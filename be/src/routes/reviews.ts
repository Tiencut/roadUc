import express from 'express'
import { authenticateJWT, ensureAdmin } from '../middleware.js'
import * as db from '../db.js'

const router = express.Router()

// POST /api/reviews - submit a document for review (authenticated)
router.post('/reviews', authenticateJWT, async (req: any, res) => {
  try {
    const user = req.user
    if (!user || !user.id) return res.status(401).json({ error: 'Not authenticated' })
    const body = req.body || {}
    const filename = body.filename || `review-${Date.now().toString(36)}.bin`
    const base64 = body.fileBase64
    if (!base64) return res.status(400).json({ error: 'Missing fileBase64' })
    const path = require('path')
    const fs = require('fs')
    const dir = path.join(process.cwd(), 'data', 'reviews')
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    const filePath = path.join(dir, filename)
    const buf = Buffer.from(base64, 'base64')
    fs.writeFileSync(filePath, buf)
    const rec = await db.createReview({ userId: user.id, filename, filePath, note: body.note || null })
    return res.json({ ok: true, review: rec })
  } catch (e: any) { res.status(500).json({ error: e?.message || String(e) }) }
})

// GET /api/reviews (admin)
router.get('/reviews', authenticateJWT, async (req: any, res) => {
  try {
    if (!ensureAdmin(req, res)) return
    const list = await db.listReviews()
    return res.json({ ok: true, reviews: list })
  } catch (e: any) { res.status(500).json({ error: e?.message || String(e) }) }
})

// GET /api/reviews/:id (admin)
router.get('/reviews/:id', authenticateJWT, async (req: any, res) => {
  try {
    if (!ensureAdmin(req, res)) return
    const id = Number(req.params.id)
    const r = await db.getReviewById(id)
    if (!r) return res.status(404).json({ error: 'Not found' })
    return res.json({ ok: true, review: r })
  } catch (e: any) { res.status(500).json({ error: e?.message || String(e) }) }
})

// POST /api/reviews/checkout - create a checkout for a single review credit (authenticated)
router.post('/reviews/checkout', authenticateJWT, async (req: any, res) => {
  try {
    const user = req.user
    if (!user || !user.id) return res.status(401).json({ error: 'Not authenticated' })
    let priceId = process.env.STRIPE_PRICE_REVIEW
    if (!priceId) {
      const cms = db.getCMSContent()
      priceId = cms && cms.reviews && cms.reviews.priceId ? cms.reviews.priceId : null
    }
    if (!process.env.STRIPE_SECRET_KEY || !priceId) return res.status(500).json({ error: 'Billing not configured for reviews' })

    const Stripe = (await import('stripe')).default
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, { apiVersion: '2022-11-15' })
    const params: any = {
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: req.body?.successUrl || `${req.protocol}://${req.get('host')}/billing/success`,
      cancel_url: req.body?.cancelUrl || `${req.protocol}://${req.get('host')}/billing/cancel`,
      metadata: { userId: user.id }
    }
    const session = await stripe.checkout.sessions.create(params)
    return res.json({ ok: true, url: session.url, id: session.id })
  } catch (e: any) { res.status(500).json({ error: e?.message || String(e) }) }
})

export default router
