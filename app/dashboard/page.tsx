import { prisma } from '@/lib/prisma'
import { UrlDashboard } from './url-dashboard'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const urls = await prisma.url.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: { clicks: true },
      },
    },
  })

  return (
    <main className="min-h-screen bg-slate-100 px-6 py-6">
      {/* Botón VOLVER arriba a la derecha */}
      <div className="w-full flex justify-end mb-4">
        <a
          href="/"
          className="text-sm px-3 py-1 rounded-md border border-blue-600 text-blue-600 hover:bg-blue-50 transition"
        >
          Volver
        </a>
      </div>

      {/* Tarjeta con el dashboard */}
      <div className="w-full max-w-4xl mx-auto bg-white shadow-md rounded-xl p-6">
        <h1 className="text-2xl font-semibold mb-4">Mis enlaces</h1>
        <UrlDashboard initialUrls={urls} />
      </div>
    </main>
  )
}
