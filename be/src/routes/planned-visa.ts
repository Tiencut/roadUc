import express from 'express'
import jwt from 'jsonwebtoken'
import * as db from '../db.js'

const router = express.Router()
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me'

router.get('/planned-visa', async (req, res) => {
  try {
    const sessionId = String(req.headers['x-session-id'] || 'global')
    let userId = String(req.headers['x-user-id'] || '') || undefined
    try {
      const auth = String(req.headers['authorization'] || '')
      if (auth.startsWith('Bearer ')) { const token = auth.slice(7); const decoded: any = jwt.verify(token, JWT_SECRET); userId = decoded.email || decoded.sub || userId }
    } catch (e) {}
    res.json({ ok: true, data: db.getPlannedVisa(sessionId, userId) })
  } catch (e: any) { res.status(500).json({ error: e?.message || String(e) }) }
})

router.post('/planned-visa', async (req, res) => {
  try {
    const sessionId = String(req.headers['x-session-id'] || 'global')
    let userId = String(req.headers['x-user-id'] || '') || undefined
    try { const auth = String(req.headers['authorization'] || ''); if (auth.startsWith('Bearer ')) { const token = auth.slice(7); const decoded: any = jwt.verify(token, JWT_SECRET); userId = decoded.email || decoded.sub || userId } } catch (e) {}
    const body = req.body || null
    if (!body || !body.code) return res.status(400).json({ error: 'Invalid body, expected { code, type?, title? }' })
    const saved = db.setPlannedVisa(sessionId, { code: body.code, type: body.type || null, title: body.title || null }, userId)
    res.json({ ok: true, data: saved })
  } catch (e: any) { res.status(500).json({ error: e?.message || String(e) }) }
})

router.delete('/planned-visa', async (req, res) => {
  try {
    const sessionId = String(req.headers['x-session-id'] || 'global')
    let userId = String(req.headers['x-user-id'] || '') || undefined
    try {
      const auth = String(req.headers['authorization'] || '')
      if (auth.startsWith('Bearer ')) {
        const token = auth.slice(7)
        const decoded: any = jwt.verify(token, JWT_SECRET)
        userId = decoded.email || decoded.sub || userId
      }
    } catch (e) {}
    const cleared = db.clearPlannedVisa(sessionId, userId)
    res.json({ ok: true, data: cleared })
  } catch (e: any) {
    res.status(500).json({ error: e?.message || String(e) })
  }
})

router.post('/planned-visa/migrate', async (req, res) => {
  try {
    const sessionId = String(req.headers['x-session-id'] || 'global')
    const body = req.body || {}
    let userId = body.userId || String(req.headers['x-user-id'] || '')
    try {
      const auth = String(req.headers['authorization'] || '')
      if (auth.startsWith('Bearer ')) {
        const token = auth.slice(7)
        const decoded: any = jwt.verify(token, JWT_SECRET)
        userId = userId || decoded.email || decoded.sub
      }
    } catch (e) {}
    if (!userId) return res.status(400).json({ error: 'Missing userId to migrate' })
    const migrated = db.migratePlannedVisa(sessionId, String(userId))
    res.json({ ok: true, data: migrated })
  } catch (e: any) {
    res.status(500).json({ error: e?.message || String(e) })
  }
})

export default router
