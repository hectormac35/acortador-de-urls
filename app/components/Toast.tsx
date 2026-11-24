'use client'

import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'

type Toast = { id: number; text: string; kind: 'ok' | 'error' }
const ToastContext = createContext<(text: string, kind?: Toast['kind']) => void>(() => {})

/** Avisos breves en la esquina, en lugar de alert(). */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const show = useCallback((text: string, kind: Toast['kind'] = 'ok') => {
    const id = Date.now() + Math.random()
    setToasts((t) => [...t, { id, text, kind }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2800)
  }, [])

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div className="pointer-events-none fixed bottom-5 right-5 z-50 flex flex-col gap-2" aria-live="polite">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`rounded-lg px-4 py-2.5 text-sm font-medium text-white shadow-lg ${
              t.kind === 'ok' ? 'bg-slate-900' : 'bg-red-600'
            }`}
          >
            {t.text}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)
