import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from './prisma'
import bcrypt from 'bcrypt'

// Hash de una contraseña cualquiera: se usa cuando el email no existe para que la respuesta
// tarde lo mismo y no se pueda averiguar qué emails están registrados.
const DUMMY_HASH = bcrypt.hashSync('contraseña-que-no-existe', 12)

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credenciales',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Contraseña', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          return null
        }

        const email = credentials.email.trim().toLowerCase()
        const user = await prisma.user.findUnique({ where: { email } })

        const isValid = await bcrypt.compare(
          credentials.password,
          user?.passwordHash ?? DUMMY_HASH
        )

        if (!user || !isValid) return null

        return {
          id: user.id,
          email: user.email,
          name: user.name ?? undefined,
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  
  callbacks: {
    // Solo redirige dentro de la propia aplicación (evita redirecciones abiertas)
    async redirect({ url, baseUrl }) {
      if (url.startsWith('/')) return `${baseUrl}${url}`
      if (new URL(url).origin === baseUrl) return url
      return baseUrl
    },
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user && token.userId) {
        session.user.id = token.userId
      }
      return session
    },
  },

  pages: {
    signIn: '/login',
  },
}
