'use client'

import { useEffect, useState, use } from 'react'
import Link from 'next/link'
import { AddVersionModal } from '@/components/AddVersionModal'
import { VersionCard } from '@/components/VersionCard'
import { StatusBadge } from '@/components/StatusBadge'
import { Status } from '@prisma/client'

interface DocumentVersion {
  id: string
  numeroVersao: string
  linkDocumento?: string
  status: Status
  dataCriacao: string
  comments: Array<{
    id: string
    autor: string
    mensagem: string
    dataCriacao: string
  }>
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

  useEffect(() => {
    fetchDocument()
  }, [id])

  async function fetchDocument() {
    setLoading(true)
    try {
      const response = await fetch(`/api/documents/${id.replace('.', '/')}`)
      if (!response.ok) throw new Error('Document not found')
      const data = await response.json()
      setDocument(data)
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
        body: JSON.stringify({
          documentId: id,
          linkDocumento: data.linkDocumento,
          status: data.status,
        }),
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

  const handleDeleteComment = async (commentId: string) => {
    try {
      await fetch(`/api/comments/${commentId}`, { method: 'DELETE' })
      await fetchDocument()
    } catch (error) {
      console.error('Failed to delete comment:', error)
    }
  }

  const handleAddComment = async (versionId: string, mensagem: string) => {
    try {
      await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ versionId, mensagem }),
      })
      await fetchDocument()
    } catch (error) {
      console.error('Failed to add comment:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <p className="text-gray-500">Carregando documento...</p>
        </div>
      </div>
    )
  }

  if (!document) {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <p className="text-red-600">Documento não encontrado</p>
          <Link href="/" className="text-blue-600 hover:underline mt-4 inline-block">
            ← Voltar ao dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-[#9C9B9B] bg-white">
        <div className="max-w-4xl mx-auto px-4 py-4">
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

      <main className="max-w-4xl mx-auto px-4 py-8 bg-[#F5F5F5] min-h-screen">
        <div className="flex justify-end mb-6">
          <button
            onClick={() => setModalOpen(true)}
            className="px-4 py-2 bg-[#215A9F] text-white rounded-md text-sm font-medium hover:bg-[#1a466b]"
            style={{ fontFamily: "'Lato', sans-serif" }}
          >
            + Nova Versão
          </button>
        </div>

        <div className="space-y-4">
          {document.versions.length === 0 ? (
            <p className="text-[#515151] text-center py-8" style={{ fontFamily: "'Lato', sans-serif" }}>
              Nenhuma versão cadastrada
            </p>
          ) : (
            document.versions.map((version) => (
              <VersionCard
                key={version.id}
                id={version.id}
                numeroVersao={version.numeroVersao}
                linkDocumento={version.linkDocumento}
                status={version.status}
                dataCriacao={new Date(version.dataCriacao)}
                comments={version.comments.map((c) => ({
                  ...c,
                  dataCriacao: new Date(c.dataCriacao),
                }))}
                onStatusChange={(status) => handleStatusChange(version.id, status)}
                onAddComment={(mensagem) => handleAddComment(version.id, mensagem)}
                onDeleteComment={handleDeleteComment}
              />
            ))
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
