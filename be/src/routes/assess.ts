import express from 'express'
import * as db from '../db.js'
import { assessSchema } from '../schemas.js'

const router = express.Router()

router.post('/assess', async (req, res) => {
  const parse = assessSchema.safeParse(req.body)
  if (!parse.success) return res.status(400).json({ error: parse.error.issues })
  const { age, education, ielts, englishTest, englishScore } = parse.data
  let score = 0
  if (age && age < 35) score += 2
  if (education === 'bachelor') score += 1
  else if (education === 'master') score += 2

  function convertToIelts(scoreNum: number | undefined, test?: string) {
    if (!scoreNum || scoreNum <= 0) return 0
    const s = Number(scoreNum)
    if (test === 'pte') {
      if (s >= 79) return 8
      if (s >= 65) return 6.5
      if (s >= 50) return 5
      return 4
    }
    if (test === 'toefl') {
      if (s >= 110) return 8
      if (s >= 95) return 7
      if (s >= 80) return 6
      return 4
    }
    return s
  }

  const effectiveIelts = englishScore ? convertToIelts(englishScore, englishTest) : (ielts ?? 0)
  if (effectiveIelts && effectiveIelts >= 6.5) score += 2
  const result = score >= 5 ? 'Cao' : score >= 3 ? 'Trung bình' : 'Thấp'
  const saved = db.createAssessment({ age: age ?? undefined, education: education ?? undefined, ielts: effectiveIelts ?? undefined, englishTest: englishTest ?? undefined, englishScore: englishScore ?? undefined, score, result })
  res.json({ score, result, id: saved.id })
})

export default router
