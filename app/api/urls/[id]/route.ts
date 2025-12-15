import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function PATCH(req: Request, { params }: RouteContext) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const userId = session.user.id
    const { id } = await params
    const body = await req.json()

    const data: any = {}

    if (typeof body.active === 'boolean') {
      data.active = body.active
    }

    if (typeof body.target === 'string') {
      const t = body.target.trim()

      try {
        const parsed = new URL(t)
        if (!/^https?:$/.test(parsed.protocol)) {
          return NextResponse.json(
            { error: 'La URL debe empezar por http:// o https://' },
            { status: 400 }
          )
        }
        data.target = parsed.toString()
      } catch {
        return NextResponse.json(
          { error: 'URL destino no válida' },
          { status: 400 }
        )
      }
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: 'Nada que actualizar' }, { status: 400 })
    }

    const url = await prisma.url.findFirst({
      where: { id, userId },
    })

    if (!url) {
      return NextResponse.json({ error: 'URL no encontrada' }, { status: 404 })
    }

    const updated = await prisma.url.update({
      where: { id },
      data,
      include: {
        _count: { select: { clicks: true } },
      },
    })

    return NextResponse.json(updated)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Error al actualizar la URL' }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: RouteContext) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const userId = session.user.id
    const { id } = await params

    const url = await prisma.url.findFirst({
      where: { id, userId },
    })

    if (!url) {
      return NextResponse.json({ error: 'URL no encontrada' }, { status: 404 })
    }

    await prisma.clickEvent.deleteMany({ where: { urlId: id } })
    await prisma.url.delete({ where: { id } })

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Error al borrar la URL' }, { status: 500 })
  }
}
