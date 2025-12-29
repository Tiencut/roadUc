import fs from 'fs'
import path from 'path'
import * as db from '../db.js'

const LOG_DIR = path.join(process.cwd(), 'logs')
const LOG_FILE = path.join(LOG_DIR, 'billing-reconcile.log')

function ensureLogDir() {
  if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true })
}

function appendLog(line: string) {
  try {
    ensureLogDir()
    fs.appendFileSync(LOG_FILE, line + '\n', 'utf-8')
  } catch (e) { console.warn('Failed to write reconcile log', e) }
}

export async function reconcileSubscriptionsOnce() {
  if (!process.env.STRIPE_SECRET_KEY) {
    appendLog(new Date().toISOString() + ' - reconcile skipped: STRIPE_SECRET_KEY not set')
    return { ok: false, reason: 'stripe-not-configured' }
  }
  try {
    const Stripe = (await import('stripe')).default
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, { apiVersion: '2022-11-15' })
    const users = db.getAllUsers() || []
    const results: any[] = []
    for (const u of users) {
      try {
        if (!u.stripeSubscriptionId) continue
        const sub = await stripe.subscriptions.retrieve(String(u.stripeSubscriptionId))
        const status = sub.status
        db.setUserSubscription(u.id, String(u.stripeSubscriptionId), status)
        const isPremium = status === 'active' || status === 'trialing'
        db.setUserPremium(u.id, !!isPremium)
        const line = `${new Date().toISOString()} - user ${u.email} sub ${u.stripeSubscriptionId} status ${status} premium ${isPremium}`
        appendLog(line)
        results.push({ userId: u.id, email: u.email, subscription: u.stripeSubscriptionId, status, premium: isPremium })
      } catch (e: any) {
        appendLog(`${new Date().toISOString()} - error reconciling user ${u.email}: ${String(e && e.message ? e.message : e)}`)
      }
    }
    return { ok: true, scanned: results.length, results }
  } catch (err: any) {
    appendLog(`${new Date().toISOString()} - reconcile failed: ${String(err && err.message ? err.message : err)}`)
    return { ok: false, error: String(err && err.message ? err.message : err) }
  }
}
