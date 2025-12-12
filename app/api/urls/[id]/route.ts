import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

type RouteContext = {
  params: {
    id: string
  }
}

// PATCH → actualizar (active y target) SOLO si es del usuario
export async function PATCH(req: Request, { params }: RouteContext) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const userId = (session.user as any).id
    const { id } = params
    const body = await req.json()

    const data: any = {}

    if (typeof body.active === 'boolean') {
      data.active = body.active
    }

    if (typeof body.target === 'string' && body.target.trim().length > 0) {
      data.target = body.target.trim()
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { error: 'Nada que actualizar' },
        { status: 400 }
      )
    }

    // Comprobar que la URL pertenece al usuario
    const url = await prisma.url.findFirst({
      where: {
        id,
        userId,
      },
    })

    if (!url) {
      return NextResponse.json(
        { error: 'URL no encontrada' },
        { status: 404 }
      )
    }

    const updated = await prisma.url.update({
      where: { id },
      data,
    })

    return NextResponse.json(updated)
  } catch (e) {
    console.error(e)
    return NextResponse.json(
      { error: 'Error al actualizar la URL' },
      { status: 500 }
    )
  }
}

// DELETE → borrar URL SOLO si es del usuario
export async function DELETE(_req: Request, { params }: RouteContext) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const userId = (session.user as any).id
    const { id } = params

    // Comprobar que la URL pertenece al usuario
    const url = await prisma.url.findFirst({
      where: {
        id,
        userId,
      },
    })

    if (!url) {
      return NextResponse.json(
        { error: 'URL no encontrada' },
        { status: 404 }
      )
    }

    await prisma.clickEvent.deleteMany({
      where: { urlId: id },
    })

    await prisma.url.delete({
      where: { id },
    })

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error(e)
    return NextResponse.json(
      { error: 'Error al borrar la URL' },
      { status: 500 }
    )
  }
}
