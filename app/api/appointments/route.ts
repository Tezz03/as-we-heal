import { NextResponse } from 'next/server'
import { ensureTables, pool } from '@/lib/db'
import { findSession } from '@/lib/sessions'
import { getStripe } from '@/lib/stripe'
import { confirmationNumber } from '@/lib/confirmation'
import { notifyBooking } from '@/lib/notify'
import { clientIp, spamCheck } from '@/lib/spam'

export async function POST(request: Request) {
  let appointmentId: number | undefined
  try {
    const body = await request.json()
    const session = findSession(body.sessionId ?? '')
    const payOnline = body.payment === 'online'
    if (!body.name || !body.email || !session || !body.preferredDate) return NextResponse.json({ error: 'Missing appointment details' }, { status: 400 })
    const isBusiness = session.audience === 'business'
    if (isBusiness && (!body.company || !body.location)) return NextResponse.json({ error: 'Please add your company and where we should set up.' }, { status: 400 })

    await ensureTables()
    const ip = clientIp(request)
    const spam = await spamCheck(body, ip, 'appointments', 4)
    if (spam === 'bot') return NextResponse.json({ ok: true, confirmation: null })
    if (spam === 'rate') return NextResponse.json({ error: 'Too many requests from your connection. Please wait a few minutes and try again.' }, { status: 429 })
    const { rows } = await pool.query(
      'INSERT INTO appointments (name, email, session, preferred_date, amount, payment_method, payment_status, audience, company, location, ip) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *',
      [String(body.name).slice(0, 200), String(body.email).slice(0, 200), session.name, body.preferredDate, session.price, payOnline ? 'online' : 'office', payOnline ? 'pending' : 'unpaid', session.audience, isBusiness ? String(body.company).slice(0, 200) : null, isBusiness ? String(body.location).slice(0, 300) : null, ip],
    )
    appointmentId = rows[0].id
    const confirmation = confirmationNumber('booking', rows[0].id)
    if (!payOnline) {
      await notifyBooking(rows[0])
      return NextResponse.json({ ok: true, confirmation })
    }

    const origin = request.headers.get('origin')
    const checkout = await getStripe().checkout.sessions.create({
      mode: 'payment',
      line_items: [{ price_data: { currency: 'usd', product_data: { name: `${session.name} (${session.minutes} min)`, description: isBusiness ? `${body.company} · ${body.preferredDate}` : `Appointment on ${body.preferredDate}` }, unit_amount: session.price }, quantity: 1 }],
      customer_email: body.email,
      metadata: { appointmentId: String(appointmentId) },
      success_url: `${origin}/massage?booked=paid&ref=${confirmation}#book`,
      cancel_url: `${origin}/massage#book`,
    })
    await pool.query('UPDATE appointments SET stripe_session_id = $1 WHERE id = $2', [checkout.id, appointmentId])
    return NextResponse.json({ url: checkout.url })
  } catch {
    if (appointmentId) await pool.query('DELETE FROM appointments WHERE id = $1', [appointmentId]).catch(() => {})
    return NextResponse.json({ error: 'Unable to save appointment' }, { status: 500 })
  }
}
