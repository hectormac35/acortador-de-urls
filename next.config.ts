import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Sin el indicador flotante de Next.js en desarrollo
  devIndicators: false,
  poweredByHeader: false,

  // Cabeceras de seguridad para todas las respuestas
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ]
  },
}

export default nextConfig
