import express from 'express'
import { authenticateJWT, ensureAdmin } from '../middleware.js'
import * as db from '../db.js'

const router = express.Router()

// GET /api/billing/config - public pricing config (reads CMS fallback)
router.get('/config', async (req, res) => {
  try {
    const cms = db.getCMSContent()
    const billing = cms && cms.billing ? cms.billing : {}
    const price = process.env.STRIPE_PRICE_ID_MONTHLY || process.env.STRIPE_PRICE_ID || billing.priceIdMonthly || null
    return res.json({ ok: true, price })
  } catch (e: any) { res.status(500).json({ error: e?.message || String(e) }) }
})

// Admin: create product + price in Stripe and store in CMS (for dev convenience)
router.post('/create-product', authenticateJWT, async (req: any, res) => {
  try {
    // ensure admin
    if (!ensureAdmin(req, res)) return
    if (!process.env.STRIPE_SECRET_KEY) return res.status(500).json({ error: 'Stripe secret key not configured' })
    const Stripe = (await import('stripe')).default
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, { apiVersion: '2022-11-15' })
    const body = req.body || {}
    const name = body.name || 'RoadToUc Premium'
    const priceAmount = body.amount || 2000 // in cents

    // create product
    const product = await stripe.products.create({ name })
    const price = await stripe.prices.create({ unit_amount: priceAmount, currency: 'usd', recurring: { interval: 'month' }, product: product.id })

    // save to CMS for fallback
    const cms = db.getCMSContent() || {}
    cms.billing = cms.billing || {}
    cms.billing.productId = product.id
    cms.billing.priceIdMonthly = price.id
    db.setCMSContent(cms)

    return res.json({ ok: true, product: { id: product.id, name: product.name }, price: { id: price.id, amount: price.unit_amount } })
  } catch (e: any) { res.status(500).json({ error: e?.message || String(e) }) }
})

// Create a Stripe Checkout session for subscription
router.post('/create-checkout-session', authenticateJWT, async (req: any, res) => {
  try {
    const user = req.user
    if (!user || !user.id) return res.status(401).json({ error: 'Not authenticated' })

    // fallback to CMS-stored price id if env not set
    let priceId = process.env.STRIPE_PRICE_ID_MONTHLY || process.env.STRIPE_PRICE_ID
    if (!priceId) {
      const cms = db.getCMSContent()
      priceId = cms && cms.billing && cms.billing.priceIdMonthly ? cms.billing.priceIdMonthly : null
    }

    if (!process.env.STRIPE_SECRET_KEY || !priceId) {
      return res.status(500).json({ error: 'Billing not configured' })
    }

    const successUrl = req.body?.successUrl || `${req.protocol}://${req.get('host')}/billing/success`
    const cancelUrl = req.body?.cancelUrl || `${req.protocol}://${req.get('host')}/billing/cancel`

    const Stripe = (await import('stripe')).default
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, { apiVersion: '2022-11-15' })

    // reuse existing customer if present
    const existing = db.getUserById(user.id)
    const customer = existing?.stripeCustomerId

    const params: any = {
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: { userId: user.id }
    }
    if (customer) params.customer = customer

    const session = await stripe.checkout.sessions.create(params)

    // if Stripe returned a customer id, store it
    if (session.customer && user.id) {
      try { db.setUserStripeCustomer(user.id, String(session.customer)) } catch (e) {}
    }

    return res.json({ url: session.url, id: session.id })
  } catch (e: any) {
    console.error('create-checkout-session error', e && e.message ? e.message : e)
    return res.status(500).json({ error: String(e && e.message ? e.message : e) })
  }
})

// Webhook endpoint (must use raw body)
router.post('/webhook', async (req: any, res) => {
  const sig = req.headers['stripe-signature'] as string | undefined
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      console.warn('stripe secret missing; ignoring webhook')
      return res.status(400).send('missing stripe config')
    }
    const Stripe = (await import('stripe')).default
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, { apiVersion: '2022-11-15' })

    let event: any
    const raw = (req as any).rawBody || req.body
    if (webhookSecret && sig) {
      event = stripe.webhooks.constructEvent(raw, sig, webhookSecret)
    } else {
      // without signature verification, attempt to parse provided body
      try { event = typeof raw === 'string' ? JSON.parse(raw) : raw } catch (e) { event = raw }
    }

    const type = event.type
    const obj = event.data?.object || event

    // log raw event
    try {
      const logDir = require('path').join(process.cwd(), 'logs')
      if (!require('fs').existsSync(logDir)) require('fs').mkdirSync(logDir, { recursive: true })
      require('fs').appendFileSync(require('path').join(logDir, 'webhooks.log'), JSON.stringify({ ts: new Date().toISOString(), type, obj: obj }, null, 2) + '\n', 'utf-8')
    } catch (e) { /* ignore logging errors */ }

    // Handle relevant events
    if (type === 'checkout.session.completed') {
      const session = obj as any
      const userId = session.metadata?.userId
      if (userId) {
        if (session.customer) db.setUserStripeCustomer(userId, String(session.customer))
        if (session.subscription) db.setUserSubscription(userId, String(session.subscription), 'active')
        db.setUserPremium(userId, true)
      }
    } else if (type === 'invoice.payment_failed') {
      const invoice = obj as any
      const subId = invoice.subscription
      // find user by subscription id
      const users = db.getAllUsers()
      const u = users.find((x: any) => x.stripeSubscriptionId === subId)
      if (u) db.setUserSubscription(u.id, subId, 'past_due')
    } else if (type === 'customer.subscription.updated' || type === 'customer.subscription.created') {
      const sub = obj as any
      const subId = sub.id
      const status = sub.status
      const customer = sub.customer
      const users = db.getAllUsers()
      const u = users.find((x: any) => String(x.stripeCustomerId) === String(customer) || String(x.stripeSubscriptionId) === String(subId))
      if (u) {
        db.setUserSubscription(u.id, subId, status)
        db.setUserPremium(u.id, status === 'active' || status === 'trialing')
      }
    } else if (type === 'customer.subscription.deleted') {
      const sub = obj as any
      const subId = sub.id
      const users = db.getAllUsers()
      const u = users.find((x: any) => x.stripeSubscriptionId === subId)
      if (u) {
        db.setUserSubscription(u.id, subId, 'canceled')
        db.setUserPremium(u.id, false)
      }
    }

    return res.json({ received: true })
  } catch (err: any) {
    console.error('Webhook handler error', err && err.message ? err.message : err)
    return res.status(400).send(`Webhook error: ${err && err.message ? err.message : String(err)}`)
  }
})

// Simple endpoint to return billing status for current user
router.get('/status', authenticateJWT, async (req: any, res) => {
  const user = req.user
  if (!user || !user.id) return res.status(401).json({ error: 'Not authenticated' })
  const dbu = db.getUserById(user.id)
  if (!dbu) return res.status(404).json({ error: 'User not found' })
  return res.json({ premium: !!dbu.premium, subscriptionStatus: dbu.subscriptionStatus || null, stripeCustomerId: dbu.stripeCustomerId || null })
})

export default router
