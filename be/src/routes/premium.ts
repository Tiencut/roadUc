import express from 'express'
import { authenticateJWT, requirePremium } from '../middleware.js'

const router = express.Router()

// Example premium-only endpoint: export user's planned visas as JSON (placeholder for PDF export)
router.get('/premium/export', authenticateJWT, requirePremium, async (req: any, res) => {
  try {
    const uid = req.user && req.user.id ? String(req.user.id) : undefined
    if (!uid) return res.status(400).json({ error: 'User id missing' })
    // For demo, return a JSON export. In production you might generate a PDF and return it.
    // Gather data (this is placeholder — adjust to actual export contents).
    const exportData = {
      exportedAt: new Date().toISOString(),
      userId: uid,
      note: 'This is a premium export placeholder. Implement real export (PDF generation) later.'
    }
    res.json({ ok: true, data: exportData })
  } catch (e: any) {
    res.status(500).json({ error: e?.message || String(e) })
  }
})

export default router
