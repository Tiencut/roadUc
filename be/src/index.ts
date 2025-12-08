import express from 'express'
import cors from 'cors'
import { z } from 'zod'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import rateLimit from 'express-rate-limit'
import * as db from './db.js'
import { fetchAndCacheVisas, getVisasMetadata } from './visas.js'
import { getCMSContent, setCMSContent } from './db.js'
const app = express()
const port = Number(process.env.PORT || 3000)

// JWT secret - for production set process.env.JWT_SECRET
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me'

// Users are stored in file `data/users.json` via db helpers.

async function ensureDefaultAdmin() {
  try {
    const existing = db.getAllUsers()
    if (!existing || existing.length === 0) {
      const id = 'u_' + Date.now().toString(36)
      const hashed = await bcrypt.hash('admin', 10)
      const admin = { id, email: 'admin', passwordHash: hashed, role: 'admin' }
      db.saveUserRecord(admin)
      console.log('Created default admin user: admin / admin (change password)')
    }
  } catch (e) {
    console.warn('ensureDefaultAdmin failed', String(e))
  }
}

// initialize default admin asynchronously
ensureDefaultAdmin().catch(() => {})

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
    // attach planned visa for this session or user (if any)
    const sessionId = String(req.headers['x-session-id'] || 'global')
    const userId = String(req.headers['x-user-id'] || '') || undefined
    const planned = db.getPlannedVisa(sessionId, userId)
    // If admin-managed CMS provides visas, return that instead so admin edits show immediately
    try {
      const cms = getCMSContent()
      if (cms && Array.isArray(cms.visas) && cms.visas.length) {
        const data = { results: cms.visas }
        const metaWithPlanned = { ...resp.meta, planned }
        return res.json({ ok: true, count: cms.visas.length, data, meta: metaWithPlanned })
      }
    } catch (e) {
      // ignore CMS errors and continue with default
    }
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

// Admin content schemas
const DetailSchema = z.object({ title: z.string().min(1), note: z.string().optional() })
const PhaseSchema = z.object({ id: z.string().optional(), title: z.string().min(1), details: z.array(DetailSchema).optional() })
const VisaSchema = z.object({ id: z.string().optional(), title: z.string().min(1), code: z.string().min(1), desc: z.string().optional() })
const VisaCreateSchema = z.object({ title: z.string().min(1), code: z.string().min(1), desc: z.string().optional() })
const CMSContentSchema = z.object({ visas: z.array(VisaSchema).optional(), phases: z.array(PhaseSchema).optional() })

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

// --- Auth endpoints (simple JWT prototype) ---
// Rate limiter to protect login endpoint from brute-force
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts, please try again later.' }
})

app.post('/api/auth/login', loginLimiter, async (req, res) => {
  try {
    const { email, password, recaptchaToken } = req.body || {}
    // If RECAPTCHA_SECRET is configured, require and validate the recaptcha token
    const RECAPTCHA_SECRET = process.env.RECAPTCHA_SECRET
    if (RECAPTCHA_SECRET) {
      if (!recaptchaToken) return res.status(400).json({ error: 'Missing recaptchaToken' })
      try {
        const params = new URLSearchParams()
        params.append('secret', RECAPTCHA_SECRET)
        params.append('response', String(recaptchaToken))
        const r = await fetch('https://www.google.com/recaptcha/api/siteverify', { method: 'POST', body: params })
        const jr = await r.json()
        if (!jr || !jr.success) {
          return res.status(401).json({ error: 'Recaptcha validation failed' })
        }
      } catch (e) {
        return res.status(500).json({ error: 'Recaptcha verification error' })
      }
    }
    const { email, password: _password } = req.body || {}
    if (!email || !password) return res.status(400).json({ error: 'Missing email or password' })
    const u = db.getUserByEmail(String(email))
    if (!u) return res.status(401).json({ error: 'Invalid credentials' })
    const hash = u.passwordHash || u.password || ''
    const match = await bcrypt.compare(String(password), String(hash))
    if (!match) return res.status(401).json({ error: 'Invalid credentials' })
    // include a jti (token id) so we can revoke later
    const jti = 't_' + Date.now().toString(36) + Math.floor(Math.random() * 10000).toString(36)
    const token = jwt.sign({ sub: u.id, email: u.email, role: u.role, jti }, JWT_SECRET, { expiresIn: '8h' })
    res.json({ ok: true, token, user: { id: u.id, email: u.email, role: u.role } })
  } catch (e: any) {
    res.status(500).json({ error: e?.message || String(e) })
  }
})

app.get('/api/auth/me', async (req, res) => {
  try {
    const auth = String(req.headers['authorization'] || '')
    if (!auth.startsWith('Bearer ')) return res.status(401).json({ error: 'Missing token' })
    const token = auth.slice(7)
    try {
      const decoded: any = jwt.verify(token, JWT_SECRET)
      // check revoked
      if (db.isTokenRevoked(token)) return res.status(401).json({ error: 'Token revoked' })
      res.json({ ok: true, user: { id: decoded.sub, email: decoded.email, role: decoded.role } })
    } catch (e) {
      return res.status(401).json({ error: 'Invalid token' })
    }
  } catch (e: any) {
    res.status(500).json({ error: e?.message || String(e) })
  }
})

// Change password for current user
app.post('/api/auth/change-password', async (req, res) => {
  try {
    const auth = String(req.headers['authorization'] || '')
    if (!auth.startsWith('Bearer ')) return res.status(401).json({ error: 'Missing token' })
    const token = auth.slice(7)
    try {
      const decoded: any = jwt.verify(token, JWT_SECRET)
      if (db.isTokenRevoked(token)) return res.status(401).json({ error: 'Token revoked' })
      const { oldPassword, newPassword } = req.body || {}
      if (!oldPassword || !newPassword) return res.status(400).json({ error: 'Missing oldPassword or newPassword' })
      const u = db.getUserById(String(decoded.sub))
      if (!u) return res.status(404).json({ error: 'User not found' })
      const ok = await bcrypt.compare(String(oldPassword), String(u.passwordHash || u.password || ''))
      if (!ok) return res.status(401).json({ error: 'Old password incorrect' })
      const newHash = await bcrypt.hash(String(newPassword), 10)
      u.passwordHash = newHash
      db.saveUserRecord(u)
      res.json({ ok: true })
    } catch (e) {
      return res.status(401).json({ error: 'Invalid token' })
    }
  } catch (e: any) {
    res.status(500).json({ error: e?.message || String(e) })
  }
})

// Revoke current token (logout)
app.post('/api/auth/revoke', async (req, res) => {
  try {
    const auth = String(req.headers['authorization'] || '')
    if (!auth.startsWith('Bearer ')) return res.status(400).json({ error: 'Missing token' })
    const token = auth.slice(7)
    db.addRevokedToken(token)
    res.json({ ok: true })
  } catch (e: any) {
    res.status(500).json({ error: e?.message || String(e) })
  }
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
    let userId = String(req.headers['x-user-id'] || '') || undefined
    // If Authorization header with Bearer token is provided, try to decode to get user id/email
    try {
      const auth = String(req.headers['authorization'] || '')
      if (auth.startsWith('Bearer ')) {
        const token = auth.slice(7)
        const decoded: any = jwt.verify(token, JWT_SECRET)
        userId = decoded.email || decoded.sub || userId
      }
    } catch (e) {
      // ignore token errors and fall back to x-user-id
    }
    const pv = db.getPlannedVisa(sessionId, userId)
    res.json({ ok: true, data: pv })
  } catch (e: any) {
    res.status(500).json({ error: e?.message || String(e) })
  }
})

app.post('/api/planned-visa', async (req, res) => {
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
    const body = req.body || null
    if (!body || !body.code) return res.status(400).json({ error: 'Invalid body, expected { code, type?, title? }' })
    const saved = db.setPlannedVisa(sessionId, { code: body.code, type: body.type || null, title: body.title || null }, userId)
    res.json({ ok: true, data: saved })
  } catch (e: any) {
    res.status(500).json({ error: e?.message || String(e) })
  }
})

app.delete('/api/planned-visa', async (req, res) => {
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

// Migrate planned-visa from session to user after login
app.post('/api/planned-visa/migrate', async (req, res) => {
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

// --- Saved jobs for authenticated users ---
app.get('/api/me/saved-jobs', authenticateJWT, async (req, res) => {
  try {
    const uid = req.user && req.user.id ? String(req.user.id) : undefined
    if (!uid) return res.status(400).json({ error: 'User id missing' })
    const jobs = db.getSavedJobsForUser(uid)
    res.json({ ok: true, data: jobs })
  } catch (e: any) {
    res.status(500).json({ error: e?.message || String(e) })
  }
})

app.post('/api/me/saved-jobs', authenticateJWT, async (req, res) => {
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

app.delete('/api/me/saved-jobs', authenticateJWT, async (req, res) => {
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

// --- Admin content endpoints (simple, dev-only protection) ---
function authenticateJWT(req: any, res: any, next: any) {
  const auth = String(req.headers['authorization'] || '')
  if (!auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing Authorization header' })
  }
  const token = auth.slice(7)
  try {
    const decoded: any = jwt.verify(token, JWT_SECRET)
    // check revoked tokens
    if (db.isTokenRevoked(token)) return res.status(401).json({ error: 'Token revoked' })
    req.user = { id: decoded.sub, email: decoded.email, role: decoded.role }
    return next()
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' })
  }
}

function ensureAdmin(req: any, res: any) {
  if (req.user && req.user.role === 'admin') return true
  res.status(401).json({ error: 'Unauthorized - admin access required' })
  return false
}

app.get('/api/admin/content', authenticateJWT, async (req, res) => {
  try {
    if (!ensureAdmin(req, res)) return
    const cms = getCMSContent()
    res.json({ ok: true, data: cms })
  } catch (e: any) {
    res.status(500).json({ error: e?.message || String(e) })
  }
})

app.put('/api/admin/content', authenticateJWT, async (req, res) => {
  try {
    if (!ensureAdmin(req, res)) return
    const body = req.body || {}
    const parse = CMSContentSchema.safeParse(body)
    if (!parse.success) return res.status(400).json({ error: parse.error.issues })
    const saved = setCMSContent(parse.data)
    res.json({ ok: true, data: saved })
  } catch (e: any) {
    res.status(500).json({ error: e?.message || String(e) })
  }
})

// --- Admin user management ---
app.get('/api/admin/users', authenticateJWT, async (req, res) => {
  try {
    if (!ensureAdmin(req, res)) return
    const users = db.getAllUsers().map((u: any) => ({ id: u.id, email: u.email, role: u.role }))
    res.json({ ok: true, data: users })
  } catch (e: any) {
    res.status(500).json({ error: e?.message || String(e) })
  }
})

app.post('/api/admin/users', authenticateJWT, async (req, res) => {
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
  } catch (e: any) {
    res.status(500).json({ error: e?.message || String(e) })
  }
})

app.put('/api/admin/users/:id/password', authenticateJWT, async (req, res) => {
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
  } catch (e: any) {
    res.status(500).json({ error: e?.message || String(e) })
  }
})

app.delete('/api/admin/users/:id', authenticateJWT, async (req, res) => {
  try {
    if (!ensureAdmin(req, res)) return
    const id = String(req.params.id)
    const u = db.getUserById(id)
    if (!u) return res.status(404).json({ error: 'User not found' })
    db.deleteUserById(id)
    res.json({ ok: true })
  } catch (e: any) {
    res.status(500).json({ error: e?.message || String(e) })
  }
})

// Update user (role) - admin only
app.put('/api/admin/users/:id', authenticateJWT, async (req, res) => {
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
  } catch (e: any) {
    res.status(500).json({ error: e?.message || String(e) })
  }
})

// CRUD for visas under CMS
app.post('/api/admin/visas', authenticateJWT, async (req, res) => {
  try {
    if (!ensureAdmin(req, res)) return
    const body = req.body || {}
    const vparse = VisaCreateSchema.safeParse(body)
    if (!vparse.success) return res.status(400).json({ error: vparse.error.issues })
    const cms = getCMSContent() || { visas: [], phases: null }
    cms.visas = cms.visas || []
    // uniqueness check for code
    if (cms.visas.find((x: any) => String(x.code).toLowerCase() === String(vparse.data.code).toLowerCase())) {
      return res.status(400).json({ error: 'Duplicate visa code' })
    }
    const id = String(Date.now()) + '-' + Math.floor(Math.random() * 10000)
    const newVisa = { id, ...vparse.data }
    cms.visas.push(newVisa)
    setCMSContent(cms)
    res.json({ ok: true, data: newVisa })
  } catch (e: any) {
    res.status(500).json({ error: e?.message || String(e) })
  }
})

app.put('/api/admin/visas/:id', authenticateJWT, async (req, res) => {
  try {
    if (!ensureAdmin(req, res)) return
    const id = String(req.params.id)
    const body = req.body || {}
    const vparse = VisaSchema.partial().safeParse(body)
    if (!vparse.success) return res.status(400).json({ error: vparse.error.issues })
    const cms = getCMSContent() || { visas: [], phases: null }
    cms.visas = cms.visas || []
    const idx = cms.visas.findIndex((v: any) => String(v.id) === id)
    if (idx === -1) return res.status(404).json({ error: 'Not found' })
    // if updating code, ensure uniqueness
    if (vparse.data.code) {
      const dup = cms.visas.find((x: any) => String(x.code).toLowerCase() === String(vparse.data.code).toLowerCase() && String(x.id) !== id)
      if (dup) return res.status(400).json({ error: 'Duplicate visa code' })
    }
    cms.visas[idx] = { ...cms.visas[idx], ...vparse.data }
    setCMSContent(cms)
    res.json({ ok: true, data: cms.visas[idx] })
  } catch (e: any) {
    res.status(500).json({ error: e?.message || String(e) })
  }
})

app.delete('/api/admin/visas/:id', authenticateJWT, async (req, res) => {
  try {
    if (!ensureAdmin(req, res)) return
    const id = String(req.params.id)
    const cms = getCMSContent() || { visas: [], phases: null }
    cms.visas = cms.visas || []
    const idx = cms.visas.findIndex((v: any) => String(v.id) === id)
    if (idx === -1) return res.status(404).json({ error: 'Not found' })
    const removed = cms.visas.splice(idx, 1)
    setCMSContent(cms)
    res.json({ ok: true, data: removed[0] })
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
