'use client'

import { useState } from 'react'
import { massageSessions, formatPrice } from '@/lib/sessions'

function Field({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) { return <label className="field"><span>{label}</span><input {...props} /></label> }

export function AppointmentForm({ paid = false }: { paid?: boolean }) {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle')
  const [error, setError] = useState('')
  const [payment, setPayment] = useState<'online' | 'office'>('office')

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('sending')
    setError('')
    const response = await fetch('/api/appointments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...Object.fromEntries(new FormData(e.currentTarget)), payment }) }).catch(() => null)
    const data = await response?.json().catch(() => null)
    if (data?.url) return void (window.location.href = data.url)
    if (data?.ok) return setStatus('sent')
    setStatus('idle')
    setError(data?.error || 'We couldn’t save your request. Please try again.')
  }

  if (paid) return <div className="form-card"><div className="success"><p className="eyebrow">Payment received</p><h3>You’re all set. We’ll confirm your time by email.</h3></div></div>
  if (status === 'sent') return <div className="form-card"><div className="success"><p className="eyebrow">You’re on the calendar</p><h3>Thank you. We’ll be in touch shortly.</h3><p>Payment is due at your visit.</p></div></div>

  return <form className="form-card" onSubmit={submit}>
    <h3>Request an appointment</h3>
    <Field label="Name" name="name" placeholder="Your name" required />
    <Field label="Email" name="email" type="email" placeholder="you@example.com" required />
    <div className="form-row">
      <label className="field"><span>Session</span><select name="sessionId">{massageSessions.map((s) => <option key={s.id} value={s.id}>{s.name} · {formatPrice(s.price)}</option>)}</select></label>
      <Field label="Preferred date" name="preferredDate" type="date" min={new Date().toISOString().slice(0, 10)} required />
    </div>
    <fieldset className="payment-options">
      <legend>How would you like to pay?</legend>
      <label className={payment === 'online' ? 'is-active' : ''}><input type="radio" name="payment" value="online" checked={payment === 'online'} onChange={() => setPayment('online')} /><span><b>Pay now</b>Secure card payment with Stripe</span></label>
      <label className={payment === 'office' ? 'is-active' : ''}><input type="radio" name="payment" value="office" checked={payment === 'office'} onChange={() => setPayment('office')} /><span><b>Pay at the office</b>Settle up at your visit</span></label>
    </fieldset>
    {error && <p className="form-error" role="alert">{error}</p>}
    <button className="button button-dark" type="submit" disabled={status === 'sending'}>{status === 'sending' ? 'Sending…' : payment === 'online' ? 'Continue to payment' : 'Request appointment'} <span>→</span></button>
    <small>{payment === 'online' ? 'You’ll be taken to Stripe’s secure checkout.' : 'No payment is due until your visit.'}</small>
  </form>
}

export function ContactForm() { const [sent, setSent] = useState(false); return <form className="form-card contact-form" onSubmit={(e) => { e.preventDefault(); setSent(true) }}>{sent ? <div className="success"><p className="eyebrow">Message received</p><h3>We’ll write back soon.</h3></div> : <><Field label="Your name" placeholder="Your name" required /><Field label="Email address" type="email" placeholder="you@example.com" required /><label className="field"><span>How can we help?</span><textarea rows={5} placeholder="Tell us a little more..." required /></label><button className="button button-dark" type="submit">Send message <span>→</span></button></>}</form> }
