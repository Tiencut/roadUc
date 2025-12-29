import express from 'express'

const router = express.Router()

router.get('/status', (_req, res) => res.json({ ok: true, time: new Date().toISOString() }))

export default router
