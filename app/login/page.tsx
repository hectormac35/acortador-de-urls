'use client'

import { Suspense, useState, type FormEvent } from 'react'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { AuthCard } from '../components/AuthCard'

function LoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const res = await signIn('credentials', { redirect: false, email, password })
    setLoading(false)
    if (res?.error) {
      setError('Email o contraseña incorrectos')
      return
    }
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {params.get('registered') && (
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">Cuenta creada. Ya puedes iniciar sesión.</p>
      )}
      <div>
        <label htmlFor="email" className="label">Email</label>
        <input id="email" type="email" autoComplete="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>
      <div>
        <label htmlFor="password" className="label">Contraseña</label>
        <input id="password" type="password" autoComplete="current-password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} required />
      </div>
      {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      <button type="submit" disabled={loading} className="btn-primary w-full py-3">
        {loading ? 'Entrando…' : 'Iniciar sesión'}
      </button>
    </form>
  )
}

export default function LoginPage() {
  return (
    <AuthCard
      title="Iniciar sesión"
      subtitle="Accede a tus enlaces y sus estadísticas."
      footer={<>¿No tienes cuenta? <Link href="/register" className="font-semibold text-indigo-600 hover:underline">Regístrate</Link></>}
    >
      <Suspense>
        <LoginForm />
      </Suspense>
    </AuthCard>
  )
}
