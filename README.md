# NutriShare

Platform distribusi surplus pangan yang menghubungkan donor (hotel/restoran/kafe) dengan penerima terverifikasi (panti asuhan/rumah singgah/panti lansia) di Yogyakarta.

## Tech Stack

- **Frontend:** React 19 + Vite 6 + Tailwind v4
- **Backend:** Express + SQLite (better-sqlite3)
- **Auth:** JWT HTTP-only cookies
- **Ranking:** Hybrid Entropy-TOPSIS

## Setup

```bash
cp .env.example .env
# Edit JWT_SECRET dan ADMIN_SECRET_KEY

npm install
npm run dev
```

## First Admin

```bash
curl -X POST http://localhost:3000/api/auth/register/admin \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin","email":"admin@email.com","password":"rahasia","admin_key":"<isi dari .env>"}'
```

## Perintah

| Perintah | Keterangan |
|----------|-----------|
| `npm run dev` | Development (Vite HMR + Express) |
| `npm run build` | Build frontend + bundle server |
| `npm start` | Jalankan production |
| `npm run lint` | TypeScript type checking |

## Struktur

```
server/        Express backend (routes, db, auth, topsis, upload)
src/           React frontend (pages, components, contexts, lib)
data/          SQLite database (runtime, gitignored)
```
