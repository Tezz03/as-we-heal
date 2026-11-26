'use client'

import { findFarmItem, MAX_PER_ITEM } from '@/lib/farm'
import { useStoredCart } from '@/lib/cart-store'

const isFarmItem = (id: string) => Boolean(findFarmItem(id))

export function useFarmCart() {
  const { cart, setQty, clear } = useStoredCart('awh-farm-cart', isFarmItem, MAX_PER_ITEM)
  const lines = Object.entries(cart).map(([id, quantity]) => ({ item: findFarmItem(id)!, quantity }))
  const count = lines.reduce((sum, line) => sum + line.quantity, 0)
  const total = lines.reduce((sum, line) => sum + line.item.price * line.quantity, 0)
  return { cart, lines, count, total, setQty, clear }
}
