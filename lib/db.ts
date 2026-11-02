import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'

export const pool = new Pool({ connectionString: process.env.DATABASE_URL })
export const db = drizzle(pool)

export async function ensureTables() {
  await pool.query(`CREATE TABLE IF NOT EXISTS appointments (id SERIAL PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL, session TEXT NOT NULL, preferred_date DATE NOT NULL, created_at TIMESTAMPTZ DEFAULT NOW())`)
  await pool.query(`ALTER TABLE appointments ADD COLUMN IF NOT EXISTS amount INTEGER, ADD COLUMN IF NOT EXISTS payment_method TEXT NOT NULL DEFAULT 'office', ADD COLUMN IF NOT EXISTS payment_status TEXT NOT NULL DEFAULT 'unpaid', ADD COLUMN IF NOT EXISTS stripe_session_id TEXT`)
  await pool.query(`CREATE TABLE IF NOT EXISTS farm_orders (id SERIAL PRIMARY KEY, product TEXT NOT NULL, amount INTEGER NOT NULL, stripe_session_id TEXT, created_at TIMESTAMPTZ DEFAULT NOW())`)
  await pool.query(`ALTER TABLE farm_orders ADD COLUMN IF NOT EXISTS payment_status TEXT NOT NULL DEFAULT 'pending', ADD COLUMN IF NOT EXISTS pickup_date DATE, ADD COLUMN IF NOT EXISTS customer_name TEXT, ADD COLUMN IF NOT EXISTS customer_email TEXT, ADD COLUMN IF NOT EXISTS customer_phone TEXT`)
}
