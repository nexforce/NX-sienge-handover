import Link from 'next/link'
import { StatusBadge } from './StatusBadge'
import { formatDistanceToNow } from '@/lib/format'

interface DocumentCardProps {
  id: string
  nome: string
  revisor: string
  statusAtual: string
  ultimaAtualizacao: string
}

export function DocumentCard({
  id,
  nome,
  revisor,
  statusAtual,
  ultimaAtualizacao,
}: DocumentCardProps) {
  return (
    <Link href={`/documents/${id.replace('.', '/')}`}>
      <div className="bg-white rounded-lg border border-[#9C9B9B] hover:shadow-lg transition-shadow p-6 cursor-pointer">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-bold text-[#0C0E0E] flex-1" style={{ fontFamily: "'Lato', sans-serif" }}>
            {nome}
          </h3>
          <StatusBadge status={statusAtual} className="ml-2" />
        </div>

        <div className="text-sm text-[#515151] mb-2" style={{ fontFamily: "'Lato', sans-serif" }}>
          <div className="font-medium">Revisor: {revisor}</div>
        </div>

        <div className="text-xs text-[#777777] pt-3 border-t border-[#9C9B9B]" style={{ fontFamily: "'Lato', sans-serif" }}>
          Atualizado {formatDistanceToNow(new Date(ultimaAtualizacao))} atrás
        </div>
      </div>
    </Link>
  )
}
