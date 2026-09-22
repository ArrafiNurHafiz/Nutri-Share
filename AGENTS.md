# NutriShare

Platform distribusi surplus pangan yang menghubungkan donor (hotel/restoran/kafe) dengan penerima terverifikasi (panti asuhan/rumah singgah/panti lansia) di Yogyakarta.

## Core Behavioral Guidelines (Karpathy Guidelines)

Pedoman perilaku untuk meminimalkan kesalahan umum coding LLM (diadaptasi dari *Andrej Karpathy's observations*). Pedoman ini mengutamakan kehati-hatian (*caution*) di atas kecepatan (*speed*).

### 1. Think Before Coding
**Jangan berasumsi. Jangan menyembunyikan kebingungan. Paparkan trade-off.**
- Nyatakan asumsi secara eksplisit sebelum implementasi. Jika ragu, tanyakan.
- Jika ada beberapa opsi pendekatan atau interpretasi, jelaskan trade-offnya — jangan memilih diam-diam.
- Jika ada pendekatan yang jauh lebih sederhana, sampaikan dan beri saran perbaikan.
- Jika ada spesifikasi atau kebutuhan yang tidak jelas, berhenti dan tanyakan secara spesifik.

### 2. Simplicity First
**Tulis kode minimal yang menyelesaikan masalah. Jangan ada kode spekulatif.**
- Jangan menambah fitur di luar yang diminta.
- Jangan membuat abstraksi atau helper berlebih untuk kode yang hanya dipakai sekali.
- Jangan menambah fleksibilitas/konfigurasi yang tidak dibutuhkan.
- Hindari error handling untuk skenario yang tidak mungkin terjadi.
- Jika kode bisa diselesaikan dalam 50 baris alih-alih 200 baris, pilih dan tulis yang 50 baris.

### 3. Surgical Changes
**Hanya sentuh berkas/baris yang wajib diubah. Bersihkan hanya apa yang kita buat.**
- Jangan "memperbaiki" kode, komentar, atau formatting di sekitar yang tidak terkait dengan task.
- Jangan me-refactor kode yang tidak rusak.
- Ikuti gaya dan konvensi kode yang sudah ada (*naming convention*, struktur, pola).
- Jika menemukan dead code yang sudah ada sebelumnya, sebutkan saja tanpa menghapusnya langsung tanpa izin.
- Hapus import, variabel, atau fungsi yang menjadi tidak terpakai akibat perubahan yang baru saja dibuat.
- *Aturan utama:* Setiap baris yang diubah harus memiliki alasan langsung yang bersumber dari permintaan user.

### 4. Goal-Driven Execution
**Tentukan kriteria sukses yang dapat diverifikasi. Uji sampai tuntas.**
- Ubah task menjadi tujuan yang terverifikasi (misal: buat/jalankan test yang mereproduksi bug atau memvalidasi fitur baru).
- Untuk task multi-langkah, buat rencana singkat berformat:
  ```
  1. [Langkah] → Verifikasi: [Perintah / Pemeriksaan]
  2. [Langkah] → Verifikasi: [Perintah / Pemeriksaan]
  ```
- Jalankan verifikasi (linting, test suite, eksekusi perintah) sebelum menyatakan pekerjaan selesai.

---

## Tech Stack

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

*Catatan: Tidak ada CI pipeline otomatis; verifikasi dijalankan secara lokal.*

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
- Tailwind v4 uses `@tailwindcss/vite` plugin — no `postcss.config.js` needed
- Vite proxies `/api` and `/uploads` to backend on port 3000

## Environment Variables

```env
DATABASE_URL=          Supabase PostgreSQL connection string
JWT_SECRET=            Secret key for JWT signing (min 32 chars)
ADMIN_SECRET_KEY=      Secret key for admin registration
SUPABASE_URL=          Supabase project URL
SUPABASE_ANON_KEY=     Supabase anonymous key
SUPABASE_SERVICE_KEY=  Supabase service role key (for file uploads)
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

## Styles & UI

Custom `@theme` tokens in `frontend/src/index.css` for three font families:
- `--font-sans`: Inter (body)
- `--font-heading`: Space Grotesk (headings)
- `--font-mono`: JetBrains Mono (data)

- **Color palette:** Natural green (`#047857`) + warm gold accent (`#d4893b`) + warm neutrals.
- **Dark mode:** CSS variable overrides.

## Notes & Rules

- **UI Language:** Bahasa Indonesia untuk seluruh label, form, toast, dan notifikasi.
- **Maps:** Leaflet maps untuk visualisasi lokasi donor dan penerima.
- **First Admin:** Dibuat via `POST /api/auth/register/admin` menggunakan `ADMIN_SECRET_KEY`.
