import Link from 'next/link'
import type { Metadata } from 'next'
import { ArrowUpRight } from 'lucide-react'
import { SiteShell, SectionIntro } from '@/components/site-shell'
import { getProducts, formatPriceRange, sizedImage } from '@/lib/shopify'

export const metadata: Metadata = { title: 'Shop | As We Heal', description: 'Apparel and goods from As We Heal.' }
export const revalidate = 300

export default async function ShopPage() {
  const products = await getProducts()
  return <SiteShell><main className="shell content-section">
    <SectionIntro eyebrow="The shop" title="Wear what you’re working toward." text="Pieces made to order for our community. Every item is printed when you buy it, so nothing goes to waste." />
    {products.length ? <div className="shop-grid">{products.map((p) => <Link className="shop-card" href={`/shop/${p.handle}`} key={p.handle}>
      <div className="shop-card-image">{p.featuredImage && <img src={sizedImage(p.featuredImage.url, 800)} alt={p.featuredImage.altText ?? p.title} loading="lazy" />}{!p.availableForSale && <span className="shop-badge">Sold out</span>}</div>
      <div className="shop-card-body"><h2>{p.title}</h2><p>{formatPriceRange(p.priceRange)}</p><span className="card-link">View <ArrowUpRight size={15} /></span></div>
    </Link>)}</div> : <div className="shop-empty"><p className="eyebrow">Coming soon</p><h2>New pieces are on the way.</h2><Link className="text-link" href="/contact">Ask us about an item <ArrowUpRight size={15} /></Link></div>}
  </main></SiteShell>
}
