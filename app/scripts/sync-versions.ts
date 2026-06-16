import { PrismaClient, Status } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()
const docsRoot = path.resolve(__dirname, '..', '..', 'docs', 'processos')

/**
 * Varre docs/processos/[id]/documentacao-gerada/ e cria DocumentVersion para
 * qualquer .docx ainda não representado no banco.
 *
 * - Cada .docx encontrado vira uma versão (fileContent = binário, linkDocumento
 *   apontando para /api/files/generated/{versionId}).
 * - Quando uma pasta tem mais de um .docx (ex: arquivo antigo mantido ao lado
 *   do atual), ordena por data de modificação: o mais antigo é V1, o mais
 *   recente é V2, etc.
 * - A versão mais recente de cada processo fica UnderReview; versões
 *   anteriores ficam Done (superadas). Document.statusAtual acompanha a
 *   versão mais recente.
 * - Idempotente: roda de novo sem duplicar (checa por documentId+numeroVersao).
 */
export async function syncVersions() {
  const entries = fs.readdirSync(docsRoot)

  for (const dir of entries) {
    const match = dir.match(/^(\d+\.\d+)/)
    if (!match) continue

    const documentId = match[1]
    const generatedDir = path.join(docsRoot, dir, 'documentacao-gerada')
    if (!fs.existsSync(generatedDir)) continue

    const document = await prisma.document.findUnique({ where: { id: documentId } })
    if (!document) {
      console.log(`  ⚠ ${documentId}: Document não existe no banco ainda, pulando (rode o seed primeiro)`)
      continue
    }

    const files = fs
      .readdirSync(generatedDir)
      .filter(f => f.endsWith('.docx'))
      .map(name => ({ name, mtimeMs: fs.statSync(path.join(generatedDir, name)).mtimeMs }))
      .sort((a, b) => a.mtimeMs - b.mtimeMs)

    if (files.length === 0) continue

    for (let i = 0; i < files.length; i++) {
      const numeroVersao = `V${i + 1}`
      const isLatest = i === files.length - 1
      const status: Status = isLatest ? Status.UnderReview : Status.Done

      const existing = await prisma.documentVersion.findFirst({ where: { documentId, numeroVersao } })
      if (existing) {
        console.log(`  ↷ ${documentId} ${numeroVersao}: já existe, pulando`)
        continue
      }

      const fileContent = fs.readFileSync(path.join(generatedDir, files[i].name))

      const version = await prisma.documentVersion.create({
        data: { documentId, numeroVersao, status, fileContent },
      })

      await prisma.documentVersion.update({
        where: { id: version.id },
        data: { linkDocumento: `/api/files/generated/${version.id}` },
      })

      console.log(`  ✓ ${documentId} ${numeroVersao}: criado a partir de "${files[i].name}" (${status})`)

      if (isLatest) {
        await prisma.document.update({ where: { id: documentId }, data: { statusAtual: status } })
      }
    }
  }
}

if (require.main === module) {
  syncVersions()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
}
