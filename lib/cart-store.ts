'use client'

import { useCallback, useEffect, useState } from 'react'

export type Cart = Record<string, number>

/** A cart kept in localStorage and shared live by every component (and other open tabs). */
export function useStoredCart(key: string, isValid: (id: string) => boolean, max: number) {
  const event = `${key}-change`
  const read = useCallback((): Cart => {
    try {
      const stored = JSON.parse(localStorage.getItem(key) ?? '{}')
      return Object.fromEntries(Object.entries(stored).filter(([id, qty]) => isValid(id) && Number(qty) > 0).map(([id, qty]) => [id, Math.min(max, Number(qty))]))
    } catch {
      return {}
    }
  }, [key, isValid, max])

  const write = useCallback((cart: Cart) => {
    try {
      if (Object.keys(cart).length) localStorage.setItem(key, JSON.stringify(cart))
      else localStorage.removeItem(key)
    } catch {}
    window.dispatchEvent(new Event(event))
  }, [key, event])

  const [cart, setCart] = useState<Cart>({})

  useEffect(() => {
    const sync = () => setCart(read())
    sync()
    const onStorage = (e: StorageEvent) => { if (e.key === key) sync() }
    window.addEventListener(event, sync)
    window.addEventListener('storage', onStorage)
    return () => {
      window.removeEventListener(event, sync)
      window.removeEventListener('storage', onStorage)
    }
  }, [key, event, read])

  const setQty = useCallback((id: string, qty: number) => {
    const next = { ...read(), [id]: Math.min(max, Math.max(0, qty)) }
    write(Object.fromEntries(Object.entries(next).filter(([, n]) => n > 0)))
  }, [read, write, max])

  const clear = useCallback(() => write({}), [write])

  return { cart, setQty, clear }
}
