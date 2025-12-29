import express from 'express'

const router = express.Router()

// POST /api/analytics - public fire-and-forget event collector
router.post('/analytics', async (req, res) => {
  try {
    const ev = req.body || {}
    const logDir = require('path').join(process.cwd(), 'logs')
    const fs = require('fs')
    if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true })
    const line = JSON.stringify({ ts: new Date().toISOString(), event: ev }, null, 2) + '\n'
    fs.appendFileSync(require('path').join(logDir, 'analytics.log'), line, 'utf-8')
    return res.json({ ok: true })
  } catch (e: any) { return res.status(500).json({ error: e?.message || String(e) }) }
})

export default router
