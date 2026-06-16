import fs from 'fs'
import path from 'path'
import mammoth from 'mammoth'

const DOCS_ROOT = path.resolve(process.cwd(), '..', 'docs', 'processos')
const AGENTS_ROOT = path.resolve(process.cwd(), '..', '.claude', 'agents')

const ALLOWED_FILE_TYPES = ['clickup', 'drive', 'hubspot'] as const
type FileType = typeof ALLOWED_FILE_TYPES[number]

export function findProcessDir(documentId: string): string | null {
  if (!fs.existsSync(DOCS_ROOT)) return null
  const entries = fs.readdirSync(DOCS_ROOT)
  return entries.find(d => d.startsWith(documentId + ' ')) ?? null
}

export interface VersionContext {
  previousVersionContent: string
  changelogHistory: string[]
}

export async function loadProcessContext(
  documentId: string,
  versionContext?: VersionContext
): Promise<{ systemPrompt: string; memoryContent: string; docContent: string }> {
  const processDir = findProcessDir(documentId)
  const systemPrompt = loadSystemPrompt(documentId)
  const memoryContent = loadMemory(processDir)
  // Use previous version content when available; fall back to file on disk for V1
  const docContent = versionContext?.previousVersionContent
    ?? await extractDocContentFromDisk(processDir)
  return { systemPrompt, memoryContent, docContent }
}

function loadSystemPrompt(documentId: string): string {
  const promptPath = path.resolve(AGENTS_ROOT, documentId, 'CLAUDE.md')
  if (!promptPath.startsWith(AGENTS_ROOT + path.sep)) {
    return `You are the documentation agent for process ${documentId} of Sienge RaaS. Help users revise process documentation. Communicate in Portuguese (Brazil).`
  }
  if (!fs.existsSync(promptPath)) {
    return `You are the documentation agent for process ${documentId} of Sienge RaaS. Help users revise process documentation. Communicate in Portuguese (Brazil).`
  }
  return fs.readFileSync(promptPath, 'utf-8')
}

function loadMemory(processDir: string | null): string {
  if (!processDir) return ''
  const memPath = path.join(DOCS_ROOT, processDir, 'MEMORY.md')
  if (!fs.existsSync(memPath)) return ''
  return fs.readFileSync(memPath, 'utf-8')
}

async function extractDocContentFromDisk(processDir: string | null): Promise<string> {
  if (!processDir) return ''
  const genDir = path.join(DOCS_ROOT, processDir, 'documentacao-gerada')
  if (!fs.existsSync(genDir)) return ''
  const files = fs.readdirSync(genDir).filter(f => f.endsWith('.docx'))
  if (files.length === 0) return ''
  const docxPath = path.join(genDir, files[0])
  try {
    const result = await mammoth.extractRawText({ path: docxPath })
    return result.value
  } catch {
    return ''
  }
}

export async function extractDocContentFromBuffer(buffer: Buffer): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ buffer })
    return result.value
  } catch {
    return ''
  }
}

export function buildSystemPrompt(
  systemPrompt: string,
  memoryContent: string,
  docContent: string,
  changelogHistory?: string[]
): string {
  const parts = [systemPrompt]

  if (memoryContent) {
    parts.push(`\n\n---\n## Session Memory (accumulated context from past sessions)\n\n${memoryContent}`)
  }

  if (docContent) {
    const docLabel = changelogHistory && changelogHistory.length > 0
      ? '## Versão anterior do documento (base para suas revisões)'
      : '## Current Document Content'
    parts.push(`\n\n---\n${docLabel}\n\n${docContent}`)
  } else {
    parts.push(`\n\n---\n## Current Document Content\n\nNo document exists yet for this process. If the user wants to create documentation from scratch, help them define the content.`)
  }

  if (changelogHistory && changelogHistory.length > 0) {
    const historyText = changelogHistory.map((entry, i) => `V${i + 1}→V${i + 2}: ${entry}`).join('\n')
    parts.push(`\n\n---\n## Histórico de mudanças entre versões\n\n${historyText}`)
  }

  return parts.join('')
}

/**
 * Reads reference files (clickup, drive, hubspot) for a process on demand.
 * Called by the agent tool execution loop — not loaded automatically on every message.
 *
 * - Without fileName: returns list of available .md files in the folder
 * - With fileName: returns the file content (path traversal guarded)
 */
export function executeReadProcessFiles(
  documentId: string,
  fileType: FileType,
  fileName?: string
): string {
  if (!ALLOWED_FILE_TYPES.includes(fileType)) {
    return `Tipo inválido. Use: ${ALLOWED_FILE_TYPES.join(', ')}`
  }

  const processDir = findProcessDir(documentId)
  if (!processDir) return 'Pasta do processo não encontrada.'

  const targetDir = path.resolve(DOCS_ROOT, processDir, fileType)
  if (!fs.existsSync(targetDir)) return `Pasta ${fileType}/ não encontrada para este processo.`

  if (!fileName) {
    const files = fs.readdirSync(targetDir).filter(f => f.endsWith('.md'))
    return files.length === 0
      ? `Nenhum arquivo .md encontrado em ${fileType}/.`
      : `Arquivos disponíveis em ${fileType}/:\n${files.map(f => `- ${f}`).join('\n')}`
  }

  const filePath = path.resolve(targetDir, fileName)
  if (!filePath.startsWith(targetDir + path.sep) && filePath !== path.resolve(targetDir, fileName)) {
    return 'Acesso negado: path traversal detectado.'
  }
  // Re-check with the resolved path
  if (!filePath.startsWith(targetDir)) return 'Acesso negado.'
  if (!fs.existsSync(filePath)) return `Arquivo "${fileName}" não encontrado em ${fileType}/.`

  return fs.readFileSync(filePath, 'utf-8')
}
