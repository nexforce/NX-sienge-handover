import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string[] }> }
) {
  const { id } = await params
  const documentId = id.join('.')
  const docsRoot = path.resolve(process.cwd(), '..', 'docs', 'processos')

  const entries = fs.readdirSync(docsRoot)
  const processDir = entries.find(d => d.startsWith(documentId + ' '))

  if (!processDir) {
    return NextResponse.json({ error: 'Processo não encontrado' }, { status: 404 })
  }

  const generatedDir = path.join(docsRoot, processDir, 'documentacao-gerada')

  if (!fs.existsSync(generatedDir)) {
    return NextResponse.json({ error: 'Pasta documentacao-gerada não existe' }, { status: 404 })
  }

  const files = fs.readdirSync(generatedDir).filter(f => f.endsWith('.docx'))

  if (files.length === 0) {
    return NextResponse.json({ error: 'Nenhum .docx encontrado' }, { status: 404 })
  }

  const filePath = path.resolve(generatedDir, files[0])
  if (!filePath.startsWith(docsRoot)) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
  }

  const buffer = fs.readFileSync(filePath)

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `attachment; filename="${encodeURIComponent(files[0])}"`,
    },
  })
}
