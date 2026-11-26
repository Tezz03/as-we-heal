// Apparel catalog. Prices are in cents. Orders are paid through Stripe; fulfill each paid order in Printify.

export const apparelCategories = [
  { id: 'shirts', label: 'Shirts' },
  { id: 'hoodies', label: 'Hoodies' },
  { id: 'sweatpants', label: 'Sweatpants' },
] as const

export type ApparelCategory = (typeof apparelCategories)[number]['id']

export type ApparelItem = { id: string; name: string; category: ApparelCategory; price: number; sizes: string[]; detail: string; image: string; imageAlt: string }

// TODO: set your real prices, and swap the hoodie and sweatpants photos for your Printify mockups.
export const apparelItems: ApparelItem[] = [
  { id: 'rare-bird-tee', name: 'Rare Bird Garment-Dyed Tee', category: 'shirts', price: 3000, sizes: ['S', 'M', 'L', 'XL', '2XL'], detail: 'Soft, garment-dyed cotton. Fly different.', image: '/shop/rare-bird-tee.png', imageAlt: 'White Rare Bird, Fly Different t-shirt' },
  { id: 'rare-bird-hoodie', name: 'Rare Bird Hoodie', category: 'hoodies', price: 5500, sizes: ['S', 'M', 'L', 'XL', '2XL'], detail: 'A heavyweight hoodie for cool mornings.', image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=900&q=80', imageAlt: 'Gray hoodie' },
  { id: 'rare-bird-sweatpants', name: 'Rare Bird Sweatpants', category: 'sweatpants', price: 4500, sizes: ['S', 'M', 'L', 'XL'], detail: 'Relaxed joggers made for rest days.', image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=900&q=80', imageAlt: 'Jogger sweatpants' },
]

export const SHIPPING_FLAT_RATE = 600 // TODO: your shipping charge per order, in cents
export const MAX_PER_LINE = 10

export const findApparelItem = (id: string) => apparelItems.find((item) => item.id === id)

/** Bag lines are keyed "itemId|size". */
export const lineKey = (id: string, size: string) => `${id}|${size}`
export function parseLineKey(key: string) {
  const [id, size] = key.split('|')
  const item = findApparelItem(id)
  return item && item.sizes.includes(size) ? { item, size } : null
}

export const shopInfo = {
  name: 'As We Heal Apparel',
  category: 'Clothing store',
  tagline: 'Comfortable pieces for slowing down, showing up, and flying different.',
  about: 'Shirts, hoodies, and sweatpants designed in New Castle. Every piece is printed to order when you buy it, so nothing goes to waste.',
  location: 'New Castle, Delaware',
  shipping: 'Printed to order and shipped to you',
  email: 'hello@asweheal.co',
  cover: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=1800&q=80',
}
