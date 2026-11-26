import Link from 'next/link'
import type { Metadata } from 'next'
import { ensureTables, pool } from '@/lib/db'
import { adminConfigured, isAdmin } from '@/lib/admin-auth'
import { emailConfigured } from '@/lib/email'
import { confirmationNumber } from '@/lib/confirmation'
import { formatPrice } from '@/lib/sessions'
import { login, logout, send, setBookingStatus, toggleFulfilled, togglePickedUp, toggleRead } from './actions'

export const metadata: Metadata = { title: 'Brittany', robots: { index: false, follow: false } }
export const dynamic = 'force-dynamic'

const TABS = [
  { id: 'bookings', label: 'Bookings' },
  { id: 'farm', label: 'Farm orders' },
  { id: 'apparel', label: 'Apparel' },
  { id: 'inbox', label: 'Inbox' },
  { id: 'compose', label: 'Compose' },
] as const
type Tab = (typeof TABS)[number]['id']

type Search = { tab?: string; notice?: string; error?: string; to?: string; subject?: string; show?: string }

const day = (value: string | Date | null) => (value ? new Date(value).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' }) : '—')
const stamp = (value: string | Date) => new Date(value).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
const mailto = (to: string, subject: string) => `/brittany?tab=compose&to=${encodeURIComponent(to)}&subject=${encodeURIComponent(subject)}`

export default async function BrittanyPage({ searchParams }: { searchParams: Promise<Search> }) {
  const params = await searchParams

  if (!adminConfigured()) return <Shell><section className="admin-card admin-narrow"><h1>Brittany</h1><p>Set an <code>ADMIN_PASSWORD</code> environment variable (in <code>.env.local</code> and in Vercel) to turn on this page.</p></section></Shell>

  if (!(await isAdmin())) return <Shell>
    <form action={login} className="admin-card admin-narrow admin-login">
      <h1>Brittany</h1>
      <p>Sign in to see bookings, orders, and messages.</p>
      <label className="admin-field"><span>Password</span><input id="admin-password" name="password" type="password" autoComplete="current-password" required autoFocus /></label>
      {params.error && <p className="admin-error" role="alert">That password didn’t match. Try again.</p>}
      <button className="button button-dark" type="submit">Sign in</button>
    </form>
  </Shell>

  if (!process.env.DATABASE_URL) return <Shell><section className="admin-card admin-narrow"><h1>Brittany</h1><p>Connect the database first: add <code>DATABASE_URL</code> to <code>.env.local</code> and Vercel.</p><form action={logout}><button className="admin-link" type="submit">Sign out</button></form></section></Shell>

  await ensureTables()
  const tab: Tab = TABS.some((t) => t.id === params.tab) ? (params.tab as Tab) : 'bookings'
  const { rows: [counts] } = await pool.query(`SELECT
    (SELECT COUNT(*)::int FROM appointments WHERE status = 'requested') AS bookings,
    (SELECT COUNT(*)::int FROM farm_orders WHERE payment_status = 'paid' AND NOT picked_up) AS farm,
    (SELECT COUNT(*)::int FROM apparel_orders WHERE payment_status = 'paid' AND NOT fulfilled) AS apparel,
    (SELECT COUNT(*)::int FROM contact_messages WHERE NOT is_read) AS inbox`)

  return <Shell>
    <header className="admin-head">
      <div><p className="eyebrow">As We Heal</p><h1>Brittany</h1></div>
      <div className="admin-head-actions"><Link className="admin-link" href="/">View site</Link><form action={logout}><button className="admin-link" type="submit">Sign out</button></form></div>
    </header>
    {!emailConfigured() && <p className="admin-banner">Email isn’t set up yet, so customers aren’t getting confirmations and replies won’t send. Add <code>RESEND_API_KEY</code> and <code>EMAIL_FROM</code> to turn it on.</p>}
    {params.notice && <p className="admin-notice" role="status">{params.notice}</p>}
    <nav className="admin-tabs" aria-label="Sections">{TABS.map((t) => {
      const n = (counts as Record<string, number>)[t.id]
      return <Link key={t.id} href={`/brittany?tab=${t.id}`} className={tab === t.id ? 'is-active' : ''} aria-current={tab === t.id ? 'page' : undefined}>{t.label}{n > 0 && <span className="admin-count">{n}</span>}</Link>
    })}</nav>
    {tab === 'bookings' && <Bookings showAll={params.show === 'all'} />}
    {tab === 'farm' && <Farm showAll={params.show === 'all'} />}
    {tab === 'apparel' && <Apparel showAll={params.show === 'all'} />}
    {tab === 'inbox' && <Inbox />}
    {tab === 'compose' && <Compose to={params.to} subject={params.subject} />}
  </Shell>
}

function Shell({ children }: { children: React.ReactNode }) {
  return <main className="admin">{children}</main>
}

function Filter({ tab, showAll, open }: { tab: string; showAll: boolean; open: string }) {
  return <div className="admin-filter">
    <Link href={`/brittany?tab=${tab}`} className={!showAll ? 'is-active' : ''}>{open}</Link>
    <Link href={`/brittany?tab=${tab}&show=all`} className={showAll ? 'is-active' : ''}>All</Link>
  </div>
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="admin-empty">{children}</p>
}

async function Bookings({ showAll }: { showAll: boolean }) {
  const { rows } = await pool.query(`SELECT * FROM appointments ${showAll ? '' : "WHERE status IN ('requested', 'confirmed')"} ORDER BY preferred_date ASC, created_at DESC LIMIT 300`)
  return <section className="admin-section">
    <Filter tab="bookings" showAll={showAll} open="Upcoming" />
    {rows.length === 0 ? <Empty>No bookings yet.</Empty> : <div className="admin-table-wrap"><table className="admin-table">
      <thead><tr><th>Confirmation</th><th>Date</th><th>Client</th><th>Session</th><th>Payment</th><th>Status</th></tr></thead>
      <tbody>{rows.map((b) => {
        const number = confirmationNumber('booking', b.id)
        return <tr key={b.id}>
          <td className="mono">{number}</td>
          <td>{day(b.preferred_date)}</td>
          <td><b>{b.name}</b><br /><Link href={mailto(b.email, `Your As We Heal booking ${number}`)}>{b.email}</Link>{b.company && <><br /><span className="muted">{b.company} · {b.location}</span></>}</td>
          <td>{b.session}{b.audience === 'business' && <span className="pill pill-business">Business</span>}</td>
          <td>{formatPrice(b.amount ?? 0)}<br /><span className={`pill ${b.payment_status === 'paid' ? 'pill-good' : 'pill-wait'}`}>{b.payment_status === 'paid' ? 'Paid' : b.payment_method === 'online' ? 'Awaiting payment' : 'Pay at visit'}</span></td>
          <td><form action={setBookingStatus} className="admin-inline"><input type="hidden" name="id" value={b.id} /><select id={`status-${b.id}`} name="status" defaultValue={b.status} aria-label={`Status for ${number}`}>{['requested', 'confirmed', 'completed', 'canceled'].map((s) => <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>)}</select><button type="submit" className="admin-link">Save</button></form></td>
        </tr>
      })}</tbody>
    </table></div>}
  </section>
}

async function Farm({ showAll }: { showAll: boolean }) {
  const { rows } = await pool.query(`SELECT * FROM farm_orders WHERE payment_status = 'paid' ${showAll ? '' : 'AND NOT picked_up'} ORDER BY pickup_date ASC NULLS LAST, created_at DESC LIMIT 300`)
  return <section className="admin-section">
    <Filter tab="farm" showAll={showAll} open="Waiting for pickup" />
    {rows.length === 0 ? <Empty>No paid farm orders {showAll ? 'yet' : 'waiting for pickup'}.</Empty> : <div className="admin-table-wrap"><table className="admin-table">
      <thead><tr><th>Confirmation</th><th>Pickup</th><th>Customer</th><th>Order</th><th>Total</th><th>Picked up</th></tr></thead>
      <tbody>{rows.map((o) => <tr key={o.id} className={o.picked_up ? 'is-done' : ''}>
        <td className="mono">{confirmationNumber('farm', o.id)}</td>
        <td><b>{day(o.pickup_date)}</b></td>
        <td><b>{o.customer_name ?? '—'}</b>{o.customer_email && <><br /><Link href={mailto(o.customer_email, `Your farm order ${confirmationNumber('farm', o.id)}`)}>{o.customer_email}</Link></>}{o.customer_phone && <><br /><span className="muted">{o.customer_phone}</span></>}</td>
        <td>{o.product}</td>
        <td>{formatPrice(o.amount)}</td>
        <td><form action={togglePickedUp}><input type="hidden" name="id" value={o.id} /><button type="submit" className={`admin-check ${o.picked_up ? 'is-on' : ''}`} aria-pressed={o.picked_up}>{o.picked_up ? 'Picked up ✓' : 'Mark picked up'}</button></form></td>
      </tr>)}</tbody>
    </table></div>}
  </section>
}

async function Apparel({ showAll }: { showAll: boolean }) {
  const { rows } = await pool.query(`SELECT * FROM apparel_orders WHERE payment_status = 'paid' ${showAll ? '' : 'AND NOT fulfilled'} ORDER BY created_at ASC LIMIT 300`)
  return <section className="admin-section">
    <Filter tab="apparel" showAll={showAll} open="To fulfill" />
    <p className="admin-hint">For each order: place the same items in Printify with this shipping address, then mark it fulfilled.</p>
    {rows.length === 0 ? <Empty>No paid apparel orders {showAll ? 'yet' : 'to fulfill'}.</Empty> : <div className="admin-table-wrap"><table className="admin-table">
      <thead><tr><th>Confirmation</th><th>Ordered</th><th>Customer</th><th>Items</th><th>Ship to</th><th>Total</th><th>Fulfilled</th></tr></thead>
      <tbody>{rows.map((o) => {
        const a = o.shipping_address ?? {}
        const number = confirmationNumber('apparel', o.id)
        return <tr key={o.id} className={o.fulfilled ? 'is-done' : ''}>
          <td className="mono">{number}</td>
          <td>{stamp(o.created_at)}</td>
          <td><b>{o.customer_name ?? '—'}</b>{o.customer_email && <><br /><Link href={mailto(o.customer_email, `Your order ${number} has shipped`)}>{o.customer_email}</Link></>}{o.customer_phone && <><br /><span className="muted">{o.customer_phone}</span></>}</td>
          <td>{o.items}</td>
          <td className="address">{[a.line1, a.line2, [a.city, a.state, a.postal_code].filter(Boolean).join(' ')].filter(Boolean).map((line: string) => <span key={line}>{line}</span>)}</td>
          <td>{formatPrice(o.amount)}</td>
          <td><form action={toggleFulfilled}><input type="hidden" name="id" value={o.id} /><button type="submit" className={`admin-check ${o.fulfilled ? 'is-on' : ''}`} aria-pressed={o.fulfilled}>{o.fulfilled ? 'Fulfilled ✓' : 'Mark fulfilled'}</button></form></td>
        </tr>
      })}</tbody>
    </table></div>}
  </section>
}

async function Inbox() {
  const { rows: messages } = await pool.query('SELECT * FROM contact_messages ORDER BY created_at DESC LIMIT 200')
  const { rows: replies } = await pool.query('SELECT * FROM sent_emails WHERE message_id IS NOT NULL ORDER BY created_at ASC')
  return <section className="admin-section">
    <p className="admin-hint">Messages from the contact page. Replies go out from your business email; when customers answer, it arrives in your regular inbox.</p>
    {messages.length === 0 ? <Empty>No messages yet.</Empty> : <div className="admin-messages">{messages.map((m) => {
      const thread = replies.filter((r) => r.message_id === m.id)
      return <details key={m.id} className={`admin-message ${m.is_read ? '' : 'is-unread'}`}>
        <summary><span className="admin-message-from"><b>{m.name}</b> <span className="muted">{m.email}</span></span><span className="admin-message-preview">{m.message}</span><span className="muted admin-message-when">{stamp(m.created_at)}</span></summary>
        <div className="admin-message-body">
          <p className="admin-message-text">{m.message}</p>
          {thread.map((r) => <div key={r.id} className="admin-reply"><p className="muted">You replied {stamp(r.created_at)}{r.delivered ? '' : ' · not sent'}</p><p className="admin-message-text">{r.body}</p></div>)}
          <form action={send} className="admin-compose">
            <input type="hidden" name="messageId" value={m.id} />
            <input type="hidden" name="to" value={m.email} />
            <label className="admin-field"><span>Subject</span><input id={`reply-subject-${m.id}`} name="subject" defaultValue="Re: Your message to As We Heal" required /></label>
            <label className="admin-field"><span>Reply to {m.name}</span><textarea id={`reply-body-${m.id}`} name="body" rows={6} defaultValue={`Hi ${m.name},\n\n\n\nWith care,\nBrittany\nAs We Heal`} required /></label>
            <div className="admin-actions"><button className="button button-dark" type="submit">Send reply</button></div>
          </form>
          <form action={toggleRead}><input type="hidden" name="id" value={m.id} /><button className="admin-link" type="submit">{m.is_read ? 'Mark as unread' : 'Mark as read'}</button></form>
        </div>
      </details>
    })}</div>}
  </section>
}

async function Compose({ to, subject }: { to?: string; subject?: string }) {
  const { rows: sent } = await pool.query('SELECT * FROM sent_emails ORDER BY created_at DESC LIMIT 30')
  return <section className="admin-section admin-compose-grid">
    <form action={send} className="admin-card admin-compose">
      <h2>New email</h2>
      <label className="admin-field"><span>To</span><input id="compose-to" name="to" type="email" defaultValue={to ?? ''} placeholder="customer@example.com" required /></label>
      <label className="admin-field"><span>Subject</span><input id="compose-subject" name="subject" defaultValue={subject ?? ''} required /></label>
      <label className="admin-field"><span>Message</span><textarea id="compose-body" name="body" rows={10} defaultValue={'Hi,\n\n\n\nWith care,\nBrittany\nAs We Heal'} required /></label>
      <div className="admin-actions"><button className="button button-dark" type="submit">Send email</button></div>
    </form>
    <div className="admin-card">
      <h2>Sent</h2>
      {sent.length === 0 ? <Empty>Nothing sent yet.</Empty> : <ul className="admin-sent">{sent.map((e) => <li key={e.id}><b>{e.subject}</b><span className="muted">To {e.to_email} · {stamp(e.created_at)}{e.delivered ? '' : ' · not sent'}</span></li>)}</ul>}
    </div>
  </section>
}
