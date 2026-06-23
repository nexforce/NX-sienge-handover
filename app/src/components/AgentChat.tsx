'use client'

import { useState, useEffect, useRef } from 'react'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: string
}

interface AgentChatProps {
  versionId: string
}

interface AcceptResult {
  versionId: string
  numeroVersao: string
  appliedEdits?: number
  proposedEdits?: number
  droppedEdits?: number
}

export function AgentChat({ versionId }: AgentChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [streamingText, setStreamingText] = useState('')
  const [acceptLoading, setAcceptLoading] = useState(false)
  const [acceptedVersion, setAcceptedVersion] = useState<AcceptResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [toolStatus, setToolStatus] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Reset all state and fetch history when version changes
  useEffect(() => {
    setError(null)
    setAcceptedVersion(null)
    setStreaming(false)
    setStreamingText('')
    setToolStatus(null)
    setInput('')
    setMessages([])
    fetchHistory()
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        buffer = lines.pop() ?? ''
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const data = line.slice(6)
          if (data === '[DONE]') break
          try {
            const parsed = JSON.parse(data)
            if (parsed.error) throw new Error(parsed.error)
            if (parsed.status) {
              setToolStatus(parsed.status)
            }
            if (parsed.text) {
              setToolStatus(null)
              accumulated += parsed.text
              setStreamingText(accumulated)
            }
          } catch (parseErr) {
            if ((parseErr as Error).message && !(parseErr instanceof SyntaxError)) {
              throw parseErr
            }
          }
        }
      }

      setStreamingText('')
      setToolStatus(null)
      await fetchHistory()
    } catch (err) {
      setError((err as Error).message || 'Erro ao contatar o agente. Tente novamente.')
      setToolStatus(null)
      setMessages(prev => prev.filter(m => m.id !== tmpId))
    } finally {
      setStreaming(false)
    }
  }

  async function handleAccept() {
    setAcceptLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/chat/${versionId}/accept`, { method: 'POST' })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error((body as { error?: string }).error || 'Falha ao criar nova versão.')
      }
      const data: AcceptResult = await res.json()
      setAcceptedVersion(data)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setAcceptLoading(false)
    }
  }

  const hasMessages = messages.length > 0

  return (
    <div className="flex flex-col h-full p-4 gap-3">
      {/* Message history — grows to fill available space, scrolls internally */}
      <div className="flex flex-col gap-3 flex-1 overflow-y-auto pr-1 min-h-0">
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

        {toolStatus && (
          <div className="self-start flex items-center gap-2 text-xs text-[#777777] italic px-2" style={{ fontFamily: "'Lato', sans-serif" }}>
            <span className="inline-block w-3 h-3 border-2 border-[#215A9F] border-t-transparent rounded-full animate-spin flex-shrink-0" />
            {toolStatus}
          </div>
        )}

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

      {/* Fixed bottom area: error, success banner, input */}
      <div className="flex-shrink-0 flex flex-col gap-3">
        {error && (
          <p className="text-sm text-[#BA1925]" style={{ fontFamily: "'Lato', sans-serif" }}>
            {error}
          </p>
        )}

        {acceptedVersion && (
          <div className="border border-green-400 rounded-lg p-3 bg-green-50 text-sm text-green-800" style={{ fontFamily: "'Lato', sans-serif" }}>
            Nova versão <strong>{acceptedVersion.numeroVersao}</strong> criada. Recarregue a página para visualizá-la.
            {typeof acceptedVersion.appliedEdits === 'number' && (
              <span className="block mt-1 text-green-900">
                {acceptedVersion.appliedEdits} de {acceptedVersion.proposedEdits} edição(ões) aplicada(s).
              </span>
            )}
            {acceptedVersion.droppedEdits ? (
              <span className="block mt-1 text-amber-700">
                ⚠ {acceptedVersion.droppedEdits} edição(ões) proposta(s) não correspondeu(eram) ao texto atual e foi(ram) ignorada(s). Reformule o pedido e tente novamente se faltou algo.
              </span>
            ) : null}
          </div>
        )}

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
            {hasMessages && !streaming && (
              <button
                type="button"
                onClick={handleAccept}
                disabled={acceptLoading}
                className="px-4 py-2 border border-[#215A9F] text-[#215A9F] rounded-md text-sm font-medium hover:bg-blue-50 disabled:opacity-50"
                style={{ fontFamily: "'Lato', sans-serif" }}
              >
                {acceptLoading ? 'Gerando nova versão...' : 'Aceitar e Gerar Nova Versão'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
