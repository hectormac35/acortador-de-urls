'use client'

import { useEffect, useMemo, useState, type FormEvent } from 'react'
import Link from 'next/link'
import { CopyButton } from '../components/CopyButton'
import { useToast } from '../components/Toast'

export type UrlWithCount = {
  id: string
  slug: string
  target: string
  active: boolean
  createdAt: string
  _count: { clicks: number }
}

const dateFmt = new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })

export function UrlDashboard({ initialUrls }: { initialUrls: UrlWithCount[] }) {
  const toast = useToast()
  const [urls, setUrls] = useState(initialUrls)
  const [origin, setOrigin] = useState('')
  const [query, setQuery] = useState('')
  const [busyId, setBusyId] = useState<string | null>(null)
  const [editing, setEditing] = useState<UrlWithCount | null>(null)
  const [deleting, setDeleting] = useState<UrlWithCount | null>(null)

  useEffect(() => setOrigin(window.location.origin), [])

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return urls
    return urls.filter((u) => u.slug.includes(q) || u.target.toLowerCase().includes(q))
  }, [urls, query])

  async function patch(id: string, data: Partial<Pick<UrlWithCount, 'active' | 'target'>>) {
    setBusyId(id)
    try {
      const res = await fetch(`/api/urls/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const body = await res.json()
      if (!res.ok) {
        toast(body.error ?? 'No se pudo actualizar', 'error')
        return false
      }
      setUrls((prev) => prev.map((u) => (u.id === id ? { ...u, ...data, target: body.target, active: body.active } : u)))
      return true
    } finally {
      setBusyId(null)
    }
  }

  async function toggle(u: UrlWithCount) {
    if (await patch(u.id, { active: !u.active })) toast(u.active ? 'Enlace desactivado' : 'Enlace activado')
  }

  async function confirmDelete() {
    if (!deleting) return
    const id = deleting.id
    setBusyId(id)
    try {
      const res = await fetch(`/api/urls/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        toast('No se pudo borrar', 'error')
        return
      }
      setUrls((prev) => prev.filter((u) => u.id !== id))
      toast('Enlace borrado')
    } finally {
      setBusyId(null)
      setDeleting(null)
    }
  }

  if (urls.length === 0) {
    return (
      <div className="card px-6 py-16 text-center">
        <p className="text-lg font-semibold">Aún no tienes enlaces</p>
        <p className="mt-1 text-slate-500">Crea el primero y aparecerá aquí con sus estadísticas.</p>
        <Link href="/" className="btn-primary mt-6">Crear mi primer enlace</Link>
      </div>
    )
  }

  return (
    <div className="card overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 p-4">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por slug o destino…"
          className="input max-w-xs"
          aria-label="Buscar enlaces"
        />
        <p className="text-sm text-slate-500">{visible.length} de {urls.length} enlaces</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3 font-semibold">Enlace</th>
              <th className="px-4 py-3 font-semibold">Clics</th>
              <th className="px-4 py-3 font-semibold">Estado</th>
              <th className="px-4 py-3 font-semibold">Creado</th>
              <th className="px-4 py-3 text-right font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {visible.map((u) => {
              const short = `${origin}/${u.slug}`
              return (
                <tr key={u.id} className="align-middle hover:bg-slate-50/70">
                  <td className="max-w-md px-4 py-3">
                    <Link href={`/dashboard/${u.id}`} className="font-mono font-semibold text-indigo-600 hover:underline">
                      /{u.slug}
                    </Link>
                    <p className="truncate text-slate-500" title={u.target}>{u.target}</p>
                  </td>
                  <td className="px-4 py-3 font-semibold tabular-nums">{u._count.clicks.toLocaleString('es-ES')}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${u.active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${u.active ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                      {u.active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-500">{dateFmt.format(new Date(u.createdAt))}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <CopyButton text={short} label="" className="icon-btn" />
                      <Link href={`/dashboard/${u.id}`} className="icon-btn" title="Estadísticas" aria-label={`Estadísticas de /${u.slug}`}>
                        <Icon d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
                      </Link>
                      <button onClick={() => setEditing(u)} disabled={busyId === u.id} className="icon-btn" title="Editar destino" aria-label={`Editar /${u.slug}`}>
                        <Icon d="M4 20h4L19 9l-4-4L4 16v4zM14 6l4 4" />
                      </button>
                      <button onClick={() => toggle(u)} disabled={busyId === u.id} className="icon-btn" title={u.active ? 'Desactivar' : 'Activar'} aria-label={`${u.active ? 'Desactivar' : 'Activar'} /${u.slug}`}>
                        <Icon d={u.active ? 'M10 4H6v16h4zM18 4h-4v16h4z' : 'M7 4v16l13-8z'} />
                      </button>
                      <button onClick={() => setDeleting(u)} disabled={busyId === u.id} className="icon-btn hover:border-red-200 hover:bg-red-50 hover:text-red-600" title="Borrar" aria-label={`Borrar /${u.slug}`}>
                        <Icon d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {visible.length === 0 && <p className="p-8 text-center text-slate-500">Ningún enlace coincide con la búsqueda.</p>}
      </div>

      {editing && (
        <EditDialog
          url={editing}
          onClose={() => setEditing(null)}
          onSave={async (target) => {
            if (await patch(editing.id, { target })) {
              toast('Destino actualizado')
              setEditing(null)
            }
          }}
        />
      )}

      {deleting && (
        <Dialog title="¿Borrar este enlace?" onClose={() => setDeleting(null)}>
          <p className="text-sm text-slate-600">
            <span className="font-mono font-semibold">/{deleting.slug}</span> dejará de funcionar y se perderán sus {deleting._count.clicks} clics. No se puede deshacer.
          </p>
          <div className="mt-6 flex justify-end gap-2">
            <button onClick={() => setDeleting(null)} className="btn-ghost">Cancelar</button>
            <button onClick={confirmDelete} disabled={busyId === deleting.id} className="btn bg-red-600 text-white hover:bg-red-700">Borrar</button>
          </div>
        </Dialog>
      )}
    </div>
  )
}

function Icon({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  )
}

function Dialog({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-slate-900/40 p-4 backdrop-blur-sm" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label={title} className="card w-full max-w-lg p-6" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-semibold">{title}</h2>
        <div className="mt-3">{children}</div>
      </div>
    </div>
  )
}

function EditDialog({ url, onClose, onSave }: { url: UrlWithCount; onClose: () => void; onSave: (target: string) => Promise<void> }) {
  const [value, setValue] = useState(url.target)
  const [saving, setSaving] = useState(false)

  async function submit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    await onSave(value)
    setSaving(false)
  }

  return (
    <Dialog title={`Editar /${url.slug}`} onClose={onClose}>
      <form onSubmit={submit}>
        <label htmlFor="edit-target" className="label">Nuevo destino</label>
        <input id="edit-target" type="url" className="input" value={value} onChange={(e) => setValue(e.target.value)} required autoFocus />
        <p className="mt-1.5 text-xs text-slate-500">El enlace corto no cambia; solo a dónde lleva.</p>
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="btn-ghost">Cancelar</button>
          <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Guardando…' : 'Guardar'}</button>
        </div>
      </form>
    </Dialog>
  )
}
