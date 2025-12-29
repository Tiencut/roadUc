import express from 'express'
import cors from 'cors'
import bcrypt from 'bcrypt'
import * as db from './db.js' 
import config from './config.js' 
import statusRouter from './routes/status.js' 
import schoolsRouter from './routes/schools.js' 
import assessRouter from './routes/assess.js' 
import visasRouter from './routes/visas.js' 
import plannedVisaRouter from './routes/planned-visa.js' 
import authRouter from './routes/auth.js' 
import checklistRouter from './routes/checklist.js' 
import savedJobsRouter from './routes/saved-jobs.js' 
import adminRouter from './routes/admin.js' 
import premiumRouter from './routes/premium.js' 
import billingRouter from './routes/billing.js' 
import plansRouter from './routes/plans.js' 
import templatesRouter from './routes/templates.js' 
import analyticsRouter from './routes/analytics.js' 
import reviewsRouter from './routes/reviews.js' 
import { reconcileSubscriptionsOnce } from './jobs/reconcile.js' 

const app = express()
const port = Number(process.env.PORT || 3000)

// Validate config in non-dev and use secret
config.validateConfig()
const JWT_SECRET = config.JWT_SECRET

// Create default admin if no users exist
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

ensureDefaultAdmin().catch(() => {})

// Seed default templates for auto-fill (student, skilled, visitor)
async function ensureDefaultTemplates() {
  try {
    const list = db.listTemplates()
    if (list && list.length > 0) return
    const templates = [
      { name: 'Student visa application', description: 'Student visa basic fields', fields: { fullName: 'Full name', dob: 'Date of birth', passport: 'Passport number', institution: 'Institution' } },
      { name: 'Skilled visa application', description: 'Skilled visa basic fields', fields: { fullName: 'Full name', occupation: 'Occupation', experienceYears: 'Years of experience', passport: 'Passport number' } },
      { name: 'Visitor visa application', description: 'Visitor visa basic fields', fields: { fullName: 'Full name', travelDates: 'Travel dates', passport: 'Passport number', purpose: 'Purpose of visit' } }
    ]
    for (const t of templates) { db.createTemplate(t) }
    console.log('Seeded default templates')
  } catch (e) { console.warn('ensureDefaultTemplates failed', String(e)) }
}

ensureDefaultTemplates().catch(() => {})

app.use(cors())
// Capture raw body for Stripe webhook before JSON body parser
app.use((req, res, next) => {
  try {
    if (req.path === '/api/billing/webhook') {
      let data = ''
      req.setEncoding && req.setEncoding('utf8')
      req.on('data', (chunk: any) => { data += chunk })
      req.on('end', () => { ;(req as any).rawBody = data; next() })
    } else next()
  } catch (e) { next() }
})
app.use(express.json())

// Small routers to keep entry file compact
const api = express.Router()


// Schools proxy moved to `routes/schools.ts`
// status, schools and assess moved to their own routers
api.use(statusRouter)
api.use(schoolsRouter)

// Visas routes moved to routes/visas.ts
api.use(authRouter)
api.use(checklistRouter)
api.use(visasRouter)
api.use(plannedVisaRouter)
api.use(savedJobsRouter)
api.use(adminRouter)
api.use(premiumRouter)
api.use(billingRouter)
api.use(plansRouter)
api.use(templatesRouter)
api.use(analyticsRouter)
api.use(reviewsRouter)

// Assess
api.use(assessRouter)



app.use('/api', api)

// Serve generated data files (exports, etc.)
import path from 'path'
app.use('/data', express.static(path.join(process.cwd(), 'data')))

app.listen(port, () => {
  console.log(`Server running: http://localhost:${port}`)
  // start periodic reconcile job if stripe configured
  try {
    const interval = Number(process.env.RECONCILE_INTERVAL_MS || 60 * 60 * 1000) // default 1 hour
    if (process.env.STRIPE_SECRET_KEY) {
      // run once on startup
      ;(async () => { try { await reconcileSubscriptionsOnce() } catch (e) { console.warn('initial reconcile failed', e) } })()
      setInterval(() => { reconcileSubscriptionsOnce().catch((e) => console.warn('reconcile error', e)) }, interval)
      console.log('Started reconcile job, interval ms=', interval)
    }
  } catch (e) { console.warn('Failed to start reconcile job', e) }
})

process.on('SIGINT', async () => {
  process.exit(0)
})

