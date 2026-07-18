# Rochus — Summer Pop-Up Bar

QR table ordering: guests scan a table code, order from the menu, pay **cash on delivery**. Staff see live tickets at `/bar`.

## Quick start

```bash
npm install
cp .env.example .env   # optional
npm start
```

Open:
- Menu: http://localhost:3000/?t=1
- Staff bar: http://localhost:3000/bar (default PIN `2468`)
- Print QR sheets: http://localhost:3000/qr

## Environment

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | HTTP port |
| `STAFF_PIN` | `2468` | Staff login for `/bar` and `/qr` |
| `TABLE_COUNT` | `20` | Tables `1…N` for QR codes |
| `PUBLIC_URL` | `http://localhost:PORT` | Base URL encoded in QR codes |
| `DATA_DIR` | `./data` | SQLite directory (use `/data` on Railway) |

## Railway

1. Create a service from this repo.
2. Add a volume mounted at `/data`.
3. Set variables: `STAFF_PIN`, `PUBLIC_URL` (your Railway domain), `TABLE_COUNT`, `DATA_DIR=/data`.
4. Deploy, open `/qr`, print cards, put one on each table.
