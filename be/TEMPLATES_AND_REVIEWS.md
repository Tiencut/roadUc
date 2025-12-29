# Templates Upload & Document Review (MVP)

This document summarizes the new endpoints and expected usage.

## Templates upload (admin)
- POST /api/templates/upload (admin)
  - Body: { name, description?, html, fields? }
  - Saves HTML to `data/templates/template-<ts>.html`, auto-detects placeholders `{{field}}`, and creates a template record.
  - Template fields stored as key->label mapping.

- POST /api/templates/:id/generate (premium)
  - Body: { answers }
  - If template has stored HTML file, placeholders will be replaced and an export generated.

## Document review (authenticated)
- POST /api/reviews
  - Body: { filename, fileBase64, note? }
  - Stores uploaded file under `data/reviews` and creates review record with status `pending`.

- GET /api/reviews (admin)
  - List reviews
- GET /api/reviews/:id (admin)
  - Get review details

- POST /api/reviews/checkout (authenticated)
  - Create a Stripe Checkout session for a single review credit (price id: STRIPE_PRICE_REVIEW or CMS `cms.reviews.priceId`)

## Notes
- All generated exports are saved under `data/exports` and served at `/data/exports/...`.
- Analytics events are logged into `logs/analytics.log`.
