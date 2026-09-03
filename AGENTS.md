# NutriShare

Platform distribusi surplus pangan yang menghubungkan donor (hotel/restoran/kafe) dengan penerima terverifikasi (panti asuhan/rumah singgah/panti lansia) di Yogyakarta.

## Tech

- **Frontend:** React 19 + Vite 6 + Tailwind v4 + react-router-dom v7 (BrowserRouter)
- **Backend:** Python 3.12+ + FastAPI + SQLModel + Supabase PostgreSQL (asyncpg)
- **Auth:** JWT HTTP-only cookies (PyJWT + bcrypt)
- **Ranking:** Hybrid Entropy-TOPSIS (numpy)
- **Module system:** ESM (frontend), Python packages (backend)
- **Animations:** `motion` library (framer-motion rebrand)

## Commands

| Command                                                   | Action                                  |
| --------------------------------------------------------- | --------------------------------------- |
| `cd frontend && npm run dev`                              | Start Vite dev server on `0.0.0.0:5173` |
| `.venv/bin/uvicorn backend.main:app --reload --port 3000` | Start FastAPI backend                   |
| `./nutrishare.sh`                                         | Interactive menu (start/stop/test)      |
| `.venv/bin/pytest backend/tests/`                         | Run backend tests                       |
| `cd frontend && npm run lint`                             | TypeScript type checking                |

No CI pipeline configured.

## Structure

```
backend/           FastAPI Python backend
  main.py          App entrypoint, middleware, error handlers
  config.py        pydantic-settings (env vars)
  database.py      SQLModel engine, sessions, WAL pragmas
  models.py        9 ORM models
  schemas.py       Pydantic request/response schemas
  auth.py          JWT, bcrypt, cookie helpers
  routers/         10 API endpoint modules
  services/        TOPSIS, notifications, gamification
  utils/           Logger, rate limiter, file upload
  tests/           Pytest unit + contract + blackbox tests

frontend/          React SPA
  src/             Components, pages, hooks, contexts
  public/          Static assets, images
  vite.config.ts   Vite config with proxy to backend

data/              SQLite/PostgreSQL data (gitignored)
docs/              Documentation and PRDs
```

## Architecture

- **Backend entrypoint:** `backend/main.py` — FastAPI app on `0.0.0.0:3000`
- **Frontend entrypoint:** `frontend/src/main.tsx` — BrowserRouter with routes in AuthProvider
- **API:** All endpoints under `/api` via FastAPI routers
- **Database:** Supabase PostgreSQL via asyncpg (SQLModel ORM)
- **Auth:** JWT in HTTP-only cookie. Role-based access (admin, donor, recipient).
- **TOPSIS:** Hybrid Entropy-TOPSIS with Shannon Entropy weighting

## Path conventions

- `@/` maps to frontend root (e.g. `@/components/Button`)
- Backend uses Python module imports (`from backend.routers import auth`)
- Tailwind v4 uses `@tailwindcss/vite` plugin — no postcss.config.js needed
- Vite proxies `/api` and `/uploads` to backend on port 3000

## Env

```
DATABASE_URL=       Supabase PostgreSQL connection string
JWT_SECRET=         Secret key for JWT signing (min 32 chars)
ADMIN_SECRET_KEY=   Secret key for admin registration
SUPABASE_URL=       Supabase project URL
SUPABASE_ANON_KEY=  Supabase anonymous key
SUPABASE_SERVICE_KEY= Supabase service role key (for file uploads)
```

## Routes

| Path                  | Page                   |
| --------------------- | ---------------------- |
| `/`                   | Landing (Home.tsx)     |
| `/login`              | Auth.tsx               |
| `/register/donor`     | RegisterDonor.tsx      |
| `/register/recipient` | RegisterRecipient.tsx  |
| `/donor`              | DonorDashboard.tsx     |
| `/recipient`          | RecipientDashboard.tsx |
| `/admin`              | AdminDashboard.tsx     |

## Styles

Custom `@theme` tokens in `frontend/src/index.css` for three font families:

- `--font-sans`: Inter (body)
- `--font-heading`: Space Grotesk (headings)
- `--font-mono`: JetBrains Mono (data)

Color palette: Natural green (#047857) + warm gold accent (#d4893b) + warm neutrals.
Dark mode via CSS variable overrides.

## Notes

- UI language: Indonesian throughout (labels, toasts).
- Leaflet maps for donor/recipient locations.
- First admin must be created via POST `/api/auth/register/admin` with `ADMIN_SECRET_KEY`.
