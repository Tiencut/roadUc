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
    return JSON.parse(raw)
  } catch (e) {
    const init = { checklist: [], assessments: [], plannedVisas: {}, _nextId: 1 }
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

export function getPlannedVisa(sessionId = 'global') {
  const db = readDB()
  // migrate older single plannedVisa shape if present
  if ((db as any).plannedVisa && !(db.plannedVisas && Object.keys(db.plannedVisas).length)) {
    db.plannedVisas = { global: (db as any).plannedVisa }
    delete (db as any).plannedVisa
    writeDB(db)
  }
  return (db.plannedVisas && db.plannedVisas[sessionId]) ? db.plannedVisas[sessionId] : null
}

export function setPlannedVisa(sessionId: string, v: any) {
  const db = readDB()
  db.plannedVisas = db.plannedVisas || {}
  db.plannedVisas[sessionId] = { ...(v || {}), savedAt: new Date().toISOString() }
  writeDB(db)
  return db.plannedVisas[sessionId]
}

export function clearPlannedVisa(sessionId = 'global') {
  const db = readDB()
  if (!db.plannedVisas) return { ok: true }
  delete db.plannedVisas[sessionId]
  writeDB(db)
  return { ok: true }
}

export default null
