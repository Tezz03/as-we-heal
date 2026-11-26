import 'server-only'
import { pool } from '@/lib/db'

export type SpamFields = { website?: unknown; startedAt?: unknown }

export const clientIp = (request: Request) => request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown'

/**
 * Cheap bot checks for public forms:
 * - `website` is a hidden honeypot field people never see, so any value means a bot.
 * - `startedAt` is when the form appeared; real people take more than a couple of seconds.
 * - At most `limit` submissions per IP to `table` in 10 minutes.
 * Returns 'bot' (pretend success), 'rate' (ask them to wait), or null.
 */
export async function spamCheck(fields: SpamFields, ip: string, table: 'contact_messages' | 'appointments', limit = 5): Promise<'bot' | 'rate' | null> {
  if (typeof fields.website === 'string' && fields.website.trim()) return 'bot'
  const started = Number(fields.startedAt)
  if (!started || Date.now() - started < 2500 || Date.now() - started > 1000 * 60 * 60 * 24) return 'bot'
  const { rows } = await pool.query(`SELECT COUNT(*)::int AS n FROM ${table} WHERE ip = $1 AND created_at > NOW() - INTERVAL '10 minutes'`, [ip])
  return rows[0].n >= limit ? 'rate' : null
}
