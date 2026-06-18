import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import {
  loadProcessContext,
  buildSystemPrompt,
  extractDocContentFromBuffer,
  executeReadProcessFiles,
} from '@/lib/agent-context'

const openai = new OpenAI({
  apiKey: process.env.NFC_TOKEN,
  baseURL: 'https://router.nexforce.ai/v1',
})

function logUsage(
  chain: string,
  processId: string,
  versionId: string,
  usage: { prompt_tokens: number; completion_tokens: number },
  userEmail?: string
) {
  console.log(
    `[${chain}] processo=${processId} user=${userEmail ?? 'unknown'} | input=${usage.prompt_tokens} output=${usage.completion_tokens}`
  )
  prisma.usageLog.create({
    data: {
      processId,
      versionId,
      chain,
      inputTokens: usage.prompt_tokens,
      outputTokens: usage.completion_tokens,
      cacheCreationTokens: 0,
      cacheReadTokens: 0,
      costUsd: 0,
      userEmail,
    },
  }).catch((err) => console.error('[UsageLog] Failed to persist:', err))
}

const READ_FILES_TOOL: OpenAI.ChatCompletionTool = {
  type: 'function',
  function: {
    name: 'read_process_files',
    description:
      'Lê arquivos de referência do processo (ClickUp, Drive, HubSpot). Use quando precisar de mais contexto sobre regras de negócio, tickets, configurações ou escopos. Não use em toda mensagem — apenas quando a conversa exigir.',
    parameters: {
      type: 'object',
      required: ['file_type'],
      properties: {
        file_type: {
          type: 'string',
          enum: ['clickup', 'drive', 'hubspot'],
          description: 'Tipo de arquivo a consultar.',
        },
        file_name: {
          type: 'string',
          description: 'Nome do arquivo (ex: "8.1 - Integrações Oracle.md"). Se omitido, retorna lista de arquivos disponíveis.',
        },
      },
    },
  },
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ versionId: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { versionId } = await params

  const messages = await prisma.chatMessage.findMany({
    where: { versionId },
    orderBy: { createdAt: 'asc' },
    select: { id: true, role: true, content: true, createdAt: true },
  })

  return NextResponse.json(messages)
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ versionId: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return new Response('Unauthorized', { status: 401 })
  }

  const { versionId } = await params
  const userEmail = session.user.email ?? undefined

  let body: { message?: string }
  try {
    body = await req.json()
  } catch {
    return new Response('Invalid JSON', { status: 400 })
  }
  const { message } = body

  if (!message?.trim()) {
    return new Response('message is required', { status: 400 })
  }

  const version = await prisma.documentVersion.findUnique({
    where: { id: versionId },
    include: {
      document: true,
      chatMessages: { orderBy: { createdAt: 'asc' }, select: { role: true, content: true } },
    },
  })

  if (!version) {
    return new Response('Version not found', { status: 404 })
  }

  // Fetch all versions of this document to build version context
  const allVersions = await prisma.documentVersion.findMany({
    where: { documentId: version.documentId },
    orderBy: { dataCriacao: 'asc' },
    select: { id: true, fileContent: true, changeLog: true },
  })

  const currentIndex = allVersions.findIndex(v => v.id === versionId)
  const currentVersion = allVersions[currentIndex] ?? null

  // Show the agent the content of the version currently being reviewed
  const currentVersionContent = currentVersion?.fileContent
    ? await extractDocContentFromBuffer(Buffer.from(currentVersion.fileContent))
    : ''

  // Changelog history = all versions created before this one
  const changelogHistory = allVersions
    .slice(0, currentIndex)
    .map(v => v.changeLog)
    .filter((cl): cl is string => !!cl)

  const versionContext = currentVersionContent || changelogHistory.length > 0
    ? { currentVersionContent, changelogHistory }
    : undefined

  const { systemPrompt, memoryContent, docContent } = await loadProcessContext(
    version.document.id,
    versionContext
  )
  const fullSystem = buildSystemPrompt(systemPrompt, memoryContent, docContent, changelogHistory)

  const history = version.chatMessages.map(m => ({
    role: m.role as 'user' | 'assistant',
    content: m.content,
  }))
  history.push({ role: 'user', content: message })
  const truncated = history.length > 20 ? history.slice(-20) : history

  let assistantContent = ''

  const stream = new ReadableStream({
    async start(controller) {
      const enqueue = (text: string) =>
        controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ text })}\n\n`))

      try {
        // Save user message before streaming
        await prisma.chatMessage.create({
          data: { versionId, role: 'user', content: message, userEmail },
        })

        // Agentic loop: stream → tool_calls → execute → continue (max 5 iterations)
        const loopMessages: OpenAI.ChatCompletionMessageParam[] = [
          { role: 'system', content: fullSystem },
          ...truncated,
        ]
        const MAX_ITERATIONS = 5

        const STATUS_LABELS: Record<string, string> = {
          clickup: 'Lendo tarefas do ClickUp...',
          drive:   'Lendo documentos do Drive...',
          hubspot: 'Lendo dados do HubSpot...',
        }

        for (let iteration = 0; iteration < MAX_ITERATIONS; iteration++) {
          const streamResponse = await openai.chat.completions.create({
            model: 'deepseek-v4-flash',
            max_tokens: 4096,
            messages: loopMessages,
            tools: [READ_FILES_TOOL],
            tool_choice: 'auto',
            stream: true,
            stream_options: { include_usage: true },
          })

          let iterationText = ''
          let finishReason = ''
          let usage: OpenAI.CompletionUsage | undefined
          const toolCallsMap = new Map<number, { id: string; name: string; arguments: string }>()

          for await (const chunk of streamResponse) {
            if (chunk.usage) usage = chunk.usage

            const choice = chunk.choices[0]
            if (!choice) continue

            const delta = choice.delta

            if (delta.content) {
              iterationText += delta.content
              assistantContent += delta.content
              enqueue(delta.content)
            }

            if (delta.tool_calls) {
              for (const tc of delta.tool_calls) {
                if (!toolCallsMap.has(tc.index)) {
                  toolCallsMap.set(tc.index, { id: '', name: '', arguments: '' })
                }
                const acc = toolCallsMap.get(tc.index)!
                if (tc.id) acc.id = tc.id
                if (tc.function?.name) acc.name = tc.function.name
                acc.arguments += tc.function?.arguments ?? ''
              }
            }

            if (choice.finish_reason) finishReason = choice.finish_reason
          }

          if (usage) logUsage(`chat[${iteration}]`, version.document.id, versionId, usage, userEmail)

          if (finishReason !== 'tool_calls') break

          const toolCalls = Array.from(toolCallsMap.values())

          // Append assistant message with tool_calls
          loopMessages.push({
            role: 'assistant',
            content: iterationText || null,
            tool_calls: toolCalls.map(tc => ({
              id: tc.id,
              type: 'function' as const,
              function: { name: tc.name, arguments: tc.arguments },
            })),
          })

          // Execute tools and append results
          for (const tc of toolCalls) {
            let input: { file_type?: string; file_name?: string } = {}
            try { input = JSON.parse(tc.arguments) } catch { /* ignore */ }
            const fileType = (input.file_type ?? '') as 'clickup' | 'drive' | 'hubspot'

            const label = STATUS_LABELS[fileType] ?? 'Lendo arquivos do processo...'
            controller.enqueue(
              new TextEncoder().encode(`data: ${JSON.stringify({ status: label })}\n\n`)
            )

            const result = executeReadProcessFiles(version.document.id, fileType, input.file_name)
            console.log(`[tool] read_process_files file_type=${fileType} file_name=${input.file_name ?? '(list)'}`)

            loopMessages.push({ role: 'tool', tool_call_id: tc.id, content: result })
          }
        }

        // Save assistant response (text only)
        await prisma.chatMessage.create({
          data: { versionId, role: 'assistant', content: assistantContent },
        })

        controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'))
        controller.close()
      } catch (err) {
        console.error('[chat] streaming error:', err)
        controller.enqueue(
          new TextEncoder().encode(`data: ${JSON.stringify({ error: 'Erro no agente. Tente novamente.' })}\n\n`)
        )
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}
