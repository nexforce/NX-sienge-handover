'use client'

import { useEffect, useRef, useState } from 'react'

interface DocxPreviewModalProps {
  url: string
  title: string
  isOpen: boolean
  onClose: () => void
}

export function DocxPreviewModal({ url, title, isOpen, onClose }: DocxPreviewModalProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen || !containerRef.current) return

    setLoading(true)
    setError(null)

    const render = async () => {
      try {
        const { renderAsync } = await import('docx-preview')
        const response = await fetch(url)
        if (!response.ok) throw new Error('Falha ao buscar o documento')
        const buffer = await response.arrayBuffer()
        if (containerRef.current) {
          containerRef.current.innerHTML = ''
          await renderAsync(buffer, containerRef.current, undefined, {
            className: 'docx-preview',
            inWrapper: true,
            ignoreWidth: false,
            ignoreHeight: false,
          })
        }
      } catch {
        setError('Não foi possível renderizar o documento.')
      } finally {
        setLoading(false)
      }
    }

    render()
  }, [isOpen, url])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg w-full max-w-4xl h-[90vh] flex flex-col shadow-2xl mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#9C9B9B] flex-shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-[#215A9F] text-lg">📄</span>
            <span
              className="font-bold text-[#0C0E0E] truncate text-sm"
              style={{ fontFamily: "'Lato', sans-serif" }}
            >
              {title}
            </span>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0 ml-4">
            <a
              href={url}
              download
              className="text-xs text-[#215A9F] hover:underline"
              style={{ fontFamily: "'Lato', sans-serif" }}
            >
              Baixar
            </a>
            <button
              onClick={onClose}
              className="text-[#777777] hover:text-[#0C0E0E] text-2xl font-light leading-none"
            >
              ×
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto bg-[#F5F5F5] p-4">
          {loading && (
            <div
              className="flex items-center justify-center h-full text-[#777777] text-sm"
              style={{ fontFamily: "'Lato', sans-serif" }}
            >
              Carregando documento...
            </div>
          )}
          {error && (
            <div
              className="flex items-center justify-center h-full text-red-500 text-sm"
              style={{ fontFamily: "'Lato', sans-serif" }}
            >
              {error}
            </div>
          )}
          <div ref={containerRef} className={loading || error ? 'hidden' : ''} />
        </div>
      </div>
    </div>
  )
}
