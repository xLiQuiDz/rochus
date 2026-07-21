# Rochus — Summer Pop-Up Bar

QR table ordering with a live staff dashboard. Guests pay **cash bij levering** of **Bancontact Pro** (Payment V3 — order gaat pas naar de bar ná bevestigde betaling).

## Architecture

| Service | Role |
|---------|------|
| **rochus** (Node/Express) | Menu UI, order API, staff dashboard, SSE |
| **Postgres** | Orders, line items, staff sessions (transactions) |
| **Bancontact Pro** | Payment V3 create + JWS webhook |

```
Guest QR → Menu (?t=N) → Confirm
  cash ──────► POST /api/orders → status new → bar SSE
  Bancontact ► POST /api/orders → awaiting_payment
                 → Bancontact create payment (exact amount)
                 → guest pays (QR / deeplink)
                 → webhook SUCCEEDED → status new → bar SSE
```

## Local development

```bash
npm install
# Point DATABASE_URL at a local or Railway Postgres instance
export DATABASE_URL=postgresql://...
export STAFF_PIN=4321
export TABLE_COUNT=30
export PUBLIC_URL=http://localhost:3000
npm start
npm test   # catalog & pricing unit tests (no DB needed)
```

- Menu: http://localhost:3000/?t=1
- Staff: http://localhost:3000/bar
- Transacties & cijfers: http://localhost:3000/transacties
- Menukaart printen: http://localhost:3000/print
- QR print: http://localhost:3000/qr

## Guest flow

1. Scan table QR → menu with **Tafel N** locked
2. Add drinks/food (+ buttons) — of trek aan de 🎰 drankautomaat als je het niet weet
3. Open cart (🛒) → **Controleer bestelling** (optioneel: 🎡 *Wie betaalt?*)
4. Confirmation modal → kies **Cash** of **Bancontact** → **Bevestigen**
   - **Cash:** order meteen naar de bar
   - **Bancontact:** betaalscherm met vast bedrag + QR/deeplink; de bar ziet
     de ticket **pas** na `SUCCEEDED` (webhook of poll-fallback)
5. Guest follows progress via the status chip
   (bij de bar → wordt gemaakt → geserveerd 🥂 met confetti)

### Playful extras

- **Water chase**: gratis water probeert te ontsnappen — 10× vangen = verdiend
- **Drankautomaat (🎰)**: gokkast met 3D-trommels en een hendel — alleen drank
  per glas (geen eten of flessen), resultaat print als kassabon. Drie op een
  rij = jackpot: muntenregen én een 🎰-notitie op de bestelling zodat de bar
  het drankje met vertoon serveert
- **Wie betaalt? (🖐️)**: iedereen legt een vinger op het scherm, het toestel
  telt af en kiest er één (verliezer betaalt óf winnaar vrijuit). In je eentje?
  Dan valt het terug op het rad met donkere-humor-kaarten.
- Easter eggs op de titel, footer en tafel-chip

## Staff dashboard (/bar)

- Tickets **oudste eerst** met live leeftijd-badge (oranje ≥ 5 min, rood ≥ 10 min)
- Nieuw ticket: chime + flash; herinnering elke minuut zolang er iets open staat
- **Ongedaan maken**-toast na Geserveerd/Annuleren (6 s)
- Betaal-badge per ticket (💶 cash innen of 📱 Bancontact — al betaald via API)
- Dagstats in de header: aantal bestellingen, omzet (incl. Payconiq-aandeel), top 3 items
- Voorraadpaneel: producten uitverkocht zetten (gasten zien het meteen)
- Menukaart printen in twee formaten: A4 tafelkaart én klemkaart 140×190 mm
  voor de houten klemborden (2 per A4 liggend, knippen op de stippellijn)
- QR-stickers per tafel

## Transacties (/transacties)

Aparte staff-pagina met periodekiezer (vandaag · gisteren · 7d · 30d · alles):

- Kerncijfers: omzet, bestellingen, gemiddeld bedrag, drukste tafel
- Grafieken: omzet per uur/dag, aandeel per betaalwijze, top producten, omzet per categorie
- Volledige transactietabel — filter op status, betaalwijze en tafel; klik een rij
  voor de losse regels en de opmerking; **CSV-export** van de zichtbare selectie

De grafieken zijn met de hand getekende SVG (geen externe library, werkt offline).
Datakleuren — amber `#c98500` en blauw `#3987e5` — zijn gevalideerd tegen het
donkere oppervlak `#15120f` op lichtheid, chroma, kleurenblindheid-scheiding en
contrast.

## API overview

| Endpoint | Auth | Purpose |
|----------|------|---------|
| `POST /api/orders` | — | Plaats bestelling (idempotent via `client_request_id`); Bancontact → `awaiting_payment` + payment links |
| `GET /api/orders/:id/status` | — | Guest volgt eigen order (status only) |
| `GET /api/orders/:id/payment` | — | Guest poll Bancontact-status (+ server fallback GET payment) |
| `POST /api/payments/bancontact/callback` | Bancontact | JWS-signed webhook → mark paid → bar SSE |
| `GET /api/menu/availability` | — | Uitverkochte items |
| `GET /api/orders?status=open` | staff | Open tickets |
| `PATCH /api/orders/:id` | staff | Status: new → preparing → served / cancelled |
| `GET /api/orders/stream` | staff | SSE live tickets + availability |
| `PATCH /api/menu/availability` | staff | Item uitverkocht / terug beschikbaar |
| `GET /api/stats/today` | staff | Dagtotalen + top items (Europe/Brussels) |
| `GET /api/transactions` | staff | Transactielijst — `range`, `status`, `payment`, `table` |
| `GET /api/analytics` | staff | Kerncijfers + reeksen per `range` voor de grafieken |
| `GET /api/menu/print` | staff | Printklare menukaart-data |
| `GET /api/qr/:table` | — | PNG QR-sticker voor tafel N |
| `GET /api/qr/payconiq.png` | — | PNG QR — `?u=` dynamische betaallink, anders legacy `PAYCONIQ_URL` |

Login is rate-limited (max 10 foute PIN-pogingen per kwartier per IP).

## Bancontact Pro setup

Volledige walkthrough (contract, API key, env-vars, go-live checklist):
**[PAYCONIQ-SETUP.md](PAYCONIQ-SETUP.md)**. Kort:

1. Accepteer de Handelaarsportaal-uitnodiging op https://portal.bancontactpro.com
2. Haal de **API key** op (Settings, of Shops and products → API key management)
3. Zet op Railway o.a.:
   - `BANCONTACT_API_KEY`
   - `BANCONTACT_CALLBACK_URL=https://<jouw-host>/api/payments/bancontact/callback`
   - optioneel `BANCONTACT_API_BASE`, `BANCONTACT_JWKS_URL`, `BANCONTACT_RETURN_URL`
4. Test eerst op preprod (`merchant.api.preprod.bancontact.net` +
   `jwks.preprod.bancontact.net`, key via devsupport@bancontact.com)

Zonder API-key weigert de app Bancontact-orders met HTTP 503 (cash blijft werken).

## Environment

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Postgres connection (required) |
| `STAFF_PIN` | Staff login PIN |
| `TABLE_COUNT` | Tables `1…N` (default 30) |
| `PUBLIC_URL` | Public base URL for QR codes |
| `PORT` | HTTP port (Railway injects this) |
| `PGSSL` | Set `true` if SSL is required for Postgres |
| `BANCONTACT_API_KEY` | Payment V3 Bearer token (required for Bancontact) |
| `BANCONTACT_API_BASE` | Default `https://merchant.api.bancontact.net` |
| `BANCONTACT_JWKS_URL` | Default `https://jwks.bancontact.net` |
| `BANCONTACT_CALLBACK_URL` | Public HTTPS webhook URL |
| `BANCONTACT_RETURN_URL` | Optional return URL after bank-app |
| `PAYCONIQ_URL` | Legacy static link (unused when API key is set) |

## Production (Railway)

- App service + Postgres plugin
- `DATABASE_URL` referenced from Postgres
- Health check: `/api/health`
