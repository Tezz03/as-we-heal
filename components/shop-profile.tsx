'use client'

import Link from 'next/link'
import { Mail, MapPin, MessageCircle, ShoppingBag, Store, Truck } from 'lucide-react'
import { apparelCategories, apparelItems, shopInfo, type ApparelItem } from '@/lib/apparel'
import { ProfileHeader, ProfileTabs, useHashTab } from '@/components/profile'
import { ApparelBag, ApparelBagBar, ApparelCard } from '@/components/apparel'

const tabs = [{ id: 'all', label: 'All' }, ...apparelCategories, { id: 'about', label: 'About' }] as const
type Tab = (typeof tabs)[number]['id']

export function ShopProfile() {
  const { tab, open, reveal } = useHashTab<Tab>('/shop', tabs, { bag: 'all' })
  const openBag = () => reveal('all', 'bag')
  const inCategory = (id: string) => apparelItems.filter((item) => item.category === id)

  return <>
    <ProfileHeader cover={shopInfo.cover} coverAlt="Shirts hanging on a clothing rack" initials="AWH" name={shopInfo.name} subtitle={`${shopInfo.category} · ${shopInfo.location}`} meta="Shirts · Hoodies · Sweatpants" actions={<>
      <button type="button" className="fp-btn fp-btn-primary" onClick={openBag}><ShoppingBag size={17} /> View bag</button>
      <Link className="fp-btn" href="/contact"><MessageCircle size={17} /> Message</Link>
    </>} />
    <ProfileTabs tabs={tabs} active={tab} onChange={(id) => open(id, false)} label="Apparel sections" />

    <div className="fp-body">
      <aside className="fp-sidebar">
        {tab !== 'about' && <ApparelBag />}
        <section className="fp-card">
          <h2>Intro</h2>
          <p className="fp-intro-text">{shopInfo.tagline}</p>
          <ul className="fp-facts">
            <li><Store size={18} /> {shopInfo.category}</li>
            <li><MapPin size={18} /> {shopInfo.location}</li>
            <li><Truck size={18} /> {shopInfo.shipping}</li>
            <li><Mail size={18} /> <a href={`mailto:${shopInfo.email}`}>{shopInfo.email}</a></li>
          </ul>
        </section>
      </aside>

      <div className="fp-main">
        {tab === 'all' && apparelCategories.map(({ id, label }) => inCategory(id).length > 0 && <ApparelSection key={id} title={label} items={inCategory(id)} onSeeAll={() => open(id)} />)}
        {apparelCategories.map(({ id, label }) => tab === id && <ApparelSection key={id} title={label} items={inCategory(id)} />)}
        {tab === 'about' && <section className="fp-card fp-about">
          <h2>About</h2>
          <p>{shopInfo.about}</p>
          <dl>
            <div><dt><MapPin size={18} /> Location</dt><dd>{shopInfo.location}</dd></div>
            <div><dt><Truck size={18} /> Shipping</dt><dd>{shopInfo.shipping}. The shipping charge is shown at checkout.</dd></div>
            <div><dt><Mail size={18} /> Contact</dt><dd><a href={`mailto:${shopInfo.email}`}>{shopInfo.email}</a> or <Link href="/contact">send a message</Link></dd></div>
          </dl>
        </section>}
      </div>
    </div>

    <ApparelBagBar onOpen={openBag} />
  </>
}

function ApparelSection({ title, items, onSeeAll }: { title: string; items: ApparelItem[]; onSeeAll?: () => void }) {
  return <section className="fp-card">
    <div className="fp-card-head"><h2>{title}</h2>{onSeeAll && <button type="button" className="fp-link" onClick={onSeeAll}>See all</button>}</div>
    {items.length ? <div className="fp-shirts">{items.map((item) => <ApparelCard key={item.id} item={item} />)}</div> : <p className="farm-order-empty">New {title.toLowerCase()} are coming soon.</p>}
  </section>
}
