import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import {
  loadProcessContext,
  buildSystemPrompt,
  extractDocContentFromBuffer,
  executeReadProcessFiles,
} from '@/lib/agent-context'

const anthropic = new Anthropic()

function logUsage(chain: string, processId: string, versionId: string, input: number, output: number) {
  const inputCost = (input / 1_000_000) * 3
  const outputCost = (output / 1_000_000) * 15
  const costUsd = inputCost + outputCost
  console.log(
    `[${chain}] processo=${processId} | input=${input}tok ($${inputCost.toFixed(5)}) | output=${output}tok ($${outputCost.toFixed(5)}) | total≈$${costUsd.toFixed(5)}`
  )
  prisma.usageLog.create({
    data: { processId, versionId, chain, inputTokens: input, outputTokens: output, costUsd },
  }).catch((err) => console.error('[UsageLog] Failed to persist:', err))
}

const READ_FILES_TOOL: Anthropic.Tool = {
  name: 'read_process_files',
  description:
    'Lê arquivos de referência do processo (ClickUp, Drive, HubSpot). Use quando precisar de mais contexto sobre regras de negócio, tickets, configurações ou escopos. Não use em toda mensagem — apenas quando a conversa exigir.',
  input_schema: {
    type: 'object' as const,
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
  const prevVersion = currentIndex > 0 ? allVersions[currentIndex - 1] : null

  const previousVersionContent = prevVersion?.fileContent
    ? await extractDocContentFromBuffer(Buffer.from(prevVersion.fileContent))
    : ''

  const changelogHistory = allVersions
    .slice(0, currentIndex)
    .map(v => v.changeLog)
    .filter((cl): cl is string => !!cl)

  const versionContext = previousVersionContent || changelogHistory.length > 0
    ? { previousVersionContent, changelogHistory }
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
          data: { versionId, role: 'user', content: message },
        })

        // Agentic loop: stream → tool_use → execute → continue (max 5 iterations)
        let loopMessages: Anthropic.MessageParam[] = truncated
        const MAX_ITERATIONS = 5

        for (let iteration = 0; iteration < MAX_ITERATIONS; iteration++) {
          const response = anthropic.messages.stream({
            model: 'claude-sonnet-4-6',
            max_tokens: 4096,
            system: fullSystem,
            messages: loopMessages,
            tools: [READ_FILES_TOOL],
            tool_choice: { type: 'auto' },
          })

          for await (const event of response) {
            if (
              event.type === 'content_block_delta' &&
              event.delta.type === 'text_delta'
            ) {
              assistantContent += event.delta.text
              enqueue(event.delta.text)
            }
          }

          const finalMsg = await response.finalMessage()
          logUsage(`chat[${iteration}]`, version.document.id, versionId, finalMsg.usage.input_tokens, finalMsg.usage.output_tokens)

          if (finalMsg.stop_reason === 'end_turn' || finalMsg.stop_reason !== 'tool_use') break

          // Execute tool calls
          const toolUseBlocks = finalMsg.content.filter(
            (b): b is Anthropic.ToolUseBlock => b.type === 'tool_use'
          )

          const STATUS_LABELS: Record<string, string> = {
            clickup: 'Lendo tarefas do ClickUp...',
            drive:   'Lendo documentos do Drive...',
            hubspot: 'Lendo dados do HubSpot...',
          }

          const toolResults: Anthropic.ToolResultBlockParam[] = toolUseBlocks.map(block => {
            const input = block.input as { file_type?: string; file_name?: string }
            const fileType = (input.file_type ?? '') as 'clickup' | 'drive' | 'hubspot'

            // Send visible status to client before executing
            const label = STATUS_LABELS[fileType] ?? 'Lendo arquivos do processo...'
            controller.enqueue(
              new TextEncoder().encode(`data: ${JSON.stringify({ status: label })}\n\n`)
            )

            const result = executeReadProcessFiles(version.document.id, fileType, input.file_name)
            console.log(`[tool] read_process_files file_type=${fileType} file_name=${input.file_name ?? '(list)'}`)
            return { type: 'tool_result', tool_use_id: block.id, content: result }
          })

          loopMessages = [
            ...loopMessages,
            { role: 'assistant', content: finalMsg.content },
            { role: 'user', content: toolResults },
          ]
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
