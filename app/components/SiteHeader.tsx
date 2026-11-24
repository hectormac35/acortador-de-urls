'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'

export function SiteHeader() {
  const { data: session, status } = useSession()
  const pathname = usePathname()

  const navLink = (href: string, label: string) => {
    const active = pathname === href || (href !== '/' && pathname.startsWith(href))
    return (
      <Link
        href={href}
        className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition ${
          active ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
        }`}
      >
        {label}
      </Link>
    )
  }

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-600 text-white">
            <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
              <path d="M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1 1" />
              <path d="M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66l1-1" />
            </svg>
          </span>
          <span className="hidden sm:inline">Acortador</span>
        </Link>

        <nav className="flex items-center gap-1">
          {session && <span className="hidden sm:inline">{navLink('/', 'Crear')}</span>}
          {session && navLink('/dashboard', 'Mis enlaces')}
        </nav>

        <div className="flex items-center gap-2">
          {status === 'loading' ? null : session ? (
            <>
              <span className="hidden text-sm text-slate-500 sm:inline">
                {session.user?.name ?? session.user?.email}
              </span>
              <button onClick={() => signOut({ callbackUrl: '/' })} className="btn-ghost btn-sm whitespace-nowrap">
                Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="btn-ghost btn-sm">Iniciar sesión</Link>
              <Link href="/register" className="btn-primary btn-sm">Crear cuenta</Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
