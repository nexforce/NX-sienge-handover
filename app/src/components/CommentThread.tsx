'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { formatDateTime } from '@/lib/format'

interface Comment {
  id: string
  autor: string
  mensagem: string
  dataCriacao: Date
}

interface CommentThreadProps {
  comments: Comment[]
  onAddComment: (mensagem: string) => Promise<void>
  onDeleteComment: (commentId: string) => Promise<void>
}

export function CommentThread({ comments, onAddComment, onDeleteComment }: CommentThreadProps) {
  const { data: session } = useSession()
  const [mensagem, setMensagem] = useState('')
  const [loading, setLoading] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const autorAtual = session?.user?.name ?? session?.user?.email ?? null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!mensagem.trim()) return
    setLoading(true)
    try {
      await onAddComment(mensagem)
      setMensagem('')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (commentId: string) => {
    setDeletingId(commentId)
    try {
      await onDeleteComment(commentId)
    } finally {
      setDeletingId(null)
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
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#777777]" style={{ fontFamily: "'Lato', sans-serif" }}>
                    {formatDateTime(new Date(comment.dataCriacao))}
                  </span>
                  {autorAtual === comment.autor && (
                    <button
                      onClick={() => handleDelete(comment.id)}
                      disabled={deletingId === comment.id}
                      className="text-[#9C9B9B] hover:text-[#BA1925] text-base leading-none disabled:opacity-40 transition-colors"
                      title="Apagar comentário"
                      aria-label="Apagar comentário"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>
              <p className="text-[#515151]" style={{ fontFamily: "'Lato', sans-serif" }}>
                {comment.mensagem}
              </p>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
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
          disabled={loading || !mensagem.trim()}
          className="w-full px-4 py-2 bg-[#215A9F] text-white rounded-md text-sm font-medium hover:bg-[#1a466b] disabled:opacity-50"
          style={{ fontFamily: "'Lato', sans-serif" }}
        >
          {loading ? 'Enviando...' : 'Adicionar Comentário'}
        </button>
      </form>
    </div>
  )
}
