import { NextResponse } from 'next/server'
import { createCheckout } from '@/lib/shopify'

export async function POST(request: Request) {
  try {
    const { variantId, quantity = 1 } = await request.json()
    const qty = Math.trunc(Number(quantity))
    if (typeof variantId !== 'string' || !variantId.startsWith('gid://shopify/ProductVariant/') || !(qty >= 1 && qty <= 10)) return NextResponse.json({ error: 'Choose an option first.' }, { status: 400 })
    return NextResponse.json({ url: await createCheckout(variantId, qty) })
  } catch {
    return NextResponse.json({ error: 'Checkout is unavailable right now.' }, { status: 500 })
  }
}
