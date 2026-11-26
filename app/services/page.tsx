import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowUpRight, HeartPulse, Leaf, Shirt, Sparkles } from 'lucide-react'
import { SiteShell, SectionIntro } from '@/components/site-shell'

export const metadata: Metadata = { title: 'Services', description: 'Massage and bodywork, a seasonal farm market, wellness guidance, and apparel from As We Heal in New Castle, Delaware.' }

export default function ServicesPage() { return <SiteShell><main className="shell content-section"><SectionIntro eyebrow="Our services" title="A gentler rhythm for everyday life." text="Start with what you need today. Our offerings are designed to work together, without asking you to become someone else first." /><div className="service-grid">{[['Massage & bodywork','Move with less tension and more ease.','/massage',HeartPulse],['Farm market','Bring seasonal goodness home.','/farm',Leaf],['Wellness guidance','Build rituals that can actually stay.','/contact',Sparkles],['Shop apparel','Rare Bird tees, hoodies, and sweatpants.','/shop',Shirt]].map(([title,copy,href,Icon]) => <Link className="service-tile" href={href as string} key={title as string}><Icon size={24}/><h2>{title as string}</h2><p>{copy as string}</p><span className="text-link">Explore <ArrowUpRight size={15}/></span></Link>)}</div></main></SiteShell> }
