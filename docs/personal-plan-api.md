# API Spec - Personalized Migration Plan (MVP)

## Endpoints

POST /api/plans
- Body: { key?: string, userId?: string, answers: object }
- Response: { ok: true, plan }
- Behavior: generate plan (rules-based) from answers, save as MigrationPlan

GET /api/plans/:key
- Response: { ok: true, plan }

POST /api/plans/:key/export
- Body: { format?: 'html' | 'pdf' } (pdf is future; current MVP returns HTML export URL)
- Response: { ok: true, export: { filename, filePath }, url }

POST /api/templates
- Body: { name: string, description?: string, fields: object }
- Response: { ok: true, template }

GET /api/templates
- Response: { ok: true, templates: [] }

GET /api/templates/:id
- Response: { ok: true, template }

## DB Models (draft)
- MigrationPlan: id, key, userId, answers(Json), generatedSteps(Json), status, timestamps
- Template: id, name, description, fields(Json), timestamps
- GeneratedExport: id, planId, templateId, filename, filePath, createdAt

Notes:
- Export to PDF will be implemented after HTML export. For production, use server-side PDF generator (puppeteer/headless-chrome).
- Templates for auto-fill will store a "fields" schema to map profile keys to template placeholders.
