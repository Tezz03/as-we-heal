'use client'

import { useCallback, useEffect, useState } from 'react'
import { findFarmItem, MAX_PER_ITEM } from '@/lib/farm'

export type Cart = Record<string, number>

const CART_KEY = 'awh-farm-cart'
const CART_EVENT = 'awh-farm-cart-change'

function readCart(): Cart {
  try {
    const stored = JSON.parse(localStorage.getItem(CART_KEY) ?? '{}')
    return Object.fromEntries(Object.entries(stored).filter(([id, qty]) => findFarmItem(id) && Number(qty) > 0).map(([id, qty]) => [id, Math.min(MAX_PER_ITEM, Number(qty))]))
  } catch {
    return {}
  }
}

function writeCart(cart: Cart) {
  try {
    if (Object.keys(cart).length) localStorage.setItem(CART_KEY, JSON.stringify(cart))
    else localStorage.removeItem(CART_KEY)
  } catch {}
  window.dispatchEvent(new Event(CART_EVENT))
}

/** Farm cart shared by every component on the page (and other open tabs) through localStorage. */
export function useFarmCart() {
  const [cart, setCart] = useState<Cart>({})

  useEffect(() => {
    const sync = () => setCart(readCart())
    sync()
    window.addEventListener(CART_EVENT, sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener(CART_EVENT, sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  const setQty = useCallback((id: string, qty: number) => {
    const next = { ...readCart(), [id]: Math.min(MAX_PER_ITEM, Math.max(0, qty)) }
    writeCart(Object.fromEntries(Object.entries(next).filter(([, n]) => n > 0)))
  }, [])

  const clear = useCallback(() => writeCart({}), [])

  const lines = Object.entries(cart).map(([id, quantity]) => ({ item: findFarmItem(id)!, quantity }))
  const count = lines.reduce((sum, line) => sum + line.quantity, 0)
  const total = lines.reduce((sum, line) => sum + line.item.price * line.quantity, 0)

  return { cart, lines, count, total, setQty, clear }
}
