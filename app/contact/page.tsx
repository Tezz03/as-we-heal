import { SiteShell, SectionIntro } from '@/components/site-shell'
import { ContactForm } from '@/components/forms'

export default function ContactPage() { return <SiteShell><main className="shell contact-page"><SectionIntro eyebrow="Get in touch" title="Let’s start where you are." text="Questions about a session, a farm order, or bringing As We Heal to your community? We would love to hear from you." /><div className="contact-grid"><div className="contact-details"><div><p className="eyebrow">Visit</p><p>New Castle, Delaware<br/>By appointment and pickup</p></div><div><p className="eyebrow">Write</p><p>hello@asweheal.co</p></div><div><p className="eyebrow">Hours</p><p>Tuesday–Saturday<br/>9:00 am–6:00 pm</p></div></div><ContactForm /></div></main></SiteShell> }
