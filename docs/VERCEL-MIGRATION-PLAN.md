# Rencana Migrasi NutriShare ke Vercel (Full Free Mode)

> **Target**: Backend (FastAPI Python) + Frontend (React Vite) di-hosting di Vercel Free Tier  
> **Status**: Plan — belum dieksekusi  
> **Tanggal**: 2026-08-04

---

## Ringkasan

NutriShare akan di-deploy sebagai **dua Vercel project**:

1. **Project 1 — Backend**: FastAPI Python sebagai Vercel Serverless Function (`api/index.py`)
2. **Project 2 — Frontend**: React Vite SPA sebagai static site + Edge rewrites

Database tetap di **Supabase PostgreSQL** (eksternal, tidak menggunakan Vercel Postgres). Upload file ke **Supabase Storage**. Tidak ada dependency Vercel KV/Blob/Postgres — semuanya free-tier compatible.

---

## Audit Temuan (Bug & Inkompatibilitas)

### 🔴 CRITICAL — Akan Break di Serverless

| #   | File:Line                        | Masalah                                                                     | Dampak                                                                                                                                                                            |
| --- | -------------------------------- | --------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `backend/main.py:49-58`          | `lifespan` membuat `asyncio.create_task(... while True: asyncio.sleep(60))` | Background task tidak jalan di serverless; sleep loop terbuang. Rate limiter cleanup tidak pernah berjalan.                                                                       |
| 2   | `backend/main.py:44`             | `await run_topsis_all_active()` di startup                                  | Cold start lambat (TOPSIS melibatkan semua donation aktif × semua recipient, dengan NumPy). Bisa >10 detik.                                                                       |
| 3   | `backend/utils/upload.py:19`     | `LOCAL_UPLOAD_DIR = Path.cwd() / "frontend" / "public" / "uploads"`         | Path tidak valid di environment Vercel (filesystem read-only kecuali `/tmp`). Tapi hanya digunakan jika `supabase_service_key` kosong — aman selama env var di-set di production. |
| 4   | `backend/services/cache.py:53`   | `cache = _MemoryCache()` — global mutable dict                              | Setiap cold start kehilangan cache. Tidak kritis (ini optimasi), tapi cache miss rate akan 100% di awal setiap deployment wave.                                                   |
| 5   | `backend/utils/rate_limit.py:45` | `_limiter = _MemoryRateLimiter()` — global defaultdict                      | Rate limit state hilang antar invocation. Multiple instances tidak share state. Soft limit — tidak membahayakan keamanan tapi rate limit tidak ketat.                             |

### 🟡 HIGH — Bug Fungsional

| #   | File:Line                              | Masalah                                                                                                                                                  | Perbaikan                                                                                               |
| --- | -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| 6   | `backend/routers/reviews.py:9,12`      | `from fastapi import APIRouter, Depends` diimport 2 kali                                                                                                 | Hapus duplikat                                                                                          |
| 7   | `backend/routers/donations.py:287-311` | N+1 query di `/donations/history` — query DB untuk setiap klaim                                                                                          | Batch query dengan `in_()`                                                                              |
| 8   | `backend/routers/topsis.py:18-37`      | `/topsis/{donation_id}` TIDAK ada auth check                                                                                                             | Tambahkan auth dependency                                                                               |
| 9   | `backend/routers/auth.py:138-147`      | `/auth/me` mengulang decoding token manual (tidak pakai `get_current_user` dependency)                                                                   | Refactor pakai `Depends(get_current_user)`                                                              |
| 10  | `backend/main.py:87-99`                | CSRF Origin check membandingkan dengan `cors_origins` tapi di non-production pakai hardcoded localhost list. Origin tidak valid di production ter-block. | Perbaiki logika: tambahkan pengecekan `SameSite=lax` cookie behavior atau sesuaikan untuk Vercel domain |

### 🟢 MEDIUM — Quality

| #   | File:Line                                | Masalah                                                                                                                        | Perbaikan                                                         |
| --- | ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------- |
| 11  | `backend/routers/notifications.py:20-21` | `if not current_user` dead code — `get_current_user` sudah raise 401                                                           | Hapus                                                             |
| 12  | `frontend/src/lib/useSSE.ts`             | Nama/mekanisme misleading: sebenarnya polling, bukan SSE                                                                       | Tidak perlu diubah fungsional, tapi naming bisa di-cleanup        |
| 13  | `backend/routers/analytics.py:110`       | `DATE()` fungsi PostgreSQL — akan gagal di SQLite (dev/test). Gunakan `text()` dengan fungsi yang compatible atau cast manual. | Wrap dengan try/except atau gunakan fungsi yang SQLite-compatible |

---

## Arsitektur Target

```
                     ┌────────────────────────────────┐
                     │       Vercel Edge Network       │
                     │                                  │
  User ──────────────┤   ┌──────────────────────┐     │
                     │   │   Frontend (Vite SPA) │     │
                     │   │   nutrishare.vercel.app     │
                     │   └──────┬───────────────┘     │
                     │          │ /api/*               │
                     │   ┌──────▼───────────────┐     │
                     │   │   Backend (FastAPI)   │     │
                     │   │   api.nutrishare.vercel.app │
                     │   └──────┬───────────────┘     │
                     └──────────┼─────────────────────┘
                                │
              ┌─────────────────┼─────────────────┐
              │                 │                  │
     ┌────────▼──────┐  ┌──────▼──────┐  ┌───────▼──────┐
     │   Supabase    │  │  Supabase   │  │   Supabase   │
     │   PostgreSQL  │  │   Storage   │  │    Auth      │
     │   (DB)        │  │   (Uploads) │  │   (optional) │
     └───────────────┘  └─────────────┘  └──────────────┘
```

### Struktur Project Baru

```
nutrishare/
├── api/                          # Vercel Serverless Function entry
│   └── index.py                  # ASGI adapter + import FastAPI app
├── backend/                      # (tidak berubah struktur)
│   ├── main.py                   # App factory + lifespan (disesuaikan)
│   ├── config.py                 # (diperbarui — lihat env vars)
│   └── ...
├── frontend/                     # (tidak berubah struktur)
│   ├── src/
│   ├── public/
│   ├── vite.config.ts            # (diperbarui — build output)
│   ├── vercel.json               # [BARU] Rewrites config
│   └── .vercelignore             # [BARU]
├── vercel.json                   # Root-level (backend project)
└── .env.example                  # (diperbarui)
```

---

## Rencana Implementasi (12 Langkah)

### Fase 1: Perbaikan Bug & Persiapan

#### Langkah 1 — Fix Critical Bugs (Backend)

**File**: `backend/main.py`, `backend/routers/reviews.py`, `backend/routers/donations.py`, `backend/routers/topsis.py`, `backend/routers/notifications.py`

- [x] Hapus background task `asyncio.create_task(_cleanup_rate_limiter())` dari lifespan — ganti dengan lazy cleanup di setiap `rate_limit_dependency` call
- [x] Pindahkan `run_topsis_all_active()` dari startup ke endpoint admin-only `/admin/topsis/run` (sudah ada). Hapus dari lifespan.
- [x] Hapus import duplikat di `reviews.py`
- [x] Fix N+1 query di `/donations/history`
- [x] Tambahkan auth dependency ke `/topsis/{donation_id}`
- [x] Refactor `/auth/me` menggunakan `Depends(get_current_user)` yang sudah ada
- [x] Perbaiki CSRF origin check untuk kompatibilitas Vercel domain

#### Langkah 2 — Konfigurasi Cookie Cross-Origin

**File**: `backend/auth.py`, `backend/config.py`

- [x] Tambahkan env var `COOKIE_DOMAIN` (optional) untuk mengatur domain cookie
- [x] Ubah `set_auth_cookie`: `samesite="lax"` → conditional `samesite="none"` jika cross-origin; tambahkan `domain` parameter
- [x] Cookie `secure=True` harus selalu di production (Vercel HTTPS)

#### Langkah 3 — File Upload Fix

**File**: `backend/utils/upload.py`

- [x] Hapus fallback `LOCAL_UPLOAD_DIR` path — di production Vercel, wajib menggunakan Supabase Storage
- [x] Tambahkan error yang jelas jika `supabase_service_key` tidak di-set di production

#### Langkah 4 — Update Config

**File**: `backend/config.py`, `.env.example`

- [x] Tambahkan `COOKIE_DOMAIN: str = ""`
- [x] Tambahkan `FRONTEND_URL: str = ""` untuk memudahkan konfigurasi CORS
- [x] Update `cors_origins` property untuk membaca `FRONTEND_URL`
- [x] Update `.env.example` dengan semua env var yang dibutuhkan

### Fase 2: Vercel Backend Setup

#### Langkah 5 — Buat Entry Point Serverless

**File**: `api/index.py` (BARU)

```python
"""Vercel Serverless Function entry point for FastAPI."""
from backend.main import app
# Vercel Python runtime akan mencari `app` variable sebagai ASGI app
```

#### Langkah 6 — Buat vercel.json (Backend)

**File**: `vercel.json` (BARU — root level)

```json
{
  "builds": [
    {
      "src": "api/index.py",
      "use": "@vercel/python"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "api/index.py"
    }
  ]
}
```

#### Langkah 7 — Fix Dependency Compatibility

**File**: `pyproject.toml`

- [x] Tidak ada dependency yang bermasalah — `asyncpg`, `bcrypt`, `numpy` semuanya support Vercel Python runtime (pure Python / compiled wheels tersedia)
- [x] Pastikan `requires-python = ">=3.12"` sesuai dengan Vercel runtime

### Fase 3: Vercel Frontend Setup

#### Langkah 8 — Update Vite Config

**File**: `frontend/vite.config.ts`

- [x] Tambahkan `build.outDir: "dist"`
- [x] Hapus proxy config (dev-only, tidak digunakan di production)

#### Langkah 9 — Buat vercel.json (Frontend)

**File**: `frontend/vercel.json` (BARU)

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

#### Langkah 10 — Update API URL

**File**: `frontend/src/lib/api.ts`

- [x] Set `VITE_API_URL` saat build (contoh: `VITE_API_URL=https://nutrishare-api.vercel.app`)
- [x] Tidak ada hardcoded localhost ditemukan — sudah dinamis via `import.meta.env.VITE_API_URL`
- [x] Cookie `credentials: "include"` sudah benar

### Fase 4: Environment Variables

#### Langkah 11 — Konfigurasi Env Vars

**Backend Project (Vercel Dashboard):**

| Variable               | Value                           | Keterangan            |
| ---------------------- | ------------------------------- | --------------------- |
| `ENVIRONMENT`          | `production`                    |                       |
| `JWT_SECRET`           | (generate 32+ char secret)      |                       |
| `ADMIN_SECRET_KEY`     | (generate 32+ char secret)      |                       |
| `COOKIE_NAME`          | `nutrishare_token`              |                       |
| `COOKIE_DOMAIN`        | (kosongkan jika same-origin)    |                       |
| `DATABASE_URL`         | `postgresql+asyncpg://...`      | Supabase pooler URL   |
| `ALLOWED_ORIGINS`      | `https://nutrishare.vercel.app` | Frontend domain       |
| `FRONTEND_URL`         | `https://nutrishare.vercel.app` | Untuk CORS + redirect |
| `SUPABASE_URL`         | `https://xxx.supabase.co`       |                       |
| `SUPABASE_ANON_KEY`    | (anon key)                      |                       |
| `SUPABASE_SERVICE_KEY` | (service key)                   | Untuk upload file     |
| `LOG_LEVEL`            | `info`                          |                       |

**Frontend Project (Vercel Dashboard):**

| Variable       | Value                               | Keterangan                            |
| -------------- | ----------------------------------- | ------------------------------------- |
| `VITE_API_URL` | `https://api-nutrishare.vercel.app` | Backend domain (jika berbeda project) |

### Fase 5: Deployment

#### Langkah 12 — Deploy

```bash
# Backend — dari root
vercel --prod
# Pilih project nutrishare-api
# Set semua env vars di atas

# Frontend — dari frontend/
cd frontend
vercel --prod
# Pilih project nutrishare (atau nutrishare-web)
# Set VITE_API_URL
```

---

## Keterbatasan Free Tier & Mitigasi

| Batasan               | Limit                     | Dampak                              | Mitigasi                                                                              |
| --------------------- | ------------------------- | ----------------------------------- | ------------------------------------------------------------------------------------- |
| Function timeout      | 60s                       | TOPSIS macro untuk 100+ recipient   | TOPSIS di-background-kan via admin trigger; pindahkan dari startup ke endpoint manual |
| Function invocations  | 1M/bulan                  | Cukup untuk skala MVP               | Polling notifikasi sudah 30 detik — aman                                              |
| Bandwidth             | 100GB/bulan               | Cukup                               | Supabase storage untuk file besar                                                     |
| Concurrent executions | Tidak ada batas eksplisit | Rate limiter in-memory tidak shared | Tambahkan rate limit simple di Supabase/PostgreSQL stored procedure jika diperlukan   |
| Cold start latency    | ~1-3 detik                | Pengalaman user terpengaruh         | Keep-warm via cron job (GitHub Actions) ping `/health` setiap 5 menit                 |

---

## Testing Plan

### Sebelum Deploy

```bash
# 1. Unit tests (SQLite in-memory, tetap bisa jalan)
cd backend && .venv/bin/pytest backend/tests/ -v

# 2. Type check
cd frontend && npm run lint

# 3. Build check
cd frontend && npm run build
```

### Setelah Deploy

- [ ] `GET https://api-nutrishare.vercel.app/health` → 200 OK
- [ ] Register donor → 201
- [ ] Login → 200 + httpOnly cookie
- [ ] Create donation → 200 + TOPSIS berjalan
- [ ] Frontend load → SPA routing works
- [ ] API calls from frontend → credentials include cookies
- [ ] File upload → ke Supabase Storage

---

## Checklist Eksekusi

- [ ] Langkah 1 — Fix critical bugs
- [ ] Langkah 2 — Cookie cross-origin fix
- [ ] Langkah 3 — File upload fix
- [ ] Langkah 4 — Update config & env vars
- [ ] Langkah 5 — Buat `api/index.py`
- [ ] Langkah 6 — Buat `vercel.json` root
- [ ] Langkah 7 — Verifikasi dependensi
- [ ] Langkah 8 — Update `vite.config.ts`
- [ ] Langkah 9 — Buat `frontend/vercel.json`
- [ ] Langkah 10 — Update API URL
- [ ] Langkah 11 — Set env vars di Vercel dashboard
- [ ] Langkah 12 — Deploy
- [ ] Verifikasi post-deploy
