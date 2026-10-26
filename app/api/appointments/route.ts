import { NextResponse } from 'next/server'
import { ensureTables, pool } from '@/lib/db'
import { findSession } from '@/lib/sessions'
import { square, squareLocationId } from '@/lib/square'

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

    const { paymentLink } = await square.checkout.paymentLinks.create({
      idempotencyKey: crypto.randomUUID(),
      quickPay: { name: `${session.name} (${session.minutes} min) · ${body.preferredDate}`, priceMoney: { amount: BigInt(session.price), currency: 'USD' }, locationId: squareLocationId },
      checkoutOptions: { redirectUrl: `${request.headers.get('origin')}/massage?booked=paid#book` },
      prePopulatedData: { buyerEmail: body.email },
      paymentNote: `Appointment #${appointmentId}`,
    })
    await pool.query('UPDATE appointments SET square_order_id = $1 WHERE id = $2', [paymentLink?.orderId, appointmentId])
    return NextResponse.json({ url: paymentLink?.url })
  } catch {
    if (appointmentId) await pool.query('DELETE FROM appointments WHERE id = $1', [appointmentId]).catch(() => {})
    return NextResponse.json({ error: 'Unable to save appointment' }, { status: 500 })
  }
}
