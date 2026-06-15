import fs from 'fs'
import path from 'path'
import mammoth from 'mammoth'

const DOCS_ROOT = path.resolve(process.cwd(), '..', 'docs', 'processos')
const AGENTS_ROOT = path.resolve(process.cwd(), '..', '.claude', 'agents')

function findProcessDir(documentId: string): string | null {
  if (!fs.existsSync(DOCS_ROOT)) return null
  const entries = fs.readdirSync(DOCS_ROOT)
  return entries.find(d => d.startsWith(documentId + ' ')) ?? null
}

export async function loadProcessContext(documentId: string): Promise<{
  systemPrompt: string
  memoryContent: string
  docContent: string
}> {
  const processDir = findProcessDir(documentId)
  const systemPrompt = loadSystemPrompt(documentId)
  const memoryContent = loadMemory(processDir)
  const docContent = await extractDocContent(processDir)
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

async function extractDocContent(processDir: string | null): Promise<string> {
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

export function buildSystemPrompt(
  systemPrompt: string,
  memoryContent: string,
  docContent: string
): string {
  const parts = [systemPrompt]
  if (memoryContent) {
    parts.push(`\n\n---\n## Session Memory (accumulated context from past sessions)\n\n${memoryContent}`)
  }
  if (docContent) {
    parts.push(`\n\n---\n## Current Document Content\n\n${docContent}`)
  } else {
    parts.push(`\n\n---\n## Current Document Content\n\nNo document exists yet for this process. If the user wants to create documentation from scratch, help them define the content.`)
  }
  return parts.join('')
}
