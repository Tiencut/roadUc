import express from 'express'
import * as db from '../db.js'
import { fetchAndCacheVisas, getVisasMetadata } from '../visas.js'

const router = express.Router()

router.get('/visas', async (req, res) => {
  try {
    const refresh = req.query.refresh === 'true'
    const resp = await fetchAndCacheVisas(refresh)
    const sessionId = String(req.headers['x-session-id'] || 'global')
    const userId = String(req.headers['x-user-id'] || '') || undefined
    const planned = db.getPlannedVisa(sessionId, userId)
    try {
      const cms = db.getCMSContent()
      if (cms && Array.isArray(cms.visas) && cms.visas.length) {
        const data = { results: cms.visas }
        const metaWithPlanned = { ...resp.meta, planned }
        return res.json({ ok: true, count: cms.visas.length, data, meta: metaWithPlanned })
      }
    } catch (e) {}
    const metaWithPlanned = { ...resp.meta, planned }
    res.json({ ok: true, count: resp.data?.results?.length || 0, data: resp.data, meta: metaWithPlanned })
  } catch (e: any) {
    res.status(500).json({ error: e?.message || String(e) })
  }
})

router.get('/visas/metadata', async (_req, res) => {
  try {
    let meta = await getVisasMetadata()
    if (!meta) {
      try {
        const resp = await fetchAndCacheVisas(false)
        if (resp && resp.meta) return res.json({ ok: true, meta: resp.meta })
      } catch (err) { console.warn('Visas metadata fetch failed:', String(err)) }
      return res.json({ ok: true, meta: { fetchedAt: null, source: null, version: null, note: 'no metadata cached' } })
    }
    res.json({ ok: true, meta })
  } catch (e: any) { res.status(500).json({ error: e?.message || String(e) }) }
})

export default router
