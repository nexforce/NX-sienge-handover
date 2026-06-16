import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

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
  const chainPrefix = searchParams.get('chain') || undefined
  const userEmail = searchParams.get('userEmail') || undefined

  const where: Prisma.UsageLogWhereInput = {}
  if (processId) where.processId = processId
  if (versionId) where.versionId = versionId
  if (chainPrefix) where.chain = { startsWith: chainPrefix }
  if (userEmail) where.userEmail = userEmail

  try {
    const [logs, aggregates, userAggregates, allUsers] = await Promise.all([
      prisma.usageLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.usageLog.groupBy({
        by: ['processId'],
        where,
        _sum: { inputTokens: true, outputTokens: true, costUsd: true },
        _count: { id: true },
      }),
      prisma.usageLog.groupBy({
        by: ['userEmail'],
        where,
        _sum: { inputTokens: true, outputTokens: true, costUsd: true },
        _count: { id: true },
        orderBy: { _sum: { costUsd: 'desc' } },
      }),
      // Always fetch ALL unique users (unfiltered) for the dropdown
      prisma.usageLog.findMany({
        select: { userEmail: true },
        distinct: ['userEmail'],
        where: { userEmail: { not: null } },
        orderBy: { userEmail: 'asc' },
      }),
    ])

    const processIds = [...new Set(aggregates.map((a) => a.processId))]
    const documents =
      processIds.length > 0
        ? await prisma.document.findMany({
            where: { id: { in: processIds } },
            select: { id: true, nome: true },
          })
        : []
    const docMap = Object.fromEntries(documents.map((d) => [d.id, d.nome]))

    return NextResponse.json({
      logs,
      aggregates: aggregates.map((a) => ({
        processId: a.processId,
        processName: docMap[a.processId] ?? a.processId,
        count: a._count.id,
        inputTokens: a._sum.inputTokens ?? 0,
        outputTokens: a._sum.outputTokens ?? 0,
        costUsd: a._sum.costUsd ?? 0,
      })),
      userAggregates: userAggregates.map((u) => ({
        userEmail: u.userEmail ?? '(desconhecido)',
        count: u._count.id,
        inputTokens: u._sum.inputTokens ?? 0,
        outputTokens: u._sum.outputTokens ?? 0,
        costUsd: u._sum.costUsd ?? 0,
      })),
      users: allUsers.map((u) => u.userEmail).filter(Boolean) as string[],
    })
  } catch {
    return NextResponse.json({ error: 'Erro ao carregar logs.' }, { status: 500 })
  }
}
