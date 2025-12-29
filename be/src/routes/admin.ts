import express from 'express'
import bcrypt from 'bcrypt'
import * as db from '../db.js'
import { CMSContentSchema, VisaCreateSchema, VisaSchema } from '../schemas.js'
import { authenticateJWT, ensureAdmin } from '../middleware.js'
import Stripe from 'stripe'

const router = express.Router()

router.get('/admin/content', authenticateJWT, async (req, res) => {
  try {
    if (!ensureAdmin(req, res)) return
    const cms = db.getCMSContent()
    res.json({ ok: true, data: cms })
  } catch (e: any) { res.status(500).json({ error: e?.message || String(e) }) }
})

router.put('/admin/content', authenticateJWT, async (req, res) => {
  try {
    if (!ensureAdmin(req, res)) return
    const body = req.body || {}
    const parse = CMSContentSchema.safeParse(body)
    if (!parse.success) return res.status(400).json({ error: parse.error.issues })
    const saved = db.setCMSContent(parse.data)
    res.json({ ok: true, data: saved })
  } catch (e: any) { res.status(500).json({ error: e?.message || String(e) }) }
})

router.get('/admin/users', authenticateJWT, async (req, res) => {
  try {
    if (!ensureAdmin(req, res)) return
    const users = db.getAllUsers().map((u: any) => ({ id: u.id, email: u.email, role: u.role }))
    res.json({ ok: true, data: users })
  } catch (e: any) { res.status(500).json({ error: e?.message || String(e) }) }
})

router.post('/admin/users', authenticateJWT, async (req, res) => {
  try {
    if (!ensureAdmin(req, res)) return
    const body = req.body || {}
    const email = String(body.email || '').toLowerCase()
    const password = String(body.password || '')
    const role = String(body.role || 'user')
    if (!email || !password) return res.status(400).json({ error: 'email and password required' })
    if (db.getUserByEmail(email)) return res.status(400).json({ error: 'User already exists' })
    const id = 'u_' + Date.now().toString(36)
    const hash = await bcrypt.hash(password, 10)
    const user = { id, email, passwordHash: hash, role }
    db.saveUserRecord(user)
    res.json({ ok: true, data: { id: user.id, email: user.email, role: user.role } })
  } catch (e: any) { res.status(500).json({ error: e?.message || String(e) }) }
})

router.put('/admin/users/:id/password', authenticateJWT, async (req, res) => {
  try {
    if (!ensureAdmin(req, res)) return
    const id = String(req.params.id)
    const body = req.body || {}
    const newPassword = String(body.password || '')
    if (!newPassword) return res.status(400).json({ error: 'password required' })
    const u = db.getUserById(id)
    if (!u) return res.status(404).json({ error: 'User not found' })
    const hash = await bcrypt.hash(newPassword, 10)
    u.passwordHash = hash
    db.saveUserRecord(u)
    res.json({ ok: true })
  } catch (e: any) { res.status(500).json({ error: e?.message || String(e) }) }
})

router.delete('/admin/users/:id', authenticateJWT, async (req, res) => {
  try {
    if (!ensureAdmin(req, res)) return
    const id = String(req.params.id)
    const u = db.getUserById(id)
    if (!u) return res.status(404).json({ error: 'User not found' })
    db.deleteUserById(id)
    res.json({ ok: true })
  } catch (e: any) { res.status(500).json({ error: e?.message || String(e) }) }
})

router.put('/admin/users/:id', authenticateJWT, async (req, res) => {
  try {
    if (!ensureAdmin(req, res)) return
    const id = String(req.params.id)
    const body = req.body || {}
    const role = body.role ? String(body.role) : undefined
    if (!role) return res.status(400).json({ error: 'role required' })
    const u = db.getUserById(id)
    if (!u) return res.status(404).json({ error: 'User not found' })
    u.role = role
    db.saveUserRecord(u)
    res.json({ ok: true, data: { id: u.id, email: u.email, role: u.role } })
  } catch (e: any) { res.status(500).json({ error: e?.message || String(e) }) }
})

router.put('/admin/users/:id/premium', authenticateJWT, async (req, res) => {
  try {
    if (!ensureAdmin(req, res)) return
    const id = String(req.params.id)
    const body = req.body || {}
    const premium = !!body.premium
    const updated = db.setUserPremium(id, premium)
    if (!updated) return res.status(404).json({ error: 'User not found' })
    res.json({ ok: true, data: { id: updated.id, email: updated.email, premium: !!updated.premium } })
  } catch (e: any) { res.status(500).json({ error: e?.message || String(e) }) }
})

// List subscriptions (simple view: map users with stripe ids)
router.get('/admin/subscriptions', authenticateJWT, async (req, res) => {
  try {
    if (!ensureAdmin(req, res)) return
    const users = db.getAllUsers()
    const subs = users.map((u: any) => ({ id: u.id, email: u.email, stripeCustomerId: u.stripeCustomerId || null, stripeSubscriptionId: u.stripeSubscriptionId || null, subscriptionStatus: u.subscriptionStatus || null, premium: !!u.premium }))
    res.json({ ok: true, data: subs })
  } catch (e: any) { res.status(500).json({ error: e?.message || String(e) }) }
})

// Cancel subscription by subscription id (admin)
router.post('/admin/subscriptions/:subscriptionId/cancel', authenticateJWT, async (req, res) => {
  try {
    if (!ensureAdmin(req, res)) return
    const subscriptionId = String(req.params.subscriptionId)
    if (!process.env.STRIPE_SECRET_KEY) return res.status(500).json({ error: 'Stripe not configured' })
    const stripe = new (Stripe as any)(process.env.STRIPE_SECRET_KEY as string, { apiVersion: '2022-11-15' })
    await stripe.subscriptions.del(subscriptionId)

    // find user and update DB
    const users = db.getAllUsers()
    const u = users.find((x: any) => x.stripeSubscriptionId === subscriptionId)
    if (u) {
      db.setUserSubscription(u.id, subscriptionId, 'canceled')
      db.setUserPremium(u.id, false)
    }
    res.json({ ok: true })
  } catch (e: any) { res.status(500).json({ error: e?.message || String(e) }) }
})

router.post('/admin/subscriptions/reconcile', authenticateJWT, async (req, res) => {
  try {
    if (!ensureAdmin(req, res)) return
    const { reconcileSubscriptionsOnce } = await import('../jobs/reconcile.js')
    const result = await reconcileSubscriptionsOnce()
    res.json({ ok: true, data: result })
  } catch (e: any) { res.status(500).json({ error: e?.message || String(e) }) }
})

router.post('/admin/visas', authenticateJWT, async (req, res) => {
  try {
    if (!ensureAdmin(req, res)) return
    const body = req.body || {}
    const vparse = VisaCreateSchema.safeParse(body)
    if (!vparse.success) return res.status(400).json({ error: vparse.error.issues })
    const cms = db.getCMSContent() || { visas: [], phases: null }
    cms.visas = cms.visas || []
    if (cms.visas.find((x: any) => String(x.code).toLowerCase() === String(vparse.data.code).toLowerCase())) {
      return res.status(400).json({ error: 'Duplicate visa code' })
    }
    const id = String(Date.now()) + '-' + Math.floor(Math.random() * 10000)
    const newVisa = { id, ...vparse.data }
    cms.visas.push(newVisa)
    db.setCMSContent(cms)
    res.json({ ok: true, data: newVisa })
  } catch (e: any) { res.status(500).json({ error: e?.message || String(e) }) }
})

router.put('/admin/visas/:id', authenticateJWT, async (req, res) => {
  try {
    if (!ensureAdmin(req, res)) return
    const id = String(req.params.id)
    const body = req.body || {}
    const vparse = VisaSchema.partial().safeParse(body)
    if (!vparse.success) return res.status(400).json({ error: vparse.error.issues })
    const cms = db.getCMSContent() || { visas: [], phases: null }
    cms.visas = cms.visas || []
    const idx = cms.visas.findIndex((v: any) => String(v.id) === id)
    if (idx === -1) return res.status(404).json({ error: 'Not found' })
    if (vparse.data.code) {
      const dup = cms.visas.find((x: any) => String(x.code).toLowerCase() === String(vparse.data.code).toLowerCase() && String(x.id) !== id)
      if (dup) return res.status(400).json({ error: 'Duplicate visa code' })
    }
    cms.visas[idx] = { ...cms.visas[idx], ...vparse.data }
    db.setCMSContent(cms)
    res.json({ ok: true, data: cms.visas[idx] })
  } catch (e: any) { res.status(500).json({ error: e?.message || String(e) }) }
})

router.delete('/admin/visas/:id', authenticateJWT, async (req, res) => {
  try {
    if (!ensureAdmin(req, res)) return
    const id = String(req.params.id)
    const cms = db.getCMSContent() || { visas: [], phases: null }
    cms.visas = cms.visas || []
    const idx = cms.visas.findIndex((v: any) => String(v.id) === id)
    if (idx === -1) return res.status(404).json({ error: 'Not found' })
    const removed = cms.visas.splice(idx, 1)
    db.setCMSContent(cms)
    res.json({ ok: true, data: removed[0] })
  } catch (e: any) { res.status(500).json({ error: e?.message || String(e) }) }
})

export default router
