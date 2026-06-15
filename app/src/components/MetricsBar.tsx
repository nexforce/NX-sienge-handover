'use client'

import { Status } from '@prisma/client'
import { statusConfig } from '@/lib/status'

interface MetricsBarProps {
  documents: any[]
}

export function MetricsBar({ documents }: MetricsBarProps) {
  const counts = {
    total: documents.length,
    [Status.Pendente]: documents.filter((d) => d.statusAtual === Status.Pendente).length,
    [Status.EmProgresso]: documents.filter((d) => d.statusAtual === Status.EmProgresso).length,
    [Status.UnderReview]: documents.filter((d) => d.statusAtual === Status.UnderReview).length,
    [Status.ReviewRefused]: documents.filter((d) => d.statusAtual === Status.ReviewRefused).length,
    [Status.ReviewApproved]: documents.filter((d) => d.statusAtual === Status.ReviewApproved).length,
    [Status.Done]: documents.filter((d) => d.statusAtual === Status.Done).length,
  }

  const metrics = [
    { label: 'Total', count: counts.total, bgColor: 'bg-[#F5F5F5]' },
    {
      label: statusConfig[Status.Pendente].label,
      count: counts[Status.Pendente],
      bgColor: statusConfig[Status.Pendente].bgColor,
    },
    {
      label: statusConfig[Status.EmProgresso].label,
      count: counts[Status.EmProgresso],
      bgColor: statusConfig[Status.EmProgresso].bgColor,
    },
    {
      label: statusConfig[Status.UnderReview].label,
      count: counts[Status.UnderReview],
      bgColor: statusConfig[Status.UnderReview].bgColor,
    },
    {
      label: statusConfig[Status.ReviewRefused].label,
      count: counts[Status.ReviewRefused],
      bgColor: statusConfig[Status.ReviewRefused].bgColor,
    },
    {
      label: statusConfig[Status.ReviewApproved].label,
      count: counts[Status.ReviewApproved],
      bgColor: statusConfig[Status.ReviewApproved].bgColor,
    },
    { label: 'Done', count: counts[Status.Done], bgColor: statusConfig[Status.Done].bgColor },
  ]

  return (
    <div className="grid grid-cols-7 gap-4 mb-8">
      {metrics.map((metric) => (
        <div key={metric.label} className={`p-4 rounded-lg ${metric.bgColor} text-center border border-[#9C9B9B]`}>
          <div className="text-2xl font-bold text-[#0C0E0E]" style={{ fontFamily: "'Lato', sans-serif", fontWeight: 900 }}>
            {metric.count}
          </div>
          <div className="text-xs text-[#515151] mt-1" style={{ fontFamily: "'Lato', sans-serif" }}>
            {metric.label}
          </div>
        </div>
      ))}
    </div>
  )
}
