# Rochus — Summer Pop-Up Bar

QR table ordering with a live staff dashboard. Guests pay **cash on delivery**.

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
- Menukaart printen: http://localhost:3000/print
- QR print: http://localhost:3000/qr

## Guest flow

1. Scan table QR → menu with **Tafel N** locked
2. Add drinks/food (+ buttons) — or let the 🎲 dice pick for you
3. Open cart (🛒) → **Controleer bestelling** (optioneel: 🎡 *Wie betaalt?*)
4. Confirmation modal → **Bevestigen & versturen**
5. Order lands on staff dashboard; guest follows progress via the status chip
   (bij de bar → wordt gemaakt → geserveerd 🥂 met confetti)

### Playful extras

- **Water chase**: gratis water probeert te ontsnappen — 10× vangen = verdiend
- **Menu-roulette (🎲)**: random suggestie uit alles wat op voorraad is
- **Wie betaalt? (🎡)**: het rad wijst een betaler aan, geen discussie
- Easter eggs op de titel, footer en tafel-chip

## Staff dashboard (/bar)

- Tickets **oudste eerst** met live leeftijd-badge (oranje ≥ 5 min, rood ≥ 10 min)
- Nieuw ticket: chime + flash; herinnering elke minuut zolang er iets open staat
- **Ongedaan maken**-toast na Geserveerd/Annuleren (6 s)
- Dagstats in de header: aantal bestellingen, omzet, top 3 items
- Voorraadpaneel: producten uitverkocht zetten (gasten zien het meteen)
- Menukaart printen in twee formaten: A4 tafelkaart én klemkaart 140×190 mm
  voor de houten klemborden (2 per A4 liggend, knippen op de stippellijn)
- QR-stickers per tafel

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
| `GET /api/menu/print` | staff | Printklare menukaart-data |
| `GET /api/qr/:table` | — | PNG QR-sticker voor tafel N |

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

## Production (Railway)

- App service + Postgres plugin
- `DATABASE_URL` referenced from Postgres
- Health check: `/api/health`
