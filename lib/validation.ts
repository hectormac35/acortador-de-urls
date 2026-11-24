import { z } from 'zod'

/** Slugs que chocan con rutas de la propia aplicación. */
export const RESERVED_SLUGS = new Set([
  'api',
  'login',
  'register',
  'dashboard',
  'logout',
  '_next',
  'favicon.ico',
  'robots.txt',
  'sitemap.xml',
])

export const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
export const SLUG_MIN = 3
export const SLUG_MAX = 30

/** true si el texto es una URL absoluta http(s). Rechaza javascript:, data:, file:, ftp:… */
export function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

export const targetSchema = z
  .string()
  .trim()
  .max(2048, 'La URL es demasiado larga')
  .refine(isHttpUrl, { message: 'La URL debe empezar por http:// o https://' })

export const slugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(SLUG_MIN, `El slug debe tener al menos ${SLUG_MIN} caracteres`)
  .max(SLUG_MAX, `El slug no puede tener más de ${SLUG_MAX} caracteres`)
  .regex(SLUG_REGEX, 'El slug solo puede contener letras minúsculas, números y guiones')
  .refine((s) => !RESERVED_SLUGS.has(s), { message: 'Ese slug está reservado' })

export const createUrlSchema = z.object({
  target: targetSchema,
  // Un slug vacío equivale a "genera uno automático"
  slug: z
    .string()
    .optional()
    .transform((s) => (s?.trim() ? s : undefined))
    .pipe(slugSchema.optional()),
})

export const updateUrlSchema = z
  .object({
    target: targetSchema.optional(),
    active: z.boolean().optional(),
  })
  .refine((d) => d.target !== undefined || d.active !== undefined, {
    message: 'Nada que actualizar',
  })

export const registerSchema = z.object({
  name: z.string().trim().max(60).optional(),
  email: z.string().trim().toLowerCase().email('Email no válido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres').max(72),
})

const SLUG_ALPHABET = 'abcdefghijkmnpqrstuvwxyz23456789' // sin 0/o ni 1/l para que no se confundan

/** Genera un slug aleatorio con el generador criptográfico del sistema. */
export function generateSlug(length = 6): string {
  const bytes = crypto.getRandomValues(new Uint8Array(length))
  let out = ''
  for (const b of bytes) out += SLUG_ALPHABET[b % SLUG_ALPHABET.length]
  return out
}

/** Primer mensaje de error legible de una validación de Zod. */
export function firstIssue(error: z.ZodError): string {
  return error.issues[0]?.message ?? 'Datos inválidos'
}
