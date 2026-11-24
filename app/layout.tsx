import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import './globals.css'
import NextAuthSessionProvider from './SessionProvider'
import { SiteHeader } from './components/SiteHeader'
import { ToastProvider } from './components/Toast'

export const metadata: Metadata = {
  title: { default: 'Acortador de URLs', template: '%s · Acortador de URLs' },
  description: 'Acorta enlaces, compártelos con un código QR y mide sus clics.',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body className={`${GeistSans.variable} ${GeistMono.variable}`}>
        <NextAuthSessionProvider>
          <ToastProvider>
            <SiteHeader />
            {children}
          </ToastProvider>
        </NextAuthSessionProvider>
      </body>
    </html>
  )
}
