'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'

type Url = {
  id: string
  slug: string
  target: string
  createdAt: string
}

export default function Home() {
  const [target, setTarget] = useState('')
  const [slug, setSlug] = useState('')
  const [created, setCreated] = useState<Url | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const { data: session, status } = useSession()

  async function createUrl(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setCreated(null)
    setLoading(true)

    try {
      const res = await fetch('/api/urls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target,
          slug: slug.trim() || undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Error al crear el enlace')
      } else {
        setCreated(data)
        setTarget('')
        setSlug('')
      }
    } catch (err) {
      setError('Error de red al crear el enlace')
    } finally {
      setLoading(false)
    }
  }

  const origin =
    typeof window !== 'undefined' ? window.location.origin : ''

  return (
    <main className="min-h-screen bg-slate-100">
      {/* Barra superior */}
      <header className="w-full flex justify-end px-6 py-4">
        {status === 'loading' ? null : !session ? (
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm px-3 py-1 rounded-md border border-blue-600 text-blue-600 hover:bg-blue-50 transition"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/register"
              className="text-sm px-3 py-1 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition"
            >
              Registrarse
            </Link>
          </div>
        ) : (
          <div className="flex items-center gap-3 text-sm">
            <span className="text-slate-600">
              Hola,{' '}
              <span className="font-semibold">
                {session.user?.name ?? session.user?.email}
              </span>
            </span>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="px-3 py-1 rounded-md border border-slate-300 text-slate-700 hover:bg-slate-100 transition"
            >
              Cerrar sesión
            </button>
          </div>
        )}
      </header>

      {/* Contenido central del acortador */}
      <div className="flex items-center justify-center px-4 pb-10">
        <div className="bg-white shadow-md rounded-xl p-6 w-full max-w-md mt-6">
          <h1 className="text-2xl font-semibold mb-4 text-center">
            Acortador de URLs
          </h1>

          <a
            href="/dashboard"
            className="block text-center text-sm text-blue-600 underline mb-4"
          >
            Ver mis enlaces creados
          </a>

          <form className="space-y-4" onSubmit={createUrl}>
            <div>
              <label className="block text-sm font-medium mb-1">
                URL destino
              </label>
              <input
                type="url"
                className="w-full border rounded-md px-3 py-2 text-sm"
                placeholder="https://ejemplo.com/mi-pagina-larga"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Slug personalizado (opcional)
              </label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500">{origin}/</span>
                <input
                  className="flex-1 border rounded-md px-3 py-2 text-sm"
                  placeholder="mi-enlace"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Min 3 caracteres, solo letras minúsculas, números y guiones.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white rounded-md py-2 text-sm font-medium disabled:opacity-60"
            >
              {loading ? 'Creando...' : 'Crear enlace corto'}
            </button>
          </form>

          {error && (
            <p className="mt-4 text-sm text-red-600 text-center">
              {error}
            </p>
          )}

          {created && (
            <p className="mt-4 text-sm text-center">
              Tu enlace:{' '}
              <a
                className="underline text-blue-600"
                href={`/${created.slug}`}
                target="_blank"
                rel="noreferrer"
              >
                {origin}/{created.slug}
              </a>
            </p>
          )}
        </div>
      </div>
    </main>
  )
}
