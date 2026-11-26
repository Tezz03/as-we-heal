'use client'

import { useCallback, useEffect, useState, type ReactNode } from 'react'

/** Facebook-style page header shared by the farm market and the clothing shop. */
export function ProfileHeader({ cover, coverAlt, initials, name, subtitle, meta, actions }: { cover: string; coverAlt: string; initials: string; name: string; subtitle: string; meta: string; actions: ReactNode }) {
  return <header className="fp-header">
    <div className="fp-cover"><img src={cover} alt={coverAlt} /></div>
    <div className="fp-identity">
      <div className="fp-avatar" aria-hidden="true">{initials}</div>
      <div className="fp-name"><h1>{name}</h1><p>{subtitle}</p><p className="fp-meta">{meta}</p></div>
      <div className="fp-actions">{actions}</div>
    </div>
  </header>
}

export function ProfileTabs<T extends string>({ tabs, active, onChange, label }: { tabs: readonly { id: T; label: string }[]; active: T; onChange: (id: T) => void; label: string }) {
  return <nav className="fp-tabs" id="profile-tabs" aria-label={label}>
    <div className="fp-tabs-inner" role="tablist">{tabs.map(({ id, label }) => <button key={id} type="button" role="tab" aria-selected={active === id} className={active === id ? 'is-active' : ''} onClick={() => onChange(id)}>{label}</button>)}</div>
  </nav>
}

/** Tab state mirrored in the URL hash (e.g. /farm#updates) so tabs can be linked to. `aliases` map other hashes to a tab. */
export function useHashTab<T extends string>(path: string, tabs: readonly { id: T }[], aliases: Record<string, T> = {}) {
  const [tab, setTab] = useState<T>(tabs[0].id)

  useEffect(() => {
    const sync = () => {
      const hash = window.location.hash.slice(1)
      const match = aliases[hash] ?? tabs.find((t) => t.id === hash)?.id
      if (match) setTab(match)
    }
    sync()
    window.addEventListener('hashchange', sync)
    return () => window.removeEventListener('hashchange', sync)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const open = useCallback((next: T, scroll = true) => {
    setTab(next)
    history.replaceState(null, '', next === tabs[0].id ? path : `${path}#${next}`)
    if (scroll) document.getElementById('profile-tabs')?.scrollIntoView({ behavior: 'smooth' })
  }, [path, tabs])

  const reveal = useCallback((first: T, elementId: string) => {
    setTab(first)
    requestAnimationFrame(() => document.getElementById(elementId)?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
  }, [])

  return { tab, open, reveal }
}
