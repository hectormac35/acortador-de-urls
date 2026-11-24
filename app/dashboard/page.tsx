import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { currentUserId } from '@/lib/session'
import { daysAgo } from '@/lib/analytics'
import { UrlDashboard } from './url-dashboard'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Mis enlaces' }

export default async function DashboardPage() {
  // Solo usuarios con sesión, y cada uno ve únicamente sus enlaces
  const userId = await currentUserId()
  if (!userId) redirect('/login')

  const since = daysAgo(7)
  const [rows, clicksTotal, clicksWeek] = await Promise.all([
    prisma.url.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { clicks: true } } },
    }),
    prisma.clickEvent.count({ where: { url: { userId } } }),
    prisma.clickEvent.count({ where: { url: { userId }, ts: { gte: since } } }),
  ])

  // El componente cliente recibe las fechas como texto
  const urls = rows.map((u) => ({ ...u, createdAt: u.createdAt.toISOString() }))
  const active = rows.filter((u) => u.active).length

  const stats = [
    { label: 'Enlaces', value: rows.length },
    { label: 'Activos', value: active },
    { label: 'Clics totales', value: clicksTotal },
    { label: 'Clics últimos 7 días', value: clicksWeek },
  ]

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mis enlaces</h1>
          <p className="mt-1 text-slate-500">Gestiona tus enlaces y consulta sus clics.</p>
        </div>
        <Link href="/" className="btn-primary">+ Nuevo enlace</Link>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="card p-5">
            <p className="text-sm text-slate-500">{s.label}</p>
            <p className="mt-1 text-3xl font-bold tracking-tight">{s.value.toLocaleString('es-ES')}</p>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <UrlDashboard initialUrls={urls} />
      </div>
    </main>
  )
}
