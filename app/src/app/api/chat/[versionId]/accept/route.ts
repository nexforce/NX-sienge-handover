import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { loadProcessContext, buildSystemPrompt } from '@/lib/agent-context'
import { Status } from '@prisma/client'

const anthropic = new Anthropic()

interface PlanChange {
  section: string
  description: string
  rationale: string
}

interface AcceptedPlan {
  title: string
  changes: PlanChange[]
}

function markdownToDocx(content: string): Document {
  const paragraphs: Paragraph[] = []

  for (const line of content.split('\n')) {
    if (line.startsWith('# ')) {
      paragraphs.push(new Paragraph({ text: line.slice(2).trim(), heading: HeadingLevel.HEADING_1 }))
    } else if (line.startsWith('## ')) {
      paragraphs.push(new Paragraph({ text: line.slice(3).trim(), heading: HeadingLevel.HEADING_2 }))
    } else if (line.startsWith('### ')) {
      paragraphs.push(new Paragraph({ text: line.slice(4).trim(), heading: HeadingLevel.HEADING_3 }))
    } else if (line.startsWith('- ')) {
      paragraphs.push(new Paragraph({
        children: [new TextRun({ text: line.slice(2).trim() })],
        bullet: { level: 0 },
      }))
    } else if (line.trim()) {
      paragraphs.push(new Paragraph({ children: [new TextRun(line)] }))
    } else {
      paragraphs.push(new Paragraph({ text: '' }))
    }
  }

  return new Document({ sections: [{ properties: {}, children: paragraphs }] })
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

  let plan: AcceptedPlan
  try {
    plan = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (!plan?.title || !Array.isArray(plan.changes)) {
    return NextResponse.json({ error: 'Invalid plan format' }, { status: 400 })
  }

  if (plan.changes.length === 0) {
    return NextResponse.json({ error: 'O plano não contém mudanças.' }, { status: 400 })
  }

  const version = await prisma.documentVersion.findUnique({
    where: { id: versionId },
    include: {
      document: true,
    },
  })

  if (!version) {
    return NextResponse.json({ error: 'Version not found' }, { status: 404 })
  }

  const { systemPrompt, memoryContent, docContent } = await loadProcessContext(version.document.id)
  const fullSystem = buildSystemPrompt(systemPrompt, memoryContent, docContent)

  const planText = plan.changes
    .map((c, i) => `${i + 1}. Seção: ${c.section}\n   Mudança: ${c.description}\n   Motivo: ${c.rationale}`)
    .join('\n\n')

  let response: Anthropic.Message
  try {
    response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 8192,
      system: fullSystem,
      messages: [
        {
          role: 'user',
          content: `Plano de mudanças aprovado:\n\n${planText}\n\nGere agora o documento completo e atualizado incorporando todas essas mudanças. Siga exatamente o formato de saída definido (Chain 3). Sem preâmbulo.`,
        },
      ],
    })
  } catch (err) {
    console.error('[accept] Anthropic API error:', err)
    return NextResponse.json({ error: 'Falha ao gerar documento. Tente novamente.' }, { status: 500 })
  }

  const textContent = response.content.find(b => b.type === 'text')
  if (!textContent || textContent.type !== 'text' || !textContent.text.trim()) {
    return NextResponse.json({ error: 'Falha ao gerar documento.' }, { status: 500 })
  }

  // Convert markdown to .docx buffer
  const doc = markdownToDocx(textContent.text)
  let fileBytes: Uint8Array<ArrayBuffer>
  try {
    const rawBuffer = await Packer.toBuffer(doc)
    fileBytes = new Uint8Array(rawBuffer.buffer, rawBuffer.byteOffset, rawBuffer.byteLength) as Uint8Array<ArrayBuffer>
  } catch (err) {
    console.error('[accept] docx generation error:', err)
    return NextResponse.json({ error: 'Falha ao gerar arquivo .docx.' }, { status: 500 })
  }

  // Get next version number
  const lastVersion = await prisma.documentVersion.findFirst({
    where: { documentId: version.documentId },
    orderBy: { dataCriacao: 'desc' },
  })
  const parsed = lastVersion ? parseInt(lastVersion.numeroVersao.replace('V', ''), 10) : NaN
  const nextNum = Number.isFinite(parsed) ? parsed + 1 : 1

  // Create new DocumentVersion with file binary in DB
  const newVersion = await prisma.documentVersion.create({
    data: {
      documentId: version.documentId,
      numeroVersao: `V${nextNum}`,
      linkDocumento: null,
      fileContent: fileBytes,
      status: Status.Pendente,
    },
  })

  // Update linkDocumento to point to generated file route
  const updated = await prisma.documentVersion.update({
    where: { id: newVersion.id },
    data: { linkDocumento: `/api/files/generated/${newVersion.id}` },
  })

  return NextResponse.json({ versionId: updated.id, numeroVersao: updated.numeroVersao })
}
