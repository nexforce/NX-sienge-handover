import { Status } from '@prisma/client'

export const statusConfig: Record<Status, { label: string; color: string; bgColor: string }> = {
  [Status.Pendente]: {
    label: 'Pendente',
    color: 'text-[#515151]',
    bgColor: 'bg-[#F5F5F5]',
  },
  [Status.EmProgresso]: {
    label: 'Em Progresso',
    color: 'text-[#D8B523]',
    bgColor: 'bg-[#FDF8E1]',
  },
  [Status.UnderReview]: {
    label: 'Under Review',
    color: 'text-[#215A9F]',
    bgColor: 'bg-[#EEF3FB]',
  },
  [Status.ReviewRefused]: {
    label: 'Review Refused',
    color: 'text-[#BA1925]',
    bgColor: 'bg-[#FDECEA]',
  },
  [Status.ReviewApproved]: {
    label: 'Review Approved',
    color: 'text-[#2D6E44]',
    bgColor: 'bg-[#EEF7F1]',
  },
  [Status.Done]: {
    label: 'Done',
    color: 'text-[#2D6E44]',
    bgColor: 'bg-[#EEF7F1]',
  },
}

export const allStatuses = Object.values(Status)

export function getStatusConfig(status: Status) {
  return statusConfig[status] || statusConfig[Status.Pendente]
}
