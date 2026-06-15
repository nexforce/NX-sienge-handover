import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { versionId, autor, mensagem } = body

  if (!versionId || !autor || !mensagem) {
    return NextResponse.json(
      { error: 'versionId, autor, and mensagem are required' },
      { status: 400 }
    )
  }

  const version = await prisma.documentVersion.findUnique({
    where: { id: versionId },
  })

  if (!version) {
    return NextResponse.json({ error: 'Version not found' }, { status: 404 })
  }

  const comment = await prisma.comment.create({
    data: {
      versionId,
      autor,
      mensagem,
    },
  })

  return NextResponse.json(comment)
}
