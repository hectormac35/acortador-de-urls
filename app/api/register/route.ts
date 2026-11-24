import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import bcrypt from 'bcrypt'
import { prisma } from '@/lib/prisma'
import { firstIssue, registerSchema } from '@/lib/validation'

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  const parsed = registerSchema.safeParse(body ?? {})
  if (!parsed.success) {
    return NextResponse.json({ error: firstIssue(parsed.error) }, { status: 400 })
  }

  const { name, email, password } = parsed.data

  try {
    await prisma.user.create({
      data: {
        email,
        name: name || null,
        passwordHash: await bcrypt.hash(password, 12),
      },
    })
    return NextResponse.json({ ok: true }, { status: 201 })
  } catch (e) {
    // Email duplicado: lo detecta la restricción UNIQUE de la base de datos
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      return NextResponse.json({ error: 'Ya existe un usuario con ese email' }, { status: 409 })
    }
    console.error('Error en /api/register', e)
    return NextResponse.json({ error: 'Error al registrar el usuario' }, { status: 500 })
  }
}
