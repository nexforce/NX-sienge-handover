import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Status } from '@prisma/client'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string[] }> }
) {
  const { id } = await params
  const documentId = id.join('.')
  const document = await prisma.document.findUnique({
    where: { id: documentId },
    include: {
      versions: {
        orderBy: { dataCriacao: 'desc' },
        include: {
          comments: {
            orderBy: { dataCriacao: 'desc' },
          },
        },
      },
    },
  })

  if (!document) {
    return NextResponse.json({ error: 'Document not found' }, { status: 404 })
  }

  return NextResponse.json(document)
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string[] }> }
) {
  const { id } = await params
  const documentId = id.join('.')
  const body = await request.json()
  const { statusAtual } = body

  if (!statusAtual || !Object.values(Status).includes(statusAtual)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  const document = await prisma.document.update({
    where: { id: documentId },
    data: { statusAtual: statusAtual as Status },
  })

  return NextResponse.json(document)
}
