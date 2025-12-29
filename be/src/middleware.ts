import jwt from 'jsonwebtoken'
import * as db from './db.js'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me'

export async function authenticateJWT(req: any, res: any, next: any) {
  const auth = String(req.headers['authorization'] || '')
  if (!auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing Authorization header' })
  }
  const token = auth.slice(7)
  try {
    const decoded: any = jwt.verify(token, JWT_SECRET)
    console.debug('authenticateJWT decoded token:', decoded)
    // support both file-backed and Prisma-backed isTokenRevoked (may be async)
    const revoked = await Promise.resolve(db.isTokenRevoked(token))
    if (revoked) return res.status(401).json({ error: 'Token revoked' })
    // fetch user from DB to attach full info (including premium flag)
    let user: any = null
    try { user = await Promise.resolve(db.getUserById(String(decoded.sub))) } catch (err) { console.error('db.getUserById threw in middleware:', err) }
    req.user = { id: decoded.sub, email: decoded.email, role: decoded.role, premium: (user && !!user.premium) || false }
    return next()
  } catch (e: any) {
    console.error('authenticateJWT error:', e)
    return res.status(401).json({ error: 'Invalid token' })
  }
}

export function ensureAdmin(req: any, res: any) {
  if (req.user && req.user.role === 'admin') return true
  res.status(401).json({ error: 'Unauthorized - admin access required' })
  return false
}

export function requirePremium(req: any, res: any, next: any) {
  if (req.user && req.user.premium) return next()
  return res.status(402).json({ error: 'Payment required - upgrade to premium to access this feature' })
}
