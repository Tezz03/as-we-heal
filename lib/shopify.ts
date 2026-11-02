const domain = process.env.SHOPIFY_STORE_DOMAIN
const token = process.env.SHOPIFY_STOREFRONT_TOKEN

export const shopifyConfigured = Boolean(domain && token)

export async function storefront<T>(query: string, variables: Record<string, unknown> = {}, revalidate = 300): Promise<T> {
  const response = await fetch(`https://${domain}/api/2026-07/graphql.json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Shopify-Storefront-Access-Token': token! },
    body: JSON.stringify({ query, variables }),
    next: { revalidate },
  })
  const { data, errors } = await response.json()
  if (errors) throw new Error(errors[0]?.message ?? 'Shopify request failed')
  return data
}

type Money = { amount: string; currencyCode: string }
type Image = { url: string; altText: string | null }

export type ProductSummary = {
  handle: string
  title: string
  availableForSale: boolean
  featuredImage: Image | null
  priceRange: { minVariantPrice: Money; maxVariantPrice: Money }
}

export type Variant = {
  id: string
  availableForSale: boolean
  price: Money
  selectedOptions: { name: string; value: string }[]
  image: Image | null
}

export type Product = ProductSummary & {
  description: string
  descriptionHtml: string
  images: { nodes: Image[] }
  options: { name: string; optionValues: { name: string }[] }[]
  variants: { nodes: Variant[] }
}

const summaryFields = `handle title availableForSale featuredImage { url altText } priceRange { minVariantPrice { amount currencyCode } maxVariantPrice { amount currencyCode } }`

export async function getProducts() {
  if (!shopifyConfigured) return []
  try {
    const { products } = await storefront<{ products: { nodes: ProductSummary[] } }>(`{ products(first: 50, sortKey: CREATED_AT, reverse: true) { nodes { ${summaryFields} } } }`)
    return products.nodes
  } catch {
    return []
  }
}

export async function getProduct(handle: string) {
  if (!shopifyConfigured) return null
  try {
    const { product } = await storefront<{ product: Product | null }>(
      `query Product($handle: String!) { product(handle: $handle) { ${summaryFields} description descriptionHtml images(first: 20) { nodes { url altText } } options { name optionValues { name } } variants(first: 100) { nodes { id availableForSale price { amount currencyCode } selectedOptions { name value } image { url altText } } } } }`,
      { handle },
    )
    return product
  } catch {
    return null
  }
}

export async function createCheckout(merchandiseId: string, quantity: number) {
  const { cartCreate } = await storefront<{ cartCreate: { cart: { checkoutUrl: string } | null; userErrors: { message: string }[] } }>(
    `mutation Cart($lines: [CartLineInput!]!) { cartCreate(input: { lines: $lines }) { cart { checkoutUrl } userErrors { message } } }`,
    { lines: [{ merchandiseId, quantity }] },
    0,
  )
  if (!cartCreate.cart) throw new Error(cartCreate.userErrors[0]?.message ?? 'Unable to create cart')
  return cartCreate.cart.checkoutUrl
}

export const formatMoney = ({ amount, currencyCode }: Money) => new Intl.NumberFormat('en-US', { style: 'currency', currency: currencyCode }).format(Number(amount))

export function formatPriceRange({ minVariantPrice, maxVariantPrice }: ProductSummary['priceRange']) {
  return minVariantPrice.amount === maxVariantPrice.amount ? formatMoney(minVariantPrice) : `${formatMoney(minVariantPrice)}–${formatMoney(maxVariantPrice)}`
}

export function sizedImage(url: string, width: number) {
  const sized = new URL(url)
  sized.searchParams.set('width', String(width))
  return sized.toString()
}
