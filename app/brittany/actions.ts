'use server'

import { redirect } from 'next/navigation'
import { ensureTables, pool } from '@/lib/db'
import { isAdmin, signIn, signOut } from '@/lib/admin-auth'
import { emailConfigured, sendEmail } from '@/lib/email'

const back = (tab: string, notice?: string) => redirect(`/brittany?tab=${tab}${notice ? `&notice=${encodeURIComponent(notice)}` : ''}`)

async function requireAdmin() {
  if (!(await isAdmin())) redirect('/brittany')
  await ensureTables()
}

export async function login(formData: FormData) {
  const ok = await signIn(String(formData.get('password') ?? ''))
  if (!ok) {
    await new Promise((r) => setTimeout(r, 800)) // slow down password guessing
    redirect('/brittany?error=1')
  }
  redirect('/brittany')
}

export async function logout() {
  await signOut()
  redirect('/brittany')
}

const BOOKING_STATUSES = ['requested', 'confirmed', 'completed', 'canceled']

export async function setBookingStatus(formData: FormData) {
  await requireAdmin()
  const status = String(formData.get('status'))
  if (BOOKING_STATUSES.includes(status)) await pool.query('UPDATE appointments SET status = $1 WHERE id = $2', [status, Number(formData.get('id'))])
  back('bookings', 'Booking updated')
}

export async function togglePickedUp(formData: FormData) {
  await requireAdmin()
  await pool.query('UPDATE farm_orders SET picked_up = NOT picked_up WHERE id = $1', [Number(formData.get('id'))])
  back('farm')
}

export async function toggleFulfilled(formData: FormData) {
  await requireAdmin()
  await pool.query('UPDATE apparel_orders SET fulfilled = NOT fulfilled WHERE id = $1', [Number(formData.get('id'))])
  back('apparel')
}

export async function toggleRead(formData: FormData) {
  await requireAdmin()
  await pool.query('UPDATE contact_messages SET is_read = NOT is_read WHERE id = $1', [Number(formData.get('id'))])
  back('inbox')
}

/** Sends an email from the business address and keeps a copy under Sent (and under the message, for replies). */
export async function send(formData: FormData) {
  await requireAdmin()
  const to = String(formData.get('to') ?? '').trim()
  const subject = String(formData.get('subject') ?? '').trim().slice(0, 300)
  const body = String(formData.get('body') ?? '').trim().slice(0, 20000)
  const messageId = Number(formData.get('messageId')) || null
  const tab = messageId ? 'inbox' : 'compose'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to) || !subject || !body) back(tab, 'Add an email address, a subject, and a message.')
  const delivered = await sendEmail({ to, subject, text: body })
  await pool.query('INSERT INTO sent_emails (to_email, subject, body, message_id, delivered) VALUES ($1, $2, $3, $4, $5)', [to, subject, body, messageId, delivered])
  if (messageId) await pool.query('UPDATE contact_messages SET is_read = TRUE WHERE id = $1', [messageId])
  back(tab, delivered ? `Sent to ${to}` : emailConfigured() ? 'Saved, but the email failed to send. Try again in a moment.' : 'Saved, but email isn’t set up yet, so nothing was sent.')
}
