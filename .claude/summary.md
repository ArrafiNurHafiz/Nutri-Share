# Session Summary: NutriShare Current State

## Tech Stack (Current)

- **Backend:** Python 3.12+ + FastAPI + SQLModel + Supabase PostgreSQL (asyncpg)
- **Frontend:** React 19 + Vite 6 + Tailwind v4 + react-router-dom v7
- **Auth:** JWT HTTP-only cookies (PyJWT + bcrypt)
- **Database:** Supabase PostgreSQL (tests use in-memory SQLite via aiosqlite)

## Commands

| Command                                                   | Action                         |
| --------------------------------------------------------- | ------------------------------ |
| `./nutrishare.sh`                                         | Interactive management menu    |
| `.venv/bin/uvicorn backend.main:app --reload --port 3000` | Backend dev                    |
| `cd frontend && npm run dev`                              | Frontend dev (Vite, port 5173) |
| `.venv/bin/pytest backend/tests/`                         | Backend tests                  |
| `cd frontend && npm run lint`                             | TypeScript type checking       |

## Structure

```
backend/        FastAPI Python backend
  routers/      10 API endpoint modules
  services/     TOPSIS, notifications, gamification
  tests/        Pytest tests
frontend/       React SPA
  src/pages/    10 route pages
  src/components/ 12 reusable components
```

## E2E Tests

- Playwright E2E tests in `tests/` directory
- 52 tests covering API, auth, donations, pages
