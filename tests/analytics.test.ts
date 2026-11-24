import { describe, expect, it } from 'vitest'
import { clicksPerDay, detectDevice, referrerHost, topCounts } from '@/lib/analytics'

describe('detectDevice', () => {
  it('detecta móviles, tablets, ordenadores y bots', () => {
    expect(detectDevice('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Mobile/15E148')).toBe('móvil')
    expect(detectDevice('Mozilla/5.0 (Linux; Android 14; Pixel 8) Mobile Safari/537.36')).toBe('móvil')
    expect(detectDevice('Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X)')).toBe('tablet')
    expect(detectDevice('Mozilla/5.0 (Linux; Android 13; SM-X200) Safari/537.36')).toBe('tablet')
    expect(detectDevice('Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0')).toBe('ordenador')
    expect(detectDevice('Googlebot/2.1 (+http://www.google.com/bot.html)')).toBe('bot')
    expect(detectDevice('WhatsApp/2.23.20.0')).toBe('bot')
    expect(detectDevice(null)).toBe('ordenador')
  })
})

describe('referrerHost', () => {
  it('se queda solo con el dominio y quita www', () => {
    expect(referrerHost('https://www.linkedin.com/feed/?x=1')).toBe('linkedin.com')
  })
  it('ignora el propio dominio y valores no válidos', () => {
    expect(referrerHost('http://localhost:3000/dashboard', 'localhost')).toBeNull()
    expect(referrerHost('no-es-url')).toBeNull()
    expect(referrerHost(undefined)).toBeNull()
  })
})

describe('clicksPerDay', () => {
  const now = new Date('2026-11-24T10:00:00Z')
  it('devuelve todos los días aunque no tengan clics', () => {
    const r = clicksPerDay([], 7, now)
    expect(r).toHaveLength(7)
    expect(r[0].date).toBe('2026-11-18')
    expect(r[6].date).toBe('2026-11-24')
    expect(r.every((d) => d.count === 0)).toBe(true)
  })
  it('agrupa por día e ignora los clics fuera del rango', () => {
    const r = clicksPerDay(
      [new Date('2026-11-24T08:00:00Z'), new Date('2026-11-24T23:00:00Z'), new Date('2026-11-20T12:00:00Z'), new Date('2026-10-01T12:00:00Z')],
      7,
      now,
    )
    expect(r.find((d) => d.date === '2026-11-24')?.count).toBe(2)
    expect(r.find((d) => d.date === '2026-11-20')?.count).toBe(1)
    expect(r.reduce((a, d) => a + d.count, 0)).toBe(3)
  })
})

describe('topCounts', () => {
  it('ordena por frecuencia, limita y etiqueta los vacíos', () => {
    expect(topCounts(['a', 'b', 'a', null, 'c', 'a', null], 2, 'Directo')).toEqual([
      { label: 'a', count: 3 },
      { label: 'Directo', count: 2 },
    ])
  })
})
