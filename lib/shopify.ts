const domain = process.env.SHOPIFY_STORE_DOMAIN
const token = process.env.SHOPIFY_STOREFRONT_TOKEN

export const shopifyConfigured = Boolean(domain && token && process.env.SHOPIFY_PRODUCT_HANDLE)

export async function storefront<T>(query: string, variables: Record<string, unknown>, revalidate = 300): Promise<T> {
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

export type ShopifyProduct = {
  title: string
  description: string
  featuredImage: { url: string; altText: string | null } | null
  variants: { nodes: { id: string; availableForSale: boolean; price: { amount: string; currencyCode: string } }[] }
}

export async function getFeaturedProduct() {
  if (!shopifyConfigured) return null
  try {
    const { product } = await storefront<{ product: ShopifyProduct | null }>(
      `query Product($handle: String!) { product(handle: $handle) { title description featuredImage { url altText } variants(first: 1) { nodes { id availableForSale price { amount currencyCode } } } } }`,
      { handle: process.env.SHOPIFY_PRODUCT_HANDLE },
    )
    return product
  } catch {
    return null
  }
}

export async function createCheckout(merchandiseId: string) {
  const { cartCreate } = await storefront<{ cartCreate: { cart: { checkoutUrl: string } | null; userErrors: { message: string }[] } }>(
    `mutation Cart($lines: [CartLineInput!]!) { cartCreate(input: { lines: $lines }) { cart { checkoutUrl } userErrors { message } } }`,
    { lines: [{ merchandiseId, quantity: 1 }] },
    0,
  )
  if (!cartCreate.cart) throw new Error(cartCreate.userErrors[0]?.message ?? 'Unable to create cart')
  return cartCreate.cart.checkoutUrl
}
