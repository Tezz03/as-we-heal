'use client'

import { useEffect, useState } from 'react'
import { lineKey, type ApparelItem } from '@/lib/apparel'
import { useApparelBag } from '@/lib/apparel-bag'
import { formatPrice } from '@/lib/sessions'
import { Stepper } from '@/components/farm-catalog'
import { ConfirmationNumber } from '@/components/forms'

export function ApparelCard({ item }: { item: ApparelItem }) {
  const { setQty, cart } = useApparelBag()
  const [size, setSize] = useState('')
  const [added, setAdded] = useState(false)
  const [error, setError] = useState('')

  function add() {
    if (!size) return setError('Choose a size')
    const key = lineKey(item.id, size)
    setQty(key, (cart[key] ?? 0) + 1)
    setError('')
    setAdded(true)
    setTimeout(() => setAdded(false), 1800)
  }

  return <article className="fp-shirt">
    <div className="fp-shirt-image"><img src={item.image} alt={item.imageAlt} loading="lazy" /></div>
    <h3>{item.name}</h3>
    <p>{formatPrice(item.price)}</p>
    <div className="size-pills" role="group" aria-label={`${item.name} size`}>{item.sizes.map((s) => <button key={s} type="button" className={`size-pill ${size === s ? 'is-active' : ''}`} aria-pressed={size === s} onClick={() => { setSize(s); setError('') }}>{s}</button>)}</div>
    <button type="button" className="fp-btn fp-btn-primary" onClick={add}>{added ? 'Added ✓' : 'Add to bag'}</button>
    {error && <p className="form-error" role="alert">{error}</p>}
  </article>
}

export function ApparelBag() {
  const { lines, total, setQty, clear } = useApparelBag()
  const [status, setStatus] = useState<'' | 'success' | 'canceled'>('')
  const [reference, setReference] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const order = params.get('order')
    const ref = params.get('ref') ?? ''
    if (/^AWH-A\d{5,}$/.test(ref)) setReference(ref)
    if (order === 'success') clear()
    if (order === 'success' || order === 'canceled') setStatus(order)
  }, [clear])

  async function checkout() {
    setLoading(true)
    setError('')
    const data = await fetch('/api/apparel-checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items: lines.map(({ key, quantity }) => ({ key, quantity })) }) }).then((r) => r.json()).catch(() => null)
    if (data?.url) return void (window.location.href = data.url)
    setLoading(false)
    setError(data?.error || 'Checkout is unavailable right now. Please try again.')
  }

  return <aside className="farm-order" id="bag" aria-label="Your bag">
    {status === 'success' ? <div className="success"><p className="eyebrow">Order placed</p><h3>Thank you! Your receipt is on its way.</h3>{reference && <ConfirmationNumber value={reference} />}<p>Your pieces are printed to order. We’ll email you when they ship.</p><button className="text-link" type="button" onClick={() => { setStatus(''); history.replaceState(null, '', '/shop') }}>Keep shopping →</button></div> : <>
      <h3>Your bag</h3>
      {status === 'canceled' && <p className="farm-order-note">Checkout was canceled. Your bag is saved below.</p>}
      {lines.length ? <ul className="farm-order-lines">{lines.map(({ key, item, size, quantity }) => <li key={key} className="bag-line">
        <img src={item.image} alt="" />
        <div><b>{item.name}</b><span>Size {size} · {formatPrice(item.price)}</span></div>
        <Stepper label={`${item.name} size ${size}`} qty={quantity} onChange={(n) => { setQty(key, n); setError('') }} />
        <strong>{formatPrice(item.price * quantity)}</strong>
      </li>)}</ul> : <p className="farm-order-empty">Your bag is empty. Pick a size and add something you love.</p>}
      {lines.length > 0 && <>
        <div className="farm-order-total"><span>Subtotal</span><strong>{formatPrice(total)}</strong></div>
        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="button button-dark" type="button" onClick={checkout} disabled={loading}>{loading ? 'Opening checkout…' : 'Checkout'} <span>→</span></button>
        <small>Shipping is added at checkout. Secure payment with Stripe.</small>
      </>}
    </>}
  </aside>
}

export function ApparelBagBar({ onOpen }: { onOpen: () => void }) {
  const { count, total } = useApparelBag()
  if (!count) return null
  return <button type="button" className="farm-order-bar" onClick={onOpen}><span>{count} {count === 1 ? 'item' : 'items'} · {formatPrice(total)}</span><b>View bag →</b></button>
}
