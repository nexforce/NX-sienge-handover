'use client'

import { useState, useEffect, useRef } from 'react'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: string
}

interface PlanChange {
  section: string
  description: string
  rationale: string
}

interface Plan {
  title: string
  changes: PlanChange[]
}

interface AgentChatProps {
  versionId: string
}

export function AgentChat({ versionId }: AgentChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [streamingText, setStreamingText] = useState('')
  const [planLoading, setPlanLoading] = useState(false)
  const [plan, setPlan] = useState<Plan | null>(null)
  const [acceptLoading, setAcceptLoading] = useState(false)
  const [acceptedVersion, setAcceptedVersion] = useState<{ versionId: string; numeroVersao: string } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchHistory()
  }, [versionId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingText])

  async function fetchHistory() {
    try {
      const res = await fetch(`/api/chat/${versionId}`)
      if (!res.ok) return
      const data: ChatMessage[] = await res.json()
      setMessages(data)
    } catch {
      // empty chat is valid — silent
    }
  }

  async function handleSend(e?: React.FormEvent) {
    e?.preventDefault()
    if (!input.trim() || streaming) return
    const text = input.trim()
    setInput('')
    setError(null)
    setStreaming(true)
    setStreamingText('')

    // Optimistic user message
    const tmpId = `tmp-${Date.now()}`
    setMessages(prev => [...prev, { id: tmpId, role: 'user', content: text, createdAt: new Date().toISOString() }])

    try {
      const res = await fetch(`/api/chat/${versionId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      })

      if (!res.ok || !res.body) throw new Error('Falha ao contatar o agente.')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let accumulated = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        // Keep the last (potentially incomplete) line in the buffer
        buffer = lines.pop() ?? ''
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const data = line.slice(6)
          if (data === '[DONE]') break
          try {
            const parsed = JSON.parse(data)
            if (parsed.error) throw new Error(parsed.error)
            if (parsed.text) {
              accumulated += parsed.text
              setStreamingText(accumulated)
            }
          } catch (parseErr) {
            // Only rethrow intentional server errors, skip JSON parse failures
            if ((parseErr as Error).message && !(parseErr instanceof SyntaxError)) {
              throw parseErr
            }
          }
        }
      }

      setStreamingText('')
      await fetchHistory()
    } catch (err) {
      setError((err as Error).message || 'Erro ao contatar o agente. Tente novamente.')
      setMessages(prev => prev.filter(m => m.id !== tmpId))
    } finally {
      setStreaming(false)
    }
  }

  async function handleGeneratePlan() {
    setPlanLoading(true)
    setError(null)
    setPlan(null)
    try {
      const res = await fetch(`/api/chat/${versionId}/plan`, { method: 'POST' })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error((body as { error?: string }).error || 'Falha ao gerar o plano.')
      }
      const data: Plan = await res.json()
      setPlan(data)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setPlanLoading(false)
    }
  }

  async function handleAccept() {
    if (!plan) return
    setAcceptLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/chat/${versionId}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(plan),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error((body as { error?: string }).error || 'Falha ao criar nova versão.')
      }
      const data: { versionId: string; numeroVersao: string } = await res.json()
      setAcceptedVersion(data)
      setPlan(null)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setAcceptLoading(false)
    }
  }

  const hasMessages = messages.length > 0

  return (
    <div className="mt-6 flex flex-col gap-4">
      <h3 className="text-lg font-bold text-[#0C0E0E]" style={{ fontFamily: "'Lato', sans-serif" }}>
        Agente de Revisão
      </h3>

      {/* Message history */}
      <div className="flex flex-col gap-3 max-h-96 overflow-y-auto pr-1">
        {!hasMessages && !streaming && (
          <p className="text-sm text-[#777777] italic" style={{ fontFamily: "'Lato', sans-serif" }}>
            Inicie a conversa com o agente para discutir revisões neste documento.
          </p>
        )}

        {messages.map(msg => (
          <div
            key={msg.id}
            className={`rounded-lg px-4 py-3 text-sm whitespace-pre-wrap ${
              msg.role === 'user'
                ? 'bg-[#215A9F] text-white self-end max-w-[80%]'
                : 'bg-[#F5F5F5] text-[#0C0E0E] border border-[#9C9B9B] self-start max-w-[90%]'
            }`}
            style={{ fontFamily: "'Lato', sans-serif" }}
          >
            {msg.content}
          </div>
        ))}

        {/* Streaming assistant bubble */}
        {streamingText && (
          <div
            className="rounded-lg px-4 py-3 text-sm whitespace-pre-wrap bg-[#F5F5F5] text-[#0C0E0E] border border-[#9C9B9B] self-start max-w-[90%]"
            style={{ fontFamily: "'Lato', sans-serif" }}
          >
            {streamingText}
            <span className="inline-block w-1 h-4 bg-[#215A9F] ml-1 animate-pulse align-middle" />
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Error message */}
      {error && (
        <p className="text-sm text-[#BA1925]" style={{ fontFamily: "'Lato', sans-serif" }}>
          {error}
        </p>
      )}

      {/* Plan card */}
      {plan && (
        <div className="border border-[#215A9F] rounded-lg p-4 bg-blue-50">
          <p className="font-bold text-[#0C0E0E] mb-2" style={{ fontFamily: "'Lato', sans-serif" }}>
            Plano: {plan.title}
          </p>
          <ul className="space-y-2 mb-4">
            {plan.changes.map((c, i) => (
              <li key={i} className="text-sm text-[#515151]" style={{ fontFamily: "'Lato', sans-serif" }}>
                <span className="font-semibold text-[#0C0E0E]">{c.section}:</span> {c.description}
                <br />
                <span className="text-xs text-[#777777]">{c.rationale}</span>
              </li>
            ))}
          </ul>
          <div className="flex gap-2">
            <button
              onClick={handleAccept}
              disabled={acceptLoading}
              className="px-4 py-2 bg-[#215A9F] text-white rounded-md text-sm font-medium hover:bg-[#1a466b] disabled:opacity-50"
              style={{ fontFamily: "'Lato', sans-serif" }}
            >
              {acceptLoading ? 'Gerando nova versão...' : 'Aceitar e Gerar Nova Versão'}
            </button>
            <button
              onClick={() => setPlan(null)}
              disabled={acceptLoading}
              className="px-4 py-2 border border-[#9C9B9B] text-[#515151] rounded-md text-sm hover:bg-[#F5F5F5] disabled:opacity-50"
              style={{ fontFamily: "'Lato', sans-serif" }}
            >
              Continuar refinando
            </button>
          </div>
        </div>
      )}

      {/* Success message */}
      {acceptedVersion && (
        <div className="border border-green-400 rounded-lg p-3 bg-green-50 text-sm text-green-800" style={{ fontFamily: "'Lato', sans-serif" }}>
          Nova versão <strong>{acceptedVersion.numeroVersao}</strong> criada. Recarregue a página para visualizá-la.
        </div>
      )}

      {/* Input form */}
      <form onSubmit={handleSend} className="flex flex-col gap-2">
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              void handleSend()
            }
          }}
          placeholder="Digite sua mensagem... (Enter para enviar, Shift+Enter para nova linha)"
          rows={3}
          disabled={streaming}
          className="w-full px-3 py-2 border border-[#9C9B9B] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#215A9F] text-[#515151] disabled:opacity-50"
          style={{ fontFamily: "'Lato', sans-serif" }}
        />
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={streaming || !input.trim()}
            className="flex-1 px-4 py-2 bg-[#215A9F] text-white rounded-md text-sm font-medium hover:bg-[#1a466b] disabled:opacity-50"
            style={{ fontFamily: "'Lato', sans-serif" }}
          >
            {streaming ? 'Aguardando agente...' : 'Enviar'}
          </button>
          {hasMessages && !streaming && !plan && (
            <button
              type="button"
              onClick={handleGeneratePlan}
              disabled={planLoading}
              className="px-4 py-2 border border-[#215A9F] text-[#215A9F] rounded-md text-sm font-medium hover:bg-blue-50 disabled:opacity-50"
              style={{ fontFamily: "'Lato', sans-serif" }}
            >
              {planLoading ? 'Gerando...' : 'Gerar Plano'}
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
