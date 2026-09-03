# NutriShare

Platform distribusi surplus pangan yang menghubungkan donor (hotel/restoran/kafe) dengan penerima terverifikasi (panti asuhan/rumah singgah/panti lansia) di Yogyakarta, Indonesia. Menggunakan Hybrid Entropy-TOPSIS untuk menentukan peringkat penerima per donasi.

## Tech Stack

- **Frontend:** React 19 + Vite 6 + Tailwind v4
- **Backend:** Python 3.12+ + FastAPI + SQLModel + Supabase PostgreSQL
- **Auth:** JWT HTTP-only cookies
- **Ranking:** Hybrid Entropy-TOPSIS (numpy)

## Setup

```bash
# Backend
python -m venv .venv
.venv/bin/pip install -r requirements.txt
cp .env.example .env
# Edit DATABASE_URL, JWT_SECRET, ADMIN_SECRET_KEY

# Frontend
cd frontend
npm install

# Jalankan
./nutrishare.sh
```

## First Admin

```bash
curl -X POST http://localhost:3000/api/auth/register/admin \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin","email":"admin@email.com","password":"rahasia","admin_key":"<isi dari .env>"}'
```

## Commands

| Perintah                                                  | Keterangan                        |
| --------------------------------------------------------- | --------------------------------- |
| `./nutrishare.sh`                                         | Menu interaktif (start/stop/test) |
| `.venv/bin/uvicorn backend.main:app --reload --port 3000` | Backend dev server                |
| `cd frontend && npm run dev`                              | Frontend Vite dev server          |
| `.venv/bin/pytest backend/tests/`                         | Backend tests                     |
| `cd frontend && npm run lint`                             | TypeScript type checking          |

## Structure

```
backend/        FastAPI Python backend (routers, models, services, tests)
frontend/       React SPA (pages, components, contexts, hooks)
data/           Database data (gitignored)
docs/           Documentation and PRDs
```
