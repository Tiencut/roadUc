# Plans & Templates API (MVP)

This document describes the minimal API and data models added to support the "Personalized Migration Plan" and "Templates + Auto-fill" MVP.

## Models (Prisma)

- MigrationPlan
  - id: Int
  - key: String (unique)
  - userId: String? (nullable)
  - answers: Json
  - generatedSteps: Json
  - status: String (draft|generated|completed)
  - createdAt, updatedAt

- Template
  - id: Int
  - name: String
  - description: String?
  - fields: Json (mapping fieldKey -> label)
  - createdAt, updatedAt

- GeneratedExport
  - id: Int
  - planId: Int?
  - templateId: Int?
  - filename: String
  - filePath: String
  - createdAt

## Endpoints

- POST /api/plans
  - Body: { key?: string, userId?: string, answers: object }
  - Response: { ok: true, plan }
  - Creates a MigrationPlan and runs a naive rule-based step generator.

- GET /api/plans/:key
  - Response: { ok: true, plan }
  - Retrieve plan by key.

- POST /api/plans/:key/export
  - Response: { ok: true, export, url }
  - Generates an HTML export (stub for PDF), saves to `data/exports`, and returns URL.

- POST /api/templates
  - Body: { name, description?, fields }
  - Creates a template (admin).

- GET /api/templates
  - Lists templates.

- GET /api/templates/:id
  - Get a template by id.

- POST /api/templates/:id/generate
  - Body: { answers }
  - Applies answers to template.fields and produces an HTML export; returns URL.

## Notes
- Exports produce styled HTML files under `data/exports`. Optionally the server can generate PDF files if `USE_PDF=true` and `puppeteer` is available (launch with `--no-sandbox` in CI/containers).
- Templates seeded on server startup: Student, Skilled, Visitor (basic fields).
- Future: template upload, field mapping UI, and advanced PDF styling.
