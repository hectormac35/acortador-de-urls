import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 text-center">
      <p className="font-mono text-6xl font-bold text-indigo-600">404</p>
      <h1 className="mt-4 text-2xl font-bold">Este enlace no existe o está desactivado</h1>
      <p className="mt-2 text-slate-500">Puede que lo hayan borrado o que la dirección tenga una errata.</p>
      <Link href="/" className="btn-primary mt-8">Ir al inicio</Link>
    </main>
  )
}
