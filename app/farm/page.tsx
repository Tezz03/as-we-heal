import type { Metadata } from 'next'
import { SiteShell } from '@/components/site-shell'
import { FarmProfile } from '@/components/farm-profile'

export const metadata: Metadata = { title: 'Farm Market', description: 'Order seasonal fruit, vegetables, pasture-raised eggs, and poultry online for pickup in New Castle, Delaware, Tuesday through Saturday.' }

export default function FarmPage() {
  return <SiteShell><main className="fp"><FarmProfile /></main></SiteShell>
}
