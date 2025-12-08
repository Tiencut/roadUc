import fs from 'fs'
import path from 'path'

const DATA_DIR = path.join(process.cwd(), 'data')
const DATA_FILE = path.join(DATA_DIR, 'db.json')

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
    const init = { checklist: [], assessments: [], plannedVisas: {}, _nextId: 1 }
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
  const db = readDB()
  return db.checklist
}

export function createChecklist(text: string, done = false) {
  const db = readDB()
  const id = db._nextId++
  const item = { id, text, done: !!done, createdAt: new Date().toISOString() }
  db.checklist.push(item)
  writeDB(db)
  return item
}

export function updateChecklist(id: number, data: { text?: string; done?: boolean }) {
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
  const db = readDB()
  db.checklist = db.checklist.filter((i: any) => i.id !== id)
  writeDB(db)
  return { ok: true }
}

export function createAssessment(a: { age?: number; education?: string; ielts?: number; score: number; result: string }) {
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
  const db = readDB()
  db.plannedVisas = db.plannedVisas || {}
  const key = keyFor(sessionId, userId)
  db.plannedVisas[key] = { ...(v || {}), savedAt: new Date().toISOString() }
  writeDB(db)
  return db.plannedVisas[key]
}

export function clearPlannedVisa(sessionId = 'global', userId?: string) {
  const db = readDB()
  if (!db.plannedVisas) return { ok: true }
  const key = keyFor(sessionId, userId)
  delete db.plannedVisas[key]
  writeDB(db)
  return { ok: true }
}

export function migratePlannedVisa(sessionId: string, userId: string) {
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
  const db = readDB()
  db.savedJobs = db.savedJobs || {}
  return db.savedJobs[userId] || []
}

export function setSavedJobsForUser(userId: string, jobs: any[]) {
  const db = readDB()
  db.savedJobs = db.savedJobs || {}
  db.savedJobs[userId] = jobs || []
  writeDB(db)
  return db.savedJobs[userId]
}

export function addSavedJobForUser(userId: string, job: any) {
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
  const db = readDB()
  db.savedJobs = db.savedJobs || {}
  const list = db.savedJobs[userId] || []
  db.savedJobs[userId] = list.filter((j: any) => j.jobType !== jobType)
  writeDB(db)
  return db.savedJobs[userId]
}

// Token revocation (simple blacklist stored in db.json)
export function addRevokedToken(token: string) {
  const db = readDB()
  db.revokedTokens = db.revokedTokens || []
  if (!db.revokedTokens.includes(token)) db.revokedTokens.push(token)
  writeDB(db)
  return { ok: true }
}

export function isTokenRevoked(token: string) {
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

export default null

export default null
