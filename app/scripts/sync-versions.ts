import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()
const docsRoot = path.resolve(__dirname, '..', '..', 'docs', 'processos')

async function main() {
  const entries = fs.readdirSync(docsRoot)

  for (const dir of entries) {
    const match = dir.match(/^(\d+\.\d+)/)
    if (!match) continue

    const documentId = match[1]
    const generatedDir = path.join(docsRoot, dir, 'documentacao-gerada')

    if (!fs.existsSync(generatedDir)) continue

    const files = fs.readdirSync(generatedDir).filter(f => f.endsWith('.docx'))
    if (files.length === 0) continue

    const existing = await prisma.documentVersion.findFirst({ where: { documentId } })
    if (existing) {
      console.log(`${documentId}: já tem versão, pulando`)
      continue
    }

    const idParts = documentId.split('.')
    const linkDocumento = `/api/files/${idParts.join('/')}`

    await prisma.documentVersion.create({
      data: {
        documentId,
        numeroVersao: 'V1',
        linkDocumento,
        status: 'EmProgresso',
      },
    })

    await prisma.document.update({
      where: { id: documentId },
      data: { statusAtual: 'EmProgresso' },
    })

    console.log(`${documentId}: versão V1 criada → ${linkDocumento}`)
  }
}

main().catch(console.error).finally(() => prisma.$disconnect())
