'use client'

import { useMemo, useState } from 'react'
import { formatMoney, sizedImage, type Product } from '@/lib/shopify'

export function ProductView({ product }: { product: Product }) {
  const options = product.options.filter((o) => o.optionValues.length > 1)
  const firstAvailable = product.variants.nodes.find((v) => v.availableForSale) ?? product.variants.nodes[0]
  const [selected, setSelected] = useState<Record<string, string>>(() => Object.fromEntries(firstAvailable?.selectedOptions.map((o) => [o.name, o.value]) ?? []))
  const [imageUrl, setImageUrl] = useState(firstAvailable?.image?.url ?? product.featuredImage?.url)
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const variant = useMemo(() => product.variants.nodes.find((v) => v.selectedOptions.every((o) => selected[o.name] === o.value)), [product, selected])
  const isAvailable = (name: string, value: string) => product.variants.nodes.some((v) => v.availableForSale && v.selectedOptions.every((o) => (o.name === name ? o.value === value : selected[o.name] === o.value)))
  const images = product.images.nodes.length ? product.images.nodes : product.featuredImage ? [product.featuredImage] : []
  const mainImage = images.find((img) => img.url === imageUrl) ?? images[0]

  function choose(name: string, value: string) {
    const next = { ...selected, [name]: value }
    setSelected(next)
    const match = product.variants.nodes.find((v) => v.selectedOptions.every((o) => next[o.name] === o.value))
    if (match?.image) setImageUrl(match.image.url)
    setError('')
  }

  async function buy() {
    if (!variant?.availableForSale) return
    setLoading(true)
    setError('')
    const data = await fetch('/api/shopify/cart', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ variantId: variant.id, quantity }) }).then((r) => r.json()).catch(() => null)
    if (data?.url) return void (window.location.href = data.url)
    setLoading(false)
    setError(data?.error || 'Checkout is unavailable right now.')
  }

  return <div className="product-layout">
    <div className="product-gallery">
      <div className="product-main-image">{mainImage && <img src={sizedImage(mainImage.url, 1200)} alt={mainImage.altText ?? product.title} />}</div>
      {images.length > 1 && <div className="product-thumbs">{images.map((img) => <button type="button" key={img.url} className={img.url === mainImage?.url ? 'is-active' : ''} onClick={() => setImageUrl(img.url)} aria-label="Show image"><img src={sizedImage(img.url, 200)} alt="" loading="lazy" /></button>)}</div>}
    </div>
    <div className="product-info">
      <p className="eyebrow">As We Heal Shop</p>
      <h1>{product.title}</h1>
      <p className="product-price">{variant ? formatMoney(variant.price) : '—'}</p>
      {options.map((option) => <fieldset className="option-group" key={option.name}>
        <legend>{option.name}{selected[option.name] && <span>: {selected[option.name]}</span>}</legend>
        <div>{option.optionValues.map(({ name }) => <button type="button" key={name} className={`option-pill ${selected[option.name] === name ? 'is-active' : ''}`} aria-pressed={selected[option.name] === name} disabled={!isAvailable(option.name, name)} onClick={() => choose(option.name, name)}>{name}</button>)}</div>
      </fieldset>)}
      <div className="product-buy">
        <label className="qty"><span>Qty</span><select value={quantity} onChange={(e) => setQuantity(Number(e.target.value))}>{Array.from({ length: 10 }, (_, i) => <option key={i + 1}>{i + 1}</option>)}</select></label>
        <button className="button button-dark" type="button" onClick={buy} disabled={loading || !variant?.availableForSale}>{!variant?.availableForSale ? 'Sold out' : loading ? 'Opening checkout…' : 'Buy now'} <span>→</span></button>
      </div>
      {error && <p className="form-error" role="alert">{error}</p>}
      <small className="product-note">Printed to order and shipped to you. Secure checkout through Shopify.</small>
      {product.descriptionHtml && <div className="product-description" dangerouslySetInnerHTML={{ __html: product.descriptionHtml }} />}
    </div>
  </div>
}
