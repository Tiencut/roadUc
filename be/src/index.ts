import express from 'express'
import cors from 'cors'
import { z } from 'zod'
import * as db from './db.js'
import { fetchAndCacheVisas, getVisasMetadata } from './visas.js'
const app = express()
const port = Number(process.env.PORT || 3000)

app.use(cors())
app.use(express.json())

app.get('/', (_req, res) => {
  res.json({ message: 'Hello from be (Express + TypeScript)' })
})

app.get('/api/status', async (_req, res) => {
  res.json({ ok: true, time: new Date().toISOString() })
})

// Proxy endpoint to fetch CRICOS-related packages from data.gov.au (CKAN)
let schoolsCache: { ts: number; data: any } | null = null
app.get('/api/schools', async (req, res) => {
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
    if (!r.ok) return res.status(502).json({ error: ' upstream error', status: r.status })
    const json = await r.json()

    // Normalize result packages to a simpler structure
    let packages = (json.result?.results || [])
    // By default, try to filter to packages likely related to CRICOS datasets to avoid unrelated results
    const onlyCricos = req.query.only_cricos !== 'false'
    if (onlyCricos) {
      packages = packages.filter((p: any) => {
        const hay = ((p.title || '') + ' ' + (p.notes || '') + ' ' + (p.name || '') + ' ' + ((p.resources || []).map((r: any) => r.name + ' ' + r.url).join(' '))).toLowerCase()
        return hay.includes('cricos') || hay.includes('cricos.edu') || hay.includes('cricos.code') || hay.includes('cricos code')
      })
    }

    const normalized = packages.map((p: any) => ({
      id: p.id,
      title: p.title,
      name: p.name,
      notes: p.notes,
      url: p.url,
      resources: (p.resources || []).map((rs: any) => ({ name: rs.name, url: rs.url, format: rs.format }))
    }))

    schoolsCache = { ts: now, data: { results: normalized } }
    res.json({ source: 'api', count: normalized.length, data: { results: normalized } })
  } catch (e: any) {
    res.status(500).json({ error: e?.message || String(e) })
  }
})

// Visas normalized API + metadata
app.get('/api/visas', async (req, res) => {
  try {
    const refresh = req.query.refresh === 'true'
    const resp = await fetchAndCacheVisas(refresh)
    // attach planned visa for this session (if any)
    const sessionId = String(req.headers['x-session-id'] || 'global')
    const planned = db.getPlannedVisa(sessionId)
    const metaWithPlanned = { ...resp.meta, planned }
    res.json({ ok: true, count: resp.data?.results?.length || 0, data: resp.data, meta: metaWithPlanned })
  } catch (e: any) {
    res.status(500).json({ error: e?.message || String(e) })
  }
})

app.get('/api/visas/metadata', async (_req, res) => {
  try {
    let meta = await getVisasMetadata()
    // If no metadata cached, try to fetch (non-forced) to populate cache.
    if (!meta) {
      try {
        const resp = await fetchAndCacheVisas(false)
        if (resp && resp.meta) {
          meta = resp.meta
          // return populated meta
          return res.json({ ok: true, meta })
        }
      } catch (err) {
        // ignore fetch error, we'll return a safe placeholder below
        console.warn('Visas metadata fetch failed:', String(err))
      }
      // return an empty-but-200 metadata object so FE can handle gracefully
      return res.json({ ok: true, meta: { fetchedAt: null, source: null, version: null, note: 'no metadata cached' } })
    }
    res.json({ ok: true, meta })
  } catch (e: any) {
    res.status(500).json({ error: e?.message || String(e) })
  }
})

const assessSchema = z.object({
  age: z.number().int().optional(),
  education: z.string().optional(),
  ielts: z.number().optional()
})

app.post('/api/assess', async (req, res) => {
  const parse = assessSchema.safeParse(req.body)
  if (!parse.success) return res.status(400).json({ error: parse.error.issues })

  const { age, education, ielts } = parse.data
  let score = 0
  if (age && age < 35) score += 2
  if (education === 'bachelor') score += 1
  else if (education === 'master') score += 2
  if (ielts && ielts >= 6.5) score += 2

  const result = score >= 5 ? 'Cao' : score >= 3 ? 'Trung bình' : 'Thấp'
  // persist
  const saved = db.createAssessment({ age: age ?? undefined, education: education ?? undefined, ielts: ielts ?? undefined, score, result })

  res.json({ score, result, id: saved.id })
})

// Checklist CRUD
const checklistCreateSchema = z.object({ text: z.string().min(1), done: z.boolean().optional() })

app.get('/api/checklist', async (_req, res) => {
  const items = db.getChecklist()
  res.json(items)
})

app.post('/api/checklist', async (req, res) => {
  const parse = checklistCreateSchema.safeParse(req.body)
  if (!parse.success) return res.status(400).json({ error: parse.error.issues })
  const { text, done } = parse.data
  const item = db.createChecklist(text, done ?? false)
  res.json(item)
})

app.put('/api/checklist/:id', async (req, res) => {
  const id = Number(req.params.id)
  if (Number.isNaN(id)) return res.status(400).json({ error: 'Invalid id' })
  const parse = checklistCreateSchema.partial().safeParse(req.body)
  if (!parse.success) return res.status(400).json({ error: parse.error.issues })
  const updated = db.updateChecklist(id, parse.data as any)
  if (!updated) return res.status(404).json({ error: 'Not found' })
  res.json(updated)
})

app.delete('/api/checklist/:id', async (req, res) => {
  const id = Number(req.params.id)
  if (Number.isNaN(id)) return res.status(400).json({ error: 'Invalid id' })
  db.deleteChecklist(id)
  res.json({ ok: true })
})

// Planned visa persistence (simple per-app storage)
app.get('/api/planned-visa', async (req, res) => {
  try {
    const sessionId = String(req.headers['x-session-id'] || 'global')
    const pv = db.getPlannedVisa(sessionId)
    res.json({ ok: true, data: pv })
  } catch (e: any) {
    res.status(500).json({ error: e?.message || String(e) })
  }
})

app.post('/api/planned-visa', async (req, res) => {
  try {
    const sessionId = String(req.headers['x-session-id'] || 'global')
    const body = req.body || null
    if (!body || !body.code) return res.status(400).json({ error: 'Invalid body, expected { code, type?, title? }' })
    const saved = db.setPlannedVisa(sessionId, { code: body.code, type: body.type || null, title: body.title || null })
    res.json({ ok: true, data: saved })
  } catch (e: any) {
    res.status(500).json({ error: e?.message || String(e) })
  }
})

app.delete('/api/planned-visa', async (req, res) => {
  try {
    const sessionId = String(req.headers['x-session-id'] || 'global')
    const cleared = db.clearPlannedVisa(sessionId)
    res.json({ ok: true, data: cleared })
  } catch (e: any) {
    res.status(500).json({ error: e?.message || String(e) })
  }
})

app.listen(port, () => {
  console.log(`Server running: http://localhost:${port}`)
})

process.on('SIGINT', async () => {
  process.exit(0)
})
