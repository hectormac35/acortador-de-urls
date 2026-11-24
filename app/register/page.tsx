'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AuthCard } from '../components/AuthCard'

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })
      if (res.ok) {
        router.push('/login?registered=1')
        return
      }
      const data = await res.json().catch(() => null)
      setError(data?.error ?? 'Error al registrar el usuario')
    } catch {
      setError('No se pudo conectar con el servidor')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthCard
      title="Crear cuenta"
      subtitle="Gratis. Solo necesitas un email."
      footer={<>¿Ya tienes cuenta? <Link href="/login" className="font-semibold text-indigo-600 hover:underline">Inicia sesión</Link></>}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="label">Nombre <span className="font-normal text-slate-400">(opcional)</span></label>
          <input id="name" className="input" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} maxLength={60} />
        </div>
        <div>
          <label htmlFor="email" className="label">Email</label>
          <input id="email" type="email" autoComplete="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label htmlFor="password" className="label">Contraseña</label>
          <input id="password" type="password" autoComplete="new-password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} minLength={8} maxLength={72} required />
          <p className="mt-1.5 text-xs text-slate-500">Mínimo 8 caracteres.</p>
        </div>
        {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <button type="submit" disabled={loading} className="btn-primary w-full py-3">
          {loading ? 'Creando cuenta…' : 'Crear cuenta'}
        </button>
      </form>
    </AuthCard>
  )
}
