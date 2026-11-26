import 'server-only'
import { createHmac, timingSafeEqual } from 'node:crypto'
import { cookies } from 'next/headers'

const COOKIE = 'awh_brittany'
const WEEK = 60 * 60 * 24 * 7

export const adminConfigured = () => Boolean(process.env.ADMIN_PASSWORD)

// The session token is derived from the password, so changing ADMIN_PASSWORD signs everyone out.
const token = () => createHmac('sha256', process.env.ADMIN_PASSWORD!).update('awh-brittany-session-v1').digest('hex')

function same(a: string, b: string) {
  const x = Buffer.from(a), y = Buffer.from(b)
  return x.length === y.length && timingSafeEqual(x, y)
}

export async function isAdmin() {
  if (!adminConfigured()) return false
  const value = (await cookies()).get(COOKIE)?.value
  return Boolean(value && same(value, token()))
}

export async function signIn(password: string) {
  if (!adminConfigured() || !same(password, process.env.ADMIN_PASSWORD!)) return false
  ;(await cookies()).set(COOKIE, token(), { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', path: '/brittany', maxAge: WEEK })
  return true
}

export async function signOut() {
  ;(await cookies()).delete({ name: COOKIE, path: '/brittany' })
}
