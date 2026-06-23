/**
 * One-shot script: aplica o feedback completo do João Passaro ao documento
 * 3.0 — Aprovações e cria uma NOVA versão (V6) em produção, preservando a V5.
 *
 * Lê a versão mais recente de 3.0 no Neon, roda scripts/python/fix_3_0.py para
 * reescrever as seções 3.1, 3.2, 3.3, 4.2, 5 e 7, e grava a nova versão.
 *
 * Uso (a partir de /app):
 *   npx tsx scripts/fix-3-0.ts
 */
import { PrismaClient, Status } from '@prisma/client'
import { spawnSync } from 'child_process'
import path from 'path'
import fs from 'fs'

const prisma = new PrismaClient()

const SCRIPTS_DIR = path.resolve(__dirname, 'python')
const VENV_PYTHON = path.join(SCRIPTS_DIR, '.venv', 'bin', 'python3')
const PYTHON_BIN = fs.existsSync(VENV_PYTHON) ? VENV_PYTHON : 'python3'
const FIX_SCRIPT = path.join(SCRIPTS_DIR, 'fix_3_0.py')

const CHANGELOG = [
  'Aplicação do feedback completo da revisão do João Passaro (jun/2026):',
  '• 3.1: incluído o tipo de aprovação Gestor Obras (GO) — aprovadora Izabela Ribeiro.',
  '• 3.2: fluxo operacional reestruturado (etapas 1–10 + sub-etapas 3.1, 8.1 Retenção e 8.2 Aquisição/Expansão); validação do desconto escalonado no início; validação de produto SP vs GO; validação de implantação; representante legal via tag no contato; pós-aprovação corrigido para Aquisição/Expansão/Retração.',
  '• 3.2: fluxo de assinatura digital — WF 1790745492 apenas notifica e incluído WF 1793664676 (ganho manual em Retração); desconto escalonado reforçado como parte de Aquisição; movimentação de pipeline separada por pipeline (Expansão/Retração) com WF 1793577625 sem mover para Upsell e WF 1793577360 retornando para Formalização.',
  '• 3.3: novas condições de rejeição automática (desconto escalonado reprovado, sem assinatura, etapa ≠ Contrato); aprovadores por canal com critérios exatos + Izabela (GO); workflow desativado 1793114638 substituído pelo novo fluxo; causa raiz da Task 150 documentada.',
  '• 4.2: propriedades conector_aprovado_pelo_backoffice_comercial, troca_de_modalidade_com_delta_negativo_aprovada_pelo_time_de_relacionamento, orcamento_aprovado_pelo_cs e amount movidas de Orçamento (0-14) para Negócio (0-3).',
  '• 5: riscos atualizados (WF substituído, causa raiz Task 150, exigência da tag Representante Legal no contato).',
  '• 7: PV-1 a PV-6 resolvidos com as respostas do João.',
].join('\n')

async function main() {
  const docId = '3.0'

  const latest = await prisma.documentVersion.findFirst({
    where: { documentId: docId },
    orderBy: { dataCriacao: 'desc' },
  })

  if (!latest) {
    console.error(`No DocumentVersion found for documentId "${docId}"`)
    process.exit(1)
  }
  if (!latest.fileContent) {
    console.error(`Version ${latest.id} (${latest.numeroVersao}) has no fileContent`)
    process.exit(1)
  }

  const baseBuffer = latest.fileContent as Buffer
  console.log(`Base: ${latest.id} — ${latest.numeroVersao} (${baseBuffer.length} bytes)`)

  // Run the python transformer
  const result = spawnSync(PYTHON_BIN, [FIX_SCRIPT], {
    input: baseBuffer,
    maxBuffer: 50 * 1024 * 1024,
  })

  // Always surface the python log (printed to stderr)
  const stderr = result.stderr?.toString() ?? ''
  if (stderr) console.log(stderr.trim())

  if (result.status !== 0) {
    console.error('Python script failed.')
    process.exit(1)
  }

  const modifiedDocx = result.stdout as Buffer
  if (!modifiedDocx || modifiedDocx.length === 0) {
    console.error('Python script returned empty output')
    process.exit(1)
  }
  console.log(`Modified DOCX: ${modifiedDocx.length} bytes (was ${baseBuffer.length})`)

  // Next version number (mirror accept route)
  const parsedNum = parseInt(latest.numeroVersao.replace('V', ''), 10)
  const nextNum = Number.isFinite(parsedNum) ? parsedNum + 1 : 1
  const numeroVersao = `V${nextNum}`

  const newVersion = await prisma.documentVersion.create({
    data: {
      documentId: docId,
      numeroVersao,
      fileContent: new Uint8Array(modifiedDocx.buffer, modifiedDocx.byteOffset, modifiedDocx.byteLength) as Uint8Array<ArrayBuffer>,
      changeLog: CHANGELOG,
      status: Status.Pendente,
    },
  })

  await prisma.documentVersion.update({
    where: { id: newVersion.id },
    data: { linkDocumento: `/api/files/generated/${newVersion.id}` },
  })

  await prisma.document.update({
    where: { id: docId },
    data: { statusAtual: Status.Pendente },
  })

  console.log(`Created ${numeroVersao} (id=${newVersion.id}) and set 3.0 statusAtual=Pendente.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
