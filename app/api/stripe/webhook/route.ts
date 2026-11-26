import { NextResponse } from 'next/server'
import type Stripe from 'stripe'
import { ensureTables, pool } from '@/lib/db'
import { getStripe } from '@/lib/stripe'
import { notifyApparelOrder, notifyBooking, notifyFarmOrder } from '@/lib/notify'

export async function POST(request: Request) {
  const payload = await request.text()
  const signature = request.headers.get('stripe-signature')
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  let event: Stripe.Event
  try {
    if (!signature || !secret) throw new Error('Missing signature')
    event = getStripe().webhooks.constructEvent(payload, signature, secret)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed' || event.type === 'checkout.session.async_payment_succeeded') {
    const session = event.data.object
    if (session.payment_status === 'paid') {
      await ensureTables()
      // `payment_status <> 'paid'` makes each update (and its emails) happen once, even when Stripe retries the event.
      const customer = session.customer_details
      const shipping = session.collected_information?.shipping_details
      const booking = await pool.query("UPDATE appointments SET payment_status = 'paid' WHERE stripe_session_id = $1 AND payment_status <> 'paid' RETURNING *", [session.id])
      const farm = await pool.query("UPDATE farm_orders SET payment_status = 'paid', customer_name = $2, customer_email = $3, customer_phone = $4 WHERE stripe_session_id = $1 AND payment_status <> 'paid' RETURNING *", [session.id, customer?.name ?? null, customer?.email ?? null, customer?.phone ?? null])
      const apparel = await pool.query("UPDATE apparel_orders SET payment_status = 'paid', customer_name = $2, customer_email = $3, customer_phone = $4, shipping_address = $5 WHERE stripe_session_id = $1 AND payment_status <> 'paid' RETURNING *", [session.id, shipping?.name ?? customer?.name ?? null, customer?.email ?? null, customer?.phone ?? null, shipping ? JSON.stringify(shipping.address) : null])
      if (booking.rows[0]) await notifyBooking(booking.rows[0])
      if (farm.rows[0]) await notifyFarmOrder(farm.rows[0])
      if (apparel.rows[0]) await notifyApparelOrder(apparel.rows[0])
    }
  }
  return NextResponse.json({ received: true })
}
