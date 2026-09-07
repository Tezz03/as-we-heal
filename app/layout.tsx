import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { DM_Sans, Fraunces } from 'next/font/google'
import './globals.css'

const body = DM_Sans({ subsets: ['latin'], variable: '--font-body' })
const display = Fraunces({ subsets: ['latin'], variable: '--font-display' })

export const metadata: Metadata = { title: 'As We Heal | Whole-person care in New Castle', description: 'Massage, nourishing food, and everyday wellness for coming back to yourself.', generator: 'v0.app' }
export const viewport: Viewport = { colorScheme: 'light', themeColor: '#f7f6f1', width: 'device-width', initialScale: 1 }

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en" className="bg-background"><body className={`${body.variable} ${display.variable}`}>{children}{process.env.NODE_ENV === 'production' && <Analytics />}</body></html> }
