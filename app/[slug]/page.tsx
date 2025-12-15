import { prisma } from '@/lib/prisma'
import { notFound, redirect } from 'next/navigation'

type PageProps = {
  params: Promise<{
    slug: string
  }>
}

export default async function RedirectPage({ params }: PageProps) {
  const { slug } = await params

  if (!slug) notFound()

  const url = await prisma.url.findUnique({
    where: { slug },
  })

  // ✅ Si no existe o está desactivada → 404
  if (!url || !url.active) notFound()

  // ✅ Registrar clic
  await prisma.clickEvent.create({
    data: { urlId: url.id },
  })

  // ✅ Redirigir
  redirect(url.target)
}
