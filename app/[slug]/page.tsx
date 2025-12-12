import { prisma } from '@/lib/prisma'
import { notFound, redirect } from 'next/navigation'

type PageProps = {
  params: Promise<{
    slug: string
  }>
}

export default async function RedirectPage({ params }: PageProps) {
  // 1️⃣ Desempaquetar params (es una Promise en Next 16)
  const { slug } = await params

  // 2️⃣ Si no hay slug → 404
  if (!slug) {
    notFound()
  }

  // 3️⃣ Buscar la URL en la base de datos
  const url = await prisma.url.findUnique({
    where: { slug },
  })

  if (!url || !url.active) {
    notFound()
  }

  // 4️⃣ Registrar el clic (opcional)
  await prisma.clickEvent.create({
    data: {
      urlId: url.id,
    },
  })

  // 5️⃣ Asegurar protocolo
  let target = url.target
  if (!/^https?:\/\//i.test(target)) {
    target = 'https://' + target
  }

  // 6️⃣ Redirigir al destino final
  redirect(target)
}
