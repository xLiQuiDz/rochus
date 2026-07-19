# Rochus — Summer Pop-Up Bar

QR table ordering with a live staff dashboard. Guests pay **cash on delivery**.

## Architecture

| Service | Role |
|---------|------|
| **rochus** (Node/Express) | Menu UI, order API, staff dashboard, SSE |
| **Postgres** | Orders, line items, staff sessions (transactions) |

```
Guest QR → Menu (?t=N) → Confirm modal → POST /api/orders → Postgres
                                                      ↓
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
```

- Menu: http://localhost:3000/?t=1  
- Staff: http://localhost:3000/bar  
- QR print: http://localhost:3000/qr  

## Guest flow

1. Scan table QR → menu with **Tafel N** locked  
2. Add drinks/food (+ buttons)  
3. Open cart (✦) → **Controleer bestelling**  
4. Confirmation modal → **Bevestigen & versturen**  
5. Order lands on staff dashboard  

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
