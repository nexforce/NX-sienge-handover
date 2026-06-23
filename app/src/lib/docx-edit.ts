import { spawn } from 'child_process'
import fs from 'fs'
import os from 'os'
import path from 'path'

const SCRIPTS_DIR = path.resolve(process.cwd(), 'scripts', 'python')

// In production the build step creates a dedicated venv with python-docx
// installed (see package.json "build"). Use it when present; otherwise fall
// back to the global python3 (local dev, where deps are installed by hand).
const VENV_PYTHON = path.join(SCRIPTS_DIR, '.venv', 'bin', 'python3')
const PYTHON_BIN = fs.existsSync(VENV_PYTHON) ? VENV_PYTHON : 'python3'

export interface DocxParagraph {
  index: number
  text: string
}

export type DocxEditOperation =
  | 'replace'
  | 'insert_paragraph_after'
  | 'insert_paragraph_before'
  | 'delete_paragraph'
  | 'insert_table_row_after'

export interface DocxEdit {
  paragraph_index: number
  /** Operation to apply. Defaults to 'replace' when omitted (legacy schema). */
  operation?: DocxEditOperation
  old_text_snippet: string
  /** New paragraph content (replace / insert_paragraph_*). Ignored for row/delete ops. */
  new_text?: string
  /** Cell values for insert_table_row_after, one per column. */
  new_row_cells?: string[]
}

/**
 * Folds NBSP and smart quotes to ASCII and collapses whitespace runs, so the
 * snippet pre-validation in the accept route matches what edit_docx.py does.
 */
export function normalizeText(s: string): string {
  if (!s) return ''
  return s
    .replace(/ /g, ' ')
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Extracts all paragraphs from a .docx buffer in document order,
 * including paragraphs inside tables.
 * Returns [{index, text}] — index is stable and matches applyEdits().
 */
export function extractParagraphs(buffer: Buffer): Promise<DocxParagraph[]> {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(SCRIPTS_DIR, 'extract_docx_paragraphs.py')
    const proc = spawn(PYTHON_BIN, [scriptPath], { stdio: ['pipe', 'pipe', 'pipe'] })

    const chunks: Buffer[] = []
    const errChunks: Buffer[] = []

    proc.stdout.on('data', (chunk: Buffer) => chunks.push(chunk))
    proc.stderr.on('data', (chunk: Buffer) => errChunks.push(chunk))

    proc.on('close', (code) => {
      if (code !== 0) {
        const errMsg = Buffer.concat(errChunks).toString('utf-8')
        return reject(new Error(`extract_docx_paragraphs.py exited with code ${code}: ${errMsg}`))
      }
      try {
        const json = Buffer.concat(chunks).toString('utf-8')
        resolve(JSON.parse(json) as DocxParagraph[])
      } catch (err) {
        reject(new Error(`Failed to parse paragraph JSON: ${err}`))
      }
    })

    proc.on('error', (err) => reject(new Error(`Failed to spawn python3: ${err.message}`)))

    // The child process may die (e.g. failed import) before consuming stdin,
    // which makes the write below throw EPIPE as an unhandled stream error.
    // Ignore it here — the real failure is already captured via proc.on('close').
    proc.stdin.on('error', () => {})
    proc.stdin.write(buffer)
    proc.stdin.end()
  })
}

/**
 * Applies a list of paragraph edits to a .docx buffer.
 * Each edit must include paragraph_index (from extractParagraphs),
 * old_text_snippet (validated before replacing), and new_text.
 * Returns the modified .docx as a Buffer, with styles/tables/branding intact.
 */
export function applyEdits(buffer: Buffer, edits: DocxEdit[]): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(SCRIPTS_DIR, 'edit_docx.py')

    // Write edits to a temp file to avoid argv length limits
    const tmpFile = path.join(os.tmpdir(), `docx-edits-${Date.now()}-${Math.floor(Math.random() * 100000)}.json`)
    try {
      fs.writeFileSync(tmpFile, JSON.stringify(edits), 'utf-8')
    } catch (err) {
      return reject(new Error(`Failed to write edits temp file: ${err}`))
    }

    const proc = spawn(PYTHON_BIN, [scriptPath, tmpFile], { stdio: ['pipe', 'pipe', 'pipe'] })

    const chunks: Buffer[] = []
    const errChunks: Buffer[] = []

    proc.stdout.on('data', (chunk: Buffer) => chunks.push(chunk))
    proc.stderr.on('data', (chunk: Buffer) => errChunks.push(chunk))

    proc.on('close', (code) => {
      fs.unlink(tmpFile, () => {})
      if (code !== 0) {
        const errMsg = Buffer.concat(errChunks).toString('utf-8')
        return reject(new Error(`edit_docx.py exited with code ${code}: ${errMsg}`))
      }
      resolve(Buffer.concat(chunks))
    })

    proc.on('error', (err) => {
      fs.unlink(tmpFile, () => {})
      reject(new Error(`Failed to spawn python3: ${err.message}`))
    })

    proc.stdin.on('error', () => {})
    proc.stdin.write(buffer)
    proc.stdin.end()
  })
}

// ----------------------------------------------------------------------------
// Endereçamento estruturado (caminho 1)
//
// Em vez de um índice achatado sobre todos os parágrafos (frágil em documentos
// cheios de tabela), cada alvo é endereçado por bloco top-level e, dentro de
// tabelas, por linha/coluna — coordenadas exatas que removem a ambiguidade.
// ----------------------------------------------------------------------------

export interface DocBlockParagraph {
  block: number
  kind: 'paragraph'
  text: string
}

export interface DocBlockTable {
  block: number
  kind: 'table'
  n_rows: number
  n_cols: number
  rows: string[][]
}

export type DocBlock = DocBlockParagraph | DocBlockTable

export interface DocStructure {
  blocks: DocBlock[]
}

export type StructuredEditOperation =
  | 'replace_paragraph'
  | 'insert_paragraph_after'
  | 'insert_paragraph_before'
  | 'delete_paragraph'
  | 'set_cell'
  | 'insert_row_after'
  | 'delete_row'

export interface StructuredEdit {
  operation: StructuredEditOperation
  /** Índice do bloco top-level (de extractStructure). */
  block: number
  /** set_cell / delete_row: linha alvo (0 = cabeçalho). */
  row?: number
  /** set_cell: coluna alvo. */
  col?: number
  /** insert_row_after: linha-âncora; a nova linha entra logo depois. */
  after_row?: number
  /** Trecho literal do texto atual do alvo, para validação opcional. */
  old_text_snippet?: string
  /** Novo conteúdo (replace_paragraph / insert_paragraph_* / set_cell). */
  new_text?: string
  /** Valores das células da nova linha (insert_row_after), um por coluna. */
  new_row_cells?: string[]
}

/**
 * Extrai a estrutura de blocos top-level de um .docx (parágrafos soltos e
 * tabelas como grade rows×cols). Endereços estáveis para applyStructuredEdits().
 */
export function extractStructure(buffer: Buffer): Promise<DocStructure> {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(SCRIPTS_DIR, 'extract_docx_structure.py')
    const proc = spawn(PYTHON_BIN, [scriptPath], { stdio: ['pipe', 'pipe', 'pipe'] })

    const chunks: Buffer[] = []
    const errChunks: Buffer[] = []
    proc.stdout.on('data', (c: Buffer) => chunks.push(c))
    proc.stderr.on('data', (c: Buffer) => errChunks.push(c))

    proc.on('close', (code) => {
      if (code !== 0) {
        return reject(new Error(`extract_docx_structure.py exited with code ${code}: ${Buffer.concat(errChunks).toString('utf-8')}`))
      }
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf-8')) as DocStructure)
      } catch (err) {
        reject(new Error(`Failed to parse structure JSON: ${err}`))
      }
    })

    proc.on('error', (err) => reject(new Error(`Failed to spawn python3: ${err.message}`)))
    proc.stdin.on('error', () => {})
    proc.stdin.write(buffer)
    proc.stdin.end()
  })
}

/**
 * Aplica edições com endereçamento estruturado a um .docx, preservando
 * estilos/tabelas/branding. Retorna o .docx modificado.
 */
export function applyStructuredEdits(buffer: Buffer, edits: StructuredEdit[]): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(SCRIPTS_DIR, 'edit_docx_structured.py')
    const tmpFile = path.join(os.tmpdir(), `docx-sedits-${Date.now()}-${Math.floor(Math.random() * 100000)}.json`)
    try {
      fs.writeFileSync(tmpFile, JSON.stringify(edits), 'utf-8')
    } catch (err) {
      return reject(new Error(`Failed to write edits temp file: ${err}`))
    }

    const proc = spawn(PYTHON_BIN, [scriptPath, tmpFile], { stdio: ['pipe', 'pipe', 'pipe'] })
    const chunks: Buffer[] = []
    const errChunks: Buffer[] = []
    proc.stdout.on('data', (c: Buffer) => chunks.push(c))
    proc.stderr.on('data', (c: Buffer) => errChunks.push(c))

    proc.on('close', (code) => {
      fs.unlink(tmpFile, () => {})
      if (code !== 0) {
        return reject(new Error(`edit_docx_structured.py exited with code ${code}: ${Buffer.concat(errChunks).toString('utf-8')}`))
      }
      resolve(Buffer.concat(chunks))
    })

    proc.on('error', (err) => {
      fs.unlink(tmpFile, () => {})
      reject(new Error(`Failed to spawn python3: ${err.message}`))
    })

    proc.stdin.on('error', () => {})
    proc.stdin.write(buffer)
    proc.stdin.end()
  })
}
