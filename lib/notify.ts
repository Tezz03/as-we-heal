import 'server-only'
import { confirmationNumber } from '@/lib/confirmation'
import { ownerEmail, sendEmail } from '@/lib/email'
import { formatPickupDay } from '@/lib/farm'
import { formatPrice } from '@/lib/sessions'

const siteUrl = () => process.env.SITE_URL || ''
const date = (value: string | Date) => new Date(value).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', timeZone: 'UTC' })
const isoDay = (value: string | Date) => new Date(value).toISOString().slice(0, 10)

type Booking = { id: number; name: string; email: string; session: string; preferred_date: string | Date; amount: number | null; payment_method: string; payment_status: string; audience: string; company: string | null; location: string | null }
type FarmOrder = { id: number; product: string; amount: number; pickup_date: string | Date | null; customer_name: string | null; customer_email: string | null; customer_phone: string | null }
type ApparelOrder = { id: number; items: string; amount: number; customer_name: string | null; customer_email: string | null; customer_phone: string | null; shipping_address: Record<string, string | null> | null }
type Message = { id: number; name: string; email: string; message: string }

export async function notifyBooking(b: Booking) {
  const number = confirmationNumber('booking', b.id)
  const paid = b.payment_status === 'paid'
  const business = b.audience === 'business'
  await sendEmail({
    to: b.email,
    subject: `Your As We Heal request ${number}`,
    text: [
      `Hi ${b.name},`,
      `Thank you for booking with As We Heal. Your confirmation number is ${number}.`,
      [`Session: ${b.session}`, `Preferred date: ${date(b.preferred_date)}`, business ? `Company: ${b.company}\nLocation: ${b.location}` : '', `Total: ${formatPrice(b.amount ?? 0)} (${paid ? 'paid online' : 'due at your visit'})`].filter(Boolean).join('\n'),
      'We will email you shortly to confirm your exact time. Reply to this email with any questions.',
      'With care,\nAs We Heal',
    ].join('\n\n'),
  })
  await sendEmail({
    to: ownerEmail(),
    replyTo: b.email,
    subject: `New ${business ? 'business ' : ''}booking ${number}: ${b.session}`,
    text: [`${b.name} <${b.email}>`, business ? `${b.company} · ${b.location}` : '', `${b.session} on ${date(b.preferred_date)}`, `${formatPrice(b.amount ?? 0)} · ${paid ? 'Paid online' : 'Pay at the office'}`, siteUrl() ? `${siteUrl()}/brittany?tab=bookings` : ''].filter(Boolean).join('\n'),
  })
}

export async function notifyFarmOrder(o: FarmOrder) {
  const number = confirmationNumber('farm', o.id)
  const pickup = o.pickup_date ? formatPickupDay(isoDay(o.pickup_date)) : 'your chosen day'
  if (o.customer_email) await sendEmail({
    to: o.customer_email,
    subject: `Your farm order ${number}`,
    text: [`Hi ${o.customer_name || 'there'},`, `Thank you for your order! Your confirmation number is ${number}.`, `${o.product}\nTotal paid: ${formatPrice(o.amount)}`, `Pickup: ${pickup}, 9:00 am–6:00 pm in New Castle. Bring your confirmation number.`, 'With care,\nAs We Heal Farm Market'].join('\n\n'),
  })
  await sendEmail({
    to: ownerEmail(),
    replyTo: o.customer_email ?? undefined,
    subject: `New farm order ${number} for ${pickup}`,
    text: [`${o.customer_name} <${o.customer_email}> ${o.customer_phone ?? ''}`, o.product, `${formatPrice(o.amount)} paid`, `Pickup ${pickup}`, siteUrl() ? `${siteUrl()}/brittany?tab=farm` : ''].filter(Boolean).join('\n'),
  })
}

export async function notifyApparelOrder(o: ApparelOrder) {
  const number = confirmationNumber('apparel', o.id)
  const a = o.shipping_address
  const address = a ? [a.line1, a.line2, `${a.city ?? ''}, ${a.state ?? ''} ${a.postal_code ?? ''}`].filter(Boolean).join('\n') : ''
  if (o.customer_email) await sendEmail({
    to: o.customer_email,
    subject: `Your apparel order ${number}`,
    text: [`Hi ${o.customer_name || 'there'},`, `Thank you for your order! Your confirmation number is ${number}.`, `${o.items}\nTotal paid: ${formatPrice(o.amount)}`, address ? `Shipping to:\n${o.customer_name ?? ''}\n${address}` : '', 'Every piece is printed to order. We will email you when it ships.', 'With care,\nAs We Heal Apparel'].filter(Boolean).join('\n\n'),
  })
  await sendEmail({
    to: ownerEmail(),
    replyTo: o.customer_email ?? undefined,
    subject: `New apparel order ${number}: place it in Printify`,
    text: [`${o.customer_name} <${o.customer_email}> ${o.customer_phone ?? ''}`, o.items, `${formatPrice(o.amount)} paid`, address ? `Ship to:\n${address}` : '', siteUrl() ? `${siteUrl()}/brittany?tab=apparel` : ''].filter(Boolean).join('\n\n'),
  })
}

export async function notifyMessage(m: Message) {
  await sendEmail({
    to: ownerEmail(),
    replyTo: m.email,
    subject: `New message from ${m.name}`,
    text: [`${m.name} <${m.email}>`, m.message, siteUrl() ? `Reply from ${siteUrl()}/brittany?tab=inbox, or just reply to this email.` : 'Reply to this email to answer them.'].join('\n\n'),
  })
  await sendEmail({
    to: m.email,
    subject: 'We got your message',
    text: [`Hi ${m.name},`, 'Thank you for reaching out to As We Heal. We read every message and will write back soon.', `Your message:\n${m.message}`, 'With care,\nAs We Heal'].join('\n\n'),
  })
}
