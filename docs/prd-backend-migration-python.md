# PRD: Migrasi Backend NutriShare dari Node.js (Express/TypeScript) ke Python

| Metadata         |                |
| ---------------- | -------------- |
| **Status**       | Draft          |
| **Author**       | Claude Fabel 5 |
| **Tanggal**      | 2026-07-06     |
| **Target Rilis** | Q3 2026        |

---

## 1. Ringkasan Eksekutif

Migrasi backend NutriShare dari Node.js/Express/TypeScript ke Python (FastAPI). Backend saat ini terdiri dari Express server dengan SQLite (better-sqlite3), JWT auth, TOPSIS algorithm, file upload, SSE notifikasi, dan Zod validation — total ~1.200 baris kode server. Frontend React (TypeScript, Vite) akan tetap tidak berubah. Migrasi ini bertujuan meningkatkan maintainability, performance, dan ekosistem library Python.

---

## 2. Analisis Backend Saat Ini

### 2.1 Stack Saat Ini (Node.js)

| Layer              | Teknologi                     | Baris      |
| ------------------ | ----------------------------- | ---------- |
| Runtime            | Node.js + tsx                 | —          |
| Framework          | Express 4                     | —          |
| Bahasa             | TypeScript 5.8                | —          |
| Database           | SQLite via better-sqlite3     | —          |
| Validation         | Zod 4                         | ~93        |
| Auth               | jsonwebtoken + bcryptjs       | ~69        |
| File Upload        | Multer                        | ~43        |
| Logging            | Custom (console-based)        | ~43        |
| Algoritma          | TOPSIS (custom)               | ~140       |
| Rate Limiting      | express-rate-limit            | —          |
| Security           | Helmet + CORS + cookie-parser | —          |
| Entry + Middleware | server.ts                     | ~158       |
| **Total Server**   | **(all modules)**             | **~1.200** |

### 2.2 API Endpoints (30 endpoint)

**Auth (7):** register admin/donor/recipient, login, logout, me, forgot/reset password
**Donations (9):** CRUD + active/history/transit/claim/arrived/complete
**Recipient (2):** AKG nutrition, emergency
**Reviews (2):** create review, get donor reviews
**TOPSIS (2):** get ranking, admin rerun
**Notifications (3):** list, mark read, SSE subscribe
**Admin (7):** users, verify, claims, approve claim, emergency toggle, delete user, search
**Dashboard (2):** stats, trends
**Public (2):** top-donors, map data
**Activity (1):** activity logs

### 2.3 Database Schema (9 tabel)

users, donor_profiles, recipient_profiles, donations, topsis_results, notifications, claims, reviews, activity_logs

---

## 3. Goal

### 3.1 Tujuan Utama

1. **Migrasi penuh** semua logika backend ke Python tanpa mengubah API contract (semua endpoint dan response format identik)
2. **Zero breakage** pada frontend — React app tidak perlu perubahan
3. **Performance setara atau lebih baik** — latency p99 < 200ms untuk 95% request
4. **Maintainability lebih tinggi** — Python type hints, Pydantic validation, dokumentasi otomatis (OpenAPI)
5. **Test coverage ≥ 80%** di kode backend baru

### 3.2 Non-Goals

- ❌ Migrasi frontend React — tetap TypeScript/Vite
- ❌ Migrasi database engine — tetap SQLite
- ❌ Redesign API atau tambah fitur baru selama migrasi
- ❌ Mengubah skema database — harus identik
- ❌ Containerization — bisa dilakukan terpisah

---

## 4. Python Tech Stack

| Layer             | Rekomendasi                     | Alasan                                     |
| ----------------- | ------------------------------- | ------------------------------------------ |
| **Runtime**       | Python 3.12+                    | Type hints native, performa                |
| **Framework**     | FastAPI                         | Async, OpenAPI otomatis, Pydantic built-in |
| **Server**        | Uvicorn + Gunicorn              | ASGI production-ready                      |
| **Database**      | SQLite via aiosqlite + SQLModel | Async, type-safe SQLite                    |
| **Migration/ORM** | SQLModel / SQLAlchemy 2.0       | Type-safe, Pydantic integration            |
| **Validation**    | Pydantic v2                     | Fast native, Zod equivalent                |
| **Auth**          | PyJWT + passlib[bcrypt]         | JWT + bcrypt hashing                       |
| **Rate Limit**    | slowapi                         | FastAPI-native rate limiting               |
| **File Upload**   | python-multipart                | Built-in FastAPI support                   |
| **Logging**       | structlog                       | Structured JSON logging                    |
| **CORS**          | fastapi.middleware.cors         | Built-in                                   |
| **Security**      | starlette.middleware.https      | Helmet equivalent headers                  |
| **Testing**       | pytest + httpx                  | Async testing                              |
| **TOPSIS**        | numpy                           | Vectorized computation                     |

### 4.1 Dependency Analysis

| Node.js Library         | Python Replacement      | Notes               |
| ----------------------- | ----------------------- | ------------------- |
| express                 | FastAPI (Uvicorn)       | Framework           |
| jsonwebtoken + bcryptjs | PyJWT + passlib[bcrypt] | Auth                |
| better-sqlite3          | SQLModel / aiosqlite    | DB sync → async     |
| zod                     | Pydantic v2             | Validation          |
| multer                  | python-multipart        | File upload         |
| helmet                  | starlette middleware    | Security headers    |
| cors                    | fastapi.middleware.cors | CORS                |
| cookie-parser           | FastAPI cookie built-in | Cookie parsing      |
| express-rate-limit      | slowapi                 | Rate limiting       |
| —                       | structlog               | Better logging      |
| —                       | numpy                   | TOPSIS optimization |

---

## 5. Arsitektur Backend Baru (Python)

```
server/                          # Backend Python (menggantikan server/ TS)
├── __init__.py
├── main.py                      # FastAPI app, middleware, startup
├── config.py                    # Settings via pydantic-settings (env vars)
├── database.py                  # SQLModel engine, session, init_db
├── models.py                    # SQLModel models (semua tabel)
├── schemas.py                   # Pydantic schemas (request/response)
├── auth.py                      # JWT sign/verify, middleware
├── dependencies.py              # FastAPI Depends (get_db, get_current_user)
├── routers/                     # Route handlers
│   ├── __init__.py
│   ├── auth.py                  # Auth endpoints
│   ├── donations.py             # Donation CRUD + lifecycle
│   ├── recipient.py             # Recipient AKG, emergency
│   ├── reviews.py               # Reviews
│   ├── topsis.py                # TOPSIS endpoints
│   ├── notifications.py         # Notifications + SSE
│   ├── admin.py                 # Admin endpoints
│   ├── dashboard.py             # Dashboard stats
│   ├── public.py                # Public data
│   └── activity.py              # Activity logs
├── services/                    # Business logic
│   ├── __init__.py
│   ├── topsis.py                # TOPSIS algorithm (numpy)
│   ├── notifications.py         # SSE manager + notification logic
│   └── gamification.py          # Badge logic
├── utils/
│   ├── __init__.py
│   ├── logger.py                # structlog setup
│   └── upload.py                # File upload handler
└── tests/
    ├── __init__.py
    ├── conftest.py              # Fixtures, test DB
    ├── test_auth.py
    ├── test_donations.py
    ├── test_topsis.py
    ├── test_admin.py
    └── test_api_compat.py       # Contract tests vs existing API
```

### 5.1 Perbandingan dengan Struktur Lama

| Node.js (sekarang)   | Python (nanti)                              | Catatan                |
| -------------------- | ------------------------------------------- | ---------------------- |
| `server.ts`          | `server/main.py`                            | Entry + middleware     |
| `server/db.ts`       | `server/database.py` + `server/models.py`   | Dipisah (ORM vs model) |
| `server/routes.ts`   | `server/routers/*.py`                       | Dipecah per domain     |
| `server/auth.ts`     | `server/auth.py` + `server/dependencies.py` | Sama + dependensi      |
| `server/topsis.ts`   | `server/services/topsis.py`                 | Sama                   |
| `server/validate.ts` | `server/schemas.py`                         | Zod → Pydantic         |
| `server/upload.ts`   | `server/utils/upload.py`                    | Sama                   |
| `server/logger.ts`   | `server/utils/logger.py`                    | Sama                   |
| —                    | `server/config.py`                          | Baru (env config)      |
| —                    | `server/dependencies.py`                    | Baru (FastAPI Depends) |

---

## 6. Migration Plan per Module

### Fase 0: Foundation (Estimasi: 2-3 hari)

| Task           | File                                     | Detail                            |
| -------------- | ---------------------------------------- | --------------------------------- |
| Setup project  | `pyproject.toml`, `requirements.txt`     | Python 3.12, uv/pip               |
| Config         | `server/config.py`                       | pydantic-settings, semua env vars |
| Database       | `server/database.py`, `server/models.py` | SQLModel, 9 tabel, migrasi data   |
| Logger         | `server/utils/logger.py`                 | structlog                         |
| Error handling | `server/main.py`                         | Global exception handlers         |

### Fase 1: Auth & Users (Estimasi: 1-2 hari)

| Task         | File                     | Detail                                 |
| ------------ | ------------------------ | -------------------------------------- |
| Auth logic   | `server/auth.py`         | JWT sign/verify, cookie set/clear      |
| Schemas      | `server/schemas.py`      | LoginSchema, Register schemas, dll     |
| Dependencies | `server/dependencies.py` | get_db, get_current_user, require_role |
| Auth routes  | `server/routers/auth.py` | 7 endpoint auth                        |
| Users routes | inline di auth + admin   | Profile update                         |

### Fase 2: Core Business (Estimasi: 2-3 hari)

| Task             | File                          | Detail           |
| ---------------- | ----------------------------- | ---------------- |
| Donation routes  | `server/routers/donations.py` | 9 endpoint       |
| TOPSIS service   | `server/services/topsis.py`   | numpy vectorized |
| TOPSIS routes    | `server/routers/topsis.py`    | 2 endpoint       |
| Recipient routes | `server/routers/recipient.py` | AKG + emergency  |
| Reviews routes   | `server/routers/reviews.py`   | 2 endpoint       |

### Fase 3: Notifications & SSE (Estimasi: 1 hari)

| Task                | File                               | Detail                |
| ------------------- | ---------------------------------- | --------------------- |
| SSE manager         | `server/services/notifications.py` | Async SSE, client map |
| Notification routes | `server/routers/notifications.py`  | list, mark read, SSE  |

### Fase 4: Admin & Utility (Estimasi: 1-2 hari)

| Task             | File                              | Detail                    |
| ---------------- | --------------------------------- | ------------------------- |
| Admin routes     | `server/routers/admin.py`         | 7 endpoint                |
| Dashboard routes | `server/routers/dashboard.py`     | 2 endpoint                |
| Public routes    | `server/routers/public.py`        | top-donors, map           |
| Activity routes  | `server/routers/activity.py`      | activity logs             |
| Gamification     | `server/services/gamification.py` | Badge logic               |
| File upload      | `server/utils/upload.py`          | Multer → python-multipart |

### Fase 5: Testing & Verifikasi (Estimasi: 2-3 hari)

| Task              | Detail                                  |
| ----------------- | --------------------------------------- |
| Unit tests        | pytest untuk semua services             |
| Integration tests | httpx + test DB untuk semua router      |
| Contract tests    | Reqres snapshot vs Node.js response     |
| E2E               | Playwright (yang sudah ada) tetap jalan |

### Total Timeline: ~10-14 hari kerja

---

## 7. API Contract Compatibility

### 7.1 Response Format (HARUS SAMA)

Semua endpoint mengembalikan response JSON dengan format identik:

```json
// Sukses
{ "message": "string", ... }

// Error
{ "message": "string" }

// List
[{ ... }, { ... }]

// Object
{ ... }
```

### 7.2 HTTP Status Codes (HARUS SAMA)

| Kode | Penggunaan                 |
| ---- | -------------------------- |
| 200  | Success                    |
| 400  | Validation error           |
| 401  | Not authenticated          |
| 403  | Forbidden / not verified   |
| 404  | Not found                  |
| 409  | Conflict (duplicate email) |
| 429  | Rate limited               |
| 500  | Server error               |

### 7.3 Auth Cookie (HARUS SAMA)

| Parameter   | Value                          |
| ----------- | ------------------------------ |
| Nama cookie | `nutrishare_token`             |
| httpOnly    | true                           |
| secure      | true (production), false (dev) |
| sameSite    | lax                            |
| maxAge      | 7 hari                         |
| path        | /                              |

### 7.4 SSE Format

```
data: connected\n\n
data: {"id":1,"user_id":2,...}\n\n
:ping\n\n
```

### 7.5 Endpoint Mapping (Lengkap)

| Method | Path                           | Node File     | Python File              |
| ------ | ------------------------------ | ------------- | ------------------------ |
| POST   | /api/auth/register/admin       | routes.ts:18  | auth.py                  |
| POST   | /api/auth/login                | routes.ts:40  | auth.py                  |
| POST   | /api/auth/logout               | routes.ts:88  | auth.py                  |
| GET    | /api/auth/me                   | routes.ts:93  | auth.py                  |
| POST   | /api/auth/forgot-password      | routes.ts:65  | auth.py                  |
| POST   | /api/auth/reset-password       | routes.ts:77  | auth.py                  |
| POST   | /api/auth/register/donor       | routes.ts:103 | auth.py                  |
| POST   | /api/auth/register/recipient   | routes.ts:115 | auth.py                  |
| PUT    | /api/users/:id/profile         | routes.ts:128 | auth.py                  |
| GET    | /api/public/top-donors         | routes.ts:173 | public.py                |
| GET    | /api/dashboard/stats           | routes.ts:188 | dashboard.py             |
| GET    | /api/dashboard/trends          | routes.ts:197 | dashboard.py             |
| POST   | /api/donations                 | routes.ts:217 | donations.py             |
| GET    | /api/donations                 | routes.ts:234 | donations.py             |
| GET    | /api/donations/active          | routes.ts:276 | donations.py             |
| GET    | /api/donations/history         | routes.ts:292 | donations.py             |
| GET    | /api/donations/transit         | routes.ts:256 | donations.py             |
| GET    | /api/donations/:id             | routes.ts:304 | donations.py             |
| POST   | /api/donations/:id/claim       | routes.ts:311 | donations.py             |
| POST   | /api/donations/:id/arrived     | routes.ts:329 | donations.py             |
| POST   | /api/donations/:id/complete    | routes.ts:335 | donations.py             |
| GET    | /api/recipient/akg             | routes.ts:348 | recipient.py             |
| POST   | /api/recipient/emergency       | routes.ts:376 | recipient.py             |
| GET    | /api/topsis/:donation_id       | routes.ts:389 | topsis.py                |
| POST   | /api/reviews                   | routes.ts:400 | reviews.py               |
| GET    | /api/donors/:id/reviews        | routes.ts:413 | reviews.py               |
| GET    | /api/notifications             | routes.ts:424 | notifications.py         |
| POST   | /api/notifications/:id/read    | routes.ts:430 | notifications.py         |
| GET    | /api/notifications/subscribe   | server.ts:96  | notifications.py         |
| GET    | /api/map/data                  | routes.ts:437 | public.py                |
| POST   | /api/admin/topsis/run          | routes.ts:445 | admin.py                 |
| GET    | /api/admin/users               | routes.ts:450 | admin.py                 |
| POST   | /api/admin/users/:id/verify    | routes.ts:458 | admin.py                 |
| GET    | /api/admin/claims              | routes.ts:471 | admin.py                 |
| POST   | /api/admin/claims/:id/approve  | routes.ts:476 | admin.py                 |
| POST   | /api/admin/users/:id/emergency | routes.ts:492 | admin.py                 |
| DELETE | /api/admin/users/:id           | routes.ts:502 | admin.py                 |
| GET    | /api/admin/search              | routes.ts:539 | admin.py                 |
| GET    | /api/activity-logs             | routes.ts:565 | activity.py              |
| GET    | /api/donors/:id/badges         | routes.ts:552 | public.py (gamification) |
| POST   | /api/upload                    | upload.ts:34  | utils/upload.py          |
| GET    | /health                        | server.ts:86  | main.py                  |

### 7.6 Frontend Type Adjustments

Frontend tetap React/TypeScript, **tidak ada perubahan** karena API contract identik. Satu-satunya perubahan:

- `src/types.ts`: respons API sama persis, tidak perlu perubahan
- `src/lib/api.ts`: wrapper fetch tetap sama (credentials: "include" dan /api/ prefix)
- Proses build: frontend tetap via Vite, backend Python serve static file `dist/` di production

---

## 8. Database Migration Strategy

### 8.1 Schema SQLite (Identik)

Database SQLite yang sudah ada (`data/nutrishare.db`) akan tetap digunakan. Python akan membaca database yang sama.

**Pendekatan: Direct Read (No Migration)**

- Python langsung konek ke SQLite file yang sama
- SQLModel / aiosqlite membaca tabel yang ada
- Tabel dan kolom persis sama — tidak ada perubahan skema
- Migration zero-downtime karena data tidak dipindah

**SQLModel Models** akan mencerminkan skema yang ada:

```python
from sqlmodel import SQLModel, Field

class User(SQLModel, table=True):
    __tablename__ = "users"
    id: int | None = Field(default=None, primary_key=True)
    name: str
    email: str
    password: str | None = None  # excluded from response
    role: str  # donor | recipient | admin
    status: str  # pending | verified | rejected
    reset_token: str | None = None
    reset_token_expiry: str | None = None
```

### 8.2 Sync → Async Concern

Node.js better-sqlite3 adalah **synchronous**. Python akan menggunakan **aiosqlite** (async):

| Concern                 | Solusi                         |
| ----------------------- | ------------------------------ |
| SQLite concurrent write | WAL mode (sudah aktif) + queue |
| Async overhead          | Minimal, aiosqlite thread pool |
| Migration tool          | Alembic (jika perlu) atau skip |

> **Ponytail:** Karena skema tidak berubah, tidak perlu migration tool. Tidak perlu Alembic. Cukup mapping SQLModel langsung.

---

## 9. TOPSIS Algorithm: Node.js → Python

### 9.1 Node.js (Current)

- Vanilla JS math (Math.sin, Math.cos, Math.sqrt, Math.log)
- Linear loops (m x n, ~20-40 recipients per donation)
- ~140 baris

### 9.2 Python (Target)

- NumPy vectorized operations
- ~80 baris
- 10-50x faster untuk batch (TopsisAllActive)
- Preserved output EXACTLY same (same math, same precision)

```
C1 = min(100, (totalProtein / dailyProteinNeed) * 100)   // % kebutuhan protein
C2 = emergency === "active" ? urgency * 1000 : urgency    // urgensi
C3 = (validUntil - now) / 3.6e6                            // waktu tersisa (jam)
C4 = haversine(pickup, recipient)                          // jarak (km)
C5 = max((now - lastReceived) / 86400000, 0) || 30         // hari sejak terakhir
```

---

## 10. Risk Assessment

| Risk                         | Dampak | Mitigasi                          |
| ---------------------------- | ------ | --------------------------------- |
| Async SQLite write conflicts | Medium | WAL mode + database queue         |
| SSE behavior differences     | Medium | Test SSE dengan frontend existing |
| Cookie/auth mismatch         | High   | Auth flow test dengan frontend    |
| File upload path mismatch    | Low    | Test upload from UI               |
| CORS/origin check berbeda    | Medium | Copy config dari Express          |
| Helmet header berbeda        | Low    | Manual response headers           |
| Rate limit behavior berbeda  | Low    | slowapi config test               |
| Topsis numeric precision     | Low    | Unit test + snapshot vs JS output |
| Deployment env vars          | Medium | Mapping pydantic-settings         |

---

## 11. Testing Strategy

### 11.1 Unit Tests (pytest)

- TOPSIS algorithm (snapshot vs Node.js output)
- Auth token sign/verify
- Badge calculation
- Schema validation
- Distance calculation

### 11.2 Integration Tests (httpx + test client)

- Setiap router dengan test DB (SQLite :memory:)
- Auth flow lengkap (register → login → verify → access)
- Donation lifecycle (create → claim → approve → arrived → complete)
- Admin CRUD
- Search functionality

### 11.3 Contract Tests (Critical!)

Test bahwa setiap endpoint mengembalikan response identik:

```python
# test_api_compat.py
# Rekam response dari Node.js server, bandingkan dengan Python
EXPECTED = {
    "status_code": 200,
    "body_keys": ["message", "user"],
    "body_sample": {...}
}
```

### 11.4 E2E (Playwright - existing)

Test frontend-to-backend:

- Login flow
- Create donation
- Claim donation
- Admin approve
- Review
- Notifications

---

## 12. Deployment Changes

### 12.1 Proses Start (Development)

| Sekarang                             | Nanti                                                          |
| ------------------------------------ | -------------------------------------------------------------- |
| `npm run dev` (tsx server.ts + Vite) | `uvicorn server.main:app --reload` + `npm run dev` (Vite only) |

### 12.2 Proses Start (Production)

| Sekarang                                | Nanti                                                                                    |
| --------------------------------------- | ---------------------------------------------------------------------------------------- |
| `npm run build && node dist/server.cjs` | `npm run build` (frontend) + `gunicorn -k uvicorn.workers.UvicornWorker server.main:app` |

### 12.3 package.json Changes

```diff
- "dev": "tsx server.ts",
- "build": "vite build && esbuild server.ts --bundle --platform=node ...",
- "start": "node dist/server.cjs",
+ "dev": "vite",
+ "dev:backend": "uvicorn server.main:app --reload --port 3000",
+ "build": "vite build",
```

### 12.4 Environment Variables

| Variable         | Node (sekarang) | Python (nanti)        |
| ---------------- | --------------- | --------------------- |
| JWT_SECRET       | ✓               | via pydantic-settings |
| ADMIN_SECRET_KEY | ✓               | via pydantic-settings |
| PORT             | ✓               | via pydantic-settings |
| DB_PATH          | ✓               | via pydantic-settings |
| NODE_ENV         | ✓               | ENVIRONMENT           |
| ALLOWED_ORIGINS  | ✓               | via pydantic-settings |
| LOG_LEVEL        | ✓               | via pydantic-settings |

---

## 13. Migration Approach: Strangler Fig

### Phase 1: Parallel Run

- Backend baru Python running di port berbeda (e.g. 3001)
- Backend lama Node.js tetap di port 3000
- Frontend dikonfigurasi untuk test dengan backend baru

### Phase 2: Feature Parity Verification

- Contract test setiap endpoint
- Playwright E2E test penuh
- Manual UAT

### Phase 3: Cutover

- Python backend pindah ke port 3000
- Node.js backend dimatikan
- Frontend di-build dan diserve oleh Python

### Rollback Plan

- Node.js backend tetap di-deploy sebagai fallback
- Rollback = restart Node.js + pointing ke port 3000

---

## 14. Files yang Tidak Berubah

| File                   | Alasan                                |
| ---------------------- | ------------------------------------- |
| Semua `src/`           | Frontend React tetap                  |
| `src/lib/api.ts`       | Fetch wrapper tetap (path /api/ saja) |
| `src/types.ts`         | Response API identik                  |
| `index.html`           | Entry point Vite                      |
| `vite.config.ts`       | Build config frontend                 |
| `tailwind.config.ts`   | Tidak terkait backend                 |
| `playwright.config.ts` | Tetap untuk E2E                       |
| `tests/`               | Playwright tests tetap jalan          |
| `public/`              | Static assets                         |
| `.env.example`         | Hanya tambah variabel baru            |

---

## 15. File per File Migration Checklist

### Server Modules

| Node.js File         | Python File                                 | Status |
| -------------------- | ------------------------------------------- | ------ |
| `server.ts`          | `server/main.py`                            | ⬜     |
| `server/db.ts`       | `server/database.py` + `server/models.py`   | ⬜     |
| `server/auth.ts`     | `server/auth.py` + `server/dependencies.py` | ⬜     |
| `server/routes.ts`   | `server/routers/*.py` (10 files)            | ⬜     |
| `server/topsis.ts`   | `server/services/topsis.py`                 | ⬜     |
| `server/validate.ts` | `server/schemas.py`                         | ⬜     |
| `server/upload.ts`   | `server/utils/upload.py`                    | ⬜     |
| `server/logger.ts`   | `server/utils/logger.py`                    | ⬜     |
| —                    | `server/config.py`                          | ⬜     |

### Route Migration Detail

| Node.js Source Lines | Python Target File                          | Endpoints                        |
| -------------------- | ------------------------------------------- | -------------------------------- |
| `routes.ts:18-38`    | `routers/auth.py`                           | register admin                   |
| `routes.ts:40-101`   | `routers/auth.py`                           | login, logout, me, forgot/reset  |
| `routes.ts:103-125`  | `routers/auth.py`                           | register donor/recipient         |
| `routes.ts:128-170`  | `routers/auth.py`                           | update profile                   |
| `routes.ts:173-185`  | `routers/public.py`                         | top donors                       |
| `routes.ts:188-214`  | `routers/dashboard.py`                      | stats, trends                    |
| `routes.ts:217-253`  | `routers/donations.py`                      | create, list                     |
| `routes.ts:256-303`  | `routers/donations.py`                      | transit, active, history         |
| `routes.ts:304-345`  | `routers/donations.py`                      | detail, claim, arrived, complete |
| `routes.ts:348-386`  | `routers/recipient.py`                      | AKG, emergency                   |
| `routes.ts:389-397`  | `routers/topsis.py`                         | TOPSIS result                    |
| `routes.ts:400-421`  | `routers/reviews.py`                        | create, list                     |
| `routes.ts:424-434`  | `routers/notifications.py`                  | list, mark read                  |
| `routes.ts:437-442`  | `routers/public.py`                         | map data                         |
| `routes.ts:444-536`  | `routers/admin.py`                          | admin endpoints                  |
| `routes.ts:539-548`  | `routers/admin.py`                          | global search                    |
| `routes.ts:552-574`  | `routers/public.py` + `routers/activity.py` | badges, activity                 |
| `server.ts:86-88`    | `main.py`                                   | health check                     |
| `server.ts:96-118`   | `services/notifications.py`                 | SSE subscription                 |
| `upload.ts:1-42`     | `utils/upload.py`                           | file upload                      |

---

## 16. Acceptance Criteria

- [ ] Semua 30+ endpoint mengembalikan response identik (status code + body keys + tipe data)
- [ ] Frontend bisa login, register, create donation, claim, approve tanpa perubahan kode
- [ ] TOPSIS menghasilkan rank dan CI score yang sama (± 1e-10 tolerance)
- [ ] SSE notifikasi real-time berfungsi
- [ ] File upload berfungsi dengan path /uploads/ yang sama
- [ ] Auth cookie (nutrishare_token) bekerja dengan frontend existing
- [ ] CORS dan security headers setara dengan Express
- [ ] Rate limiting berfungsi
- [ ] Database SQLite yang sudah ada bisa langsung digunakan
- [ ] Test coverage ≥ 80%
- [ ] `npm run dev` (frontend) + Python backend berjalan bersama
- [ ] Playwright E2E tests lulus tanpa perubahan
- [ ] Semua AI-generated comments dibersihkan

---

## 17. Open Questions

| Question                                                                        | Decision Needed By             |
| ------------------------------------------------------------------------------- | ------------------------------ |
| Apakah mau menggunakan `uv` (Rust) atau `pip` untuk package management?         | Developer                      |
| Apakah database yang sudah ada di production harus di-migrate atau mulai fresh? | Timeline                       |
| Apakah tetap menggunakan SQLite, atau migrasi ke PostgreSQL juga?               | Arsitek (diluar scope PRD ini) |
| Mode deployment: standalone Python atau via Docker?                             | DevOps                         |
| Apakah frontend tetap di-serve oleh Python, atau pisah (Vercel/Netlify)?        | Arsitek                        |

---

## 18. Lampiran

### A. Data Flow Diagram (Simplified)

```
Browser (React/Vite)
    │
    ├─ /api/* ───────────► FastAPI (Python)
    │                         │
    │                         ├── Auth (JWT + bcrypt)
    │                         ├── SQLite (aiosqlite)
    │                         ├── TOPSIS (numpy)
    │                         ├── SSE (asyncio)
    │                         └── Static Files (dist/)
    │
    └─ Static assets ──────► Python serves dist/
```

### B. Python Dependencies (pyproject.toml)

```toml
[project]
name = "nutrishare"
version = "2.0.0"
requires-python = ">=3.12"
dependencies = [
    "fastapi>=0.115",
    "uvicorn[standard]>=0.34",
    "sqlmodel>=0.0.22",
    "aiosqlite>=0.20",
    "pydantic>=2.10",
    "pydantic-settings>=2.7",
    "pyjwt>=2.10",
    "passlib[bcrypt]>=1.7",
    "python-multipart>=0.0.18",
    "structlog>=25.1",
    "numpy>=2.2",
    "slowapi>=0.1.9",
]

[project.optional-dependencies]
dev = [
    "pytest>=8.3",
    "pytest-asyncio>=0.25",
    "httpx>=0.28",
    "ruff>=0.9",       # Linter + formatter
]
```
