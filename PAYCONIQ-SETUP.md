# Payconiq / Bancontact Pro — setup guide

Guests pay in the app they already have (**Payconiq by Bancontact**). The tech
behind it is the **Bancontact Pro Payment V3 API** — Payconiq and Bancontact
merged into one company, and since May 2026 the Payconiq brand and URLs are
retired on the merchant side. Same app for the guest, new name for us.

**The golden rule built into Rochus:** a Bancontact order only reaches the bar
*after* the payment is confirmed. Until then it is an invisible
`awaiting_payment` hold. Cash orders still go straight to the bar and are
settled at the table. So: **client pays first → then we prepare the drinks.**

```
Guest confirms order (Bancontact)
  → order saved as awaiting_payment (bar sees nothing)
  → payment created for the exact total (guest can't change the amount)
  → guest pays via deeplink or QR
  → Bancontact webhook (signed) says SUCCEEDED
  → order flips to "new" → ticket pops up at the bar 🍹
```

---

## Step 1 — Get a Bancontact Pro contract

1. Register as a merchant for the **integrated solution** (own integration via
   the Payment API): <https://www.bancontact.com/en/professional/start/integrated-solution>
2. Questions / help with the application: call **+32 2 793 01 43** (office hours).
3. You'll receive a contract and a welcome e-mail for the merchant portal.
   Your login is the e-mail address on the contract.
4. Optional but recommended: ask for **pre-production (test) access** via
   **devsupport@bancontact.com** so you can do a dry run without real money.

## Step 2 — Get your API key

1. Log in at <https://portal.bancontactpro.com>
   (set a password via the welcome e-mail or "Forgotten password").
2. Go to **Settings** → you'll find your **API Key** and **Company ID**.
   Alternatively: **Shops and products** → pick the product → **API key
   management** → **Show API key**.
3. The payment profile must support **Payment V3 with callbacks** — if you
   don't see an API key, ask support to enable the integrated/API product.

Treat the API key like a password: it authorizes payments on your account.
Only store it in Railway environment variables, never in git.

## Step 3 — Configure the environment (Railway)

Set these variables on the Rochus service:

| Variable | Value |
|----------|-------|
| `BANCONTACT_API_KEY` | the API key from the portal |
| `BANCONTACT_CALLBACK_URL` | `https://<your-host>/api/payments/bancontact/callback` |
| `BANCONTACT_RETURN_URL` | `https://<your-host>/?paid=1` (optional — sends the guest back to the menu after paying) |
| `BANCONTACT_API_BASE` | default `https://merchant.api.bancontact.net` — only set to override |
| `BANCONTACT_JWKS_URL` | default `https://jwks.bancontact.net` — only set to override |

Notes:

- The callback URL must be **public HTTPS** and reachable from the internet
  (Railway is fine; localhost is not — for local testing use a tunnel like
  `railway`'s preview URL or ngrok).
- Without `BANCONTACT_API_KEY` the app runs fine: the Bancontact button in the
  menu is disabled with a hint, and only cash is offered. No half-configured
  states.

## Step 4 — Dry run on pre-production (recommended)

With the preprod credentials from devsupport, point the same variables at the
test environment first:

| Variable | Preprod value |
|----------|---------------|
| `BANCONTACT_API_BASE` | `https://merchant.api.preprod.bancontact.net` |
| `BANCONTACT_JWKS_URL` | `https://jwks.preprod.bancontact.net` |
| `BANCONTACT_API_KEY` | the preprod API key |

Place a test order with payment method Bancontact and check that:

1. the pay screen shows the exact total, a QR code and an "open app" button;
2. the bar dashboard (`/bar`) shows **nothing** yet;
3. after paying in the test app, the ticket appears at the bar within seconds.

Then switch the three variables back to production values.

## Step 5 — Go-live checklist

- [ ] `GET https://<your-host>/api/config` returns `"bancontactEnabled": true`
- [ ] Order one cheap item yourself and pay it for real (you can refund it
      via the portal afterwards)
- [ ] Ticket appears at the bar only after the app confirms the payment
- [ ] `/transacties` shows the order with payment method Payconiq/Bancontact
- [ ] The bar crew knows the badge difference: 💶 **cash** = collect at the
      table, 📱 **Bancontact** = already paid, just serve

---

## The safety checks (what protects you)

These are all active in the code — nothing to configure:

| Check | What it does |
|-------|--------------|
| **Pay-before-prepare** | Bancontact orders are created as `awaiting_payment`; the bar feed, SSE stream, stats and ledger all exclude them until paid. |
| **Exact amount** | The payment is created server-side for the order total. When the webhook comes in, the paid amount must match the order total or the order is *not* marked paid. |
| **Signed webhooks** | Every callback carries a detached JWS (ES256) signature. It is verified against Bancontact's published keys (JWKS), including the critical headers, the issuer and the callback-URL claim — a forged "it's paid!" request is rejected. |
| **Poll fallback** | If the webhook is delayed or lost, the guest's pay screen polls and the server double-checks the status straight from the Bancontact API. The bar still gets the ticket. |
| **Expiry** | Online payments are valid for 20 minutes. Failed/expired payments cancel the hold; the guest is told to retry or choose cash. |
| **Idempotency** | Double-taps and reloads can't create duplicate orders or double payments (`client_request_id`). |
| **No key, no promises** | Bancontact orders are refused with a clear message when the API key isn't configured; the menu button is disabled up front. |

## Troubleshooting

| Symptom | Likely cause |
|---------|--------------|
| Menu shows Bancontact greyed out | `BANCONTACT_API_KEY` or `BANCONTACT_CALLBACK_URL` not set on the service |
| "Bancontact create payment mislukt (401)" | Wrong API key, or preprod key against the production URL (or vice versa) |
| Paid, but ticket appears only after ~5 s | Webhook not arriving — check that `BANCONTACT_CALLBACK_URL` is your public host; the poll fallback is carrying you |
| Server log: "Callback afgewezen" | JWKS URL doesn't match the environment (prod key ↔ preprod JWKS), or the callback URL in the portal differs from `BANCONTACT_CALLBACK_URL` |
| Payment screen says "Betaling verlopen" | Guest waited > 20 min — they can simply re-order |

## Sources

- Developer portal: <https://docs.bancontactpro.com/> (Payment V3 API,
  callback guide, getting started)
- URL migration (Payconiq → Bancontact Pro, production since 11/05/2026):
  <https://docs.bancontactpro.com/guides/general/payloadurlupdate>
- Merchant portal & API key FAQ:
  <https://www.bancontact.com/en/faq/what-is-an-api-key-and-what-should-i-do-with-it>,
  <https://www.bancontact.com/en/faq/what-are-my-login-details-for-the-bancontact-pro-portal>
- Integrated solution signup:
  <https://www.bancontact.com/en/professional/start/integrated-solution>
- Developer support: **devsupport@bancontact.com**
