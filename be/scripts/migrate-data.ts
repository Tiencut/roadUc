#!/usr/bin/env node
import { PrismaClient } from '@prisma/client'
import fs from 'fs/promises'
import path from 'path'

const prisma = new PrismaClient()

async function readJSON(filename: string) {
  const p = path.join(process.cwd(), 'be', 'data', filename)
  try {
    const raw = await fs.readFile(p, 'utf-8')
    return JSON.parse(raw)
  } catch (err) {
    console.warn('Could not read', p, err.message || err)
    return null
  }
}

async function run() {
  console.log('Starting data migration to Postgres via Prisma...')

  const db = await readJSON('db.json')
  const usersFile = await readJSON('users.json')

  let created = { users: 0, checklist: 0, assessments: 0, plannedVisas: 0 }

  try {
    if (usersFile && Array.isArray(usersFile.users)) {
      for (const u of usersFile.users) {
        const data: any = {
          id: u.id,
          email: u.email,
          passwordHash: u.passwordHash || null,
          role: u.role || 'user',
          premium: !!u.premium
        }
        await prisma.user.upsert({
          where: { id: data.id },
          update: data,
          create: data
        })
        created.users++
      }
      console.log(`Imported ${created.users} users`)
    }

    if (db) {
      // checklist
      if (Array.isArray(db.checklist)) {
        for (const item of db.checklist) {
          const payload: any = {
            text: item.text || item.t || '',
            done: !!item.done
          }
          if (item.createdAt) payload.createdAt = new Date(item.createdAt)
          await prisma.checklistItem.create({ data: payload })
          created.checklist++
        }
        console.log(`Imported ${created.checklist} checklist items`)
      }

      // assessments
      if (Array.isArray(db.assessments)) {
        for (const a of db.assessments) {
          const payload: any = {
            age: a.age ?? null,
            education: a.education ?? null,
            ielts: a.ielts ?? null,
            score: a.score ?? 0,
            result: a.result ?? '',
          }
          if (a.createdAt) payload.createdAt = new Date(a.createdAt)
          await prisma.assessment.create({ data: payload })
          created.assessments++
        }
        console.log(`Imported ${created.assessments} assessments`)
      }

      // plannedVisas (object keyed by key)
      if (db.plannedVisas && typeof db.plannedVisas === 'object') {
        for (const key of Object.keys(db.plannedVisas)) {
          const data = db.plannedVisas[key]
          await prisma.plannedVisa.upsert({
            where: { key },
            update: { data },
            create: { key, data }
          })
          created.plannedVisas++
        }
        console.log(`Imported ${created.plannedVisas} plannedVisas`)
      }
    }

    console.log('Data migration complete:', created)
  } catch (err) {
    console.error('Migration error', err)
  } finally {
    await prisma.$disconnect()
  }
}

run().catch((e) => {
  console.error(e)
  prisma.$disconnect()
  process.exit(1)
})
