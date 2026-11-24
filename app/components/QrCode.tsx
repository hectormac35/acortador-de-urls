'use client'

import { useEffect, useState } from 'react'
import QRCode from 'qrcode'

/** Código QR del enlace corto, con descarga en PNG. */
export function QrCode({ value, fileName, size = 168 }: { value: string; fileName: string; size?: number }) {
  const [dataUrl, setDataUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!value) return
    QRCode.toDataURL(value, { width: 512, margin: 1, color: { dark: '#0f172a', light: '#ffffff' } })
      .then(setDataUrl)
      .catch(() => setDataUrl(null))
  }, [value])

  if (!dataUrl) {
    return <div className="animate-pulse rounded-xl bg-slate-100" style={{ width: size, height: size }} />
  }

  return (
    <div className="flex flex-col items-center gap-2">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={dataUrl} alt={`Código QR de ${value}`} width={size} height={size} className="rounded-xl border border-slate-200" />
      <a href={dataUrl} download={`${fileName}.png`} className="text-xs font-semibold text-indigo-600 hover:underline">
        Descargar QR
      </a>
    </div>
  )
}
