import { headers } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { detectDevice, referrerHost } from '@/lib/analytics'
import { RESERVED_SLUGS } from '@/lib/validation'

export const dynamic = 'force-dynamic'

export default async function RedirectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  if (!slug || RESERVED_SLUGS.has(slug)) notFound()

  const url = await prisma.url.findUnique({
    where: { slug: slug.toLowerCase() },
    select: { id: true, target: true, active: true },
  })

  // Si no existe o está desactivado → 404
  if (!url || !url.active) notFound()

  // Registramos el clic: dispositivo y dominio de origen (nunca la IP ni la URL completa de origen)
  const h = await headers()
  const device = detectDevice(h.get('user-agent'))
  const ownHost = (h.get('host') ?? '').split(':')[0]
  try {
    await prisma.clickEvent.create({
      data: { urlId: url.id, device, referrer: referrerHost(h.get('referer'), ownHost) },
    })
  } catch (e) {
    // Un fallo al guardar la estadística no debe impedir la redirección
    console.error('No se pudo registrar el clic', e)
  }

  redirect(url.target)
}
