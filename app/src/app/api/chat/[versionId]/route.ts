import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { loadProcessContext, buildSystemPrompt } from '@/lib/agent-context'

const anthropic = new Anthropic()

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

  // Load process context
  const { systemPrompt, memoryContent, docContent } = await loadProcessContext(version.document.id)
  const fullSystem = buildSystemPrompt(systemPrompt, memoryContent, docContent)

  // Build messages array with full history + new message
  const history = version.chatMessages.map(m => ({
    role: m.role as 'user' | 'assistant',
    content: m.content,
  }))
  history.push({ role: 'user', content: message })

  // Truncate if history exceeds 20 messages (keep last 20)
  const messages = history.length > 20 ? history.slice(-20) : history

  let assistantContent = ''

  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Save user message to DB (inside try so orphan is avoided on Anthropic failure)
        await prisma.chatMessage.create({
          data: { versionId, role: 'user', content: message },
        })

        const response = anthropic.messages.stream({
          model: 'claude-sonnet-4-6',
          max_tokens: 4096,
          system: fullSystem,
          messages,
        })

        for await (const event of response) {
          if (
            event.type === 'content_block_delta' &&
            event.delta.type === 'text_delta'
          ) {
            assistantContent += event.delta.text
            controller.enqueue(
              new TextEncoder().encode(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`)
            )
          }
        }

        // Save assistant response to DB
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
