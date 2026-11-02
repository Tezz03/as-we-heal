import { NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { ensureTables, pool } from '@/lib/db'
import { findFarmItem, formatPickupDay, isValidPickupDay, MAX_PER_ITEM } from '@/lib/farm'

export async function POST(request: Request) {
  let orderId: number | undefined
  try {
    const { items, pickupDate } = await request.json()
    const lines = (Array.isArray(items) ? items : []).map(({ id, quantity }: { id: string; quantity: number }) => ({ item: findFarmItem(String(id)), quantity: Math.trunc(Number(quantity)) }))
    if (!lines.length || lines.some(({ item, quantity }) => !item || !(quantity >= 1 && quantity <= MAX_PER_ITEM))) return NextResponse.json({ error: 'Something in your order needs another look. Please refresh and try again.' }, { status: 400 })
    if (!isValidPickupDay(String(pickupDate))) return NextResponse.json({ error: 'Choose a pickup day.' }, { status: 400 })

    const summary = lines.map(({ item, quantity }) => `${quantity}× ${item!.name}`).join(', ')
    const total = lines.reduce((sum, { item, quantity }) => sum + item!.price * quantity, 0)
    await ensureTables()
    const { rows } = await pool.query('INSERT INTO farm_orders (product, amount, pickup_date) VALUES ($1, $2, $3) RETURNING id', [summary, total, pickupDate])
    orderId = rows[0].id

    const origin = request.headers.get('origin')
    const session = await getStripe().checkout.sessions.create({
      mode: 'payment',
      line_items: lines.map(({ item, quantity }) => ({ price_data: { currency: 'usd', product_data: { name: item!.name, description: `Per ${item!.unit}` }, unit_amount: item!.price }, quantity })),
      phone_number_collection: { enabled: true },
      custom_text: { submit: { message: `Pickup in New Castle on ${formatPickupDay(pickupDate)}, 9:00 am–6:00 pm.` } },
      metadata: { farmOrderId: String(orderId), pickupDate },
      success_url: `${origin}/farm?order=success`,
      cancel_url: `${origin}/farm?order=canceled`,
    })
    await pool.query('UPDATE farm_orders SET stripe_session_id = $1 WHERE id = $2', [session.id, orderId])
    return NextResponse.json({ url: session.url })
  } catch {
    if (orderId) await pool.query('DELETE FROM farm_orders WHERE id = $1', [orderId]).catch(() => {})
    return NextResponse.json({ error: 'Unable to start checkout' }, { status: 500 })
  }
}
