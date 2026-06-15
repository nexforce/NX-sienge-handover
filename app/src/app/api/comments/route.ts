import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function POST(request: NextRequest) {
  const session = await auth()

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { versionId, mensagem } = body

  if (!versionId || !mensagem) {
    return NextResponse.json(
      { error: 'versionId and mensagem are required' },
      { status: 400 }
    )
  }

  const version = await prisma.documentVersion.findUnique({
    where: { id: versionId },
  })

  if (!version) {
    return NextResponse.json({ error: 'Version not found' }, { status: 404 })
  }

  const autor = session.user.name ?? session.user.email ?? 'Usuário'

  const comment = await prisma.comment.create({
    data: { versionId, autor, mensagem },
  })

  return NextResponse.json(comment)
}
