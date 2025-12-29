import express from 'express'
import * as db from '../db.js'
import { checklistCreateSchema } from '../schemas.js'

const router = express.Router()

router.get('/checklist', async (_req, res) => res.json(db.getChecklist()))

router.post('/checklist', async (req, res) => {
  const parse = checklistCreateSchema.safeParse(req.body)
  if (!parse.success) return res.status(400).json({ error: parse.error.issues })
  const item = db.createChecklist(parse.data.text, parse.data.done ?? false)
  res.json(item)
})

router.put('/checklist/:id', async (req, res) => {
  const id = Number(req.params.id)
  if (Number.isNaN(id)) return res.status(400).json({ error: 'Invalid id' })
  const parse = checklistCreateSchema.partial().safeParse(req.body)
  if (!parse.success) return res.status(400).json({ error: parse.error.issues })
  const updated = db.updateChecklist(id, parse.data as any)
  if (!updated) return res.status(404).json({ error: 'Not found' })
  res.json(updated)
})

router.delete('/checklist/:id', async (req, res) => {
  const id = Number(req.params.id)
  if (Number.isNaN(id)) return res.status(400).json({ error: 'Invalid id' })
  db.deleteChecklist(id)
  res.json({ ok: true })
})

export default router
