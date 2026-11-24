import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { currentUserId } from '@/lib/session'
import { firstIssue, updateUrlSchema } from '@/lib/validation'

type RouteContext = {
  params: Promise<{ id: string }>
}

/** Devuelve el enlace solo si pertenece al usuario; si no, null (y respondemos 404, sin revelar que existe). */
async function findOwnUrl(id: string, userId: string) {
  return prisma.url.findFirst({ where: { id, userId }, select: { id: true } })
}

export async function PATCH(req: Request, { params }: RouteContext) {
  const userId = await currentUserId()
  if (!userId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { id } = await params
  const body = await req.json().catch(() => null)
  const parsed = updateUrlSchema.safeParse(body ?? {})
  if (!parsed.success) {
    return NextResponse.json({ error: firstIssue(parsed.error) }, { status: 400 })
  }

  if (!(await findOwnUrl(id, userId))) {
    return NextResponse.json({ error: 'Enlace no encontrado' }, { status: 404 })
  }

  const updated = await prisma.url.update({
    where: { id },
    data: parsed.data,
    include: { _count: { select: { clicks: true } } },
  })
  return NextResponse.json(updated)
}

export async function DELETE(_req: Request, { params }: RouteContext) {
  const userId = await currentUserId()
  if (!userId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { id } = await params
  if (!(await findOwnUrl(id, userId))) {
    return NextResponse.json({ error: 'Enlace no encontrado' }, { status: 404 })
  }

  // Los clics se borran solos (ON DELETE CASCADE)
  await prisma.url.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
