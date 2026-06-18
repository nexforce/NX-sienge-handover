import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { extractParagraphs, applyEdits, DocxEdit } from '@/lib/docx-edit'
import { Status } from '@prisma/client'

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

const PROPOSE_EDITS_TOOL: OpenAI.ChatCompletionTool = {
  type: 'function',
  function: {
    name: 'propose_docx_edits',
    description:
      'Propõe uma lista de edições precisas ao documento .docx atual, baseadas na conversa de revisão. Cada edit referencia um parágrafo pelo índice e valida o trecho de texto original antes de substituir.',
    parameters: {
      type: 'object',
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
  let response: OpenAI.ChatCompletion
  try {
    response = await openai.chat.completions.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 8192,
      messages: [
        {
          role: 'system',
          content: `Você é um assistente especializado em aplicar mudanças de documentação. Você receberá:
1. O histórico de uma conversa de revisão entre o revisor e o agente.
2. A lista de parágrafos numerados do documento atual (formato: [índice] texto).

Sua tarefa: propor exatamente quais parágrafos devem mudar, com o novo texto, baseado nas mudanças discutidas na conversa. Use a ferramenta propose_docx_edits.

Regras críticas:
- Edite apenas o que foi explicitamente discutido na conversa.
- old_text_snippet DEVE ser uma substring literal do texto atual do parágrafo — copie diretamente da lista. NUNCA invente ou parafrasie o snippet.
- PREFIRA sempre parágrafos com conteúdo (texto não vazio). Parágrafos vazios são separadores de espaçamento e têm estilos imprevisíveis — evite usá-los como alvo. Use um parágrafo vazio somente se não houver alternativa, e nesse caso use old_text_snippet: "".
- Para ADICIONAR conteúdo a uma seção: edite o último parágrafo não-vazio da seção para expandir seu conteúdo, ou atualize o parágrafo de título da seção com o texto novo logo abaixo. Nunca ponha conteúdo novo num parágrafo vazio de separação.
- Para ADICIONAR LINHAS A UMA TABELA: identifique a última célula não-vazia da tabela (a última linha de dados existente) e edite-a para incluir o novo conteúdo concatenado. NUNCA crie parágrafos fora da tabela para representar novas linhas. Tabelas no .docx são estruturas fechadas — qualquer parágrafo adicionado após a tabela fica fora dela, não dentro.
- Seja conservador: inclua apenas mudanças com suporte claro na conversa.`,
        },
        {
          role: 'user',
          content: `## Conversa de revisão\n\n${chatHistory}\n\n## Parágrafos do documento (índice → texto)\n\n${paragraphList}\n\nPropõe as edições necessárias.`,
        },
      ],
      tools: [PROPOSE_EDITS_TOOL],
      tool_choice: { type: 'function', function: { name: 'propose_docx_edits' } },
    })
  } catch (err) {
    console.error('[accept] API error:', err)
    return NextResponse.json({ error: 'Falha ao gerar edições. Tente novamente.' }, { status: 500 })
  }

  if (response.usage) logUsage('accept', version.document.id, versionId, response.usage, userEmail)

  // If the model hit the output token cap, the propose_docx_edits JSON may be
  // truncated/incomplete — fail clearly instead of falling through to a
  // confusing "no edits proposed" error.
  if (response.choices[0]?.finish_reason === 'length') {
    console.error(
      `[accept] Response truncated at max_tokens (output=${response.usage?.completion_tokens}). ` +
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
  const toolCall = response.choices[0]?.message.tool_calls?.find(
    tc => tc.function.name === 'propose_docx_edits'
  )

  if (!toolCall) {
    console.error('[accept] No propose_docx_edits tool call in response')
    return NextResponse.json({ error: 'Agente não propôs edições.' }, { status: 500 })
  }

  let parsed: { summary: string; edits: DocxEdit[] }
  try {
    parsed = JSON.parse(toolCall.function.arguments)
  } catch (err) {
    console.error('[accept] Failed to parse tool arguments:', err)
    return NextResponse.json({ error: 'Falha ao interpretar edições propostas.' }, { status: 500 })
  }

  const { summary, edits: proposedEdits } = parsed

  if (!Array.isArray(proposedEdits) || proposedEdits.length === 0) {
    return NextResponse.json({ error: 'Nenhuma edição proposta. Discuta mudanças concretas antes de aceitar.' }, { status: 400 })
  }

  // Defensive pre-validation against the paragraph list we already extracted.
  // In large/repetitive tables (e.g. property mapping tables) the model can pick
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
  const parsed2 = lastVersion ? parseInt(lastVersion.numeroVersao.replace('V', ''), 10) : NaN
  const nextNum = Number.isFinite(parsed2) ? parsed2 + 1 : 1

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
