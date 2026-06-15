'use client'

import { useState } from 'react'
import { Status } from '@prisma/client'
import { allStatuses, statusConfig } from '@/lib/status'

interface AddVersionModalProps {
  documentId: string
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: { linkDocumento?: string; status: Status }) => Promise<void>
}

export function AddVersionModal({
  documentId,
  isOpen,
  onClose,
  onSubmit,
}: AddVersionModalProps) {
  const [linkDocumento, setLinkDocumento] = useState('')
  const [status, setStatus] = useState<Status>(Status.Pendente)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await onSubmit({
        linkDocumento: linkDocumento || undefined,
        status,
      })
      setLinkDocumento('')
      setStatus(Status.Pendente)
      onClose()
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md border border-[#9C9B9B]">
        <h2 className="text-xl font-bold text-[#0C0E0E] mb-4" style={{ fontFamily: "'Lato', sans-serif" }}>
          Nova Versão
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-[#0C0E0E] mb-1" style={{ fontFamily: "'Lato', sans-serif" }}>
              Link do Documento (Google Docs, PDF, etc.)
            </label>
            <input
              type="url"
              value={linkDocumento}
              onChange={(e) => setLinkDocumento(e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-2 border border-[#9C9B9B] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#215A9F] text-[#515151]"
              style={{ fontFamily: "'Lato', sans-serif" }}
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-[#0C0E0E] mb-1" style={{ fontFamily: "'Lato', sans-serif" }}>
              Status Inicial
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as Status)}
              className="w-full px-3 py-2 border border-[#9C9B9B] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#215A9F] text-[#515151]"
              style={{ fontFamily: "'Lato', sans-serif" }}
            >
              {allStatuses.map((s) => (
                <option key={s} value={s}>
                  {statusConfig[s].label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-[#0C0E0E] border border-[#9C9B9B] rounded-md text-sm font-medium hover:bg-[#F5F5F5]"
              style={{ fontFamily: "'Lato', sans-serif" }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-[#215A9F] text-white rounded-md text-sm font-medium hover:bg-[#1a466b] disabled:opacity-50"
              style={{ fontFamily: "'Lato', sans-serif" }}
            >
              {loading ? 'Adicionando...' : 'Adicionar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
