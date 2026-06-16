'use client'

import { useEffect, useState, use } from 'react'
import Link from 'next/link'
import { AddVersionModal } from '@/components/AddVersionModal'
import { VersionCard } from '@/components/VersionCard'
import { StatusBadge } from '@/components/StatusBadge'
import { AgentChat } from '@/components/AgentChat'
import { Status } from '@prisma/client'

interface DocumentVersion {
  id: string
  numeroVersao: string
  linkDocumento?: string
  status: Status
  dataCriacao: string
}

interface DocumentDetail {
  id: string
  nome: string
  revisor: string
  statusAtual: Status
  versions: DocumentVersion[]
}

export default function DocumentPage({ params }: { params: Promise<{ id: string[] }> }) {
  const { id: idArray } = use(params)
  const id = idArray.join('.')
  const [document, setDocument] = useState<DocumentDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null)

  useEffect(() => {
    fetchDocument()
  }, [id])

  async function fetchDocument() {
    setLoading(true)
    try {
      const response = await fetch(`/api/documents/${id.replace('.', '/')}`)
      if (!response.ok) throw new Error('Document not found')
      const data: DocumentDetail = await response.json()
      setDocument(data)
      // Auto-select the latest version if none is selected yet
      setSelectedVersionId(prev => prev ?? data.versions.at(-1)?.id ?? null)
    } catch (error) {
      console.error('Failed to fetch document:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddVersion = async (data: { linkDocumento?: string; status: Status }) => {
    try {
      await fetch('/api/versions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId: id, linkDocumento: data.linkDocumento, status: data.status }),
      })
      await fetchDocument()
    } catch (error) {
      console.error('Failed to add version:', error)
    }
  }

  const handleStatusChange = async (versionId: string, status: Status) => {
    try {
      await fetch(`/api/versions/${versionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      await fetchDocument()
    } catch (error) {
      console.error('Failed to update status:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <p className="text-[#777777]" style={{ fontFamily: "'Lato', sans-serif" }}>Carregando documento...</p>
      </div>
    )
  }

  if (!document) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-white gap-4">
        <p className="text-[#BA1925]" style={{ fontFamily: "'Lato', sans-serif" }}>Documento não encontrado</p>
        <Link href="/" className="text-[#215A9F] hover:underline text-sm" style={{ fontFamily: "'Lato', sans-serif" }}>
          ← Voltar ao dashboard
        </Link>
      </div>
    )
  }

  const selectedVersion = document.versions.find(v => v.id === selectedVersionId)

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header — full width */}
      <header className="flex-shrink-0 border-b border-[#9C9B9B] bg-white">
        <div className="px-6 py-4">
          <Link href="/" className="text-[#215A9F] hover:underline mb-3 inline-block text-sm" style={{ fontFamily: "'Lato', sans-serif" }}>
            ← Voltar ao dashboard
          </Link>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-[#0C0E0E]" style={{ fontFamily: "'Lato', sans-serif", fontWeight: 900 }}>
                {document.nome}
              </h1>
              <p className="text-[#777777] text-sm mt-1" style={{ fontFamily: "'Lato', sans-serif" }}>
                ID: {document.id}
              </p>
              <div className="mt-2 text-sm text-[#515151]" style={{ fontFamily: "'Lato', sans-serif" }}>
                Revisor: <span className="font-bold">{document.revisor}</span>
              </div>
            </div>
            <div className="flex-shrink-0">
              <StatusBadge status={document.statusAtual} />
            </div>
          </div>
        </div>
      </header>

      {/* Main — two columns, fills remaining viewport height */}
      <main className="flex flex-1 overflow-hidden">
        {/* Left column: versions list (30%) */}
        <div className="w-[30%] border-r border-[#E0E0E0] bg-[#F5F5F5] overflow-y-auto p-4 flex flex-col gap-3">
          <p className="text-xs font-bold uppercase text-[#777777] tracking-wide" style={{ fontFamily: "'Lato', sans-serif" }}>
            Versões
          </p>

          {document.versions.length === 0 ? (
            <p className="text-[#515151] text-sm text-center py-8" style={{ fontFamily: "'Lato', sans-serif" }}>
              Nenhuma versão cadastrada
            </p>
          ) : (
            document.versions.map(version => (
              <VersionCard
                key={version.id}
                id={version.id}
                numeroVersao={version.numeroVersao}
                linkDocumento={version.linkDocumento}
                status={version.status}
                dataCriacao={new Date(version.dataCriacao)}
                isSelected={selectedVersionId === version.id}
                onSelect={() => setSelectedVersionId(version.id)}
                onStatusChange={status => handleStatusChange(version.id, status)}
              />
            ))
          )}

          <button
            onClick={() => setModalOpen(true)}
            className="mt-auto w-full py-2 border border-dashed border-[#9C9B9B] rounded-md text-sm text-[#777777] hover:border-[#215A9F] hover:text-[#215A9F] transition-colors"
            style={{ fontFamily: "'Lato', sans-serif" }}
          >
            + Nova Versão
          </button>
        </div>

        {/* Right column: agent chat (70%) */}
        <div className="flex-1 flex flex-col overflow-hidden bg-white">
          {selectedVersionId ? (
            <>
              {/* Panel header */}
              <div className="flex-shrink-0 flex items-center gap-3 px-5 py-3 border-b border-[#E0E0E0]">
                <h2 className="font-bold text-[#0C0E0E]" style={{ fontFamily: "'Lato', sans-serif" }}>
                  Agente de Revisão
                </h2>
                {selectedVersion && (
                  <span
                    className="text-xs bg-[#EFF5FF] text-[#215A9F] border border-[#215A9F] rounded-full px-2 py-0.5"
                    style={{ fontFamily: "'Lato', sans-serif" }}
                  >
                    {selectedVersion.numeroVersao} selecionada
                  </span>
                )}
              </div>

              {/* Chat fills remaining space */}
              <div className="flex-1 overflow-hidden">
                <AgentChat versionId={selectedVersionId} />
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-[#777777] text-sm" style={{ fontFamily: "'Lato', sans-serif" }}>
              Selecione uma versão para iniciar
            </div>
          )}
        </div>
      </main>

      <AddVersionModal
        documentId={id}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleAddVersion}
      />
    </div>
  )
}
