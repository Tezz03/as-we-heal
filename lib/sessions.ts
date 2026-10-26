export const massageSessions = [
  { id: 'restorative', name: 'Restorative massage', minutes: 60, price: 9500 },
  { id: 'deep-release', name: 'Deep release', minutes: 90, price: 12500 },
  { id: 'foot-scalp', name: 'Foot & scalp ritual', minutes: 45, price: 6500 },
] as const

export type MassageSession = (typeof massageSessions)[number]

export const findSession = (id: string) => massageSessions.find((session) => session.id === id)

export const formatPrice = (cents: number) => `$${(cents / 100).toFixed(cents % 100 ? 2 : 0)}`
