import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Esquema básico: URL obligatoria, slug opcional
const CreateSchema = z.object({
  target: z.string().url(),
  slug: z.string().min(3).max(30).optional(),
})

function generateRandomSlug(length = 6) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)]
  }
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
  const body = await req.json()
  const parsed = CreateSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
  }

  const { target, slug: providedSlug } = parsed.data

  // ✅ Validación extra del slug con regex "normal"
  if (providedSlug && !/^[a-z0-9-]+$/.test(providedSlug)) {
    return NextResponse.json(
      {
        error:
          'El slug solo puede contener letras minúsculas, números y guiones',
      },
      { status: 400 }
    )
  }

  let slug = providedSlug ?? (await generateUniqueSlug())

  if (providedSlug) {
    const existing = await prisma.url.findUnique({
      where: { slug: providedSlug },
    })
    if (existing) {
      return NextResponse.json(
        { error: 'Ese slug ya está en uso' },
        { status: 409 }
      )
    }
  }

  const url = await prisma.url.create({
    data: {
      target,
      slug,
    },
  })

  return NextResponse.json(url)
}

export async function GET() {
  const urls = await prisma.url.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: {
      _count: {
        select: { clicks: true }, // 👈 nº de clics por URL
      },
    },
  })

  return NextResponse.json(urls)
}
