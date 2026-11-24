import { getServerSession } from 'next-auth'
import { authOptions } from './auth'

/** Id del usuario con sesión, o null si no hay sesión. */
export async function currentUserId(): Promise<string | null> {
  const session = await getServerSession(authOptions)
  return session?.user?.id ?? null
}
