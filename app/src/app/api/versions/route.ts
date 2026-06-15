import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Status } from '@prisma/client'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { documentId, linkDocumento, status } = body

  if (!documentId) {
    return NextResponse.json({ error: 'documentId is required' }, { status: 400 })
  }

  const document = await prisma.document.findUnique({
    where: { id: documentId },
  })

  if (!document) {
    return NextResponse.json({ error: 'Document not found' }, { status: 404 })
  }

  const lastVersion = await prisma.documentVersion.findFirst({
    where: { documentId },
    orderBy: { dataCriacao: 'desc' },
  })

  const versionNumber = lastVersion
    ? parseInt(lastVersion.numeroVersao.replace('V', '')) + 1
    : 1

  const version = await prisma.documentVersion.create({
    data: {
      documentId,
      numeroVersao: `V${versionNumber}`,
      linkDocumento: linkDocumento || null,
      status: status || Status.Pendente,
    },
  })

  await prisma.document.update({
    where: { id: documentId },
    data: { statusAtual: status || Status.Pendente },
  })

  return NextResponse.json(version)
}
