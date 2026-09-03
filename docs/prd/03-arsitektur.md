# PRD NUTRI-SHARE — Arsitektur Sistem

---

## 3.1 Arsitektur Aplikasi

```
┌─────────────────────────────────────────────────────────────────────┐
│                          CLIENT                                      │
│            React 19 SPA + Vite 6 — http://localhost:5173             │
│                                                                       │
│  ┌──────┐ ┌───────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐ │
│  │Landng│ │ Register  │ │Dashboard │ │ Tracking │ │ 404, Auth    │ │
│  │Pages │ │ Pages     │ │Pages     │ │ Modal    │ │ Components   │ │
│  └──────┘ └───────────┘ └──────────┘ └──────────┘ └──────────────┘ │
│         │              │            │           │                    │
│    ┌────┴──────────────┴────────────┴───────────┴────────┐           │
│    │              API Layer: lib/api.ts                    │           │
│    │    fetchJSON() → auto BASE_URL + credentials include   │           │
│    └──────────────────────┬───────────────────────────────┘           │
└───────────────────────────┼───────────────────────────────────────────┘
                            │ HTTP/JSON/SSE
                            ▼
┌──────────────────────────────────────────────────────────────────────┐
│                         BACKEND API                                   │
│           FastAPI + Uvicorn — http://localhost:3000                    │
│                                                                        │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────┐ │
│  │ Routers  │ │ Services │ │ Auth JWT │ │ Utils    │ │ Middleware  │ │
│  │ (10 mod) │ │ (3 mod)  │ │+bcrypt   │ │ Logger   │ │ CORS, Sec  │ │
│  └────┬─────┘ └──────────┘ └──────────┘ └──────────┘ └────────────┘ │
│       │                                                               │
│    ┌──┴────────────────────────────────────────────────────────────┐ │
│    │              SQLModel + SQLAlchemy 2.0 + aiosqlite             │ │
│    └─────────────────────────┬──────────────────────────────────────┘ │
└──────────────────────────────┼────────────────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────────────┐
│                       SQLITE DATABASE                                 │
│          data/nutrishare.db — WAL mode + foreign_keys ON              │
│                                                                        │
│  ┌──────┐ ┌────────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐ │
│  │users │ │donor_prof  │ │recip_prof│ │donations │ │topsis_results│ │
│  ├──────┤ ├────────────┤ ├──────────┤ ├──────────┤ ├──────────────┤ │
│  │claims│ │notificatns │ │reviews   │ │act_logs  │ │              │ │
│  └──────┘ └────────────┘ └──────────┘ └──────────┘ └──────────────┘ │
│                                                                        │
│  Total: 10 tabel, ~150 kolom                                          │
└──────────────────────────────────────────────────────────────────────┘
```

## 3.2 Diagram Alur Request

```
Browser                          FastAPI                         SQLite
  │                                │                                │
  │ 1. Request                     │                                │
  ├─ GET /api/donations ──────────►│                                │
  │                                │                                │
  │ 2. Middleware Chain             │                                │
  │                                ├──► [CORS Middleware]           │
  │                                ├──► [Security Headers]          │
  │                                │                                │
  │ 3. Route Matching              │                                │
  │                                ├──► Find router handler         │
  │                                │                                │
  │ 4. Auth (jika perlu)           │                                │
  │                                ├──► get_current_user()          │
  │                                │    ├── read cookie             │
  │                                │    ├── decode JWT              │
  │                                │    └── query user ────────────►│
  │                                │                              ◄─┤
  │ 5. Validation                   │                                │
  │                                ├──► Pydantic schema.parse()     │
  │                                │                                │
  │ 6. Handler Logic               │                                │
  │                                ├──► get_session()               │
  │                                │    ├── execute query ─────────►│
  │                                │    │                         ◄─┤
  │                                │    └── process results         │
  │                                │                                │
  │ 7. Response                    │                                │
  │◄── JSON Response ─────────────┤                                │
```

## 3.3 Diagram Alur SSE (Real-time Notifikasi)

```
Browser                          FastAPI                      Database
  │                                │                             │
  │ 1. Subscribe                   │                             │
  ├─ GET /api/notifications/      │                             │
  │   subscribe?user_id=N ────────►│                             │
  │                                ├── SSEManager.subscribe()    │
  │                                │    └── asyncio.Queue(user)  │
  │◄── "data: connected\n\n" ─────┤                             │
  │                                │                             │
  │ 2. Event terjadi               │                             │
  │    (donasi baru, claim, etc)   │                             │
  │                                │◄── INSERT notification ────┤
  │                                ├── sse_manager.notify_user() │
  │                                │    └── queue.put(JSON)      │
  │◄── "data: {...notification} "──┤                             │
  │                                │                             │
  │ 3. Keepalive (30s idle)        │                             │
  │◄── ":ping\n\n" ────────────────┤                             │
  │                                │                             │
  │ 4. Fallback polling (30s)      │                             │
  ├─ GET /api/notifications?      │                             │
  │   user_id=N ──────────────────►│                             │
  │                                ├── SELECT notifications ───►│
  │◄── [{...}, {...}] ────────────┤                           ◄─┤
```

## 3.4 Diagram Alur TOPSIS

```
Donasi Baru                    TOPSIS Service                  Database
     │                             │                             │
     │ POST /api/donations         │                             │
     ├─► INSERT donation ──────────┤──► INSERT ─────────────────►│
     │                             │                             │
     │                             ├── calculate_topsis()        │
     │                             │                             │
     │                             │ 1. Query verified recipients│
     │                             ├── SELECT recipient_profiles►│
     │                             │◄── recipients ─────────────┤
     │                             │                             │
     │                             │ 2. Build Matrix (m×n)       │
     │                             │    C1: protein coverage     │
     │                             │    C2: urgency score        │
     │                             │    C3: hours remaining      │
     │                             │    C4: haversine distance   │
     │                             │    C5: days since last      │
     │                             │                             │
     │                             │ 3. Entropy Weighting        │
     │                             │    Norm → P → Entropy → W  │
     │                             │                             │
     │                             │ 4. TOPSIS Scoring           │
     │                             │    V matrix → A+ A- → D+ D-│
     │                             │    → CI Score → Rank        │
     │                             │                             │
     │                             │ 5. Save results             │
     │                             ├── INSERT topsis_results ───►│
     │                             │                             │
     │                             │ 6. Notify priority #1       │
     │                             ├── INSERT notification ─────►│
     │                             ├── SSE notify recipient      │
     │                             │                             │
     │◄── return ─────────────────┤                             │
```

## 3.5 Komunikasi Antar Komponen

### Frontend → Backend

| Metode   | Path                           | Fungsi               |
| -------- | ------------------------------ | -------------------- |
| REST API | `/api/*`                       | Data CRUD            |
| SSE      | `/api/notifications/subscribe` | Real-time events     |
| Static   | `/uploads/*`                   | File upload/download |

### Backend → Database

| Operasi    | Driver                   | Koneksi               |
| ---------- | ------------------------ | --------------------- |
| Read/Write | `aiosqlite` via SQLModel | Async session         |
| TOPSIS     | `sqlite3` via SQLAlchemy | Sync session terpisah |

### Frontend Auth Flow

```
React App → lib/api.ts fetchJSON()
  → credentials: "include" (kirim cookie)
  → Backend baca cookie → JWT decode → attach user
  → Response
  → Jika 401 → redirect ke /login (di AuthContext)
```

### Tech Stack Detail

| Layer         | Teknologi                  | Versi      | Lisensi |
| ------------- | -------------------------- | ---------- | ------- |
| Runtime       | Python                     | 3.12+      | PSF     |
| Web Framework | FastAPI                    | 0.139      | MIT     |
| ORM           | SQLModel + SQLAlchemy      | 0.0.39     | MIT     |
| DB Driver     | aiosqlite                  | 0.22       | MIT     |
| Validation    | Pydantic                   | 2.13       | MIT     |
| Settings      | pydantic-settings          | 2.14       | MIT     |
| Auth          | PyJWT + bcrypt             | 2.13 + 5.0 | MIT     |
| Math          | NumPy                      | 2.5        | BSD     |
| Frontend      | React                      | 19         | MIT     |
| Bundler       | Vite                       | 6.4        | MIT     |
| CSS           | TailwindCSS                | 4.3        | MIT     |
| Map           | Leaflet + react-leaflet    | 1.9 + 5.0  | BSD     |
| Icon          | Lucide React               | 0.546      | ISC     |
| Chart         | Chart.js + react-chartjs-2 | 4.5 + 5.3  | MIT     |
| Toast         | react-hot-toast            | 2.6        | MIT     |
| Animation     | Motion                     | 12.40      | MIT     |
| Logger        | structlog                  | 26.1       | MIT     |
| Testing       | Pytest + httpx             | 9.1 + 0.28 | MIT     |
| Linter        | Ruff                       | 0.15       | MIT     |

### Struktur Direktori

```
nutrishare/
│
├── backend/                          # Python API (33 file)
│   ├── main.py                       # FastAPI entry + middleware
│   ├── config.py                     # pydantic-settings
│   ├── database.py                   # async engine + WAL
│   ├── models.py                     # 9 ORM models
│   ├── schemas.py                    # 15+ Pydantic schemas
│   ├── auth.py                       # JWT + bcrypt + deps
│   ├── dependencies.py               # FastAPI Depends
│   ├── routers/                      # 10 file
│   │   ├── auth.py                   # 9 endpoint
│   │   ├── donations.py              # 9 endpoint
│   │   ├── admin.py                  # 7 endpoint
│   │   ├── public.py                 # 3 endpoint
│   │   ├── recipient.py              # 2 endpoint
│   │   ├── reviews.py                # 2 endpoint
│   │   ├── topsis.py                 # 2 endpoint
│   │   ├── notifications.py          # 3 endpoint
│   │   ├── dashboard.py              # 2 endpoint
│   │   └── activity.py               # 1 endpoint
│   ├── services/
│   │   ├── topsis.py                 # NumPy TOPSIS (267 line)
│   │   ├── notifications.py          # SSE manager
│   │   └── gamification.py           # Badge logic
│   ├── utils/
│   │   ├── logger.py                 # structlog + log_activity
│   │   └── upload.py                 # File upload handler
│   └── tests/
│       ├── test_auth.py              # 7 test
│       ├── test_gamification.py      # 8 test
│       ├── test_topsis.py            # 5 test
│       ├── test_api_compat.py        # 34 test
│       ├── blackbox_test.py          # 89 test
│       └── conftest.py               # Test fixtures
│
├── frontend/                         # React SPA
│   ├── index.html                    # Entry + PWA meta
│   ├── vite.config.ts                # Vite + proxy
│   ├── package.json                  # Dependencies
│   ├── tsconfig.json                 # TypeScript config
│   ├── public/                       # Static assets
│   └── src/
│       ├── main.tsx                  # App entry + router
│       ├── index.css                 # Tailwind + dark mode
│       ├── types.ts                  # Interfaces
│       ├── lib/                      # 6 utilities
│       ├── contexts/                 # AuthContext
│       ├── components/               # 11 components
│       ├── pages/                    # 14 pages
│       └── assets/images/            # Images
│
├── tests/                            # Playwright E2E
├── data/                             # SQLite database
├── docs/                             # Documentation
│   └── prd/                         # 15 file PRD
├── config/                           # Vercel config
└── pyproject.toml                    # Python deps
```
