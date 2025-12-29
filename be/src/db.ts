import fs from 'fs'
import path from 'path'
import { PrismaClient } from '@prisma/client'

const DATA_DIR = path.join(process.cwd(), 'data')
const DATA_FILE = path.join(DATA_DIR, 'db.json')

const USING_PRISMA = !!process.env.DATABASE_URL
let prisma: any = null
if (USING_PRISMA) {
  prisma = new PrismaClient()
}

function ensureData() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
  if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, JSON.stringify({ checklist: [], assessments: [], plannedVisas: {}, _nextId: 1 }, null, 2), 'utf-8')
}

function readDB() {
  ensureData()
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8')
    const parsed = JSON.parse(raw)
    // ensure revokedTokens array exists
    if (!parsed.revokedTokens) parsed.revokedTokens = []
    // ensure savedJobs map exists (per-user saved job lists)
    if (!parsed.savedJobs) parsed.savedJobs = {}
    return parsed
  } catch (e) {
    const init: any = { checklist: [], assessments: [], plannedVisas: {}, _nextId: 1 }
    init.revokedTokens = []
    init.savedJobs = {}
    fs.writeFileSync(DATA_FILE, JSON.stringify(init, null, 2), 'utf-8')
    return init
  }
}

function writeDB(obj: any) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(obj, null, 2), 'utf-8')
}

export function getChecklist() {
  if (USING_PRISMA) return prisma.checklistItem.findMany()
  const db = readDB()
  return db.checklist
}

export function createChecklist(text: string, done = false) {
  if (USING_PRISMA) return prisma.checklistItem.create({ data: { text: String(text), done: !!done } })
  const db = readDB()
  const id = db._nextId++
  const item = { id, text, done: !!done, createdAt: new Date().toISOString() }
  db.checklist.push(item)
  writeDB(db)
  return item
}

export function updateChecklist(id: number, data: { text?: string; done?: boolean }) {
  if (USING_PRISMA) return prisma.checklistItem.update({ where: { id: Number(id) }, data: { text: data.text, done: data.done } })
  const db = readDB()
  const idx = db.checklist.findIndex((i: any) => i.id === id)
  if (idx === -1) return null
  const item = db.checklist[idx]
  if (data.text !== undefined) item.text = data.text
  if (data.done !== undefined) item.done = !!data.done
  db.checklist[idx] = item
  writeDB(db)
  return item
}

export function deleteChecklist(id: number) {
  if (USING_PRISMA) return prisma.checklistItem.delete({ where: { id: Number(id) } })
  const db = readDB()
  db.checklist = db.checklist.filter((i: any) => i.id !== id)
  writeDB(db)
  return { ok: true }
}

export function createAssessment(a: { age?: number; education?: string; ielts?: number; score: number; result: string }) {
  if (USING_PRISMA) return prisma.assessment.create({ data: { age: a.age ?? null, education: a.education ?? null, ielts: a.ielts ?? null, score: a.score, result: a.result } })
  const db = readDB()
  const id = db._nextId++
  const row = { id, age: a.age ?? null, education: a.education ?? null, ielts: a.ielts ?? null, score: a.score, result: a.result, createdAt: new Date().toISOString() }
  db.assessments.push(row)
  writeDB(db)
  return row
}

function keyFor(sessionId: string | undefined, userId?: string) {
  if (userId) return `user:${userId}`
  return sessionId || 'global'
}

export function getPlannedVisa(sessionId = 'global', userId?: string) {
  if (USING_PRISMA) return prisma.plannedVisa.findUnique({ where: { key: keyFor(sessionId, userId) } })
  const db = readDB()
  // migrate older single plannedVisa shape if present
  if ((db as any).plannedVisa && !(db.plannedVisas && Object.keys(db.plannedVisas).length)) {
    db.plannedVisas = { global: (db as any).plannedVisa }
    delete (db as any).plannedVisa
    writeDB(db)
  }
  const key = keyFor(sessionId, userId)
  return (db.plannedVisas && db.plannedVisas[key]) ? db.plannedVisas[key] : null
}

export function setPlannedVisa(sessionId: string, v: any, userId?: string) {
  if (USING_PRISMA) return prisma.plannedVisa.upsert({ where: { key: keyFor(sessionId, userId) }, update: { data: v, savedAt: new Date() }, create: { key: keyFor(sessionId, userId), data: v } })
  const db = readDB()
  db.plannedVisas = db.plannedVisas || {}
  const key = keyFor(sessionId, userId)
  db.plannedVisas[key] = { ...(v || {}), savedAt: new Date().toISOString() }
  writeDB(db)
  return db.plannedVisas[key]
}

export function clearPlannedVisa(sessionId = 'global', userId?: string) {
  if (USING_PRISMA) return prisma.plannedVisa.deleteMany({ where: { key: keyFor(sessionId, userId) } })
  const db = readDB()
  if (!db.plannedVisas) return { ok: true }
  const key = keyFor(sessionId, userId)
  delete db.plannedVisas[key]
  writeDB(db)
  return { ok: true }
}

export function migratePlannedVisa(sessionId: string, userId: string) {
  if (USING_PRISMA) {
    const fromKey = keyFor(sessionId, undefined)
    const toKey = keyFor(undefined, userId)
    return (async () => {
      const from = await prisma.plannedVisa.findUnique({ where: { key: fromKey } })
      if (!from) return { ok: true, migrated: false }
      await prisma.plannedVisa.delete({ where: { key: fromKey } })
      const created = await prisma.plannedVisa.create({ data: { key: toKey, data: from.data } })
      return { ok: true, migrated: true, data: created }
    })()
  }
  const db = readDB()
  if (!db.plannedVisas) return { ok: true }
  const from = keyFor(sessionId, undefined)
  const to = keyFor(undefined, userId)
  if (!db.plannedVisas[from]) return { ok: true, migrated: false }
  db.plannedVisas[to] = db.plannedVisas[from]
  db.plannedVisas[to].migratedAt = new Date().toISOString()
  delete db.plannedVisas[from]
  writeDB(db)
  return { ok: true, migrated: true, data: db.plannedVisas[to] }
}

// --- Saved jobs per user ---
export function getSavedJobsForUser(userId: string) {
  if (USING_PRISMA) return prisma.savedJob.findMany({ where: { userId } })
  const db = readDB()
  db.savedJobs = db.savedJobs || {}
  return db.savedJobs[userId] || []
}

export function setSavedJobsForUser(userId: string, jobs: any[]) {
  if (USING_PRISMA) {
    // replace existing saved jobs for user
    return (async () => {
      await prisma.savedJob.deleteMany({ where: { userId } })
      const created = []
      for (const j of (jobs || [])) {
        const c = await prisma.savedJob.create({ data: { userId, jobType: j.jobType || '', payload: j } })
        created.push(c)
      }
      return created
    })()
  }
  const db = readDB()
  db.savedJobs = db.savedJobs || {}
  db.savedJobs[userId] = jobs || []
  writeDB(db)
  return db.savedJobs[userId]
}

export function addSavedJobForUser(userId: string, job: any) {
  if (USING_PRISMA) return prisma.savedJob.create({ data: { userId, jobType: job.jobType || '', payload: job } })
  const db = readDB()
  db.savedJobs = db.savedJobs || {}
  const list = db.savedJobs[userId] || []
  const exists = list.find((j: any) => j.jobType === job.jobType)
  if (!exists) list.push(job)
  db.savedJobs[userId] = list
  writeDB(db)
  return db.savedJobs[userId]
}

export function removeSavedJobForUser(userId: string, jobType: string) {
  if (USING_PRISMA) return prisma.savedJob.deleteMany({ where: { userId, jobType } })
  const db = readDB()
  db.savedJobs = db.savedJobs || {}
  const list = db.savedJobs[userId] || []
  db.savedJobs[userId] = list.filter((j: any) => j.jobType !== jobType)
  writeDB(db)
  return db.savedJobs[userId]
}

// Token revocation (simple blacklist stored in db.json)
export function addRevokedToken(token: string) {
  if (USING_PRISMA) return prisma.revokedToken.create({ data: { token } })
  const db = readDB()
  db.revokedTokens = db.revokedTokens || []
  if (!db.revokedTokens.includes(token)) db.revokedTokens.push(token)
  writeDB(db)
  return { ok: true }
}

export function isTokenRevoked(token: string) {
  if (USING_PRISMA) return prisma.revokedToken.findUnique({ where: { token } }).then((r: any) => !!r)
  const db = readDB()
  db.revokedTokens = db.revokedTokens || []
  return db.revokedTokens.includes(token)
}

// Simple CMS storage for editable content (visas, phases, details)
const CMS_FILE = path.join(DATA_DIR, 'cms.json')

function ensureCMS() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
  if (!fs.existsSync(CMS_FILE)) fs.writeFileSync(CMS_FILE, JSON.stringify({ visas: null, phases: null, updatedAt: null }, null, 2), 'utf-8')
}

function readCMS() {
  ensureCMS()
  try {
    const raw = fs.readFileSync(CMS_FILE, 'utf-8')
    return JSON.parse(raw)
  } catch (e) {
    const init = { visas: null, phases: null, updatedAt: null }
    fs.writeFileSync(CMS_FILE, JSON.stringify(init, null, 2), 'utf-8')
    return init
  }
}

function writeCMS(obj: any) {
  ensureCMS()
  fs.writeFileSync(CMS_FILE, JSON.stringify(obj, null, 2), 'utf-8')
}

export function getCMSContent() {
  return readCMS()
}

export function setCMSContent(content: any) {
  const now = new Date().toISOString()
  const toSave = { ...(content || {}), updatedAt: now }
  // create a timestamped backup before overwriting
  try {
    ensureCMS()
    const bakName = CMS_FILE + '.bak-' + Date.now().toString(36)
    if (fs.existsSync(CMS_FILE)) fs.copyFileSync(CMS_FILE, bakName)
  } catch (e) {
    // ignore backup errors
  }
  writeCMS(toSave)
  return toSave
}

// --- User store (file-backed) ---
const USERS_FILE = path.join(DATA_DIR, 'users.json')

function ensureUsers() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
  if (!fs.existsSync(USERS_FILE)) fs.writeFileSync(USERS_FILE, JSON.stringify({ users: [] }, null, 2), 'utf-8')
}

function readUsers() {
  ensureUsers()
  try {
    const raw = fs.readFileSync(USERS_FILE, 'utf-8')
    return JSON.parse(raw)
  } catch (e) {
    const init = { users: [] }
    fs.writeFileSync(USERS_FILE, JSON.stringify(init, null, 2), 'utf-8')
    return init
  }
}

function writeUsers(obj: any) {
  ensureUsers()
  fs.writeFileSync(USERS_FILE, JSON.stringify(obj, null, 2), 'utf-8')
}

export function getAllUsers() {
  const u = readUsers()
  return u.users || []
}

export function getUserByEmail(email: string) {
  const u = readUsers()
  return (u.users || []).find((x: any) => String(x.email).toLowerCase() === String(email).toLowerCase()) || null
}

export function getUserById(id: string) {
  const u = readUsers()
  return (u.users || []).find((x: any) => String(x.id) === String(id)) || null
}

export function saveUserRecord(user: any) {
  const u = readUsers()
  u.users = u.users || []
  const idx = u.users.findIndex((x: any) => String(x.id) === String(user.id))
  if (idx === -1) u.users.push(user)
  else u.users[idx] = user
  writeUsers(u)
  return user
}

export function deleteUserById(id: string) {
  const u = readUsers()
  u.users = (u.users || []).filter((x: any) => String(x.id) !== String(id))
  writeUsers(u)
  return { ok: true }
}

export function setUserPremium(id: string, premium: boolean) {
  const u = readUsers()
  u.users = u.users || []
  const idx = u.users.findIndex((x: any) => String(x.id) === String(id))
  if (idx === -1) return null
  u.users[idx].premium = !!premium
  writeUsers(u)
  return u.users[idx]
}

export function setUserStripeCustomer(id: string, customerId: string) {
  const u = readUsers()
  u.users = u.users || []
  const idx = u.users.findIndex((x: any) => String(x.id) === String(id))
  if (idx === -1) return null
  u.users[idx].stripeCustomerId = String(customerId)
  writeUsers(u)
  return u.users[idx]
}

export function setUserSubscription(id: string, subscriptionId: string, status: string) {
  const u = readUsers()
  u.users = u.users || []
  const idx = u.users.findIndex((x: any) => String(x.id) === String(id))
  if (idx === -1) return null
  u.users[idx].stripeSubscriptionId = String(subscriptionId)
  u.users[idx].subscriptionStatus = status
  writeUsers(u)
  return u.users[idx]
}

// --- Migration Plans & Templates (file-backed if no prisma)

export function createReview(r: { userId: string; filename: string; filePath: string; note?: string; status?: string }) {
  if (USING_PRISMA) {
    // Prisma model not added for Review in schema; fallback to file-backed for now
    throw new Error('createReview not supported with Prisma in this build')
  }
  const db = readDB()
  db.reviews = db.reviews || []
  const id = db._nextId++
  const rec = { id, userId: r.userId, filename: r.filename, filePath: r.filePath, note: r.note || null, status: r.status || 'pending', createdAt: new Date().toISOString() }
  db.reviews.push(rec)
  writeDB(db)
  return rec
}

export function listReviews() {
  if (USING_PRISMA) throw new Error('listReviews not supported with Prisma in this build')
  const db = readDB()
  return db.reviews || []
}

export function getReviewById(id: number) {
  if (USING_PRISMA) throw new Error('getReviewById not supported with Prisma in this build')
  const db = readDB()
  return (db.reviews || []).find((r: any) => r.id === Number(id)) || null
}

export function createMigrationPlan(key: string, data: { userId?: string; answers?: any; generatedSteps?: any; status?: string }) {
  if (USING_PRISMA) return prisma.migrationPlan.create({ data: { key, userId: data.userId ?? null, answers: data.answers || {}, generatedSteps: data.generatedSteps || {}, status: data.status || 'draft' } })
  const db = readDB()
  db.plans = db.plans || {}
  const id = db._nextId++
  const plan = { id, key, userId: data.userId || null, answers: data.answers || {}, generatedSteps: data.generatedSteps || {}, status: data.status || 'draft', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
  db.plans[key] = plan
  writeDB(db)
  return plan
}

export function getMigrationPlanByKey(key: string) {
  if (USING_PRISMA) return prisma.migrationPlan.findUnique({ where: { key } })
  const db = readDB()
  return db.plans && db.plans[key] ? db.plans[key] : null
}

export function listMigrationPlans() {
  if (USING_PRISMA) return prisma.migrationPlan.findMany()
  const db = readDB()
  return Object.values(db.plans || {})
}

export function createTemplate(t: { name: string; description?: string; fields?: any; filePath?: string; html?: string }) {
  if (USING_PRISMA) return prisma.template.create({ data: { name: t.name, description: t.description ?? null, fields: t.fields || {} } })
  const db = readDB()
  db.templates = db.templates || {}
  const id = db._nextId++
  const rec: any = { id, name: t.name, description: t.description || null, fields: t.fields || {}, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
  if (t.filePath) rec.filePath = t.filePath
  if (t.html) rec.html = t.html
  db.templates[id] = rec
  writeDB(db)
  return rec
}

export function listTemplates() {
  if (USING_PRISMA) return prisma.template.findMany()
  const db = readDB()
  return Object.values(db.templates || {})
}

export function getTemplateById(id: number) {
  if (USING_PRISMA) return prisma.template.findUnique({ where: { id } })
  const db = readDB()
  return (db.templates || {})[id] || null
}

export function createExportRecord(payload: { planId?: number; templateId?: number; filename: string; filePath: string }) {
  if (USING_PRISMA) return prisma.generatedExport.create({ data: { planId: payload.planId ?? null, templateId: payload.templateId ?? null, filename: payload.filename, filePath: payload.filePath } })
  const db = readDB()
  db.exports = db.exports || []
  const id = db._nextId++
  const rec = { id, planId: payload.planId ?? null, templateId: payload.templateId ?? null, filename: payload.filename, filePath: payload.filePath, createdAt: new Date().toISOString() }
  db.exports.push(rec)
  writeDB(db)
  return rec
}

// no default export
