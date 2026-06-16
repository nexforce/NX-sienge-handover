'use client'

import { useState } from 'react'
import { Status } from '@prisma/client'
import { StatusBadge } from './StatusBadge'
import { DocxPreviewModal } from './DocxPreviewModal'
import { formatDate } from '@/lib/format'
import { allStatuses, statusConfig } from '@/lib/status'

interface VersionCardProps {
  id: string
  numeroVersao: string
  linkDocumento?: string
  status: Status
  dataCriacao: Date
  isSelected: boolean
  onSelect: () => void
  onStatusChange: (status: Status) => Promise<void>
}

export function VersionCard({
  id,
  numeroVersao,
  linkDocumento,
  status,
  dataCriacao,
  isSelected,
  onSelect,
  onStatusChange,
}: VersionCardProps) {
  const [statusLoading, setStatusLoading] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)

  const isLocalFile = linkDocumento?.startsWith('/api/files/')

  const handleStatusChange = async (newStatus: Status) => {
    setStatusLoading(true)
    try {
      await onStatusChange(newStatus)
    } finally {
      setStatusLoading(false)
    }
  }

  return (
    <div
      onClick={onSelect}
      className={`bg-white rounded-lg p-4 border cursor-pointer transition-all ${
        isSelected
          ? 'border-[#215A9F] ring-2 ring-[#215A9F]/20'
          : 'border-[#9C9B9B] hover:border-[#215A9F]/50'
      }`}
    >
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
          {isLocalFile ? (
            <button
              onClick={e => { e.stopPropagation(); setPreviewOpen(true) }}
              className="w-full flex items-center gap-3 p-3 bg-[#F5F5F5] border border-[#9C9B9B] rounded-md hover:border-[#215A9F] hover:bg-blue-50 transition-colors text-left group"
            >
              <div className="flex-shrink-0 w-10 h-12 bg-white border border-[#9C9B9B] rounded flex items-center justify-center shadow-sm group-hover:shadow">
                <span className="text-xl">📄</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-[#0C0E0E] truncate" style={{ fontFamily: "'Lato', sans-serif" }}>
                  {numeroVersao}
                </p>
                <p className="text-xs text-[#777777]" style={{ fontFamily: "'Lato', sans-serif" }}>
                  Clique para visualizar
                </p>
              </div>
              <span className="text-xs text-[#215A9F] font-medium flex-shrink-0" style={{ fontFamily: "'Lato', sans-serif" }}>
                Abrir →
              </span>
            </button>
          ) : (
            <a
              href={linkDocumento}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="text-[#215A9F] text-sm hover:underline break-all"
              style={{ fontFamily: "'Lato', sans-serif" }}
            >
              📄 Abrir documento
            </a>
          )}
        </div>
      )}

      {linkDocumento && isLocalFile && (
        <DocxPreviewModal
          url={linkDocumento}
          title={numeroVersao}
          isOpen={previewOpen}
          onClose={() => setPreviewOpen(false)}
        />
      )}

      <div onClick={e => e.stopPropagation()}>
        <label className="block text-xs font-medium text-[#0C0E0E] mb-1" style={{ fontFamily: "'Lato', sans-serif" }}>
          Atualizar Status
        </label>
        <select
          value={status}
          onChange={e => handleStatusChange(e.target.value as Status)}
          disabled={statusLoading}
          className="w-full px-2 py-1 text-xs border border-[#9C9B9B] rounded focus:outline-none focus:ring-2 focus:ring-[#215A9F] disabled:opacity-50 text-[#515151]"
          style={{ fontFamily: "'Lato', sans-serif" }}
        >
          {allStatuses.map(s => (
            <option key={s} value={s}>
              {statusConfig[s].label}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
