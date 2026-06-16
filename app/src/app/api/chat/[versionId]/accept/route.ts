import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { extractParagraphs, applyEdits, DocxEdit } from '@/lib/docx-edit'
import { Status } from '@prisma/client'

const anthropic = new Anthropic()

function logUsage(
  chain: string,
  processId: string,
  versionId: string,
  usage: { input_tokens: number; output_tokens: number; cache_creation_input_tokens?: number | null; cache_read_input_tokens?: number | null },
  userEmail?: string
) {
  const cacheCreate = usage.cache_creation_input_tokens ?? 0
  const cacheRead = usage.cache_read_input_tokens ?? 0
  const inputCost = (usage.input_tokens / 1_000_000) * 3
  const outputCost = (usage.output_tokens / 1_000_000) * 15
  const cacheCreateCost = (cacheCreate / 1_000_000) * 3.75
  const cacheReadCost = (cacheRead / 1_000_000) * 0.30
  const costUsd = inputCost + outputCost + cacheCreateCost + cacheReadCost
  console.log(
    `[${chain}] processo=${processId} user=${userEmail ?? 'unknown'} | input=${usage.input_tokens} cacheCreate=${cacheCreate} cacheRead=${cacheRead} output=${usage.output_tokens} | total≈$${costUsd.toFixed(5)}`
  )
  prisma.usageLog.create({
    data: {
      processId,
      versionId,
      chain,
      inputTokens: usage.input_tokens,
      outputTokens: usage.output_tokens,
      cacheCreationTokens: cacheCreate,
      cacheReadTokens: cacheRead,
      costUsd,
      userEmail,
    },
  }).catch((err) => console.error('[UsageLog] Failed to persist:', err))
}

const PROPOSE_EDITS_TOOL: Anthropic.Tool = {
  name: 'propose_docx_edits',
  description:
    'Propõe uma lista de edições precisas ao documento .docx atual, baseadas na conversa de revisão. Cada edit referencia um parágrafo pelo índice e valida o trecho de texto original antes de substituir.',
  input_schema: {
    type: 'object' as const,
    required: ['summary', 'edits'],
    properties: {
      summary: {
        type: 'string',
        description: 'Resumo em 1-2 frases das mudanças realizadas. Será salvo como changeLog da nova versão.',
      },
      edits: {
        type: 'array',
        description: 'Lista de edições a aplicar ao documento. Cada item altera exatamente um parágrafo.',
        items: {
          type: 'object',
          required: ['paragraph_index', 'old_text_snippet', 'new_text'],
          properties: {
            paragraph_index: {
              type: 'integer',
              description: 'Índice do parágrafo a editar (começa em 0, mesmo índice da lista fornecida).',
            },
            old_text_snippet: {
              type: 'string',
              description: 'Trecho do texto atual do parágrafo para validar que o índice está correto. Pode ser substring.',
            },
            new_text: {
              type: 'string',
              description: 'Novo conteúdo completo do parágrafo (substitui o parágrafo inteiro).',
            },
          },
        },
      },
    },
  },
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ versionId: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { versionId } = await params
  const userEmail = session.user.email ?? undefined

  // Load the current version with chat history
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
    return NextResponse.json({ error: 'Nenhuma conversa encontrada. Discuta as mudanças antes de aceitar.' }, { status: 400 })
  }

  // Need the current version's file to edit in-place
  if (!version.fileContent) {
    return NextResponse.json(
      { error: 'Esta versão não tem arquivo base. Gere o V1 via gerar_documento.py + seed antes de revisar pelo chat.' },
      { status: 400 }
    )
  }

  const baseBuffer = Buffer.from(version.fileContent)

  // Extract paragraphs from the base file
  let paragraphs: { index: number; text: string }[]
  try {
    paragraphs = await extractParagraphs(baseBuffer)
  } catch (err) {
    console.error('[accept] extractParagraphs error:', err)
    return NextResponse.json({ error: 'Falha ao extrair parágrafos do documento.' }, { status: 500 })
  }

  // Build the paragraph list for the prompt
  const paragraphList = paragraphs
    .map(p => `[${p.index}] ${p.text}`)
    .join('\n')

  // Build chat history for context
  const chatHistory = version.chatMessages
    .map(m => `${m.role === 'user' ? 'Revisor' : 'Agente'}: ${m.content}`)
    .join('\n\n')

  // Single call with forced propose_docx_edits tool
  let response: Anthropic.Message
  try {
    response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 8192,
      system: [
        {
          type: 'text',
          text: `Você é um assistente especializado em aplicar mudanças de documentação. Você receberá:
1. O histórico de uma conversa de revisão entre o revisor e o agente.
2. A lista de parágrafos numerados do documento atual (formato: [índice] texto).

Sua tarefa: propor exatamente quais parágrafos devem mudar, com o novo texto, baseado nas mudanças discutidas na conversa. Use a ferramenta propose_docx_edits.

Regras críticas:
- Edite apenas o que foi explicitamente discutido na conversa.
- old_text_snippet DEVE ser uma substring literal do texto atual do parágrafo — copie diretamente da lista. NUNCA invente ou parafrasie o snippet.
- PREFIRA sempre parágrafos com conteúdo (texto não vazio). Parágrafos vazios são separadores de espaçamento e têm estilos imprevisíveis — evite usá-los como alvo. Use um parágrafo vazio somente se não houver alternativa, e nesse caso use old_text_snippet: "".
- Para ADICIONAR conteúdo a uma seção: edite o último parágrafo não-vazio da seção para expandir seu conteúdo, ou atualize o parágrafo de título da seção com o texto novo logo abaixo. Nunca ponha conteúdo novo num parágrafo vazio de separação.
- Seja conservador: inclua apenas mudanças com suporte claro na conversa.`,
          cache_control: { type: 'ephemeral' },
        },
      ],
      messages: [
        {
          role: 'user',
          content: `## Conversa de revisão\n\n${chatHistory}\n\n## Parágrafos do documento (índice → texto)\n\n${paragraphList}\n\nPropõe as edições necessárias.`,
        },
      ],
      tools: [PROPOSE_EDITS_TOOL],
      tool_choice: { type: 'tool', name: 'propose_docx_edits' },
    })
  } catch (err) {
    console.error('[accept] Anthropic API error:', err)
    return NextResponse.json({ error: 'Falha ao gerar edições. Tente novamente.' }, { status: 500 })
  }

  logUsage('accept', version.document.id, versionId, response.usage, userEmail)

  // If the model hit the output token cap, the propose_docx_edits JSON may be
  // truncated/incomplete — fail clearly instead of falling through to a
  // confusing "no edits proposed" error.
  if (response.stop_reason === 'max_tokens') {
    console.error(
      `[accept] Response truncated at max_tokens (output=${response.usage.output_tokens}). ` +
        'Edits list is likely too large for one request.'
    )
    return NextResponse.json(
      {
        error:
          'A resposta do agente foi cortada por limite de tamanho (muitas edições de uma vez). Tente aceitar mudanças menores por vez.',
      },
      { status: 500 }
    )
  }

  // Extract the tool call result
  const toolUse = response.content.find(
    (b): b is Anthropic.ToolUseBlock => b.type === 'tool_use' && b.name === 'propose_docx_edits'
  )

  if (!toolUse) {
    console.error('[accept] No propose_docx_edits tool call in response')
    return NextResponse.json({ error: 'Agente não propôs edições.' }, { status: 500 })
  }

  const { summary, edits: proposedEdits } = toolUse.input as { summary: string; edits: DocxEdit[] }

  if (!Array.isArray(proposedEdits) || proposedEdits.length === 0) {
    return NextResponse.json({ error: 'Nenhuma edição proposta. Discuta mudanças concretas antes de aceitar.' }, { status: 400 })
  }

  // Defensive pre-validation against the paragraph list we already extracted.
  // In large/repetitive tables (e.g. property mapping tables) Claude can pick
  // the wrong index (off-by-one into a neighboring cell). edit_docx.py validates
  // this too, but aborts the whole batch on the first mismatch — drop just the
  // bad edits here so the rest (almost certainly correct) still go through.
  const invalidEdits: { edit: DocxEdit; reason: string }[] = []
  const edits = proposedEdits.filter((edit) => {
    const para = paragraphs[edit.paragraph_index]
    if (!para) {
      invalidEdits.push({ edit, reason: 'paragraph_index fora do intervalo do documento' })
      return false
    }
    if (edit.old_text_snippet && para.text && !para.text.includes(edit.old_text_snippet)) {
      invalidEdits.push({ edit, reason: `snippet não encontrado no parágrafo ${edit.paragraph_index} (texto atual: ${JSON.stringify(para.text)})` })
      return false
    }
    return true
  })

  if (invalidEdits.length > 0) {
    console.warn('[accept] Dropping invalid edits:', JSON.stringify(invalidEdits))
  }

  if (edits.length === 0) {
    return NextResponse.json(
      { error: 'Nenhuma das edições propostas correspondeu ao texto atual do documento. Tente reformular o pedido de mudança.' },
      { status: 400 }
    )
  }

  const finalSummary =
    invalidEdits.length > 0
      ? `${summary}\n\n(${invalidEdits.length} edição(ões) proposta(s) pelo agente não correspondeu(eram) ao texto atual do documento e foi(ram) ignorada(s).)`
      : summary

  // Apply edits to the base document
  let newDocBuffer: Buffer
  try {
    newDocBuffer = await applyEdits(baseBuffer, edits)
  } catch (err) {
    console.error('[accept] applyEdits error:', err)
    return NextResponse.json(
      { error: `Falha ao aplicar edições: ${(err as Error).message}` },
      { status: 500 }
    )
  }

  // Determine next version number
  const lastVersion = await prisma.documentVersion.findFirst({
    where: { documentId: version.documentId },
    orderBy: { dataCriacao: 'desc' },
  })
  const parsed = lastVersion ? parseInt(lastVersion.numeroVersao.replace('V', ''), 10) : NaN
  const nextNum = Number.isFinite(parsed) ? parsed + 1 : 1

  // Create new DocumentVersion with the edited binary
  const newVersion = await prisma.documentVersion.create({
    data: {
      documentId: version.documentId,
      numeroVersao: `V${nextNum}`,
      fileContent: new Uint8Array(newDocBuffer.buffer, newDocBuffer.byteOffset, newDocBuffer.byteLength) as Uint8Array<ArrayBuffer>,
      changeLog: finalSummary,
      status: Status.Pendente,
    },
  })

  // Update linkDocumento to point to the file API route
  const updated = await prisma.documentVersion.update({
    where: { id: newVersion.id },
    data: { linkDocumento: `/api/files/generated/${newVersion.id}` },
  })

  // Sync Document.statusAtual to the new version's status
  await prisma.document.update({
    where: { id: version.documentId },
    data: { statusAtual: Status.Pendente },
  })

  return NextResponse.json({ versionId: updated.id, numeroVersao: updated.numeroVersao })
}
