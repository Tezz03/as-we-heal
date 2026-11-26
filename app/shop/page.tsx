import type { Metadata } from 'next'
import { SiteShell } from '@/components/site-shell'
import { ShopProfile } from '@/components/shop-profile'

export const metadata: Metadata = { title: 'Apparel', description: 'Shop Rare Bird tees, hoodies, and sweatpants from As We Heal. Printed to order and shipped to your door.' }

export default function ShopPage() {
  return <SiteShell><main className="fp"><ShopProfile /></main></SiteShell>
}
