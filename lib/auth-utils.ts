import { auth } from './auth'
import { headers } from 'next/headers'

export async function getUserId() {
  'use server'
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  return session.user.id
}

export async function getSession() {
  'use server'
  const session = await auth.api.getSession({ headers: await headers() })
  return session
}

export async function requireAuth() {
  'use server'
  const session = await getSession()
  if (!session?.user) {
    throw new Error('Authentication required')
  }
  return session
}
