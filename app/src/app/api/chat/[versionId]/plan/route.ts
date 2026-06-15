import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { loadProcessContext, buildSystemPrompt } from '@/lib/agent-context'

const anthropic = new Anthropic()

const PLAN_TOOL: Anthropic.Tool = {
  name: 'submit_plan',
  description: 'Submits the structured document revision plan based on the conversation.',
  input_schema: {
    type: 'object' as const,
    required: ['title', 'changes'],
    properties: {
      title: {
        type: 'string',
        description: 'Short title summarizing the revision (e.g., "Atualização das regras de aprovação")',
      },
      changes: {
        type: 'array',
        description: 'List of changes to apply to the document',
        items: {
          type: 'object',
          required: ['section', 'description', 'rationale'],
          properties: {
            section: { type: 'string', description: 'Document section to change' },
            description: { type: 'string', description: 'What will change in this section' },
            rationale: { type: 'string', description: 'Why this change is needed' },
          },
        },
      },
    },
  },
}

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ versionId: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { versionId } = await params

  const version = await prisma.documentVersion.findUnique({
    where: { id: versionId },
    include: {
      document: true,
      chatMessages: { orderBy: { createdAt: 'asc' }, select: { role: true, content: true } },
    },
  })

  if (!version) {
    return NextResponse.json({ error: 'Version not found' }, { status: 404 })
  }

  if (version.chatMessages.length === 0) {
    return NextResponse.json({ error: 'No conversation to generate plan from' }, { status: 400 })
  }

  const { systemPrompt, memoryContent, docContent } = await loadProcessContext(version.document.id)
  const fullSystem = buildSystemPrompt(systemPrompt, memoryContent, docContent)

  const history = version.chatMessages.map(m => ({
    role: m.role as 'user' | 'assistant',
    content: m.content,
  }))

  const messages: Anthropic.MessageParam[] = [
    ...history,
    {
      role: 'user',
      content: 'Com base em nossa conversa, gere agora o plano estruturado de mudanças para o documento.',
    },
  ]

  let response: Anthropic.Message
  try {
    response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      system: fullSystem,
      messages,
      tools: [PLAN_TOOL],
      tool_choice: { type: 'tool', name: 'submit_plan' },
    })
  } catch (err) {
    console.error('[plan] Anthropic API error:', err)
    return NextResponse.json({ error: 'Falha ao gerar plano. Tente novamente.' }, { status: 500 })
  }

  const toolUse = response.content.find(b => b.type === 'tool_use')
  if (!toolUse || toolUse.type !== 'tool_use') {
    return NextResponse.json({ error: 'Agente não gerou um plano estruturado.' }, { status: 500 })
  }

  const input = toolUse.input as { title?: unknown; changes?: unknown }
  if (!input.title || !Array.isArray(input.changes)) {
    return NextResponse.json({ error: 'Plano gerado com formato inválido.' }, { status: 500 })
  }

  return NextResponse.json(toolUse.input)
}
