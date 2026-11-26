import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { DM_Sans, Fraunces } from 'next/font/google'
import './globals.css'

const body = DM_Sans({ subsets: ['latin'], variable: '--font-body' })
const display = Fraunces({ subsets: ['latin'], variable: '--font-display' })

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL || 'http://localhost:3000'),
  title: { default: 'As We Heal | Massage, Farm Market & Apparel in New Castle, DE', template: '%s | As We Heal' },
  description: 'Restorative massage, a seasonal farm market, and apparel in New Castle, Delaware. Book a session, order for pickup, or shop online.',
  openGraph: { siteName: 'As We Heal', type: 'website', locale: 'en_US' },
}
export const viewport: Viewport = { colorScheme: 'light', themeColor: '#f7f6f1', width: 'device-width', initialScale: 1 }

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en" className="bg-background"><body className={`${body.variable} ${display.variable}`}>{children}{process.env.NODE_ENV === 'production' && <Analytics />}</body></html> }
