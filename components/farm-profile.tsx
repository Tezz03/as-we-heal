'use client'

import Link from 'next/link'
import { ArrowUpRight, Clock, Mail, MapPin, MessageCircle, ShoppingBasket, Store } from 'lucide-react'
import { farmInfo, farmItems, farmPosts, findFarmItem, formatPostDate } from '@/lib/farm'
import { apparelItems } from '@/lib/apparel'
import { ApparelCard } from '@/components/apparel'
import { AddToOrder, FarmOrder, FarmOrderBar, FarmProducts } from '@/components/farm-catalog'
import { ProfileHeader, ProfileTabs, useHashTab } from '@/components/profile'

const tabs = [
  { id: 'market', label: 'Market' },
  { id: 'apparel', label: 'Apparel' },
  { id: 'updates', label: 'Updates' },
  { id: 'about', label: 'About' },
  { id: 'photos', label: 'Photos' },
] as const


export function FarmProfile() {
  const { tab, open, reveal } = useHashTab('/farm', tabs, { order: 'market', shirts: 'apparel' })
  const photos = [{ url: farmInfo.cover, alt: 'The farm market' }, ...farmItems.map((item) => ({ url: item.image, alt: item.name })), ...apparelItems.map((item) => ({ url: item.image, alt: item.name }))]
  const openOrder = () => reveal('market', 'order')

  return <>
    <ProfileHeader cover={farmInfo.cover} coverAlt="Fresh produce at the farm market" initials="AWH" name={farmInfo.name} subtitle={`${farmInfo.category} · ${farmInfo.location}`} meta={`${farmItems.length} fresh items · Pickup Tue–Sat`} actions={<>
      <button type="button" className="fp-btn fp-btn-primary" onClick={openOrder}><ShoppingBasket size={17} /> Order now</button>
      <Link className="fp-btn" href="/contact"><MessageCircle size={17} /> Message</Link>
    </>} />
    <ProfileTabs tabs={tabs} active={tab} onChange={(id) => open(id, false)} label="Farm page sections" />

    <div className="fp-body">
      <aside className="fp-sidebar">
        {(tab === 'market') && <FarmOrder />}
        <section className="fp-card">
          <h2>Intro</h2>
          <p className="fp-intro-text">{farmInfo.tagline}</p>
          <ul className="fp-facts">
            <li><Store size={18} /> {farmInfo.category}</li>
            <li><MapPin size={18} /> {farmInfo.location}</li>
            <li><Clock size={18} /> {farmInfo.hours}</li>
            <li><ShoppingBasket size={18} /> {farmInfo.pickup}</li>
            <li><Mail size={18} /> <a href={`mailto:${farmInfo.email}`}>{farmInfo.email}</a></li>
          </ul>
        </section>
        <section className="fp-card">
          <div className="fp-card-head"><h2>Photos</h2><button type="button" className="fp-link" onClick={() => open('photos')}>See all photos</button></div>
          <div className="fp-photo-mini">{photos.slice(0, 9).map((photo) => <button type="button" key={photo.url} onClick={() => open('photos')} aria-label={`View ${photo.alt}`}><img src={photo.url} alt="" loading="lazy" /></button>)}</div>
        </section>
      </aside>

      <div className="fp-main">
        {tab === 'market' && <section className="fp-card">
          <div className="fp-card-head"><div><h2>Fresh this week</h2><p>Add what you’d like, choose a pickup day, and check out.</p></div></div>
          <FarmProducts />
        </section>}

        {tab === 'apparel' && <section className="fp-card">
          <div className="fp-card-head"><div><h2>Apparel</h2><p>Shirts, hoodies, and sweatpants, printed to order.</p></div><Link className="fp-link" href="/shop">Open Apparel</Link></div>
          <div className="fp-shirts">{apparelItems.map((item) => <ApparelCard key={item.id} item={item} />)}</div>
          <Link className="fp-btn fp-apparel-link" href="/shop#bag">Go to your apparel bag <ArrowUpRight size={15} /></Link>
        </section>}

        {tab === 'updates' && farmPosts.map((post) => {
          const action = post.action
          const product = action && 'productId' in action ? findFarmItem(action.productId) : undefined
          return <article className="fp-card fp-post" key={post.date + post.text}>
            <header className="fp-post-head"><div className="fp-avatar fp-avatar-sm" aria-hidden="true">AWH</div><div><b>{farmInfo.name}</b><span>{formatPostDate(post.date)}</span></div></header>
            <p className="fp-post-text">{post.text}</p>
            {post.image && <img className="fp-post-image" src={post.image} alt="" loading="lazy" />}
            {(product || (action && 'tab' in action)) && <div className="fp-post-action">
              {product ? <><span>{product.name}</span><AddToOrder item={product} /></> : action && 'tab' in action && <button type="button" className="fp-btn fp-btn-primary" onClick={() => open(action.tab)}>{action.label}</button>}
            </div>}
          </article>
        })}

        {tab === 'about' && <section className="fp-card fp-about">
          <h2>About</h2>
          <p>{farmInfo.about}</p>
          <dl>
            <div><dt><MapPin size={18} /> Location</dt><dd>{farmInfo.location}</dd></div>
            <div><dt><Clock size={18} /> Hours</dt><dd>{farmInfo.hours}</dd></div>
            <div><dt><ShoppingBasket size={18} /> Pickup</dt><dd>{farmInfo.pickup}. Choose your day at checkout.</dd></div>
            <div><dt><Mail size={18} /> Contact</dt><dd><a href={`mailto:${farmInfo.email}`}>{farmInfo.email}</a> or <Link href="/contact">send a message</Link></dd></div>
          </dl>
        </section>}

        {tab === 'photos' && <section className="fp-card">
          <h2>Photos</h2>
          <div className="fp-photos">{photos.map((photo) => <img key={photo.url} src={photo.url} alt={photo.alt} loading="lazy" />)}</div>
        </section>}
      </div>
    </div>

    <FarmOrderBar onOpen={openOrder} />
  </>
}
