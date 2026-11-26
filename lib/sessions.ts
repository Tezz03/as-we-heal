export type Audience = 'personal' | 'business'

export const audiences: { id: Audience; label: string; blurb: string }[] = [
  { id: 'personal', label: 'Personal', blurb: 'One-on-one sessions in our New Castle space.' },
  { id: 'business', label: 'Business', blurb: 'On-site massage for your team, office, or event.' },
]

// TODO: confirm business pricing — these are starting placeholders.
export const massageSessions = [
  { id: 'restorative', audience: 'personal', name: 'Restorative massage', minutes: 60, price: 9500 },
  { id: 'deep-release', audience: 'personal', name: 'Deep release', minutes: 90, price: 12500 },
  { id: 'foot-scalp', audience: 'personal', name: 'Foot & scalp ritual', minutes: 45, price: 6500 },
  { id: 'chair-hour', audience: 'business', name: 'On-site chair massage', minutes: 60, price: 15000, note: 'Up to 4 guests' },
  { id: 'team-half-day', audience: 'business', name: 'Team wellness half-day', minutes: 240, price: 48000, note: 'Up to 16 guests' },
  { id: 'corporate-day', audience: 'business', name: 'Corporate event day', minutes: 480, price: 90000, note: 'Up to 32 guests' },
] as const satisfies readonly { id: string; audience: Audience; name: string; minutes: number; price: number; note?: string }[]

export type MassageSession = (typeof massageSessions)[number]

export const findSession = (id: string) => massageSessions.find((session) => session.id === id)
export const sessionsFor = (audience: Audience) => massageSessions.filter((session) => session.audience === audience)

export const formatPrice = (cents: number) => `$${(cents / 100).toFixed(cents % 100 ? 2 : 0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`
export const formatDuration = (minutes: number) => (minutes >= 120 && minutes % 60 === 0 ? `${minutes / 60} hours` : `${minutes} min`)
