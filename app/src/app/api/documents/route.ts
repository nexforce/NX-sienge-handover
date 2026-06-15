import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Status } from '@prisma/client'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const status = searchParams.get('status')
  const search = searchParams.get('search')
  const sort = searchParams.get('sort') || 'recent'

  const where: any = {}

  if (status && status !== 'Todos') {
    where.statusAtual = status as Status
  }

  if (search) {
    where.OR = [
      { nome: { contains: search, mode: 'insensitive' } },
      { revisor: { contains: search, mode: 'insensitive' } },
    ]
  }

  let orderBy: any = { ultimaAtualizacao: 'desc' }
  if (sort === 'status') {
    orderBy = { statusAtual: 'asc' }
  } else if (sort === 'revisor') {
    orderBy = { revisor: 'asc' }
  }

  const documents = await prisma.document.findMany({
    where,
    orderBy,
    include: {
      _count: {
        select: { versions: true },
      },
    },
  })

  return NextResponse.json(documents)
}
