'use client'

import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { findFarmItem } from '@/lib/farm'
import { useFarmCart } from '@/lib/farm-cart'
import { formatPrice } from '@/lib/sessions'
import { Stepper } from '@/components/farm-catalog'

const featured = ['strawberries', 'tomatoes', 'eggs', 'whole-chicken'].map((id) => findFarmItem(id)!)

export function FarmPreview() {
  const { cart, count, total, setQty } = useFarmCart()
  return <section className="farm-preview" aria-labelledby="farm-preview-title">
    <div className="shell">
      <div className="farm-preview-head">
        <div><p className="eyebrow">From the farm this week</p><h2 id="farm-preview-title">Fresh food, ready for pickup.</h2></div>
        <Link className="text-link" href="/farm">Shop the full market <ArrowUpRight size={15} /></Link>
      </div>
      <div className="farm-preview-grid">{featured.map((item) => {
        const qty = cart[item.id] ?? 0
        return <article className="farm-preview-card" key={item.id}>
          <Link href="/farm" className="farm-preview-image" tabIndex={-1} aria-hidden="true"><img src={item.image} alt="" loading="lazy" /></Link>
          <div className="farm-preview-body">
            <h3>{item.name}</h3>
            <p>{formatPrice(item.price)} / {item.unit}</p>
            {qty ? <Stepper label={item.name} qty={qty} onChange={(n) => setQty(item.id, n)} /> : <button className="button button-outline" type="button" onClick={() => setQty(item.id, 1)}>Add to order</button>}
          </div>
        </article>
      })}</div>
      <div className="farm-preview-foot" aria-live="polite">{count > 0 ? <Link className="button button-dark" href="/farm#order">Review order · {count} {count === 1 ? 'item' : 'items'} · {formatPrice(total)} <span>→</span></Link> : <p>Order online, pick up in New Castle Tuesday through Saturday.</p>}</div>
    </div>
  </section>
}
