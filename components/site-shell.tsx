'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X, ArrowUpRight } from 'lucide-react'
import { useFarmCart } from '@/lib/farm-cart'

export function Header() {
  const [open, setOpen] = useState(false)
  const { count } = useFarmCart()
  const links = [['Home', '/'], ['Services', '/services'], ['Farm', '/farm'], ['Shop', '/shop'], ['Contact', '/contact']]
  return <header className="site-header"><div className="shell nav-wrap"><Link href="/" className="brand" onClick={() => setOpen(false)}><span className="brand-mark">AWH</span><span>As We Heal</span></Link><nav className={open ? 'nav-links is-open' : 'nav-links'}>{links.map(([label, href]) => <Link key={href} href={href === '/farm' && count ? '/farm#order' : href} onClick={() => setOpen(false)}>{label}{href === '/farm' && count > 0 && <span className="nav-badge" aria-label={`${count} items in your farm order`}>{count}</span>}</Link>)}<Link className="nav-cta" href="/massage" onClick={() => setOpen(false)}>Book a session <ArrowUpRight size={15} /></Link></nav><button className="menu-button" aria-label="Toggle navigation" aria-expanded={open} onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button></div></header>
}

export function Footer() { return <footer className="footer"><div className="shell footer-grid"><div><Link href="/" className="brand"><span className="brand-mark">AWH</span><span>As We Heal</span></Link><p className="footer-copy">Care for the body, nourishment for the table, and room to come back to yourself.</p></div><div><p className="eyebrow">Explore</p><Link href="/services">Services</Link><Link href="/farm">Farm market</Link><Link href="/shop">Shop</Link><Link href="/contact">Contact</Link></div><div><p className="eyebrow">Visit</p><p>New Castle, Delaware</p><p>hello@asweheal.co</p></div></div><div className="shell footer-bottom"><span>© 2026 As We Heal</span><span>Made for your whole wellbeing</span></div></footer> }

export function SiteShell({ children }: { children: React.ReactNode }) { return <><Header />{children}<Footer /></> }

export function SectionIntro({ eyebrow, title, text }: { eyebrow: string; title: string; text?: string }) { return <div className="section-intro"><p className="eyebrow">{eyebrow}</p><h1>{title}</h1>{text && <p>{text}</p>}</div> }

export function LazyImage({ src, alt, className = '' }: { src: string; alt: string; className?: string }) { return <img loading="lazy" src={src} alt={alt} className={className} /> }
