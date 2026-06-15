'use client'

import { useState } from 'react'
import { formatDateTime } from '@/lib/format'

interface Comment {
  id: string
  autor: string
  mensagem: string
  dataCriacao: Date
}

interface CommentThreadProps {
  comments: Comment[]
  onAddComment: (autor: string, mensagem: string) => Promise<void>
}

export function CommentThread({ comments, onAddComment }: CommentThreadProps) {
  const [autor, setAutor] = useState('')
  const [mensagem, setMensagem] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!autor.trim() || !mensagem.trim()) return

    setLoading(true)
    try {
      await onAddComment(autor, mensagem)
      setMensagem('')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-6">
      <h3 className="text-lg font-bold text-[#0C0E0E] mb-4" style={{ fontFamily: "'Lato', sans-serif" }}>
        Comentários
      </h3>

      {comments.length > 0 && (
        <div className="space-y-4 mb-6">
          {comments.map((comment) => (
            <div key={comment.id} className="bg-[#F5F5F5] rounded p-4 border border-[#9C9B9B]">
              <div className="flex justify-between items-start mb-2">
                <span className="font-bold text-[#0C0E0E]" style={{ fontFamily: "'Lato', sans-serif" }}>
                  {comment.autor}
                </span>
                <span className="text-xs text-[#777777]" style={{ fontFamily: "'Lato', sans-serif" }}>
                  {formatDateTime(new Date(comment.dataCriacao))}
                </span>
              </div>
              <p className="text-[#515151]" style={{ fontFamily: "'Lato', sans-serif" }}>
                {comment.mensagem}
              </p>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          placeholder="Seu nome..."
          value={autor}
          onChange={(e) => setAutor(e.target.value)}
          className="w-full px-3 py-2 border border-[#9C9B9B] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#215A9F] text-[#515151]"
          style={{ fontFamily: "'Lato', sans-serif" }}
        />
        <textarea
          placeholder="Escreva seu comentário..."
          value={mensagem}
          onChange={(e) => setMensagem(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-[#9C9B9B] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#215A9F] text-[#515151]"
          style={{ fontFamily: "'Lato', sans-serif" }}
        />
        <button
          type="submit"
          disabled={loading || !autor.trim() || !mensagem.trim()}
          className="w-full px-4 py-2 bg-[#215A9F] text-white rounded-md text-sm font-medium hover:bg-[#1a466b] disabled:opacity-50"
          style={{ fontFamily: "'Lato', sans-serif" }}
        >
          {loading ? 'Enviando...' : 'Adicionar Comentário'}
        </button>
      </form>
    </div>
  )
}
