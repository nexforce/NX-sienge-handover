'use client'

import { useState } from 'react'
import { Status } from '@prisma/client'
import { statusConfig, allStatuses } from '@/lib/status'

interface FilterBarProps {
  onFilter: (filters: { status: string; search: string; sort: string }) => void
}

export function FilterBar({ onFilter }: FilterBarProps) {
  const [status, setStatus] = useState('Todos')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('recent')

  const handleChange = (newStatus?: string, newSearch?: string, newSort?: string) => {
    const updated = {
      status: newStatus ?? status,
      search: newSearch ?? search,
      sort: newSort ?? sort,
    }
    setStatus(updated.status)
    setSearch(updated.search)
    setSort(updated.sort)
    onFilter(updated)
  }

  return (
    <div className="bg-white rounded-lg border border-[#9C9B9B] p-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-[#0C0E0E] mb-1" style={{ fontFamily: "'Lato', sans-serif" }}>
            Status
          </label>
          <select
            value={status}
            onChange={(e) => handleChange(e.target.value)}
            className="w-full px-3 py-2 border border-[#9C9B9B] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#215A9F] text-[#515151]"
            style={{ fontFamily: "'Lato', sans-serif" }}
          >
            <option>Todos</option>
            {allStatuses.map((s) => (
              <option key={s} value={s}>
                {statusConfig[s].label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#0C0E0E] mb-1" style={{ fontFamily: "'Lato', sans-serif" }}>
            Buscar
          </label>
          <input
            type="text"
            placeholder="Nome ou revisor..."
            value={search}
            onChange={(e) => handleChange(undefined, e.target.value)}
            className="w-full px-3 py-2 border border-[#9C9B9B] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#215A9F] text-[#515151]"
            style={{ fontFamily: "'Lato', sans-serif" }}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#0C0E0E] mb-1" style={{ fontFamily: "'Lato', sans-serif" }}>
            Ordenar por
          </label>
          <select
            value={sort}
            onChange={(e) => handleChange(undefined, undefined, e.target.value)}
            className="w-full px-3 py-2 border border-[#9C9B9B] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#215A9F] text-[#515151]"
            style={{ fontFamily: "'Lato', sans-serif" }}
          >
            <option value="recent">Mais recentes</option>
            <option value="status">Status</option>
            <option value="revisor">Revisor</option>
          </select>
        </div>
      </div>
    </div>
  )
}
