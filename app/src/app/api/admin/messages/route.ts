import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

const ADMIN_EMAIL = 'hugo.zanni@nexforce.ai'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (session.user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const processId = searchParams.get('processId') || undefined
  const versionId = searchParams.get('versionId') || undefined
  const userEmail = searchParams.get('userEmail') || undefined

  const messages = await prisma.chatMessage.findMany({
    where: {
      role: 'user',
      ...(userEmail ? { userEmail } : {}),
      ...(versionId ? { versionId } : {}),
      ...(processId ? { version: { documentId: processId } } : {}),
    },
    include: {
      version: {
        select: {
          id: true,
          numeroVersao: true,
          document: { select: { id: true, nome: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 200,
  })

  return NextResponse.json(messages)
}
