import { NextResponse } from 'next/server'
import { WebhooksHelper } from 'square'
import { ensureTables, pool } from '@/lib/db'

export async function POST(request: Request) {
  const requestBody = await request.text()
  const signatureHeader = request.headers.get('x-square-hmacsha256-signature')
  const { SQUARE_WEBHOOK_SIGNATURE_KEY: signatureKey, SQUARE_WEBHOOK_URL: notificationUrl } = process.env
  const valid = !!(signatureHeader && signatureKey && notificationUrl) && (await WebhooksHelper.verifySignature({ requestBody, signatureHeader, signatureKey, notificationUrl }))
  if (!valid) return NextResponse.json({ error: 'Invalid signature' }, { status: 403 })

  const event = JSON.parse(requestBody)
  const payment = event.data?.object?.payment
  if (event.type?.startsWith('payment.') && payment?.status === 'COMPLETED' && payment.order_id) {
    await ensureTables()
    await pool.query("UPDATE appointments SET payment_status = 'paid' WHERE square_order_id = $1", [payment.order_id])
  }
  return NextResponse.json({ ok: true })
}
