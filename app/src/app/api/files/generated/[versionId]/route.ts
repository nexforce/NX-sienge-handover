import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ versionId: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { versionId } = await params

  const version = await prisma.documentVersion.findUnique({
    where: { id: versionId },
    select: {
      fileContent: true,
      numeroVersao: true,
      document: { select: { nome: true } },
    },
  })

  if (!version?.fileContent) {
    return NextResponse.json({ error: 'File not found' }, { status: 404 })
  }

  const filename = `${version.document.nome} - ${version.numeroVersao}.docx`

  return new NextResponse(version.fileContent, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
    },
  })
}
