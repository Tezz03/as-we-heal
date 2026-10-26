import Stripe from 'stripe'

let client: Stripe | undefined

export const getStripe = () => (client ??= new Stripe(process.env.STRIPE_SECRET_KEY!))
