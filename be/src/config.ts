import dotenv from 'dotenv'
import path from 'path'

// Load .env in development
dotenv.config({ path: path.join(process.cwd(), 'be', '.env') })

function required(name: string, allowEmpty = false): string {
  const v = process.env[name]
  if (v === undefined || (!allowEmpty && v === '')) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return v as string
}

export const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me'
export const DATABASE_URL = process.env.DATABASE_URL || null
export const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || null
export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || null
export const RECONCILE_INTERVAL_MS = Number(process.env.RECONCILE_INTERVAL_MS || 60 * 60 * 1000)

// call at startup to validate required secrets in production
export function validateConfig() {
  if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
    // allow missing secrets in development
    return
  }
  // in non-dev require JWT_SECRET and DATABASE_URL
  required('JWT_SECRET')
  required('DATABASE_URL')
}

export default { JWT_SECRET, DATABASE_URL, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, RECONCILE_INTERVAL_MS, validateConfig }
