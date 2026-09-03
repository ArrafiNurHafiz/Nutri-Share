# NutriShare

Platform donasi makanan — TOPSIS allocation, reviews, notifications, admin dashboard.

## Tech Stack

- **Backend**: Python 3.12+, FastAPI, SQLModel, asyncpg
- **Frontend**: React 19, TypeScript, Vite, TailwindCSS
- **Testing**: Pytest (backend), Playwright (E2E)
- **Database**: Supabase PostgreSQL (tests use in-memory SQLite via aiosqlite)

## Project Structure

```
nutrishare/
├── backend/                    # 🐍 Python API
│   ├── main.py                # FastAPI app, middleware, error handlers
│   ├── config.py              # pydantic-settings (env vars)
│   ├── database.py            # SQLModel engine, sessions, WAL pragmas
│   ├── models.py              # 9 ORM models (users, donations, etc.)
│   ├── schemas.py             # Pydantic request/response schemas
│   ├── auth.py                # JWT, bcrypt, cookie helpers, deps
│   ├── dependencies.py        # FastAPI Depends helpers
│   ├── routers/               # 10 API endpoint modules
│   ├── services/              # TOPSIS, SSE notifications, gamification
│   ├── utils/                 # Logger, file upload
│   └── tests/                 # Pytest unit + contract + blackbox tests
│
├── frontend/                   # ⚛️ React SPA
│   ├── src/                   # Components, pages, hooks, contexts
│   ├── public/                # Static assets, images, uploads
│   ├── index.html             # Entry point
│   └── vite.config.ts         # Vite config
│
├── tests/                     # 🎭 Playwright E2E tests
├── data/                      # 💾 Database data
├── docs/                      # 📚 Documentation and PRDs
│
├── pyproject.toml             # Python dependencies
└── .env.example               # Environment variables
```

## Commands

- `./nutrishare.sh` — Interactive management menu
- `.venv/bin/uvicorn backend.main:app --reload` — Backend dev
- `cd frontend && npm run dev` — Frontend dev
- `.venv/bin/pytest backend/tests/` — Backend tests
- `.venv/bin/pytest backend/tests/blackbox_test.py` — Blackbox tests
- `cd frontend && npm run lint` — TypeScript type checking
