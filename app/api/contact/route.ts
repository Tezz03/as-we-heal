import { NextResponse } from 'next/server'
import { ensureTables, pool } from '@/lib/db'
import { notifyMessage } from '@/lib/notify'
import { clientIp, spamCheck } from '@/lib/spam'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const name = String(body.name ?? '').trim().slice(0, 200)
    const email = String(body.email ?? '').trim().slice(0, 200)
    const message = String(body.message ?? '').trim().slice(0, 5000)
    if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || message.length < 2) return NextResponse.json({ error: 'Please add your name, a valid email, and a message.' }, { status: 400 })

    await ensureTables()
    const ip = clientIp(request)
    const spam = await spamCheck(body, ip, 'contact_messages', 3)
    if (spam === 'bot') return NextResponse.json({ ok: true })
    if (spam === 'rate') return NextResponse.json({ error: 'You’ve sent a few messages already. Please wait a few minutes and try again.' }, { status: 429 })

    const { rows } = await pool.query('INSERT INTO contact_messages (name, email, message, ip) VALUES ($1, $2, $3, $4) RETURNING *', [name, email, message, ip])
    await notifyMessage(rows[0])
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'We couldn’t send your message. Please try again.' }, { status: 500 })
  }
}
