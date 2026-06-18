/**
 * One-shot script: replaces the "Estrutura de módulos HubL" table in the
 * latest DocumentVersion of process 5.1 stored in Neon.
 *
 * Usage (from /app):
 *   npx tsx scripts/fix-hubl-table.ts
 */
import { PrismaClient } from '@prisma/client'
import { spawnSync } from 'child_process'
import path from 'path'
import fs from 'fs'

const prisma = new PrismaClient()

const SCRIPTS_DIR = path.resolve(__dirname, 'python')
const VENV_PYTHON = path.join(SCRIPTS_DIR, '.venv', 'bin', 'python3')
const PYTHON_BIN = fs.existsSync(VENV_PYTHON) ? VENV_PYTHON : 'python3'
const FIX_SCRIPT = path.join(SCRIPTS_DIR, 'fix_hubl_table.py')

async function main() {
  // Find the latest version of the 5.1 document
  const version = await prisma.documentVersion.findFirst({
    where: { documentId: '5.1' },
    orderBy: { dataCriacao: 'desc' },
  })

  if (!version) {
    console.error('No DocumentVersion found for documentId "5.1"')
    process.exit(1)
  }

  if (!version.fileContent) {
    console.error(`Version ${version.id} (${version.numeroVersao}) has no fileContent`)
    process.exit(1)
  }

  console.log(`Found: ${version.id} — ${version.numeroVersao} (${(version.fileContent as Buffer).length} bytes)`)

  // Run the Python script
  const result = spawnSync(PYTHON_BIN, [FIX_SCRIPT], {
    input: version.fileContent as Buffer,
    maxBuffer: 20 * 1024 * 1024,
  })

  if (result.status !== 0) {
    const stderr = result.stderr?.toString() ?? ''
    console.error('Python script failed:')
    console.error(stderr)
    process.exit(1)
  }

  const modifiedDocx = result.stdout as Buffer
  if (!modifiedDocx || modifiedDocx.length === 0) {
    console.error('Python script returned empty output')
    process.exit(1)
  }

  console.log(`Modified DOCX: ${modifiedDocx.length} bytes (was ${(version.fileContent as Buffer).length})`)

  // Update in-place — same version, same reviewer context
  await prisma.documentVersion.update({
    where: { id: version.id },
    data: { fileContent: modifiedDocx },
  })

  console.log(`Updated version ${version.id} in DB.`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
