import express from 'express'
import rateLimit from 'express-rate-limit'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import * as db from '../db.js'
import { authenticateJWT } from '../middleware.js'

const router = express.Router()

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me'
const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, standardHeaders: true, legacyHeaders: false, message: { error: 'Too many login attempts, please try again later.' } })

router.post('/auth/login', loginLimiter, async (req, res) => {
  try {
    const { email, password, recaptchaToken } = req.body || {}
    const RECAPTCHA_SECRET = process.env.RECAPTCHA_SECRET
    if (RECAPTCHA_SECRET) {
      if (!recaptchaToken) return res.status(400).json({ error: 'Missing recaptchaToken' })
      try {
        const params = new URLSearchParams()
        params.append('secret', RECAPTCHA_SECRET)
        params.append('response', String(recaptchaToken))
        const r = await fetch('https://www.google.com/recaptcha/api/siteverify', { method: 'POST', body: params })
        const jr = await r.json()
        if (!jr || !jr.success) return res.status(401).json({ error: 'Recaptcha validation failed' })
      } catch (e) { return res.status(500).json({ error: 'Recaptcha verification error' }) }
    }
    if (!email || !password) return res.status(400).json({ error: 'Missing email or password' })
    const u = db.getUserByEmail(String(email))
    if (!u) return res.status(401).json({ error: 'Invalid credentials' })
    const match = await bcrypt.compare(String(password), String(u.passwordHash || u.password || ''))
    if (!match) return res.status(401).json({ error: 'Invalid credentials' })
    const jti = 't_' + Date.now().toString(36) + Math.floor(Math.random() * 10000).toString(36)
    const token = jwt.sign({ sub: u.id, email: u.email, role: u.role, jti }, JWT_SECRET, { expiresIn: '8h' })
    res.json({ ok: true, token, user: { id: u.id, email: u.email, role: u.role, premium: u.premium } })
  } catch (e: any) { res.status(500).json({ error: e?.message || String(e) }) }
})

router.get('/auth/me', authenticateJWT, async (req, res) => {
  try {
    console.debug('/auth/me called, req.user=', req.user)
    const uid = req.user && req.user.id ? String(req.user.id) : undefined
    if (!uid) return res.status(400).json({ error: 'User id missing' })
    let u: any = null
    try { u = await Promise.resolve(db.getUserById(uid)) } catch (err) { console.error('db.getUserById threw:', err); return res.status(500).json({ error: 'Internal DB error' }) }
    if (!u) return res.status(404).json({ error: 'User not found' })
    res.json({ ok: true, user: { id: u.id, email: u.email, role: u.role, premium: !!u.premium, subscriptionStatus: u.subscriptionStatus || null, stripeCustomerId: u.stripeCustomerId || null, stripeSubscriptionId: u.stripeSubscriptionId || null } })
  } catch (e: any) {
    console.error('/auth/me error:', e)
    res.status(500).json({ error: e?.message || String(e) })
  }
})

router.post('/auth/change-password', authenticateJWT, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body || {}
    if (!oldPassword || !newPassword) return res.status(400).json({ error: 'Missing oldPassword or newPassword' })
    const uid = req.user && req.user.id ? String(req.user.id) : undefined
    if (!uid) return res.status(400).json({ error: 'User id missing' })
    const u = db.getUserById(uid)
    if (!u) return res.status(404).json({ error: 'User not found' })
    const ok = await bcrypt.compare(String(oldPassword), String(u.passwordHash || u.password || ''))
    if (!ok) return res.status(401).json({ error: 'Old password incorrect' })
    const newHash = await bcrypt.hash(String(newPassword), 10)
    u.passwordHash = newHash
    db.saveUserRecord(u)
    res.json({ ok: true })
  } catch (e) { res.status(500).json({ error: 'Invalid token' }) }
})

router.post('/auth/revoke', authenticateJWT, async (req, res) => {
  try {
    const token = String(req.headers['authorization'] || '').startsWith('Bearer ') ? String(req.headers['authorization'] || '').slice(7) : ''
    if (!token) return res.status(400).json({ error: 'Missing token' })
    db.addRevokedToken(token)
    res.json({ ok: true })
  } catch (e: any) { res.status(500).json({ error: e?.message || String(e) }) }
})

export default router
