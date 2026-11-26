import { NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { confirmationNumber } from '@/lib/confirmation'
import { ensureTables, pool } from '@/lib/db'
import { MAX_PER_LINE, parseLineKey, SHIPPING_FLAT_RATE } from '@/lib/apparel'

export async function POST(request: Request) {
  let orderId: number | undefined
  try {
    const { items } = await request.json()
    const lines = (Array.isArray(items) ? items : []).map(({ key, quantity }: { key: string; quantity: number }) => ({ line: parseLineKey(String(key)), quantity: Math.trunc(Number(quantity)) }))
    if (!lines.length || lines.some(({ line, quantity }) => !line || !(quantity >= 1 && quantity <= MAX_PER_LINE))) return NextResponse.json({ error: 'Something in your bag needs another look. Please refresh and try again.' }, { status: 400 })

    const summary = lines.map(({ line, quantity }) => `${quantity}× ${line!.item.name} (${line!.size})`).join(', ')
    const subtotal = lines.reduce((sum, { line, quantity }) => sum + line!.item.price * quantity, 0)
    await ensureTables()
    const { rows } = await pool.query('INSERT INTO apparel_orders (items, amount) VALUES ($1, $2) RETURNING id', [summary, subtotal + SHIPPING_FLAT_RATE])
    orderId = rows[0].id

    const origin = request.headers.get('origin')
    const session = await getStripe().checkout.sessions.create({
      mode: 'payment',
      line_items: lines.map(({ line, quantity }) => ({ price_data: { currency: 'usd', product_data: { name: line!.item.name, description: `Size ${line!.size}` }, unit_amount: line!.item.price }, quantity })),
      shipping_address_collection: { allowed_countries: ['US'] },
      shipping_options: [{ shipping_rate_data: { type: 'fixed_amount', display_name: 'Standard shipping', fixed_amount: { amount: SHIPPING_FLAT_RATE, currency: 'usd' } } }],
      phone_number_collection: { enabled: true },
      metadata: { apparelOrderId: String(orderId) },
      success_url: `${origin}/shop?order=success&ref=${confirmationNumber('apparel', orderId!)}`,
      cancel_url: `${origin}/shop?order=canceled`,
    })
    await pool.query('UPDATE apparel_orders SET stripe_session_id = $1 WHERE id = $2', [session.id, orderId])
    return NextResponse.json({ url: session.url })
  } catch {
    if (orderId) await pool.query('DELETE FROM apparel_orders WHERE id = $1', [orderId]).catch(() => {})
    return NextResponse.json({ error: 'Unable to start checkout' }, { status: 500 })
  }
}
