import 'server-only'

const escapeHtml = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)

export const emailConfigured = () => Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM)

/** Where notifications about new bookings, orders and messages go. */
export const ownerEmail = () => process.env.NOTIFY_EMAIL || process.env.EMAIL_FROM?.match(/<([^>]+)>/)?.[1] || process.env.EMAIL_FROM || ''

type Email = { to: string; subject: string; text: string; replyTo?: string }

/** Sends through Resend. Returns false (never throws) when email isn't set up or the send fails, so orders still go through. */
export async function sendEmail({ to, subject, text, replyTo }: Email) {
  if (!emailConfigured() || !to) return false
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: process.env.EMAIL_FROM, to: [to], subject, text, html: layout(text), reply_to: replyTo ?? ownerEmail() }),
    })
    if (!response.ok) console.error('Email failed', response.status, await response.text().catch(() => ''))
    return response.ok
  } catch (error) {
    console.error('Email failed', error)
    return false
  }
}

function layout(text: string) {
  const body = escapeHtml(text).split(/\n{2,}/).map((p) => `<p style="margin:0 0 16px">${p.replace(/\n/g, '<br>')}</p>`).join('')
  return `<div style="background:#f7f6f1;padding:32px 16px;font-family:Helvetica,Arial,sans-serif;color:#24312c;font-size:15px;line-height:1.6"><div style="max-width:560px;margin:0 auto;background:#fffefa;border-radius:14px;padding:28px"><p style="margin:0 0 20px;font-weight:700;letter-spacing:.02em">As We Heal</p>${body}</div></div>`
}
