import { z } from 'zod'

export const assessSchema = z.object({
  age: z.number().int().optional(),
  education: z.string().optional(),
  // support legacy `ielts` field and newer `englishTest`/`englishScore`
  ielts: z.number().optional(),
  englishTest: z.enum(['pte','ielts','toefl','other']).optional(),
  englishScore: z.number().optional()
})

export const checklistCreateSchema = z.object({ text: z.string().min(1), done: z.boolean().optional() })

// Admin content schemas
export const DetailSchema = z.object({ title: z.string().min(1), note: z.string().optional() })
export const PhaseSchema = z.object({ id: z.string().optional(), title: z.string().min(1), details: z.array(DetailSchema).optional() })
export const VisaSchema = z.object({ id: z.string().optional(), title: z.string().min(1), code: z.string().min(1), desc: z.string().optional() })
export const VisaCreateSchema = z.object({ title: z.string().min(1), code: z.string().min(1), desc: z.string().optional() })
export const CMSContentSchema = z.object({ visas: z.array(VisaSchema).optional(), phases: z.array(PhaseSchema).optional() })

export type Visa = z.infer<typeof VisaSchema>
