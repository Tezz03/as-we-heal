import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { SiteShell } from '@/components/site-shell'
import { ProductView } from '@/components/product-view'
import { getProduct } from '@/lib/shopify'

export const revalidate = 300

type Props = { params: Promise<{ handle: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProduct((await params).handle)
  return product ? { title: `${product.title} | As We Heal Shop`, description: product.description.slice(0, 160), openGraph: { images: product.featuredImage ? [product.featuredImage.url] : [] } } : {}
}

export default async function ProductPage({ params }: Props) {
  const product = await getProduct((await params).handle)
  if (!product) notFound()
  return <SiteShell><main className="shell product-page">
    <Link className="back-link" href="/shop">← Back to shop</Link>
    <ProductView product={product} />
  </main></SiteShell>
}
