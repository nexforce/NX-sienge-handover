'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'

const ADMIN_EMAIL = 'hugo.zanni@nexforce.ai'

interface UsageLog {
  id: string
  processId: string
  versionId: string
  chain: string
  inputTokens: number
  outputTokens: number
  costUsd: number
  createdAt: string
}

interface Aggregate {
  processId: string
  processName: string
  count: number
  inputTokens: number
  outputTokens: number
  costUsd: number
}

interface Document {
  id: string
  nome: string
}

interface DocumentVersion {
  id: string
  numeroVersao: string
}

function formatCost(costUsd: number): string {
  if (costUsd < 0.001) return '< $0.001'
  return `$${costUsd.toFixed(5)}`
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function AdminLogsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [processes, setProcesses] = useState<Document[]>([])
  const [versions, setVersions] = useState<DocumentVersion[]>([])
  const [logs, setLogs] = useState<UsageLog[]>([])
  const [aggregates, setAggregates] = useState<Aggregate[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [processFilter, setProcessFilter] = useState('')
  const [versionFilter, setVersionFilter] = useState('')
  const [chainFilter, setChainFilter] = useState('')

  useEffect(() => {
    if (status === 'loading') return
    if (!session) { router.replace('/login'); return }
    if (session.user?.email !== ADMIN_EMAIL) { router.replace('/'); return }
  }, [session, status, router])

  useEffect(() => {
    if (session?.user?.email !== ADMIN_EMAIL) return
    fetch('/api/documents')
      .then((r) => r.json())
      .then((data: Document[]) => setProcesses(data))
      .catch(() => {})
  }, [session])

  useEffect(() => {
    setVersionFilter('')
    setVersions([])
    if (!processFilter) return
    fetch(`/api/documents/${processFilter}`)
      .then((r) => r.json())
      .then((data: { versions?: DocumentVersion[] }) => setVersions(data.versions ?? []))
      .catch(() => {})
  }, [processFilter])

  const fetchLogs = useCallback(() => {
    if (session?.user?.email !== ADMIN_EMAIL) return
    const params = new URLSearchParams()
    if (processFilter) params.set('processId', processFilter)
    if (versionFilter) params.set('versionId', versionFilter)
    if (chainFilter) params.set('chain', chainFilter)

    setLoading(true)
    setError(null)
    fetch(`/api/admin/logs?${params.toString()}`)
      .then((r) => {
        if (!r.ok) throw new Error('fetch failed')
        return r.json()
      })
      .then((data: { logs: UsageLog[]; aggregates: Aggregate[] }) => {
        setLogs(data.logs)
        setAggregates(data.aggregates)
      })
      .catch(() => setError('Erro ao carregar logs.'))
      .finally(() => setLoading(false))
  }, [session, processFilter, versionFilter, chainFilter])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  if (status === 'loading' || !session || session.user?.email !== ADMIN_EMAIL) {
    return null
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="border-b border-[#215A9F] pb-4">
          <h1 className="text-2xl font-bold text-[#0C0E0E]">Logs de Uso — Agentes</h1>
          <p className="text-sm text-[#515151] mt-1">Monitoramento de tokens e custo por processo</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 bg-white rounded-lg p-4 shadow-sm">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-[#515151] uppercase tracking-wide">Processo</label>
            <select
              value={processFilter}
              onChange={(e) => setProcessFilter(e.target.value)}
              className="border border-gray-200 rounded px-3 py-1.5 text-sm text-[#0C0E0E] min-w-[200px] focus:outline-none focus:ring-2 focus:ring-[#215A9F]"
            >
              <option value="">Todos os processos</option>
              {processes.map((p) => (
                <option key={p.id} value={p.id}>{p.nome}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-[#515151] uppercase tracking-wide">Versão</label>
            <select
              value={versionFilter}
              onChange={(e) => setVersionFilter(e.target.value)}
              disabled={!processFilter}
              className="border border-gray-200 rounded px-3 py-1.5 text-sm text-[#0C0E0E] min-w-[140px] focus:outline-none focus:ring-2 focus:ring-[#215A9F] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <option value="">Todas as versões</option>
              {versions.map((v) => (
                <option key={v.id} value={v.id}>{v.numeroVersao}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-[#515151] uppercase tracking-wide">Chain</label>
            <select
              value={chainFilter}
              onChange={(e) => setChainFilter(e.target.value)}
              className="border border-gray-200 rounded px-3 py-1.5 text-sm text-[#0C0E0E] min-w-[140px] focus:outline-none focus:ring-2 focus:ring-[#215A9F]"
            >
              <option value="">Todos</option>
              <option value="chat">chat</option>
              <option value="plan">plan</option>
              <option value="accept">accept</option>
            </select>
          </div>
        </div>

        {error && (
          <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded px-4 py-2">{error}</p>
        )}

        {/* Aggregates */}
        {aggregates.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-[#0C0E0E]">Totais por Processo</h2>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-[#F5F5F5]">
                <tr>
                  <th className="text-left px-4 py-2 text-xs font-semibold text-[#515151] uppercase tracking-wide">Processo</th>
                  <th className="text-right px-4 py-2 text-xs font-semibold text-[#515151] uppercase tracking-wide">Interações</th>
                  <th className="text-right px-4 py-2 text-xs font-semibold text-[#515151] uppercase tracking-wide">Tokens Input</th>
                  <th className="text-right px-4 py-2 text-xs font-semibold text-[#515151] uppercase tracking-wide">Tokens Output</th>
                  <th className="text-right px-4 py-2 text-xs font-semibold text-[#515151] uppercase tracking-wide">Custo (USD)</th>
                </tr>
              </thead>
              <tbody>
                {aggregates.map((a) => (
                  <tr key={a.processId} className="border-t border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-2 text-[#0C0E0E] font-medium">{a.processName}</td>
                    <td className="px-4 py-2 text-right text-[#515151]">{a.count}</td>
                    <td className="px-4 py-2 text-right text-[#515151]">{a.inputTokens.toLocaleString()}</td>
                    <td className="px-4 py-2 text-right text-[#515151]">{a.outputTokens.toLocaleString()}</td>
                    <td className="px-4 py-2 text-right font-medium text-[#215A9F]">{formatCost(a.costUsd)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Logs table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[#0C0E0E]">Logs Individuais</h2>
            {loading && <span className="text-xs text-[#515151]">Carregando...</span>}
          </div>

          {!loading && logs.length === 0 ? (
            <p className="text-center text-[#515151] py-10 text-sm">Nenhuma interação registrada ainda.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#F5F5F5]">
                  <tr>
                    <th className="text-left px-4 py-2 text-xs font-semibold text-[#515151] uppercase tracking-wide whitespace-nowrap">Data/Hora</th>
                    <th className="text-left px-4 py-2 text-xs font-semibold text-[#515151] uppercase tracking-wide">Processo</th>
                    <th className="text-left px-4 py-2 text-xs font-semibold text-[#515151] uppercase tracking-wide">Versão</th>
                    <th className="text-left px-4 py-2 text-xs font-semibold text-[#515151] uppercase tracking-wide">Chain</th>
                    <th className="text-right px-4 py-2 text-xs font-semibold text-[#515151] uppercase tracking-wide">Tokens In</th>
                    <th className="text-right px-4 py-2 text-xs font-semibold text-[#515151] uppercase tracking-wide">Tokens Out</th>
                    <th className="text-right px-4 py-2 text-xs font-semibold text-[#515151] uppercase tracking-wide">Custo (USD)</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} className="border-t border-gray-50 hover:bg-gray-50">
                      <td className="px-4 py-2 text-[#515151] whitespace-nowrap">{formatDate(log.createdAt)}</td>
                      <td className="px-4 py-2 text-[#0C0E0E]">{log.processId}</td>
                      <td className="px-4 py-2 text-[#515151] font-mono text-xs">{log.versionId.slice(0, 8)}…</td>
                      <td className="px-4 py-2">
                        <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-[#215A9F]/10 text-[#215A9F]">
                          {log.chain}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-right text-[#515151]">{log.inputTokens.toLocaleString()}</td>
                      <td className="px-4 py-2 text-right text-[#515151]">{log.outputTokens.toLocaleString()}</td>
                      <td className="px-4 py-2 text-right font-medium text-[#215A9F]">{formatCost(log.costUsd)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
