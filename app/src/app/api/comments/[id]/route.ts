import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const comment = await prisma.comment.findUnique({ where: { id } })

  if (!comment) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const autorSessao = session.user.name ?? session.user.email ?? 'Usuário'
  if (comment.autor !== autorSessao) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  await prisma.comment.delete({ where: { id } })
  return new NextResponse(null, { status: 204 })
}
