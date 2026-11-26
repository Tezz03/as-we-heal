'use client'

import { useEffect, useState } from 'react'
import { audiences, formatDuration, formatPrice, sessionsFor, type Audience } from '@/lib/sessions'

function Field({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) { return <label className="field"><span>{label}</span><input {...props} /></label> }

/** Hidden honeypot plus a form-start timestamp; the server rejects submissions that fill the trap or arrive too fast. */
export function SpamTrap() {
  const [startedAt, setStartedAt] = useState('')
  useEffect(() => setStartedAt(String(Date.now())), [])
  return <div className="spam-trap" aria-hidden="true">
    <label>Leave this empty <input type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" /></label>
    <input type="hidden" name="startedAt" value={startedAt} readOnly />
  </div>
}

export function AppointmentForm({ paid = false, reference, audience, onAudienceChange }: { paid?: boolean; reference?: string; audience: Audience; onAudienceChange: (audience: Audience) => void }) {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle')
  const [confirmation, setConfirmation] = useState('')
  const [error, setError] = useState('')
  const [payment, setPayment] = useState<'online' | 'office'>('office')

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('sending')
    setError('')
    const response = await fetch('/api/appointments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...Object.fromEntries(new FormData(e.currentTarget)), payment }) }).catch(() => null)
    const data = await response?.json().catch(() => null)
    if (data?.url) return void (window.location.href = data.url)
    if (data?.ok) { setConfirmation(data.confirmation ?? ''); return setStatus('sent') }
    setStatus('idle')
    setError(data?.error || 'We couldn’t save your request. Please try again.')
  }

  if (paid) return <div className="form-card"><div className="success"><p className="eyebrow">Payment received</p><h3>You’re all set. We’ll confirm your time by email.</h3>{reference && <ConfirmationNumber value={reference} />}</div></div>
  if (status === 'sent') return <div className="form-card"><div className="success"><p className="eyebrow">You’re on the calendar</p><h3>Thank you. We’ll be in touch shortly.</h3>{confirmation && <ConfirmationNumber value={confirmation} />}<p>Payment is due at your visit. We emailed you a copy.</p></div></div>

  return <form className="form-card" onSubmit={submit}>
    <h3>Request an appointment</h3>
    <div className="audience-toggle" role="radiogroup" aria-label="Booking type">{audiences.map((a) => <button key={a.id} type="button" role="radio" aria-checked={audience === a.id} className={audience === a.id ? 'is-active' : ''} onClick={() => onAudienceChange(a.id)}>{a.label}</button>)}</div>
    <Field label="Name" name="name" placeholder="Your name" required />
    <Field label="Email" name="email" type="email" placeholder="you@example.com" required />
    {audience === 'business' && <>
      <Field label="Company" name="company" placeholder="Your company or organization" required />
      <Field label="Where should we set up?" name="location" placeholder="Street address, city" required />
    </>}
    <div className="form-row">
      <label className="field"><span>Session</span><select name="sessionId" key={audience}>{sessionsFor(audience).map((s) => <option key={s.id} value={s.id}>{s.name} · {formatPrice(s.price)} · {formatDuration(s.minutes)}</option>)}</select></label>
      <Field label="Preferred date" name="preferredDate" type="date" min={new Date().toISOString().slice(0, 10)} required />
    </div>
    <fieldset className="payment-options">
      <legend>How would you like to pay?</legend>
      <label className={payment === 'online' ? 'is-active' : ''}><input type="radio" name="payment" value="online" checked={payment === 'online'} onChange={() => setPayment('online')} /><span><b>Pay now</b>Secure card payment with Stripe</span></label>
      <label className={payment === 'office' ? 'is-active' : ''}><input type="radio" name="payment" value="office" checked={payment === 'office'} onChange={() => setPayment('office')} /><span><b>Pay at the office</b>Settle up at your visit</span></label>
    </fieldset>
    <SpamTrap />
    {error && <p className="form-error" role="alert">{error}</p>}
    <button className="button button-dark" type="submit" disabled={status === 'sending'}>{status === 'sending' ? 'Sending…' : payment === 'online' ? 'Continue to payment' : 'Request appointment'} <span>→</span></button>
    <small>{payment === 'online' ? 'You’ll be taken to Stripe’s secure checkout.' : 'No payment is due until your visit.'}</small>
  </form>
}

export function ConfirmationNumber({ value }: { value: string }) {
  return <p className="confirmation">Confirmation number <strong>{value}</strong></p>
}

export function ContactForm() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle')
  const [error, setError] = useState('')

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('sending')
    setError('')
    const data = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.fromEntries(new FormData(e.currentTarget))) }).then((r) => r.json()).catch(() => null)
    if (data?.ok) return setStatus('sent')
    setStatus('idle')
    setError(data?.error || 'We couldn’t send your message. Please try again.')
  }

  if (status === 'sent') return <div className="form-card contact-form"><div className="success"><p className="eyebrow">Message received</p><h3>We’ll write back soon.</h3><p>We emailed you a copy of your message.</p></div></div>

  return <form className="form-card contact-form" onSubmit={submit}>
    <Field label="Your name" id="contact-name" name="name" placeholder="Your name" autoComplete="name" required />
    <Field label="Email address" id="contact-email" name="email" type="email" placeholder="you@example.com" autoComplete="email" required />
    <label className="field"><span>How can we help?</span><textarea id="contact-message" name="message" rows={5} placeholder="Tell us a little more..." maxLength={5000} required /></label>
    <SpamTrap />
    {error && <p className="form-error" role="alert">{error}</p>}
    <button className="button button-dark" type="submit" disabled={status === 'sending'}>{status === 'sending' ? 'Sending…' : 'Send message'} <span>→</span></button>
  </form>
}
