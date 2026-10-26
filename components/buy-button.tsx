'use client'

import { useState } from 'react'

export function BuyButton({ available }: { available: boolean }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function buy() {
    setLoading(true)
    setError('')
    const data = await fetch('/api/shopify/cart', { method: 'POST' }).then((r) => r.json()).catch(() => null)
    if (data?.url) return void (window.location.href = data.url)
    setLoading(false)
    setError(data?.error || 'Checkout is unavailable right now.')
  }

  if (!available) return <button className="button button-outline" type="button" disabled>Sold out</button>
  return <>
    <button className="button button-dark" type="button" onClick={buy} disabled={loading}>{loading ? 'Opening checkout…' : 'Buy now'} <span>→</span></button>
    {error && <p className="form-error" role="alert">{error}</p>}
  </>
}
