'use client'

import { useEffect, useState, type FormEvent } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { CopyButton } from './components/CopyButton'
import { QrCode } from './components/QrCode'

type CreatedUrl = { id: string; slug: string; target: string }

const FEATURES = [
  { title: 'Slug a tu medida', text: 'Elige el final del enlace o deja que se genere uno aleatorio.' },
  { title: 'Estadísticas de clics', text: 'Clics por día, dispositivos y desde qué webs llegan.' },
  { title: 'Código QR', text: 'Descarga el QR de cada enlace para carteles o tarjetas.' },
  { title: 'Control total', text: 'Edita el destino, desactiva o borra tus enlaces cuando quieras.' },
]

export default function Home() {
  const { data: session, status } = useSession()
  const [origin, setOrigin] = useState('')
  const [target, setTarget] = useState('')
  const [slug, setSlug] = useState('')
  const [created, setCreated] = useState<CreatedUrl | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => setOrigin(window.location.origin), [])

  async function createUrl(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setCreated(null)
    setLoading(true)
    try {
      const res = await fetch('/api/urls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target, slug }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Error al crear el enlace')
      } else {
        setCreated(data)
        setTarget('')
        setSlug('')
      }
    } catch {
      setError('Error de red al crear el enlace')
    } finally {
      setLoading(false)
    }
  }

  const shortUrl = created ? `${origin}/${created.slug}` : ''
  const host = origin.replace(/^https?:\/\//, '')

  return (
    <main className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px] bg-gradient-to-b from-indigo-100 via-indigo-50 to-transparent" />

      <section className="mx-auto max-w-3xl px-4 pt-16 pb-10 text-center sm:px-6">
        <span className="inline-block rounded-full border border-indigo-200 bg-white px-3 py-1 text-xs font-semibold text-indigo-700">
          Enlaces cortos · QR · Estadísticas
        </span>
        <h1 className="mt-5 text-balance text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          Acorta tus enlaces y mide <span className="text-indigo-600">cada clic</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-slate-600">
          Crea enlaces fáciles de compartir, descarga su código QR y descubre cuándo, desde dónde y con qué dispositivo los abren.
        </p>
      </section>

      <section className="mx-auto max-w-2xl px-4 pb-16 sm:px-6">
        <div className="card p-6 sm:p-8">
          {status === 'loading' ? (
            <div className="h-40 animate-pulse rounded-xl bg-slate-100" />
          ) : !session ? (
            <div className="py-6 text-center">
              <p className="text-slate-600">Crea una cuenta gratis para empezar a acortar enlaces.</p>
              <div className="mt-5 flex justify-center gap-3">
                <Link href="/register" className="btn-primary">Crear cuenta</Link>
                <Link href="/login" className="btn-ghost">Ya tengo cuenta</Link>
              </div>
            </div>
          ) : (
            <form className="space-y-5" onSubmit={createUrl}>
              <div>
                <label htmlFor="target" className="label">URL de destino</label>
                <input
                  id="target"
                  type="url"
                  className="input"
                  placeholder="https://ejemplo.com/una-pagina-con-una-url-muy-larga"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  required
                />
              </div>

              <div>
                <label htmlFor="slug" className="label">Slug personalizado <span className="font-normal text-slate-400">(opcional)</span></label>
                <div className="flex overflow-hidden rounded-lg border border-slate-300 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-100">
                  <span className="flex items-center border-r border-slate-200 bg-slate-50 px-3 text-sm text-slate-500">{host}/</span>
                  <input
                    id="slug"
                    className="w-full px-3 py-2.5 text-sm outline-none"
                    placeholder="mi-enlace"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase())}
                  />
                </div>
                <p className="mt-1.5 text-xs text-slate-500">De 3 a 30 caracteres: letras minúsculas, números y guiones.</p>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full py-3">
                {loading ? 'Creando…' : 'Acortar enlace'}
              </button>

              {error && (
                <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
              )}
            </form>
          )}

          {created && (
            <div className="mt-6 flex flex-col items-center gap-5 rounded-xl border border-emerald-200 bg-emerald-50/60 p-5 sm:flex-row sm:items-start">
              <QrCode value={shortUrl} fileName={created.slug} size={128} />
              <div className="min-w-0 flex-1 text-center sm:text-left">
                <p className="text-sm font-semibold text-emerald-700">¡Enlace creado!</p>
                <a href={shortUrl} target="_blank" rel="noreferrer" className="mt-1 block break-all font-mono text-lg font-semibold text-slate-900 hover:text-indigo-600">
                  {shortUrl}
                </a>
                <p className="mt-1 truncate text-sm text-slate-500" title={created.target}>→ {created.target}</p>
                <div className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start">
                  <CopyButton text={shortUrl} />
                  <Link href={`/dashboard/${created.id}`} className="btn-ghost btn-sm">Ver estadísticas</Link>
                  <Link href="/dashboard" className="btn-ghost btn-sm">Mis enlaces</Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl gap-4 px-4 pb-20 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
        {FEATURES.map((f) => (
          <div key={f.title} className="card p-5">
            <h2 className="font-semibold text-slate-900">{f.title}</h2>
            <p className="mt-1.5 text-sm text-slate-600">{f.text}</p>
          </div>
        ))}
      </section>
    </main>
  )
}
