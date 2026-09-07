import { NextResponse } from 'next/server'
import { ensureTables, pool } from '@/lib/db'

export async function POST(request: Request) { try { const body = await request.json(); if (!body.name || !body.email || !body.session || !body.preferredDate) return NextResponse.json({ error: 'Missing appointment details' }, { status: 400 }); await ensureTables(); await pool.query('INSERT INTO appointments (name, email, session, preferred_date) VALUES ($1, $2, $3, $4)', [body.name, body.email, body.session, body.preferredDate]); return NextResponse.json({ ok: true }) } catch { return NextResponse.json({ error: 'Unable to save appointment' }, { status: 500 }) } }
