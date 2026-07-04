# NutriShare

Food surplus distribution platform connecting donors (hotels/restaurants/cafes) with verified recipients (orphanages/shelters/nursing homes) in Yogyakarta, Indonesia. Uses Hybrid Entropy-TOPSIS to rank recipients per donation.

## Tech

- **Frontend:** React 19 + Vite 6 + Tailwind v4 + react-router-dom v7 (BrowserRouter)
- **Backend:** Express + SQLite (better-sqlite3) via `tsx` runtime (dev) or esbuild bundle (prod)
- **Auth:** JWT HTTP-only cookies
- **Module system:** ESM (`"type": "module"`)
- **Animations:** `motion` library (framer-motion rebrand)

## Commands

| Command | Action |
|---------|--------|
| `npm run dev` | Start Express + Vite HMR on `0.0.0.0:3000` |
| `npm run build` | `vite build` then `esbuild server.ts` → `dist/server.cjs` |
| `npm start` | `node dist/server.cjs` (serves `dist/` as static files) |
| `npm run lint` | `tsc --noEmit` (typecheck only, no linter) |
| `npm run clean` | `rm -rf dist server.cjs` |

No test command exists. No CI pipeline.

## Structure

```
server/       Express backend (routes, db, topsis, auth, upload)
  db.ts       SQLite schema + connection
  routes.ts   All API endpoints
  auth.ts     JWT middleware
  topsis.ts   Hybrid Entropy-TOPSIS
  upload.ts   File upload
  validate.ts Zod schemas
src/          React frontend
  pages/      7 route pages
  components/ Reusable UI components
  contexts/   AuthContext
  lib/        fetch wrapper
data/         SQLite database file (gitignored)
```

## Architecture

- **Entrypoint:** `server.ts` — Express with Vite middleware (dev) or static `dist/` (prod). Binds `0.0.0.0:3000`.
- **Frontend entry:** `src/main.tsx` — `BrowserRouter` with 7 routes wrapped in `AuthProvider`.
- **API:** All endpoints under `/api` in `server/routes.ts`.
- **Database:** SQLite via `better-sqlite3`. Tables created on startup. No seed data.
- **Auth:** JWT in HTTP-only cookie. Auth middleware on all protected routes. Role-based access (`admin`, `donor`, `recipient`).
- **TOPSIS:** `server/topsis.ts` — Hybrid Entropy-TOPSIS with Shannon Entropy weighting. 5 criteria: C1 Protein Need Coverage (benefit), C2 Urgency Score (benefit), C3 Hours Remaining (benefit), C4 Distance (cost), C5 Days Since Last Donation (benefit).
- **Validation:** Zod schemas on all mutation endpoints.

## Path conventions

- `@/` maps to project root (e.g. `@/server/db.js` in tsconfig paths)
- Server-side imports use `.js` extension (e.g. `./server/routes.js`). `tsx` resolves this to `.ts`.
- Tailwind v4 uses `@tailwindcss/vite` plugin directly — no `postcss.config.js` needed.

## Env

```
JWT_SECRET=         Secret key for JWT signing
ADMIN_SECRET_KEY=   Secret key for admin registration
NODE_ENV=           "production" or "development"
```

## Routes

| Path | Page |
|------|------|
| `/` | Landing (Home.tsx) |
| `/login` | Auth.tsx |
| `/register/donor` | RegisterDonor.tsx |
| `/register/recipient` | RegisterRecipient.tsx |
| `/donor` | DonorDashboard.tsx |
| `/recipient` | RecipientDashboard.tsx |
| `/admin` | AdminDashboard.tsx |

## Styles

Custom `@theme` tokens in `src/index.css` for three font families:
- `--font-sans`: Inter (body)
- `--font-heading`: Plus Jakarta Sans (headings)
- `--font-mono`: JetBrains Mono

Color palette: dark green (#2D7A4F) + beige (#F7F4EE).

## Notes

- UI language: Indonesian throughout (labels, toasts).
- Leaflet maps use `react-leaflet`.
- First admin must be created via POST `/api/auth/register/admin` with `ADMIN_SECRET_KEY`.
