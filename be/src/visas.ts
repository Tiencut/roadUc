import fs from 'fs/promises'
import path from 'path'
import crypto from 'crypto'

const DATA_DIR = path.resolve(process.cwd(), 'data')
const VISAS_FILE = path.join(DATA_DIR, 'visas.json')
const META_FILE = path.join(DATA_DIR, 'visas-meta.json')

async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true })
  } catch (e) {
    // ignore
  }
}

function hashObj(obj: any) {
  const s = JSON.stringify(obj)
  return crypto.createHash('sha256').update(s).digest('hex')
}

async function readCache() {
  try {
    const [d, m] = await Promise.all([
      fs.readFile(VISAS_FILE, 'utf-8').catch(() => null),
      fs.readFile(META_FILE, 'utf-8').catch(() => null)
    ])
    const data = d ? JSON.parse(d) : null
    const meta = m ? JSON.parse(m) : null
    return { data, meta }
  } catch (e) {
    return { data: null, meta: null }
  }
}

async function writeCache(data: any, meta: any) {
  await ensureDataDir()
  await Promise.all([
    fs.writeFile(VISAS_FILE, JSON.stringify(data, null, 2), 'utf-8'),
    fs.writeFile(META_FILE, JSON.stringify(meta, null, 2), 'utf-8')
  ])
}

export async function fetchAndCacheVisas(force = false) {
  await ensureDataDir()
  const now = Date.now()
  const ttl = 1000 * 60 * 60 * 24 // 24h

  const cached = await readCache()
  if (!force && cached.meta && cached.meta.fetchedAt) {
    const age = now - new Date(cached.meta.fetchedAt).getTime()
    if (age < ttl && cached.data) {
      return { data: cached.data, meta: { ...cached.meta, source: 'cache' } }
    }
  }

  // Fetch from data.gov.au CKAN package_search
  const apiUrl = `https://data.gov.au/api/3/action/package_search?q=CRICOS&rows=200`
  const r = await fetch(apiUrl, { method: 'GET' })
  if (!r.ok) throw new Error('Upstream CKAN error: ' + r.status)
  const json = await r.json()

  let packages = (json.result?.results || [])
  // filter heuristically for 'cricos' in metadata
  packages = packages.filter((p: any) => {
    const hay = ((p.title || '') + ' ' + (p.notes || '') + ' ' + (p.name || '') + ' ' + ((p.resources || []).map((r: any) => r.name + ' ' + r.url).join(' '))).toLowerCase()
    return hay.includes('cricos') || hay.includes('cricos.edu') || hay.includes('cricos code')
  })

  const normalized = packages.map((p: any) => ({
    id: p.id,
    title: p.title,
    name: p.name,
    notes: p.notes,
    url: p.url,
    resources: (p.resources || []).map((rs: any) => ({ name: rs.name, url: rs.url, format: rs.format }))
  }))

  const meta = { fetchedAt: new Date().toISOString(), source: apiUrl, version: hashObj(normalized) }
  await writeCache({ results: normalized }, meta)
  return { data: { results: normalized }, meta: { ...meta, source: 'api' } }
}

export async function getVisasMetadata() {
  const cached = await readCache()
  if (cached.meta) return cached.meta
  return null
}
