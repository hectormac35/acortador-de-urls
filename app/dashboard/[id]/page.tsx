import type { Metadata } from 'next'
import Link from 'next/link'
import { headers } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { currentUserId } from '@/lib/session'
import { clicksPerDay, daysAgo, topCounts } from '@/lib/analytics'
import { CopyButton } from '../../components/CopyButton'
import { QrCode } from '../../components/QrCode'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Estadísticas' }

const DAYS = 14
const dayFmt = new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short', timeZone: 'UTC' })
const dateTimeFmt = new Intl.DateTimeFormat('es-ES', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Europe/Madrid' })

export default async function UrlStatsPage({ params }: { params: Promise<{ id: string }> }) {
  const userId = await currentUserId()
  if (!userId) redirect('/login')

  const { id } = await params
  const url = await prisma.url.findFirst({ where: { id, userId } })
  if (!url) notFound()

  const since = daysAgo(DAYS)
  const [total, recent, last] = await Promise.all([
    prisma.clickEvent.count({ where: { urlId: id } }),
    prisma.clickEvent.findMany({ where: { urlId: id, ts: { gte: since } }, select: { ts: true, device: true, referrer: true } }),
    prisma.clickEvent.findFirst({ where: { urlId: id }, orderBy: { ts: 'desc' }, select: { ts: true } }),
  ])

  const perDay = clicksPerDay(recent.map((c) => c.ts), DAYS)
  const max = Math.max(1, ...perDay.map((d) => d.count))
  const devices = topCounts(recent.map((c) => c.device), 4, 'Desconocido')
  const referrers = topCounts(recent.map((c) => c.referrer), 5, 'Directo / sin origen')

  const h = await headers()
  const origin = `${h.get('x-forwarded-proto') ?? 'http'}://${h.get('host')}`
  const shortUrl = `${origin}/${url.slug}`

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <Link href="/dashboard" className="text-sm font-medium text-slate-500 hover:text-slate-800">← Mis enlaces</Link>

      <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_auto]">
        <div className="card p-6">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-mono text-2xl font-bold">/{url.slug}</h1>
            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${url.active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
              {url.active ? 'Activo' : 'Inactivo'}
            </span>
          </div>
          <a href={url.target} target="_blank" rel="noreferrer" className="mt-2 block break-all text-slate-600 hover:text-indigo-600">→ {url.target}</a>
          <div className="mt-4 flex flex-wrap gap-2">
            <CopyButton text={shortUrl} label="Copiar enlace corto" />
            <a href={shortUrl} target="_blank" rel="noreferrer" className="btn-ghost btn-sm">Abrir</a>
          </div>
          <dl className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
            <Stat label="Clics totales" value={total.toLocaleString('es-ES')} />
            <Stat label={`Últimos ${DAYS} días`} value={recent.length.toLocaleString('es-ES')} />
            <Stat label="Último clic" value={last ? dateTimeFmt.format(last.ts) : '—'} small />
          </dl>
        </div>
        <div className="card flex items-center justify-center p-6">
          <QrCode value={shortUrl} fileName={url.slug} size={168} />
        </div>
      </div>

      <section className="card mt-6 p-6">
        <h2 className="font-semibold">Clics por día</h2>
        <p className="text-sm text-slate-500">Últimos {DAYS} días</p>
        <div className="mt-6 flex h-48 items-end gap-1.5 sm:gap-2" role="img" aria-label={`Gráfica de clics de los últimos ${DAYS} días`}>
          {perDay.map((d) => (
            <div key={d.date} className="group flex h-full flex-1 flex-col items-center justify-end gap-1">
              <span className="text-xs font-semibold tabular-nums text-slate-600 opacity-0 transition group-hover:opacity-100">{d.count}</span>
              <div
                className={`w-full rounded-t-md transition ${d.count ? 'bg-indigo-500 group-hover:bg-indigo-600' : 'bg-slate-100'}`}
                style={{ height: `${Math.max(d.count ? 6 : 3, (d.count / max) * 100)}%` }}
                title={`${dayFmt.format(new Date(d.date))}: ${d.count} clics`}
              />
            </div>
          ))}
        </div>
        <div className="mt-2 flex gap-1.5 sm:gap-2">
          {perDay.map((d, i) => (
            <span key={d.date} className="flex-1 text-center text-[10px] text-slate-400 sm:text-xs">
              {i % 2 === 0 ? dayFmt.format(new Date(d.date)) : ''}
            </span>
          ))}
        </div>
      </section>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <Breakdown title="Dispositivos" items={devices} total={recent.length} capitalize />
        <Breakdown title="Webs de origen" items={referrers} total={recent.length} />
      </div>
    </main>
  )
}

function Stat({ label, value, small }: { label: string; value: string; small?: boolean }) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className={`mt-1 font-bold tracking-tight ${small ? 'text-base' : 'text-2xl'}`}>{value}</dd>
    </div>
  )
}

function Breakdown({ title, items, total, capitalize }: { title: string; items: { label: string; count: number }[]; total: number; capitalize?: boolean }) {
  return (
    <section className="card p-6">
      <h2 className="font-semibold">{title}</h2>
      <p className="text-sm text-slate-500">Últimos {DAYS} días</p>
      {items.length === 0 ? (
        <p className="mt-6 text-sm text-slate-400">Todavía no hay clics.</p>
      ) : (
        <ul className="mt-5 space-y-3">
          {items.map((it) => {
            const pct = Math.round((it.count / Math.max(1, total)) * 100)
            return (
              <li key={it.label}>
                <div className="flex justify-between text-sm">
                  <span className={`font-medium ${capitalize ? 'capitalize' : ''}`}>{it.label}</span>
                  <span className="tabular-nums text-slate-500">{it.count} · {pct}%</span>
                </div>
                <div className="mt-1.5 h-2 rounded-full bg-slate-100">
                  <div className="h-2 rounded-full bg-indigo-500" style={{ width: `${pct}%` }} />
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
