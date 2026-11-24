'use client'

import { useToast } from './Toast'

export function CopyButton({ text, className = 'btn-ghost btn-sm', label = 'Copiar' }: { text: string; className?: string; label?: string }) {
  const toast = useToast()

  async function copy() {
    try {
      await navigator.clipboard.writeText(text)
      toast('Enlace copiado')
    } catch {
      toast('No se pudo copiar', 'error')
    }
  }

  return (
    <button type="button" onClick={copy} className={className} title="Copiar enlace" aria-label="Copiar enlace">
      <svg viewBox="0 0 24 24" className={label ? "h-3.5 w-3.5" : "h-4 w-4"} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <rect x="9" y="9" width="12" height="12" rx="2" />
        <path d="M5 15V5a2 2 0 0 1 2-2h10" />
      </svg>
      {label}
    </button>
  )
}
