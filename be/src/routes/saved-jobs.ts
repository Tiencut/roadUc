import express from 'express'
import * as db from '../db.js'
import { authenticateJWT } from '../middleware.js'

const router = express.Router()

router.get('/me/saved-jobs', authenticateJWT, async (req, res) => {
  try {
    const uid = req.user && req.user.id ? String(req.user.id) : undefined
    if (!uid) return res.status(400).json({ error: 'User id missing' })
    const jobs = db.getSavedJobsForUser(uid)
    res.json({ ok: true, data: jobs })
  } catch (e: any) {
    res.status(500).json({ error: e?.message || String(e) })
  }
})

router.post('/me/saved-jobs', authenticateJWT, async (req, res) => {
  try {
    const uid = req.user && req.user.id ? String(req.user.id) : undefined
    if (!uid) return res.status(400).json({ error: 'User id missing' })
    const job = req.body && req.body.job ? req.body.job : null
    if (!job || !job.jobType) return res.status(400).json({ error: 'Missing job payload with jobType' })
    const newList = db.addSavedJobForUser(uid, job)
    res.json({ ok: true, data: newList })
  } catch (e: any) {
    res.status(500).json({ error: e?.message || String(e) })
  }
})

router.delete('/me/saved-jobs', authenticateJWT, async (req, res) => {
  try {
    const uid = req.user && req.user.id ? String(req.user.id) : undefined
    if (!uid) return res.status(400).json({ error: 'User id missing' })
    const jobType = String(req.query.jobType || (req.body && req.body.jobType) || '')
    if (!jobType) return res.status(400).json({ error: 'jobType required to delete' })
    const newList = db.removeSavedJobForUser(uid, jobType)
    res.json({ ok: true, data: newList })
  } catch (e: any) {
    res.status(500).json({ error: e?.message || String(e) })
  }
})

export default router
