"use client"

import { useEffect, useState } from "react"
import { farmCategories, formatPickupDay, upcomingPickupDays, MAX_PER_ITEM, type FarmItem } from "@/lib/farm"
import { useFarmCart } from "@/lib/farm-cart"
import { formatPrice } from "@/lib/sessions"
import { ConfirmationNumber } from "@/components/forms"

export function FarmProducts() {
  const [active, setActive] = useState(farmCategories[0].label)
  const category = farmCategories.find((item) => item.label === active) ?? farmCategories[0]
  return <section className="farm-catalog" aria-label="Farm products for sale">
    <div className="catalog-tabs" role="tablist">{farmCategories.map((item) => <button key={item.label} type="button" role="tab" aria-selected={item.label === active} className={`catalog-tab ${item.label === active ? "is-active" : ""}`} onClick={() => setActive(item.label)}>{item.label}</button>)}</div>
    <div className="product-grid">{category.items.map((item) => <article className="farm-product" key={item.id}>
      <img src={item.image} alt={item.name} loading="lazy" width="900" height="700" />
      <div className="farm-product-body">
        <div><h3>{item.name}</h3><p>{item.detail}</p></div>
        <strong>{formatPrice(item.price)} / {item.unit}</strong>
        <AddToOrder item={item} />
      </div>
    </article>)}</div>
  </section>
}

export function AddToOrder({ item }: { item: FarmItem }) {
  const { cart, setQty } = useFarmCart()
  const qty = cart[item.id] ?? 0
  return qty ? <Stepper label={item.name} qty={qty} onChange={(n) => setQty(item.id, n)} /> : <button className="button button-outline" type="button" onClick={() => setQty(item.id, 1)}>Add to order</button>
}

export function FarmOrder() {
  const { lines, total, setQty, clear } = useFarmCart()
  const [pickupDays, setPickupDays] = useState<string[]>([])
  const [pickupDate, setPickupDate] = useState("")
  const [status, setStatus] = useState<"" | "success" | "canceled">("")
  const [reference, setReference] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const order = params.get("order")
    const ref = params.get("ref") ?? ""
    if (/^AWH-F\d{5,}$/.test(ref)) setReference(ref)
    if (order === "success") clear()
    if (order === "success" || order === "canceled") setStatus(order)
    setPickupDays(upcomingPickupDays())
  }, [clear])

  async function checkout() {
    if (!pickupDate) return setError("Choose a pickup day.")
    setLoading(true)
    setError("")
    const data = await fetch("/api/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ items: lines.map(({ item, quantity }) => ({ id: item.id, quantity })), pickupDate }) }).then((r) => r.json()).catch(() => null)
    if (data?.url) return void (window.location.href = data.url)
    setLoading(false)
    setError(data?.error || "Checkout is unavailable right now. Please try again.")
  }

  return <aside className="farm-order" id="order" aria-label="Your order">
    {status === "success" ? <div className="success"><p className="eyebrow">Order placed</p><h3>Thank you! Your receipt is on its way.</h3>{reference && <ConfirmationNumber value={reference} />}<p>We’ll have everything packed and ready on your pickup day.</p><button className="text-link" type="button" onClick={() => { setStatus(""); history.replaceState(null, "", "/farm") }}>Start a new order →</button></div> : <>
      <h3>Your order</h3>
      {status === "canceled" && <p className="farm-order-note">Checkout was canceled. Your order is saved below.</p>}
      {lines.length ? <ul className="farm-order-lines">{lines.map(({ item, quantity }) => <li key={item.id}>
        <div><b>{item.name}</b><span>{formatPrice(item.price)} / {item.unit}</span></div>
        <Stepper label={item.name} qty={quantity} onChange={(n) => { setQty(item.id, n); setError("") }} />
        <strong>{formatPrice(item.price * quantity)}</strong>
      </li>)}</ul> : <p className="farm-order-empty">Nothing here yet. Add a few things from the market.</p>}
      {lines.length > 0 && <>
        <label className="field"><span>Pickup day</span><select value={pickupDate} onChange={(e) => { setPickupDate(e.target.value); setError("") }}><option value="">Choose a day</option>{pickupDays.map((day) => <option key={day} value={day}>{formatPickupDay(day)}</option>)}</select></label>
        <p className="farm-order-note">Pickup in New Castle, 9:00 am–6:00 pm.</p>
        <div className="farm-order-total"><span>Total</span><strong>{formatPrice(total)}</strong></div>
        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="button button-dark" type="button" onClick={checkout} disabled={loading}>{loading ? "Opening checkout…" : "Checkout"} <span>→</span></button>
        <small>Secure payment with Stripe. We’ll email your receipt.</small>
      </>}
    </>}
  </aside>
}

export function FarmOrderBar({ onOpen }: { onOpen: () => void }) {
  const { count, total } = useFarmCart()
  if (!count) return null
  return <button type="button" className="farm-order-bar" onClick={onOpen}><span>{count} {count === 1 ? "item" : "items"} · {formatPrice(total)}</span><b>View order →</b></button>
}

export function Stepper({ label, qty, onChange }: { label: string; qty: number; onChange: (qty: number) => void }) {
  return <div className="stepper" role="group" aria-label={`${label} quantity`}>
    <button type="button" onClick={() => onChange(qty - 1)} aria-label={`Remove one ${label}`}>−</button>
    <span aria-live="polite">{qty}</span>
    <button type="button" onClick={() => onChange(qty + 1)} disabled={qty >= MAX_PER_ITEM} aria-label={`Add one ${label}`}>+</button>
  </div>
}
