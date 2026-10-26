import { NextResponse } from 'next/server'
import { createCheckout, getFeaturedProduct } from '@/lib/shopify'

export async function POST() {
  try {
    const variant = (await getFeaturedProduct())?.variants.nodes[0]
    if (!variant) return NextResponse.json({ error: 'Checkout is unavailable right now.' }, { status: 503 })
    if (!variant.availableForSale) return NextResponse.json({ error: 'This item is sold out right now.' }, { status: 409 })
    return NextResponse.json({ url: await createCheckout(variant.id) })
  } catch {
    return NextResponse.json({ error: 'Checkout is unavailable right now.' }, { status: 500 })
  }
}
