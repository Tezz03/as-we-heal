export const farmCategories = [
  { label: 'Fruit', items: [
    { id: 'apples', name: 'Orchard apples', detail: 'Crisp, sweet, and picked this week.', price: 600, unit: 'basket', image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=900&q=80' },
    { id: 'strawberries', name: 'Strawberries', detail: 'Bright berries for breakfast and baking.', price: 500, unit: 'pint', image: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&w=900&q=80' },
    { id: 'peaches', name: 'Peaches', detail: 'Sun-ripened, fragrant, and tender.', price: 700, unit: 'basket', image: 'https://images.unsplash.com/photo-1639588473831-dd9d014646ae?auto=format&fit=crop&w=900&q=80' },
  ] },
  { label: 'Vegetables', items: [
    { id: 'tomatoes', name: 'Heirloom tomatoes', detail: 'Juicy varieties for salads and sauces.', price: 500, unit: 'basket', image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=900&q=80' },
    { id: 'greens', name: 'Leafy greens', detail: 'Tender kale, chard, and salad mix.', price: 400, unit: 'bunch', image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=900&q=80' },
    { id: 'carrots', name: 'Rainbow carrots', detail: 'Colorful roots with a sweet crunch.', price: 400, unit: 'bunch', image: 'https://images.unsplash.com/photo-1445282768818-728615cc910a?auto=format&fit=crop&w=900&q=80' },
  ] },
  { label: 'Poultry', items: [
    { id: 'eggs', name: 'Pasture-raised eggs', detail: 'Rich golden yolks from happy hens.', price: 700, unit: 'dozen', image: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&w=900&q=80' },
    { id: 'whole-chicken', name: 'Whole chicken', detail: 'Tender, air-chilled, and ready to roast.', price: 1800, unit: 'bird', image: 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&w=900&q=80' },
    { id: 'chicken-thighs', name: 'Chicken thighs', detail: 'Flavorful cuts for weeknight meals.', price: 1200, unit: 'pack', image: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&w=900&q=80' },
  ] },
]

export type FarmItem = (typeof farmCategories)[number]['items'][number]

export const farmItems: FarmItem[] = farmCategories.flatMap((category) => category.items)
export const findFarmItem = (id: string) => farmItems.find((item) => item.id === id)
export const MAX_PER_ITEM = 20

// Pickup runs Tuesday–Saturday (getDay 2–6), starting the day after the order.
const PICKUP_WEEKDAYS = [2, 3, 4, 5, 6]
const TIME_ZONE = 'America/New_York'

const todayInDelaware = () => new Date(new Date().toLocaleDateString('en-CA', { timeZone: TIME_ZONE }) + 'T12:00:00Z')
const isoDate = (date: Date) => date.toISOString().slice(0, 10)

export function upcomingPickupDays(count = 6) {
  const days: string[] = []
  const date = todayInDelaware()
  while (days.length < count) {
    date.setUTCDate(date.getUTCDate() + 1)
    if (PICKUP_WEEKDAYS.includes(date.getUTCDay())) days.push(isoDate(date))
  }
  return days
}

export function isValidPickupDay(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(value + 'T12:00:00Z')
  const days = (date.getTime() - todayInDelaware().getTime()) / 86_400_000
  return PICKUP_WEEKDAYS.includes(date.getUTCDay()) && days >= 1 && days <= 21
}

export const formatPickupDay = (value: string) => new Date(value + 'T12:00:00Z').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', timeZone: 'UTC' })

export const farmInfo = {
  name: 'As We Heal Farm Market',
  category: 'Farm market',
  tagline: 'Fresh food, local hands, and a table worth gathering around.',
  about: 'Seasonal produce, pasture-raised eggs, and poultry, packed with a little more intention. Order online and pick up in New Castle.',
  location: 'New Castle, Delaware',
  hours: 'Tuesday–Saturday, 9:00 am–6:00 pm',
  pickup: 'Order online, pick up the next open day',
  email: 'hello@asweheal.co',
  cover: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=1800&q=80',
}

// Sample updates — replace with real news from the farm. `action` adds a product to the order or opens a tab.
export const farmPosts: { date: string; text: string; image?: string; action?: { productId: string } | { tab: 'apparel' | 'market'; label: string } }[] = [
  { date: '2026-11-05', text: 'Strawberries are back this week! Grab a pint (or three) for pickup Tuesday through Saturday.', image: findFarmItem('strawberries')!.image, action: { productId: 'strawberries' } },
  { date: '2026-11-02', text: 'New shirts just dropped. Rare Bird, Fly Different: printed to order and shipped to your door.', action: { tab: 'apparel', label: 'Shop apparel' } },
  { date: '2026-10-29', text: 'Our hens have been busy. Pasture-raised eggs, collected daily, with the richest golden yolks.', image: findFarmItem('eggs')!.image, action: { productId: 'eggs' } },
]

export const formatPostDate = (value: string) => new Date(value + 'T12:00:00Z').toLocaleDateString('en-US', { month: 'long', day: 'numeric', timeZone: 'UTC' })
