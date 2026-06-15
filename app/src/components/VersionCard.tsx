'use client'

import { useState } from 'react'
import { Status } from '@prisma/client'
import { StatusBadge } from './StatusBadge'
import { CommentThread } from './CommentThread'
import { formatDate } from '@/lib/format'
import { allStatuses, statusConfig } from '@/lib/status'

interface Comment {
  id: string
  autor: string
  mensagem: string
  dataCriacao: Date
}

interface VersionCardProps {
  id: string
  numeroVersao: string
  linkDocumento?: string
  status: Status
  dataCriacao: Date
  comments: Comment[]
  onStatusChange: (status: Status) => Promise<void>
  onAddComment: (autor: string, mensagem: string) => Promise<void>
}

export function VersionCard({
  id,
  numeroVersao,
  linkDocumento,
  status,
  dataCriacao,
  comments,
  onStatusChange,
  onAddComment,
}: VersionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [statusLoading, setStatusLoading] = useState(false)

  const handleStatusChange = async (newStatus: Status) => {
    setStatusLoading(true)
    try {
      await onStatusChange(newStatus)
    } finally {
      setStatusLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg p-4 border border-[#9C9B9B]">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-bold text-[#0C0E0E]" style={{ fontFamily: "'Lato', sans-serif" }}>
            {numeroVersao}
          </h4>
          <p className="text-xs text-[#777777]" style={{ fontFamily: "'Lato', sans-serif" }}>
            {formatDate(dataCriacao)}
          </p>
        </div>
        <StatusBadge status={status} />
      </div>

      {linkDocumento && (
        <div className="mb-3">
          <a
            href={linkDocumento}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#215A9F] text-sm hover:underline break-all"
            style={{ fontFamily: "'Lato', sans-serif" }}
          >
            📄 Abrir documento
          </a>
        </div>
      )}

      <div className="mb-3">
        <label className="block text-xs font-medium text-[#0C0E0E] mb-1" style={{ fontFamily: "'Lato', sans-serif" }}>
          Atualizar Status
        </label>
        <select
          value={status}
          onChange={(e) => handleStatusChange(e.target.value as Status)}
          disabled={statusLoading}
          className="w-full px-2 py-1 text-xs border border-[#9C9B9B] rounded focus:outline-none focus:ring-2 focus:ring-[#215A9F] disabled:opacity-50 text-[#515151]"
          style={{ fontFamily: "'Lato', sans-serif" }}
        >
          {allStatuses.map((s) => (
            <option key={s} value={s}>
              {statusConfig[s].label}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full text-left px-2 py-1 text-sm text-[#215A9F] hover:underline"
        style={{ fontFamily: "'Lato', sans-serif" }}
      >
        {isExpanded ? '▼ Ocultar comentários' : `▶ Ver comentários (${comments.length})`}
      </button>

      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-[#9C9B9B]">
          <CommentThread comments={comments} onAddComment={onAddComment} />
        </div>
      )}
    </div>
  )
}
