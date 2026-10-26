import { getFeaturedProduct } from '@/lib/shopify'
import { BuyButton } from '@/components/buy-button'

export async function ShopifyProduct() {
  const product = await getFeaturedProduct()
  const variant = product?.variants.nodes[0]
  if (!product || !variant) return null
  const price = new Intl.NumberFormat('en-US', { style: 'currency', currency: variant.price.currencyCode }).format(Number(variant.price.amount))

  return <section className="shell featured-product">
    {product.featuredImage && <div className="featured-product-image"><img src={product.featuredImage.url} alt={product.featuredImage.altText ?? product.title} loading="lazy" /></div>}
    <div className="featured-product-copy">
      <p className="eyebrow">From our shop</p>
      <h2>{product.title}</h2>
      <p>{product.description}</p>
      <div className="featured-product-buy"><strong>{price}</strong><BuyButton available={variant.availableForSale} /></div>
      <small>Secure checkout through Shopify</small>
    </div>
  </section>
}
