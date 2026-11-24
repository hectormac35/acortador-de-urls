import Link from 'next/link'
import type { ReactNode } from 'react'

export function AuthCard({ title, subtitle, children, footer }: { title: string; subtitle: string; children: ReactNode; footer: ReactNode }) {
  return (
    <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-gradient-to-b from-indigo-50 to-slate-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="card p-7 sm:p-8">
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
          <div className="mt-6">{children}</div>
        </div>
        <p className="mt-5 text-center text-sm text-slate-600">{footer}</p>
        <p className="mt-2 text-center text-sm">
          <Link href="/" className="text-slate-500 hover:text-slate-700">← Volver al inicio</Link>
        </p>
      </div>
    </main>
  )
}
