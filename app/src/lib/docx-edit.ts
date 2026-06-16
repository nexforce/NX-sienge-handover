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

export interface DocxEdit {
  paragraph_index: number
  old_text_snippet: string
  new_text: string
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
