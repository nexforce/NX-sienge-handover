import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Status } from '@prisma/client'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()
  const { status } = body

  if (!status || !Object.values(Status).includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  const version = await prisma.documentVersion.update({
    where: { id },
    data: { status: status as Status },
  })

  const document = await prisma.document.findUnique({
    where: { id: version.documentId },
  })

  if (document) {
    await prisma.document.update({
      where: { id: document.id },
      data: { statusAtual: status as Status },
    })
  }

  return NextResponse.json(version)
}
