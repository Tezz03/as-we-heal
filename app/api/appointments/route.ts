import { NextResponse } from 'next/server'
import { ensureTables, pool } from '@/lib/db'
import { findSession } from '@/lib/sessions'
import { getStripe } from '@/lib/stripe'

export async function POST(request: Request) {
  let appointmentId: number | undefined
  try {
    const body = await request.json()
    const session = findSession(body.sessionId ?? '')
    const payOnline = body.payment === 'online'
    if (!body.name || !body.email || !session || !body.preferredDate) return NextResponse.json({ error: 'Missing appointment details' }, { status: 400 })

    await ensureTables()
    const { rows } = await pool.query(
      'INSERT INTO appointments (name, email, session, preferred_date, amount, payment_method, payment_status) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      [body.name, body.email, session.name, body.preferredDate, session.price, payOnline ? 'online' : 'office', payOnline ? 'pending' : 'unpaid'],
    )
    appointmentId = rows[0].id
    if (!payOnline) return NextResponse.json({ ok: true })

    const origin = request.headers.get('origin')
    const checkout = await getStripe().checkout.sessions.create({
      mode: 'payment',
      line_items: [{ price_data: { currency: 'usd', product_data: { name: `${session.name} (${session.minutes} min)`, description: `Appointment on ${body.preferredDate}` }, unit_amount: session.price }, quantity: 1 }],
      customer_email: body.email,
      metadata: { appointmentId: String(appointmentId) },
      success_url: `${origin}/massage?booked=paid#book`,
      cancel_url: `${origin}/massage#book`,
    })
    await pool.query('UPDATE appointments SET stripe_session_id = $1 WHERE id = $2', [checkout.id, appointmentId])
    return NextResponse.json({ url: checkout.url })
  } catch {
    if (appointmentId) await pool.query('DELETE FROM appointments WHERE id = $1', [appointmentId]).catch(() => {})
    return NextResponse.json({ error: 'Unable to save appointment' }, { status: 500 })
  }
}
