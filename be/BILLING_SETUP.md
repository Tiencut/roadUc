# Billing / Stripe Setup

This document explains how to configure Stripe for local/dev or production use.

Required environment variables (in `.env` or deployment config):

- STRIPE_SECRET_KEY: Your Stripe secret key (sk_test_... for development)
- STRIPE_WEBHOOK_SECRET: (optional) the webhook signing secret for `/api/billing/webhook` if you want signature verification
- STRIPE_PRICE_ID_MONTHLY or STRIPE_PRICE_ID: (optional) a price id created in Stripe for your subscription; if not provided, you can create one via the admin API endpoint `/api/billing/create-product` and it will be stored in CMS for fallback
- USE_PDF: set to `true` to enable server-side PDF generation via `puppeteer` (optional)

Dev notes:
- You can create a test product & recurring price by calling the admin-only endpoint (authenticate as admin):
  - POST /api/billing/create-product { name?: string, amount?: number }
  - Response includes price.id which will be saved to CMS as `billing.priceIdMonthly` and used by checkout if environment variable is not set.

- To test webhooks locally with Stripe CLI:
  1. Start your local dev server (PORT=3000)
  2. In another terminal run: `stripe listen --forward-to localhost:3000/api/billing/webhook --print-secret`
  3. Copy the printed webhook secret into `STRIPE_WEBHOOK_SECRET` env var; webhook handler will verify signatures when present.

- The checkout flow uses `metadata.userId` to associate sessions with local users and sets premium flag on `checkout.session.completed` webhook.

Security note:
- Keep `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` private. Use production keys in production and test keys in development.
