import express from 'express'

const router = express.Router()

let schoolsCache: { ts: number; data: any } | null = null

router.get('/schools', async (req, res) => {
  try {
    const q = String(req.query.q || 'CRICOS')
    const rows = Number(req.query.rows || 100)
    const refresh = req.query.refresh === 'true'
    const now = Date.now()
    if (!refresh && schoolsCache && (now - schoolsCache.ts) < 1000 * 60 * 60 * 24) {
      return res.json({ source: 'cache', count: (schoolsCache.data.results || []).length, data: schoolsCache.data })
    }
    const apiUrl = `https://data.gov.au/api/3/action/package_search?q=${encodeURIComponent(q)}&rows=${rows}`
    const r = await fetch(apiUrl)
    if (!r.ok) return res.status(502).json({ error: 'upstream error', status: r.status })
    const json = await r.json()
    let packages = (json.result?.results || [])
    const onlyCricos = req.query.only_cricos !== 'false'
    if (onlyCricos) {
      packages = packages.filter((p: any) => {
        const hay = ((p.title || '') + ' ' + (p.notes || '') + ' ' + (p.name || '') + ' ' + ((p.resources || []).map((r: any) => r.name + ' ' + r.url).join(' '))).toLowerCase()
        return hay.includes('cricos') || hay.includes('cricos.edu') || hay.includes('cricos.code') || hay.includes('cricos code')
      })
    }
    const normalized = packages.map((p: any) => ({ id: p.id, title: p.title, name: p.name, notes: p.notes, url: p.url, resources: (p.resources || []).map((rs: any) => ({ name: rs.name, url: rs.url, format: rs.format })) }))
    schoolsCache = { ts: now, data: { results: normalized } }
    res.json({ source: 'api', count: normalized.length, data: { results: normalized } })
  } catch (e: any) {
    res.status(500).json({ error: e?.message || String(e) })
  }
})

export default router
