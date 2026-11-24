import { describe, expect, it } from 'vitest'
import { createUrlSchema, generateSlug, isHttpUrl, registerSchema, slugSchema, updateUrlSchema } from '@/lib/validation'

describe('isHttpUrl', () => {
  it.each(['https://ejemplo.com', 'http://localhost:3000/a?b=1', 'https://sub.dominio.es/ruta#x'])('acepta %s', (u) => {
    expect(isHttpUrl(u)).toBe(true)
  })
  it.each(['javascript:alert(1)', 'data:text/html,hola', 'ftp://x.com', 'file:///etc/passwd', 'no es una url', ''])('rechaza %s', (u) => {
    expect(isHttpUrl(u)).toBe(false)
  })
})

describe('slugSchema', () => {
  it('normaliza a minúsculas y quita espacios', () => {
    expect(slugSchema.parse('  Mi-Enlace ')).toBe('mi-enlace')
  })
  it.each(['ab', 'a'.repeat(31), 'con espacio', 'acento-á', '-empieza', 'acaba-', 'doble--guion'])('rechaza %j', (s) => {
    expect(slugSchema.safeParse(s).success).toBe(false)
  })
  it.each(['login', 'dashboard', 'api', 'register'])('rechaza el slug reservado %s', (s) => {
    const r = slugSchema.safeParse(s)
    expect(r.success).toBe(false)
    expect(r.error?.issues[0].message).toBe('Ese slug está reservado')
  })
})

describe('createUrlSchema', () => {
  it('trata un slug vacío como "generar automáticamente"', () => {
    expect(createUrlSchema.parse({ target: 'https://a.com', slug: '   ' }).slug).toBeUndefined()
  })
  it('rechaza destinos javascript:', () => {
    const r = createUrlSchema.safeParse({ target: 'javascript:alert(1)' })
    expect(r.success).toBe(false)
  })
})

describe('updateUrlSchema', () => {
  it('exige al menos un campo', () => {
    expect(updateUrlSchema.safeParse({}).success).toBe(false)
  })
  it('acepta solo el estado', () => {
    expect(updateUrlSchema.parse({ active: false })).toEqual({ active: false })
  })
})

describe('registerSchema', () => {
  it('normaliza el email', () => {
    expect(registerSchema.parse({ email: ' Hector@Ejemplo.ES ', password: '12345678' }).email).toBe('hector@ejemplo.es')
  })
  it('exige contraseñas de al menos 8 caracteres', () => {
    expect(registerSchema.safeParse({ email: 'a@b.es', password: '1234567' }).success).toBe(false)
  })
})

describe('generateSlug', () => {
  it('genera slugs válidos de la longitud pedida', () => {
    for (let i = 0; i < 200; i++) {
      const s = generateSlug(6)
      expect(s).toHaveLength(6)
      expect(slugSchema.safeParse(s).success).toBe(true)
    }
  })
})
