import { Status } from '@prisma/client'
import { getStatusConfig } from '@/lib/status'

interface StatusBadgeProps {
  status: Status
  className?: string
}

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const config = getStatusConfig(status)
  return (
    <span
      className={`px-3 py-1 rounded-full text-sm font-medium ${config.bgColor} ${config.color} ${className}`}
      style={{ fontFamily: "'Lato', sans-serif" }}
    >
      {config.label}
    </span>
  )
}
