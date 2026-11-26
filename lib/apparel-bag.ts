'use client'

import { MAX_PER_LINE, parseLineKey } from '@/lib/apparel'
import { useStoredCart } from '@/lib/cart-store'

const isLine = (key: string) => Boolean(parseLineKey(key))

export function useApparelBag() {
  const { cart, setQty, clear } = useStoredCart('awh-apparel-bag', isLine, MAX_PER_LINE)
  const lines = Object.entries(cart).map(([key, quantity]) => ({ key, ...parseLineKey(key)!, quantity }))
  const count = lines.reduce((sum, line) => sum + line.quantity, 0)
  const total = lines.reduce((sum, line) => sum + line.item.price * line.quantity, 0)
  return { cart, lines, count, total, setQty, clear }
}
