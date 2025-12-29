# Billing (Stripe) — Local setup

This document describes how to configure and test the Stripe billing integration for the backend service.

Required environment variables (do NOT commit):

- `STRIPE_SECRET_KEY` — your Stripe secret key (test keys start with `sk_test_...`).
- `STRIPE_WEBHOOK_SECRET` — (optional for local testing) webhook signing secret from Stripe CLI when forwarding events.
- `STRIPE_PRICE_ID_MONTHLY` or `STRIPE_PRICE_ID` — price id for the subscription product.

Installation

```powershell
cd be
npm install
```

Run server (dev):

```powershell
npm run dev
```

Build + run production (compiled):

```powershell
npm run build
node dist/index.js
```

Testing webhooks locally (Stripe CLI)

1. Install Stripe CLI (https://stripe.com/docs/stripe-cli).
2. In a terminal, run:

```powershell
stripe listen --forward-to http://localhost:3000/api/billing/webhook
```

3. Stripe CLI will print a `Webhook signing secret` — copy it and set `STRIPE_WEBHOOK_SECRET` in your env.
4. Trigger test events:

```powershell
stripe trigger checkout.session.completed
stripe trigger customer.subscription.updated
```

Notes

- The webhook endpoint expects raw request body for signature verification. The server captures raw body for `/api/billing/webhook` before the JSON body parser.
- Webhook signature verification is enabled when `STRIPE_WEBHOOK_SECRET` is set. For local testing you can forward events without verification, but enable verification in production.
- Admin endpoints exist to list and cancel subscriptions: `GET /api/admin/subscriptions`, `POST /api/admin/subscriptions/:subscriptionId/cancel`.
