import { NextResponse } from 'next/server'
import type Stripe from 'stripe'
import { ensureTables, pool } from '@/lib/db'
import { getStripe } from '@/lib/stripe'

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
      await pool.query("UPDATE appointments SET payment_status = 'paid' WHERE stripe_session_id = $1", [session.id])
      await pool.query("UPDATE farm_orders SET payment_status = 'paid' WHERE stripe_session_id = $1", [session.id])
    }
  }
  return NextResponse.json({ received: true })
}
