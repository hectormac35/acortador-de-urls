export type Device = 'móvil' | 'tablet' | 'ordenador' | 'bot'

/** Clasifica el dispositivo a partir del User-Agent (sin librerías externas). */
export function detectDevice(userAgent: string | null | undefined): Device {
  const ua = (userAgent ?? '').toLowerCase()
  if (!ua) return 'ordenador'
  if (/bot|crawler|spider|slurp|facebookexternalhit|whatsapp|telegrambot|preview/.test(ua)) return 'bot'
  if (/ipad|tablet|kindle|silk|playbook|(android(?!.*mobile))/.test(ua)) return 'tablet'
  if (/mobi|iphone|ipod|android|blackberry|opera mini|iemobile/.test(ua)) return 'móvil'
  return 'ordenador'
}

/** Devuelve solo el dominio de la página de origen (sin rutas ni parámetros, por privacidad). */
export function referrerHost(referer: string | null | undefined, ownHost?: string): string | null {
  if (!referer) return null
  try {
    const host = new URL(referer).hostname.replace(/^www\./, '')
    if (!host || host === ownHost) return null
    return host
  } catch {
    return null
  }
}

export type DayCount = { date: string; count: number }

/** Agrupa clics por día (UTC) para los últimos `days` días, incluyendo los días sin clics. */
export function clicksPerDay(timestamps: Date[], days: number, now: Date = new Date()): DayCount[] {
  const end = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  const result: DayCount[] = []
  const index = new Map<string, number>()
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(end - i * 86_400_000).toISOString().slice(0, 10)
    index.set(date, result.length)
    result.push({ date, count: 0 })
  }
  for (const ts of timestamps) {
    const pos = index.get(ts.toISOString().slice(0, 10))
    if (pos !== undefined) result[pos].count++
  }
  return result
}

/** Cuenta ocurrencias y devuelve las `limit` más frecuentes. */
export function topCounts(values: (string | null)[], limit = 5, emptyLabel = 'Directo'): { label: string; count: number }[] {
  const counts = new Map<string, number>()
  for (const v of values) {
    const key = v ?? emptyLabel
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }
  return [...counts.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
    .slice(0, limit)
}

/** Fecha de hace `days` días. */
export function daysAgo(days: number, now: Date = new Date()): Date {
  return new Date(now.getTime() - days * 86_400_000)
}
