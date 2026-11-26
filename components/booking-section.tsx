'use client'

import { useState } from 'react'
import { audiences, formatDuration, formatPrice, sessionsFor, type Audience } from '@/lib/sessions'
import { AppointmentForm } from '@/components/forms'

export function BookingSection({ paid, reference }: { paid: boolean; reference?: string }) {
  const [audience, setAudience] = useState<Audience>('personal')

  function choose(next: Audience) {
    setAudience(next)
    document.getElementById('booking-form')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  return <section className="booking-section" id="book">
    <div className="shell booking-grid">
      <div>
        <p className="eyebrow">Make room for yourself</p>
        <h2>Book your reset.</h2>
        <p>Choose a session and a time that feels right, then pay securely now or at your visit. We will confirm your appointment by email.</p>
        <div className="price-groups">{audiences.map((group) => <section key={group.id} className={`price-group ${audience === group.id ? 'is-active' : ''}`} aria-labelledby={`prices-${group.id}`}>
          <div className="price-group-head"><h3 id={`prices-${group.id}`}>{group.label} prices</h3><p>{group.blurb}</p></div>
          <div className="service-list">{sessionsFor(group.id).map((s) => <span key={s.id}><div>{s.name}{'note' in s && <small>{s.note}</small>}</div><b>{formatPrice(s.price)} · {formatDuration(s.minutes)}</b></span>)}</div>
          <button type="button" className="text-link" onClick={() => choose(group.id)}>{group.id === 'business' ? 'Book for your business' : 'Book a personal session'} →</button>
        </section>)}</div>
      </div>
      <div id="booking-form"><AppointmentForm paid={paid} reference={reference} audience={audience} onAudienceChange={setAudience} /></div>
    </div>
  </section>
}
