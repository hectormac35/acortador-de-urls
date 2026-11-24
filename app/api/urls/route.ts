import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { currentUserId } from '@/lib/session'
import { createUrlSchema, firstIssue, generateSlug } from '@/lib/validation'

export async function POST(req: Request) {
  const userId = await currentUserId()
  if (!userId) {
    return NextResponse.json({ error: 'Inicia sesión para crear enlaces' }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  const parsed = createUrlSchema.safeParse(body ?? {})
  if (!parsed.success) {
    return NextResponse.json({ error: firstIssue(parsed.error) }, { status: 400 })
  }

  const { target, slug: customSlug } = parsed.data

  // Insertamos directamente y dejamos que la restricción UNIQUE de la base de datos
  // detecte los duplicados: así no hay carrera entre "comprobar" e "insertar".
  for (let attempt = 0; attempt < 5; attempt++) {
    const slug = customSlug ?? generateSlug()
    try {
      const url = await prisma.url.create({
        data: { target, slug, userId },
        include: { _count: { select: { clicks: true } } },
      })
      return NextResponse.json(url, { status: 201 })
    } catch (e) {
      const duplicated = e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002'
      if (!duplicated) throw e
      if (customSlug) {
        return NextResponse.json({ error: 'Ese slug ya está en uso' }, { status: 409 })
      }
      // slug aleatorio repetido: probamos con otro
    }
  }
  return NextResponse.json({ error: 'No se pudo generar un slug libre, inténtalo de nuevo' }, { status: 503 })
}

export async function GET() {
  const userId = await currentUserId()
  if (!userId) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const urls = await prisma.url.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: { _count: { select: { clicks: true } } },
  })

  return NextResponse.json(urls)
}
