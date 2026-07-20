# Rochus — Summer Pop-Up Bar

QR table ordering with a live staff dashboard. Guests pay **cash of Bancontact/Payconiq** bij levering.

## Architecture

| Service | Role |
|---------|------|
| **rochus** (Node/Express) | Menu UI, order API, staff dashboard, SSE |
| **Postgres** | Orders, line items, staff sessions (transactions) |

```
Guest QR → Menu (?t=N) → Confirm modal → POST /api/orders → Postgres
                ↑                                     ↓
   status chip ─┴── GET /api/orders/:id/status        ↓
Staff /bar ←── SSE live tickets ←── status updates ───┘
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
2. Add drinks/food (+ buttons) — or let the 🎲 dice pick for you
3. Open cart (🛒) → **Controleer bestelling** (optioneel: 🎡 *Wie betaalt?*)
4. Confirmation modal → kies **Cash** of **Bancontact** → **Bevestigen & versturen**
   (Bancontact: betaalscherm met bedrag, app-link en QR verschijnt na versturen)
5. Order lands on staff dashboard; guest follows progress via the status chip
   (bij de bar → wordt gemaakt → geserveerd 🥂 met confetti)

### Playful extras

- **Water chase**: gratis water probeert te ontsnappen — 10× vangen = verdiend
- **Menu-roulette (🎲)**: random suggestie uit alles wat op voorraad is
- **Wie betaalt? (🖐️)**: iedereen legt een vinger op het scherm, het toestel
  telt af en kiest er één (verliezer betaalt óf winnaar vrijuit). In je eentje?
  Dan valt het terug op het rad met donkere-humor-kaarten.
- Easter eggs op de titel, footer en tafel-chip

## Staff dashboard (/bar)

- Tickets **oudste eerst** met live leeftijd-badge (oranje ≥ 5 min, rood ≥ 10 min)
- Nieuw ticket: chime + flash; herinnering elke minuut zolang er iets open staat
- **Ongedaan maken**-toast na Geserveerd/Annuleren (6 s)
- Betaal-badge per ticket (💶 cash innen of 📱 Payconiq-vinkje checken)
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
| `POST /api/orders` | — | Plaats bestelling (idempotent via `client_request_id`) |
| `GET /api/orders/:id/status` | — | Guest volgt eigen order (status only) |
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
| `GET /api/qr/payconiq.png` | — | PNG QR met de Bancontact-betaallink |

Login is rate-limited (max 10 foute PIN-pogingen per kwartier per IP).

## Environment

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Postgres connection (required) |
| `STAFF_PIN` | Staff login PIN |
| `TABLE_COUNT` | Tables `1…N` (default 30) |
| `PUBLIC_URL` | Public base URL for QR codes |
| `PORT` | HTTP port (Railway injects this) |
| `PGSSL` | Set `true` if SSL is required for Postgres |
| `PAYCONIQ_URL` | Bancontact/Payconiq betaallink voor de betaal-QR |

## Production (Railway)

- App service + Postgres plugin
- `DATABASE_URL` referenced from Postgres
- Health check: `/api/health`
