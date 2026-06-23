import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { extractStructure, applyStructuredEdits, normalizeText, StructuredEdit, DocBlock } from '@/lib/docx-edit'
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
      'Propõe uma lista de edições precisas ao documento .docx atual, baseadas na conversa de revisão. Cada edit endereça um bloco top-level por índice e, dentro de tabelas, por linha/coluna.',
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
          description: 'Lista de operações a aplicar ao documento, endereçadas por bloco (e linha/coluna em tabelas).',
          items: {
            type: 'object',
            required: ['operation', 'block'],
            properties: {
              operation: {
                type: 'string',
                enum: [
                  'replace_paragraph',
                  'insert_paragraph_after',
                  'insert_paragraph_before',
                  'delete_paragraph',
                  'set_cell',
                  'insert_row_after',
                  'delete_row',
                ],
                description:
                  'replace_paragraph: troca o texto de um parágrafo solto por new_text. insert_paragraph_after/before: cria um parágrafo novo (new_text) depois/antes do bloco. delete_paragraph: remove o parágrafo. set_cell: troca o texto da célula (block,row,col) por new_text. insert_row_after: adiciona uma linha à tabela após after_row, preenchendo new_row_cells. delete_row: remove a linha (block,row).',
              },
              block: {
                type: 'integer',
                description: 'Índice do bloco top-level (conforme a estrutura fornecida). Para parágrafos é um bloco "paragraph"; para operações de tabela é o bloco "table".',
              },
              row: {
                type: 'integer',
                description: 'Linha alvo da tabela (0 = cabeçalho). Para set_cell e delete_row.',
              },
              col: {
                type: 'integer',
                description: 'Coluna alvo da tabela (começa em 0). Para set_cell.',
              },
              after_row: {
                type: 'integer',
                description: 'Linha-âncora; a nova linha entra logo abaixo dela. Para insert_row_after (use a última linha de dados).',
              },
              old_text_snippet: {
                type: 'string',
                description: 'Trecho LITERAL do texto atual do alvo (parágrafo ou célula), para validação. Copie da estrutura; não parafraseie.',
              },
              new_text: {
                type: 'string',
                description: 'Conteúdo novo para replace_paragraph, insert_paragraph_* e set_cell.',
              },
              new_row_cells: {
                type: 'array',
                items: { type: 'string' },
                description: 'Valores das células da nova linha (um por coluna, na ordem das colunas). Obrigatório para insert_row_after.',
              },
            },
          },
        },
      },
    },
  },
}

const PARA_OPS = new Set([
  'replace_paragraph',
  'insert_paragraph_after',
  'insert_paragraph_before',
  'delete_paragraph',
])
const TABLE_OPS = new Set(['set_cell', 'insert_row_after', 'delete_row'])

/** Renderiza a estrutura do documento para o prompt: blocos numerados + tabelas como grade. */
function renderStructure(blocks: DocBlock[]): string {
  const lines: string[] = []
  for (const b of blocks) {
    if (b.kind === 'paragraph') {
      lines.push(`[block ${b.block}] (paragraph) ${b.text}`)
    } else {
      lines.push(`[block ${b.block}] (table ${b.n_rows}x${b.n_cols})`)
      b.rows.forEach((row, r) => {
        lines.push(`   row ${r}: ${row.map((c, ci) => `(col ${ci}) ${c}`).join(' | ')}`)
      })
    }
  }
  return lines.join('\n')
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

  // Extract the structured block outline from the base file
  let blocks: DocBlock[]
  try {
    const structure = await extractStructure(baseBuffer)
    blocks = structure.blocks
  } catch (err) {
    console.error('[accept] extractStructure error:', err)
    return NextResponse.json({ error: 'Falha ao extrair a estrutura do documento.' }, { status: 500 })
  }

  const byBlock = new Map(blocks.map(b => [b.block, b]))
  const structureOutline = renderStructure(blocks)

  // Build chat history for context
  const chatHistory = version.chatMessages
    .map(m => `${m.role === 'user' ? 'Revisor' : 'Agente'}: ${m.content}`)
    .join('\n\n')

  // Single call with forced propose_docx_edits tool
  let response: OpenAI.ChatCompletion
  try {
    response = await openai.chat.completions.create({
      model: 'deepseek-v4-pro',
      max_tokens: 16384,
      messages: [
        {
          role: 'system',
          content: `Você é um assistente especializado em aplicar mudanças de documentação. Você receberá:
1. O histórico de uma conversa de revisão entre o revisor e o agente.
2. A ESTRUTURA do documento atual em blocos top-level numerados. Cada bloco é:
   - "[block N] (paragraph) texto"  → um parágrafo solto, endereçado por block.
   - "[block N] (table RxC)" seguido de "row r: (col 0) ... | (col 1) ..." → uma tabela, endereçada por block + row + col.

Sua tarefa: propor exatamente quais operações aplicar, baseado nas mudanças discutidas na conversa. Use a ferramenta propose_docx_edits.

Operações (campo "operation"):
- replace_paragraph {block, new_text}: troca o texto de um parágrafo solto existente.
- insert_paragraph_after / insert_paragraph_before {block, new_text}: cria um parágrafo NOVO depois/antes de um bloco parágrafo.
- delete_paragraph {block}: remove um parágrafo solto.
- set_cell {block, row, col, new_text}: troca o texto de UMA célula de tabela. Use para corrigir/reescrever conteúdo de célula.
- insert_row_after {block, after_row, new_row_cells}: adiciona uma LINHA NOVA à tabela após after_row (use a última linha de dados). new_row_cells tem um valor por coluna, na ordem das colunas.
- delete_row {block, row}: remove uma linha da tabela.

Regras críticas:
- Edite apenas o que foi explicitamente discutido na conversa. Seja conservador.
- ENDEREÇAMENTO EXATO: para mexer numa célula, use set_cell com block+row+col exatos da estrutura. Para mexer num parágrafo, use o block dele. Não confunda parágrafo com tabela.
- Para conteúdo NOVO numa tabela use SEMPRE insert_row_after (nunca insert_paragraph_*, que ficaria fora da tabela). Para conteúdo novo de texto corrido use insert_paragraph_*.
- old_text_snippet (opcional, mas recomendado) DEVE ser um trecho literal do texto atual do alvo — copie da estrutura; serve para validar o endereço.
- block/row/col sempre se referem ao documento ATUAL mostrado abaixo. As inserções são resolvidas por âncora; não recalcule índices entre operações.`,
        },
        {
          role: 'user',
          content: `## Conversa de revisão\n\n${chatHistory}\n\n## Estrutura do documento (blocos numerados)\n\n${structureOutline}\n\nPropõe as edições necessárias.`,
        },
      ],
      tools: [PROPOSE_EDITS_TOOL],
      // deepseek-v4-pro roda em "thinking mode", que rejeita tool_choice forçado
      // (400 "Thinking mode does not support this tool_choice"). Usamos 'auto' — o
      // system prompt instrui a chamar a tool, e o guard de "sem tool call" abaixo
      // cobre o caso raro de o modelo responder só com texto.
      tool_choice: 'auto',
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

  let parsed: { summary: string; edits: StructuredEdit[] }
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

  // Pre-validação por endereço estruturado. Com coordenadas exatas (block/row/col)
  // não há re-ancoragem: cada edit é validado contra a estrutura já extraída e,
  // se o endereço/tipo não bater, é descartado e reportado (sem editar à toa).
  const invalidEdits: { edit: StructuredEdit; reason: string }[] = []
  const snippetMatches = (text: string | undefined, snippet?: string) =>
    !snippet || !text || normalizeText(text).includes(normalizeText(snippet))

  const edits = proposedEdits.filter((edit) => {
    const drop = (reason: string) => {
      invalidEdits.push({ edit, reason })
      return false
    }

    const block = byBlock.get(edit.block)
    if (!block) return drop(`block ${edit.block} fora do intervalo do documento`)

    if (PARA_OPS.has(edit.operation)) {
      if (block.kind !== 'paragraph') return drop(`operação ${edit.operation} requer bloco paragraph, mas block ${edit.block} é tabela`)
      if (edit.operation === 'replace_paragraph' && !snippetMatches(block.text, edit.old_text_snippet)) {
        return drop(`snippet não corresponde ao parágrafo do block ${edit.block} (texto atual: ${JSON.stringify(block.text)})`)
      }
      return true
    }

    if (TABLE_OPS.has(edit.operation)) {
      if (block.kind !== 'table') return drop(`operação ${edit.operation} requer bloco table, mas block ${edit.block} é parágrafo`)
      if (edit.operation === 'set_cell') {
        const { row, col } = edit
        if (typeof row !== 'number' || row < 0 || row >= block.n_rows) return drop(`row ${row} fora do intervalo (block ${edit.block} tem ${block.n_rows} linhas)`)
        if (typeof col !== 'number' || col < 0 || col >= block.n_cols) return drop(`col ${col} fora do intervalo (block ${edit.block} tem ${block.n_cols} colunas)`)
        if (!snippetMatches(block.rows[row]?.[col], edit.old_text_snippet)) {
          return drop(`snippet não corresponde à célula (${edit.block},${row},${col}) (texto atual: ${JSON.stringify(block.rows[row]?.[col])})`)
        }
        return true
      }
      if (edit.operation === 'insert_row_after') {
        const r = edit.after_row
        if (typeof r !== 'number' || r < 0 || r >= block.n_rows) return drop(`after_row ${r} fora do intervalo (block ${edit.block} tem ${block.n_rows} linhas)`)
        if (!Array.isArray(edit.new_row_cells) || edit.new_row_cells.length === 0) return drop(`insert_row_after exige new_row_cells em block ${edit.block}`)
        return true
      }
      if (edit.operation === 'delete_row') {
        const r = edit.row
        if (typeof r !== 'number' || r < 0 || r >= block.n_rows) return drop(`row ${r} fora do intervalo (block ${edit.block} tem ${block.n_rows} linhas)`)
        return true
      }
    }

    return drop(`operação desconhecida: ${edit.operation}`)
  })

  if (invalidEdits.length > 0) {
    console.warn('[accept] Dropping invalid edits:', JSON.stringify(invalidEdits))
  }

  if (edits.length === 0) {
    return NextResponse.json(
      { error: 'Nenhuma das edições propostas correspondeu à estrutura atual do documento. Tente reformular o pedido de mudança.' },
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
    newDocBuffer = await applyStructuredEdits(baseBuffer, edits)
  } catch (err) {
    console.error('[accept] applyStructuredEdits error:', err)
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

  return NextResponse.json({
    versionId: updated.id,
    numeroVersao: updated.numeroVersao,
    appliedEdits: edits.length,
    proposedEdits: proposedEdits.length,
    droppedEdits: invalidEdits.length,
  })
}
