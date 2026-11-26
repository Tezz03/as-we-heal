import Link from 'next/link'
import type { Metadata } from 'next'
import { ArrowUpRight } from 'lucide-react'
import { SiteShell } from '@/components/site-shell'

export const metadata: Metadata = { title: 'Page not found', robots: { index: false } }

const places = [
  { href: '/massage', label: 'Book a massage' },
  { href: '/farm', label: 'Order from the farm' },
  { href: '/shop', label: 'Shop apparel' },
  { href: '/contact', label: 'Send us a message' },
]

export default function NotFound() {
  return <SiteShell><main className="shell not-found">
    <p className="eyebrow">Error 404</p>
    <h1>This page wandered off.</h1>
    <p className="not-found-text">The link may be old or mistyped. Here are a few good places to land instead.</p>
    <div className="not-found-links">{places.map((p) => <Link key={p.href} href={p.href} className="not-found-link">{p.label} <ArrowUpRight size={16} /></Link>)}</div>
    <Link className="button button-dark" href="/">Back to the home page <span>→</span></Link>
  </main></SiteShell>
}
