'use client'

import { useEffect, useState } from 'react'

type UrlWithCount = {
  id: string
  slug: string
  target: string
  active: boolean
  createdAt: string
  _count: {
    clicks: number
  }
}

type Props = {
  initialUrls: UrlWithCount[]
}

export function UrlDashboard({ initialUrls }: Props) {
  const [urls, setUrls] = useState(initialUrls)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [origin, setOrigin] = useState('')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin)
    }
  }, [])

  async function toggleActive(id: string, current: boolean) {
    setLoadingId(id)
    try {
      const res = await fetch(`/api/urls/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !current }),
      })

      if (!res.ok) return

      const updated: UrlWithCount = await res.json()
      setUrls((prev) =>
        prev.map((u) =>
          u.id === id ? { ...u, active: updated.active } : u
        )
      )
    } finally {
      setLoadingId(null)
    }
  }

  async function deleteUrl(id: string) {
    if (!confirm('¿Seguro que quieres borrar este enlace?')) return

    setLoadingId(id)
    try {
      const res = await fetch(`/api/urls/${id}`, {
        method: 'DELETE',
      })

      if (!res.ok) return

      setUrls((prev) => prev.filter((u) => u.id !== id))
    } finally {
      setLoadingId(null)
    }
  }

  async function editTarget(id: string, currentTarget: string) {
    const nuevo = prompt('Nuevo destino para esta URL:', currentTarget)
    if (!nuevo) return

    setLoadingId(id)
    try {
      const res = await fetch(`/api/urls/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target: nuevo }),
      })

      if (!res.ok) {
        alert('Error al actualizar el destino')
        return
      }

      const updated: UrlWithCount = await res.json()
      setUrls((prev) =>
        prev.map((u) =>
          u.id === id ? { ...u, target: updated.target } : u
        )
      )
    } finally {
      setLoadingId(null)
    }
  }

  function copyUrl(slug: string) {
    if (!origin) return
    const full = `${origin}/${slug}`
    navigator.clipboard.writeText(full)
    alert('Enlace copiado al portapapeles')
  }

  if (urls.length === 0) {
    return <p className="text-sm text-slate-500">Aún no tienes enlaces.</p>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-slate-100 text-left">
            <th className="p-2 border-b">Slug</th>
            <th className="p-2 border-b">Destino</th>
            <th className="p-2 border-b">Clics</th>
            <th className="p-2 border-b">Estado</th>
            <th className="p-2 border-b text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {urls.map((u) => (
            <tr key={u.id} className="border-b last:border-b-0">
              <td className="p-2">
                <span className="font-mono text-xs">
                  {origin ? `${origin}/${u.slug}` : `/${u.slug}`}
                </span>
              </td>
              <td className="p-2 max-w-xs truncate" title={u.target}>
                {u.target}
              </td>
              <td className="p-2">{u._count?.clicks ?? 0}</td>
              <td className="p-2">
                {u.active ? (
                  <span className="text-green-600 text-xs font-medium">
                    Activo
                  </span>
                ) : (
                  <span className="text-red-600 text-xs font-medium">
                    Inactivo
                  </span>
                )}
              </td>
              <td className="p-2 text-right space-x-2">
                <button
                  onClick={() => copyUrl(u.slug)}
                  className="text-xs px-2 py-1 border rounded-md"
                >
                  Copiar
                </button>
                <button
                  onClick={() => editTarget(u.id, u.target)}
                  disabled={loadingId === u.id}
                  className="text-xs px-2 py-1 border rounded-md"
                >
                  Editar
                </button>
                <button
                  onClick={() => toggleActive(u.id, u.active)}
                  disabled={loadingId === u.id}
                  className="text-xs px-2 py-1 border rounded-md"
                >
                  {u.active ? 'Desactivar' : 'Activar'}
                </button>
                <button
                  onClick={() => deleteUrl(u.id)}
                  disabled={loadingId === u.id}
                  className="text-xs px-2 py-1 border rounded-md text-red-600"
                >
                  Borrar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
