export type OrderKind = 'booking' | 'farm' | 'apparel'

const PREFIX: Record<OrderKind, string> = { booking: 'M', farm: 'F', apparel: 'A' }

/** Customer-facing confirmation number, e.g. AWH-M00042 for booking #42. */
export const confirmationNumber = (kind: OrderKind, id: number) => `AWH-${PREFIX[kind]}${String(id).padStart(5, '0')}`
