import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'


const CreateSchema = z.object({
  target: z.string().url(),
  slug: z.string().min(3).max(30).optional(),
})

function generateRandomSlug(length = 6) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) result += chars[Math.floor(Math.random() * chars.length)]
  return result
}

async function generateUniqueSlug() {
  while (true) {
    const slug = generateRandomSlug()
    const existing = await prisma.url.findUnique({ where: { slug } })
    if (!existing) return slug
  }
}

export async function POST(req: Request) {
  // ✅ 1) Exigir login
  const session = await getServerSession(authOptions)
  const userId = session?.user?.id
  if (!userId) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const body = await req.json()
  const parsed = CreateSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
  }

  const { target, slug: providedSlug } = parsed.data

  if (providedSlug && !/^[a-z0-9-]+$/.test(providedSlug)) {
    return NextResponse.json(
      { error: 'El slug solo puede contener letras minúsculas, números y guiones' },
      { status: 400 }
    )
  }

  let slug = providedSlug ?? (await generateUniqueSlug())

  if (providedSlug) {
    const existing = await prisma.url.findUnique({ where: { slug: providedSlug } })
    if (existing) {
      return NextResponse.json({ error: 'Ese slug ya está en uso' }, { status: 409 })
    }
  }

  // ✅ 2) Guardar userId
  const url = await prisma.url.create({
    data: { target, slug, userId },
  })

  return NextResponse.json(url)
}

export async function GET() {
  // ✅ 3) Exigir login + filtrar por usuario
  
  const session = await getServerSession(authOptions)
  const userId = session?.user?.id
  if (!userId) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const urls = await prisma.url.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: {
      _count: { select: { clicks: true } },
    },
  })

  return NextResponse.json(urls)
}
