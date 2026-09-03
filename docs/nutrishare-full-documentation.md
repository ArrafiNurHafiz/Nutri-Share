# NutriShare — Dokumentasi Lengkap Website

> **Tujuan dokumen ini:** Panduan komprehensif untuk AI dalam menulis artikel tentang NutriShare.
> Berisi seluruh fitur, alur penggunaan, teknologi, data, dan konteks yang dibutuhkan.

---

## 1. Ringkasan Eksekutif

**NutriShare** adalah platform distribusi pangan berbasis web yang menghubungkan **donor makanan** (hotel, restoran, kafe, katering) dengan **penerima manfaat** (panti asuhan, rumah singgah, lembaga sosial) di Indonesia. Platform ini menggunakan **algoritma TOPSIS** (_Technique for Order of Preference by Similarity to Ideal Solution_) untuk mengalokasikan donasi makanan secara adil dan optimal berdasarkan kebutuhan nutrisi penerima.

**Misi:** Mengurangi food waste sekaligus memenuhi kebutuhan nutrisi kelompok rentan melalui distribusi makanan yang cerdas, transparan, dan terukur.

**Tagline:** _"Platform Distribusi Pangan Cerdas Berbasis Algoritma TOPSIS"_

---

## 2. Tech Stack

| Layer           | Teknologi                                         |
| --------------- | ------------------------------------------------- |
| **Backend**     | Python 3.12+, FastAPI, SQLModel, aiosqlite, NumPy |
| **Frontend**    | React 19, TypeScript, Vite, TailwindCSS           |
| **Database**    | SQLite (WAL mode)                                 |
| **Peta**        | Leaflet.js + React-Leaflet (OpenStreetMap tiles)  |
| **Grafik**      | Chart.js (Bar, Pie, Line, Radar)                  |
| **Animasi**     | Framer Motion (motion/react)                      |
| **Autentikasi** | JWT (httpOnly cookie), bcrypt                     |
| **Testing**     | Pytest (backend), Playwright (E2E)                |
| **Deklarasi**   | React Hot Toast (notifikasi), Lucide React (ikon) |

---

## 3. Arsitektur & Struktur Proyek

```
nutrishare/
├── backend/                    # Python API (FastAPI)
│   ├── main.py                # Entry point, middleware, error handlers, CORS, CSP
│   ├── config.py              # Environment variables (pydantic-settings)
│   ├── database.py            # SQLModel engine, async sessions, WAL pragmas
│   ├── models.py              # 9 ORM models (User, DonorProfile, RecipientProfile, Donation, TopsisResult, Notification, Claim, Review, ActivityLog)
│   ├── schemas.py             # Pydantic request/response schemas (16 schemas)
│   ├── auth.py                # JWT, bcrypt, cookie helpers, dependency injection
│   ├── dependencies.py        # FastAPI Depends helpers (session, etc.)
│   ├── routers/               # 10 API endpoint modules
│   │   ├── auth.py            # Register, login, logout, forgot/reset password
│   │   ├── donations.py       # CRUD donasi, claim, arrived, complete
│   │   ├── public.py          # Endpoint publik (statistik, leaderboard)
│   │   ├── recipient.py       # Profil penerima, AKG tracking
│   │   ├── reviews.py         # Ulasan donasi
│   │   ├── topsis.py          # Ranking TOPSIS
│   │   ├── notifications.py   # Notifikasi real-time
│   │   ├── dashboard.py       # Statistik & tren
│   │   ├── admin.py           # Panel admin
│   │   └── activity.py        # Log aktivitas
│   ├── services/              # Bisnis logic
│   │   ├── topsis.py          # Algoritma TOPSIS (NumPy vectorized)
│   │   ├── gamification.py    # Badge / pencapaian donor
│   │   └── notifications.py   # Layanan notifikasi
│   ├── utils/                 # Logger, file upload, rate limiting
│   └── tests/                 # Pytest unit + contract + blackbox
│
├── frontend/                   # React SPA
│   ├── src/
│   │   ├── pages/             # 10 halaman utama
│   │   │   ├── Home.tsx              # Landing page
│   │   │   ├── Auth.tsx              # Login
│   │   │   ├── RegisterDonor.tsx     # Registrasi donor
│   │   │   ├── RegisterRecipient.tsx # Registrasi penerima
│   │   │   ├── DonorDashboard.tsx    # Dashboard donor
│   │   │   ├── RecipientDashboard.tsx# Dashboard penerima
│   │   │   ├── AdminDashboard.tsx    # Dashboard admin
│   │   │   ├── ForgotPassword.tsx    # Lupa password
│   │   │   ├── ResetPassword.tsx     # Reset password
│   │   │   └── NotFound.tsx          # 404
│   │   ├── components/        # 12 komponen reusable
│   │   ├── contexts/          # AuthContext (autentikasi global)
│   │   ├── lib/               # API client, validasi, peta ikon
│   │   ├── types.ts           # TypeScript interfaces
│   │   ├── main.tsx           # Entry point (React Router)
│   │   └── index.css          # TailwindCSS + custom properties
│   └── vite.config.ts
│
├── docs/                      # Dokumentasi & PRD
├── data/                      # SQLite database file
├── tests/                     # Playwright E2E tests
└── scripts/                   # Utility scripts
```

---

## 4. Model Data (Schema Database)

### 4.1 User

| Field              | Tipe         | Keterangan                                  |
| ------------------ | ------------ | ------------------------------------------- |
| id                 | int (PK)     | Auto-increment                              |
| name               | str          | Nama lengkap / nama bisnis / nama institusi |
| email              | str (unique) | Email login                                 |
| password           | str          | Hash bcrypt                                 |
| role               | str          | `donor` / `recipient` / `admin`             |
| status             | str          | `pending` / `verified` / `rejected`         |
| reset_token        | str?         | Token reset password                        |
| reset_token_expiry | str?         | Waktu kedaluwarsa token                     |

### 4.2 DonorProfile

| Field                | Tipe           | Keterangan                                             |
| -------------------- | -------------- | ------------------------------------------------------ |
| id                   | int (PK)       | —                                                      |
| user_id              | int (FK→users) | Relasi ke User                                         |
| business_name        | str            | Nama bisnis (contoh: "Hotel Grand Mercy")              |
| business_type        | str            | `hotel` / `restoran` / `kafe` / `katering` / `lainnya` |
| address              | str            | Alamat lokasi                                          |
| latitude / longitude | float          | Koordinat GPS                                          |
| phone                | str            | Nomor telepon                                          |
| logo_url             | str            | URL logo bisnis                                        |
| total_donations      | int            | Jumlah total donasi                                    |

### 4.3 RecipientProfile

| Field                  | Tipe           | Keterangan                                                      |
| ---------------------- | -------------- | --------------------------------------------------------------- |
| id                     | int (PK)       | —                                                               |
| user_id                | int (FK→users) | Relasi ke User                                                  |
| institution_name       | str            | Nama lembaga                                                    |
| institution_type       | str            | `panti_asuhan` / `rumah_singgah` / `lembaga_sosial` / `lainnya` |
| address                | str            | Alamat                                                          |
| latitude / longitude   | float          | Koordinat GPS                                                   |
| phone                  | str            | Nomor telepon                                                   |
| resident_count         | int            | Jumlah penghuni                                                 |
| age_range              | str            | Rentang usia penghuni                                           |
| health_condition       | str            | Kondisi kesehatan penghuni                                      |
| daily_protein_need     | float          | Kebutuhan protein harian (gram)                                 |
| daily_calorie_need     | float          | Kebutuhan kalori harian (kkal)                                  |
| daily_iron_need        | float          | Kebutuhan zat besi harian (mg)                                  |
| daily_vitamin_c_need   | float          | Kebutuhan vitamin C harian (mg)                                 |
| urgency_score          | int            | Skor urgensi (1-10, dihitung otomatis)                          |
| emergency              | str            | `none` / `pending` / `active`                                   |
| last_received_donation | str?           | Terakhir terima donasi                                          |
| document_url           | str            | URL dokumen verifikasi                                          |

### 4.4 Donation

| Field                              | Tipe           | Keterangan                                                                   |
| ---------------------------------- | -------------- | ---------------------------------------------------------------------------- |
| id                                 | int (PK)       | —                                                                            |
| donor_id                           | int (FK→users) | Donor yang membuat                                                           |
| food_name                          | str            | Nama makanan (contoh: "Nasi Kotak Ayam")                                     |
| food_type                          | str            | `makanan_berat` / `sayur` / `lauk_protein` / `snack` / `minuman` / `lainnya` |
| portion_count                      | int            | Jumlah porsi                                                                 |
| protein_per_portion                | float          | Protein per porsi (gram)                                                     |
| calorie_per_portion                | float          | Kalori per porsi (kkal)                                                      |
| iron_mg                            | float?         | Zat besi per porsi (mg)                                                      |
| vitamin_c_mg                       | float?         | Vitamin C per porsi (mg)                                                     |
| valid_until                        | str            | Waktu kedaluwarsa (ISO timestamp)                                            |
| pickup_latitude / pickup_longitude | float          | Lokasi pengambilan                                                           |
| photo_url                          | str            | Foto makanan                                                                 |
| notes                              | str            | Catatan tambahan                                                             |
| status                             | str            | `active` / `claimed` / `completed` / `expired`                               |
| claimed_by                         | int?           | ID penerima yang mengklaim                                                   |
| claimed_at                         | str?           | Waktu klaim                                                                  |
| arrived_at                         | str?           | Waktu makanan tiba di penerima                                               |
| completed_at                       | str?           | Waktu donasi selesai                                                         |
| created_at                         | str            | Waktu pembuatan                                                              |

### 4.5 TopsisResult

| Field            | Tipe     | Keterangan                          |
| ---------------- | -------- | ----------------------------------- |
| id               | int (PK) | —                                   |
| donation_id      | int (FK) | Donasi terkait                      |
| recipient_id     | int (FK) | Penerima terkait                    |
| rank_position    | int      | Peringkat (1 = prioritas tertinggi) |
| raw_c1–c5        | float    | Nilai mentah 5 kriteria             |
| weight_c1–c5     | float    | Nilai terbobot                      |
| d_plus / d_minus | float    | Jarak ke ideal positif/negatif      |
| ci_score         | float    | Skor preferensi (-1 sampai 1)       |
| calculated_at    | str      | Waktu kalkulasi                     |

### 4.6 Notification

| Field               | Tipe     | Keterangan                                                          |
| ------------------- | -------- | ------------------------------------------------------------------- |
| id                  | int (PK) | —                                                                   |
| user_id             | int (FK) | Penerima notifikasi                                                 |
| title               | str      | Judul                                                               |
| message             | str      | Isi pesan                                                           |
| type                | str      | `donation_available` / `claim_approved` / `verification` / `system` |
| is_read             | int      | 0 = belum dibaca, 1 = sudah dibaca                                  |
| related_donation_id | int?     | ID donasi terkait                                                   |
| created_at          | str      | Waktu pembuatan                                                     |

### 4.7 Claim

| Field                | Tipe     | Keterangan                          |
| -------------------- | -------- | ----------------------------------- |
| id                   | int (PK) | —                                   |
| donation_id          | int (FK) | Donasi yang diklaim                 |
| recipient_id         | int (FK) | Penerima yang mengklaim             |
| topsis_rank_at_claim | int      | Peringkat TOPSIS saat klaim         |
| status               | str      | `pending` / `approved` / `rejected` |
| admin_note           | str?     | Catatan admin                       |
| created_at           | str      | Waktu klaim                         |
| reviewed_at          | str?     | Waktu review                        |
| reviewed_by          | int?     | ID admin yang mereview              |

### 4.8 Review

| Field        | Tipe     | Keterangan                   |
| ------------ | -------- | ---------------------------- |
| id           | int (PK) | —                            |
| donation_id  | int (FK) | Donasi terkait               |
| donor_id     | int (FK) | Donor yang diulas            |
| recipient_id | int (FK) | Penerima yang memberi ulasan |
| rating       | int      | Bintang 1–5                  |
| comment      | str      | Komentar                     |
| created_at   | str      | Waktu pembuatan              |

### 4.9 ActivityLog

| Field      | Tipe     | Keterangan  |
| ---------- | -------- | ----------- |
| id         | int (PK) | —           |
| user_id    | int      | ID pengguna |
| action     | str      | Jenis aksi  |
| details    | str      | Detail      |
| created_at | str      | Waktu       |

---

## 5. Algoritma TOPSIS — Inti Platform

TOPSIS (_Technique for Order of Preference by Similarity to Ideal Solution_) adalah metode decision-making multi-kriteria yang digunakan NutriShare untuk menentukan **penerima mana yang paling berhak** menerima setiap donasi.

### 5 Kriteria Penilaian

| Kode | Nama                       | Tipe        | Bobot   | Keterangan                                                                        |
| ---- | -------------------------- | ----------- | ------- | --------------------------------------------------------------------------------- |
| C1   | Kebutuhan Protein          | **Benefit** | Entropi | % kebutuhan protein harian yang terpenuhi — semakin tinggi semakin baik           |
| C2   | Skor Urgensi               | **Benefit** | Entropi | urgency_score + boost 1000 jika status emergency aktif                            |
| C3   | Waktu Tersisa              | **Benefit** | Entropi | Jam sebelum makanan kedaluwarsa — semakin lama semakin fleksibel                  |
| C4   | Jarak Pickup               | **Cost**    | Entropi | Jarak km dari lokasi pickup ke penerima — semakin dekat semakin baik              |
| C5   | Hari Sejak Terakhir Donasi | **Benefit** | Entropi | Hari sejak penerima terakhir dapat donasi — prioritas yang sudah lama tidak dapat |

### Alur Kalkulasi

1. **Haversine distance** menghitung jarak km antara donor dan setiap penerima
2. **Entropy weighting** menghitung bobot kriteria secara otomatis dari data
3. **Normalized matrix** → **weighted normalized matrix**
4. Hitung **ideal solution positif (A+)** dan **ideal solution negatif (A−)**
5. Hitung **jarak euclidean** ke A+ (D+) dan A− (D−)
6. **CI Score** = D− / (D+ + D−) → nilai mendekati 1 = prioritas tinggi
7. **Ranking** berdasarkan CI Score tertinggi ke terendah

### Kapan TOPSIS Dijalankan

- **Otomatis saat startup** server
- **Saat donasi baru dibuat** — langsung menghitung ranking untuk donasi tersebut
- **Manual oleh admin** — tombol "Recalculate TOPSIS" di dashboard admin
- **Berjalan di background** — tidak memblokir operasi lain

---

## 6. Fitur-Fitur Utama

### 6.1 Landing Page (Home)

- **Hero section** dengan CTA "Mulai Donasi" dan "Jadi Penerima"
- **Statistik animasi** (counter): jumlah donor, penerima, donasi aktif, donasi selesai
- **Bagaimana NutriShare Bekerja** — 4 langkah: Daftar → Donasi → TOPSIS Alokasi → Dampak
- **Testimoni** dari donor dan penerima
- **Leaderboard donor** — peringkat donator teratas berdasarkan jumlah donasi
- **CTA footer** untuk registrasi
- Responsive design (mobile-first)
- SEO meta tags dinamis

### 6.2 Autentikasi

#### Login

- Email + password dengan validasi client-side
- Show/hide password toggle
- JWT token disimpan di httpOnly cookie (bukan localStorage)
- Redirect otomatis berdasarkan role: `/donor`, `/recipient`, `/admin`
- Error handling dengan toast notification

#### Registrasi Donor

- **Step 1:** Nama bisnis, email, password
- **Step 2:** Tipe bisnis (hotel/restoran/kafe/katering/lainnya), alamat, telepon
- **Step 3:** Koordinat GPS (peta interaktif Leaflet untuk pick lokasi)
- Status default: `pending` (menunggu verifikasi admin)

#### Registrasi Penerima

- **Step 1:** Nama institusi, email, password
- **Step 2:** Tipe institusi (panti_asuhan/rumah_singgah/lembaga_sosial/lainnya), alamat, telepon
- **Step 3:** Data demografis: jumlah penghuni, rentang usia, kondisi kesehatan
- **Step 4:** Kebutuhan nutrisi harian: protein, kalori, zat besi, vitamin C (dalam gram/mg)
- **Step 5:** Koordinat GPS (peta interaktif)
- Status default: `pending`

#### Lupa & Reset Password

- Input email → dapat reset token
- Halaman reset password dengan token + password baru

### 6.3 Dashboard Donor

- **Ringkasan cepat:** total donasi, donasi aktif, rata-rata rating
- **Form donasi baru** (multi-step):
  - **Step 1:** Nama makanan, tipe makanan (6 kategori), jumlah porsi
  - **Step 2:** Nutrisi per porsi: protein (g), kalori (kkal), zat besi (mg), vitamin C (mg)
  - **Step 3:** Waktu validitas (jam), catatan, foto makanan
  - **Step 4:** Lokasi pickup (peta interaktif, default dari profil)
  - Tersedia **Food Catalog** — pilihan cepat untuk makanan umum (Nasi Kotak, Mie Ayam, dll.)
- **Daftar donasi** dengan filter: Semua / Aktif / Diklaim / Selesai
- **Countdown timer** real-time untuk donasi yang belum kedaluwarsa
- **Live Tracking Modal** — melacak status pengiriman donasi di peta
- **Profil Modal** — edit profil bisnis
- **Notifikasi** (polling setiap 30 detik): donasi baru tersedia, klaim disetujui, ulasan baru
- **Badge / Gamifikasi:**
  - 🌱 Donator Pemula (1 donasi)
  - ⭐ Donator Aktif (5 donasi)
  - 🏆 Pahlawan Pangan (10 donasi)
  - 👑 Legenda Donasi (20+ donasi)
  - ❤️ Favorit Penerima (5+ ulasan positif)
- **Review** — melihat ulasan dari penerima

### 6.4 Dashboard Penerima

- **Peta donasi aktif** (Leaflet/OpenStreetMap) — marker donor dan penerima, polyline pengiriman
- **Daftar donasi tersedia** dengan ranking TOPSIS:
  - Peringkat (Rank 1, 2, 3...)
  - CI Score (skor preferensi)
  - Countdown timer kedaluwarsa
  - Detail nutrisi: protein, kalori
- **Klaim donasi** — penerima mengklaim donasi berdasarkan ranking
- **Status donasi:** Diklaim → Dalam Perjalanan → Selesai
- **AKG Tracker (Angka Kebutuhan Gizi Harian):**
  - Radar chart menampilkan pemenuhan nutrisi: protein, kalori, zat besi, vitamin C
  - Persentase pemenuhan harian
  - Daftar donasi yang diterima hari ini beserta kontribusi nutrisinya
  - Target vs realisasi per nutrisi
- **Notifikasi** real-time
- **Profil Modal** — edit data institusi dan kebutuhan nutrisi
- **Emergency alert** — penerima dapat mengajukan status darurat

### 6.5 Dashboard Admin

- **Tab Overview:**
  - Statistik ringkas: total donor, penerima, donasi aktif, donasi selesai
  - Grafik tren donasi mingguan (Line chart)
  - Distribusi tipe makanan (Pie chart)
  - Total porsi & protein yang tersalurkan
- **Tab Verifikasi:**
  - Daftar pengguna menunggu verifikasi (donor & penerima)
  - Terima / Tolak pendaftaran
  - Lihat dokumen verifikasi penerima
- **Tab Data:**
  - Tabel lengkap donor dan penerima
  - Pencarian global (donor, penerima, donasi, klaim)
  - Urutkan berdasarkan: nama, tipe, total donasi, status, urgensi, darurat
- **Tab Aktivitas:**
  - Log aktivitas seluruh pengguna
- **TOPSIS Management:**
  - Tombol "Recalculate TOPSIS" — menjalankan ulang algoritma untuk semua donasi aktif
- **Klaim Management:**
  - Review klaim masuk
  - Setujui / Tolak klaim dengan catatan admin
- Auto-refresh data setiap 30 detik

### 6.6 Sistem Notifikasi

- **Jenis notifikasi:**
  - `donation_available` — donasi baru tersedia untuk penerima
  - `claim_approved` — klaim disetujui admin
  - `verification` — status verifikasi berubah
  - `system` — notifikasi sistem (ulasan baru, dll.)
- **Mekanisme:** Polling HTTP setiap 30 detik (compatibel Vercel/serverless)
- **Indikator unread** — badge angka di bell icon
- **Mark as read** — klik untuk tandai sudah dibaca

### 6.7 Sistem Ulasan (Review)

- Penerima memberikan ulasan untuk donasi yang sudah selesai
- Rating bintang 1–5
- Komentar opsional
- Ulasan ditampilkan di profil donor
- Donor mendapat badge jika mengumpulkan 5+ ulasan positif

### 6.8 Peta Interaktif (Leaflet + OpenStreetMap)

- **Donor dashboard:** marker lokasi pickup donasi
- **Peta penerima:** menampilkan semua donasi aktif dengan marker donor dan penerima
- **Polyline:** rute pengiriman dari donor ke penerima
- **Live Tracking Modal:** pemetaan real-time status donasi
- **Custom icons:** donor (warna biru) dan penerima (warna hijau)
- **Location Picker:** penerima/donor memilih lokasi dengan klik peta

### 6.9 Gamifikasi

| Badge            | Syarat              | Ikon |
| ---------------- | ------------------- | ---- |
| Donator Pemula   | ≥ 1 donasi selesai  | 🌱   |
| Donator Aktif    | ≥ 5 donasi selesai  | ⭐   |
| Pahlawan Pangan  | ≥ 10 donasi selesai | 🏆   |
| Legenda Donasi   | ≥ 20 donasi selesai | 👑   |
| Favorit Penerima | ≥ 5 ulasan positif  | ❤️   |

---

## 7. API Endpoints

### 7.1 Autentikasi (`/api/auth/...`)

| Metode | Endpoint                       | Keterangan                         |
| ------ | ------------------------------ | ---------------------------------- |
| POST   | `/api/auth/register/donor`     | Registrasi donor                   |
| POST   | `/api/auth/register/recipient` | Registrasi penerima                |
| POST   | `/api/auth/register/admin`     | Registrasi admin (perlu admin_key) |
| POST   | `/api/auth/login`              | Login                              |
| POST   | `/api/auth/logout`             | Logout                             |
| POST   | `/api/auth/forgot-password`    | Minta reset password               |
| POST   | `/api/auth/reset-password`     | Reset password dengan token        |

### 7.2 Donasi (`/api/donations/...`)

| Metode | Endpoint                       | Keterangan                                |
| ------ | ------------------------------ | ----------------------------------------- |
| POST   | `/api/donations`               | Buat donasi baru (rate-limited: 20/menit) |
| GET    | `/api/donations`               | Daftar donasi (filter: donor_id, status)  |
| POST   | `/api/donations/{id}/claim`    | Klaim donasi                              |
| POST   | `/api/donations/{id}/arrived`  | Tandai makanan tiba                       |
| POST   | `/api/donations/{id}/complete` | Selesaikan donasi                         |

### 7.3 Penerima (`/api/recipients/...`)

| Metode | Endpoint                       | Keterangan                       |
| ------ | ------------------------------ | -------------------------------- |
| GET    | `/api/recipients/{id}/profile` | Profil penerima                  |
| PUT    | `/api/recipients/{id}/profile` | Update profil                    |
| GET    | `/api/recipients/{id}/akg`     | Data Angka Kebutuhan Gizi Harian |

### 7.4 TOPSIS (`/api/topsis/...`)

| Metode | Endpoint                    | Keterangan                         |
| ------ | --------------------------- | ---------------------------------- |
| GET    | `/api/topsis/{donation_id}` | Hasil ranking TOPSIS untuk donasi  |
| POST   | `/api/admin/topsis/run`     | Jalankan ulang TOPSIS (admin only) |

### 7.5 Admin (`/api/admin/...`)

| Metode | Endpoint                        | Keterangan                  |
| ------ | ------------------------------- | --------------------------- |
| GET    | `/api/admin/users`              | Daftar semua pengguna       |
| POST   | `/api/admin/verify/{user_id}`   | Verifikasi / tolak pengguna |
| DELETE | `/api/admin/users/{user_id}`    | Hapus pengguna              |
| GET    | `/api/admin/claims`             | Daftar klaim                |
| POST   | `/api/admin/claims/{id}/review` | Setujui / tolak klaim       |

### 7.6 Dashboard (`/api/dashboard/...`)

| Metode | Endpoint                | Keterangan           |
| ------ | ----------------------- | -------------------- |
| GET    | `/api/dashboard/stats`  | Statistik ringkas    |
| GET    | `/api/dashboard/trends` | Tren donasi mingguan |

### 7.7 Publik (`/api/...`)

| Metode | Endpoint                  | Keterangan                          |
| ------ | ------------------------- | ----------------------------------- |
| GET    | `/api/public/leaderboard` | Papan peringkat donor teratas       |
| GET    | `/api/public/stats`       | Statistik publik untuk landing page |

### 7.8 Lainnya

| Metode | Endpoint                       | Keterangan                            |
| ------ | ------------------------------ | ------------------------------------- |
| GET    | `/api/notifications`           | Notifikasi pengguna                   |
| PUT    | `/api/notifications/{id}/read` | Tandai notifikasi sudah dibaca        |
| POST   | `/api/reviews`                 | Kirim ulasan (rate-limited: 20/menit) |
| GET    | `/api/donors/{id}/reviews`     | Ulasan untuk donor tertentu           |
| GET    | `/api/donors/{id}/badges`      | Badge untuk donor tertentu            |
| POST   | `/api/upload`                  | Upload foto (JPEG/PNG/WEBP, max 5MB)  |
| GET    | `/health`                      | Health check                          |

---

## 8. Alur Penggunaan (User Journey)

### 8.1 Alur Donor

```
1. Registrasi (nama bisnis, tipe, alamat, koordinat GPS)
2. Menunggu verifikasi admin (status: pending)
3. Admin memverifikasi → status: verified
4. Login → Dashboard Donor
5. Buat donasi baru (nama makanan, nutrisi, porsi, foto, lokasi)
   → TOPSIS otomatis menghitung ranking untuk semua penerima verified
   → Notifikasi dikirim ke semua penerima verified
6. Melihat daftar donasi dengan status (aktif / diklaim / selesai)
7. Penerima mengklaim → donor melihat profil penerima
8. Penerima konfirmasi pengambilan → status: completed
9. Penerima memberikan ulasan (bintang 1-5)
10. Donor mendapat badge sesuai pencapaian
```

### 8.2 Alur Penerima

```
1. Registrasi (nama institusi, tipe, kebutuhan nutrisi harian, koordinat GPS)
2. Menunggu verifikasi admin (status: pending)
3. Admin memverifikasi → status: verified
4. Login → Dashboard Penerima
5. Melihat peta donasi aktif dengan ranking TOPSIS
   → Rank 1 = prioritas tertinggi
6. Mengklaim donasi (hanya dapat klaim yang ranking-nya bagus)
7. Menunggu persetujuan admin
8. Admin menyetujui → status: claimed
9. Mengambil makanan / diantarkan
10. Menandai "tiba" → donasi selesai
11. Melihat AKG tracker (pemenuhan nutrisi hari ini)
12. Memberikan ulasan untuk donor
13. Jika darurat → ajukan status emergency (urgency score naik)
```

### 8.3 Alur Admin

```
1. Login dengan akun admin (akses: /admin)
2. Melihat statistik overview (donor, penerima, donasi)
3. Verifikasi pendaftaran donor & penerima
4. Review klaim donasi (setujui / tolak)
5. Kelola data pengguna (cari, urutkan, hapus)
6. Jalankan ulang TOPSIS jika diperlukan
7. Monitoring log aktivitas
```

---

## 9. Halaman-Halaman Website

| #   | Halaman             | URL                      | Keterangan                                      |
| --- | ------------------- | ------------------------ | ----------------------------------------------- |
| 1   | Landing Page        | `/`                      | Beranda publik dengan statistik, testimoni, CTA |
| 2   | Login               | `/login`                 | Form email + password                           |
| 3   | Registrasi Donor    | `/register/donor`        | Form multi-step 3 langkah                       |
| 4   | Registrasi Penerima | `/register/recipient`    | Form multi-step 5 langkah                       |
| 5   | Dashboard Donor     | `/donor`                 | Kelola donasi, badge, ulasan                    |
| 6   | Dashboard Penerima  | `/recipient`             | Peta donasi, klaim, AKG tracker                 |
| 7   | Dashboard Admin     | `/admin`                 | Statistik, verifikasi, kelola data              |
| 8   | Lupa Password       | `/forgot-password`       | Input email untuk reset                         |
| 9   | Reset Password      | `/reset-password/:token` | Form password baru                              |
| 10  | 404 Not Found       | `/*`                     | Halaman error 404                               |

---

## 10. Kategori Data

### Tipe Bisnis Donor

| Kode       | Label    |
| ---------- | -------- |
| `hotel`    | Hotel    |
| `restoran` | Restoran |
| `kafe`     | Kafe     |
| `katering` | Katering |
| `lainnya`  | Lainnya  |

### Tipe Institusi Penerima

| Kode             | Label          |
| ---------------- | -------------- |
| `panti_asuhan`   | Panti Asuhan   |
| `rumah_singgah`  | Rumah Singgah  |
| `lembaga_sosial` | Lembaga Sosial |
| `lainnya`        | Lainnya        |

### Tipe Makanan

| Kode            | Label               |
| --------------- | ------------------- |
| `makanan_berat` | Makanan Berat       |
| `sayur`         | Sayur               |
| `lauk_protein`  | Lauk Pauk / Protein |
| `snack`         | Snack / Cemilan     |
| `minuman`       | Minuman             |
| `lainnya`       | Lainnya             |

### Status Donasi

| Kode        | Label       | Keterangan                                   |
| ----------- | ----------- | -------------------------------------------- |
| `active`    | Aktif       | Donasi tersedia untuk diklaim                |
| `claimed`   | Diklaim     | Sudah diklaim penerima, menunggu pengambilan |
| `completed` | Selesai     | Donasi berhasil diterima                     |
| `expired`   | Kedaluwarsa | Lewat waktu validitas                        |

### Status Klaim

| Kode       | Label           |
| ---------- | --------------- |
| `pending`  | Menunggu Review |
| `approved` | Disetujui       |
| `rejected` | Ditolak         |

### Status Pengguna

| Kode       | Label               |
| ---------- | ------------------- |
| `pending`  | Menunggu Verifikasi |
| `verified` | Terverifikasi       |
| `rejected` | Ditolak             |

---

## 11. Keamanan

- **JWT httpOnly Cookie** — token tidak dapat diakses JavaScript (mencegah XSS)
- **CSRF Protection** — validasi Origin/Referer header pada semua request POST/PUT/DELETE
- **Security Headers:**
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Content-Security-Policy` dengan whitelist ketat
  - `Strict-Transport-Security` (production)
- **Rate Limiting** — 20 request/menit untuk donasi dan review
- **Input Validation** — Pydantic schemas di backend + validasi client-side
- **Password Hashing** — bcrypt
- **File Upload** — batas ukuran 5MB, hanya JPEG/PNG/WEBP

---

## 12. Statistik & Dampak

### Metrik yang Ditampilkan

- **Jumlah donor terdaftar**
- **Jumlah penerima terdaftar**
- **Donasi aktif** (saat ini tersedia)
- **Donasi selesai** (total historis)
- **Total porsi tersalurkan**
- **Total protein tersalurkan (kg)**
- **Tren donasi 7 hari terakhir** (grafik harian)
- **Distribusi tipe makanan** (grafik pie)

### Leaderboard

- Peringkat donor berdasarkan jumlah donasi selesai
- Badge pencapaian untuk donor aktif

---

## 13. Teknologi Pendukung

### Frontend Libraries

| Library                    | Fungsi                         |
| -------------------------- | ------------------------------ |
| React 19                   | UI framework                   |
| TypeScript                 | Type safety                    |
| React Router               | Client-side routing            |
| TailwindCSS                | Utility-first CSS              |
| Framer Motion              | Animasi transisi               |
| Chart.js + react-chartjs-2 | Grafik (Bar, Pie, Line, Radar) |
| React Leaflet + Leaflet    | Peta interaktif OpenStreetMap  |
| React Hot Toast            | Notifikasi toast               |
| Lucide React               | Ikon                           |
| date-fns                   | Format waktu relatif           |

### Backend Libraries

| Library           | Fungsi                          |
| ----------------- | ------------------------------- |
| FastAPI           | Async Python web framework      |
| SQLModel          | ORM (SQLAlchemy + Pydantic)     |
| aiosqlite         | Async SQLite driver             |
| NumPy             | Kalkulasi TOPSIS vectorized     |
| PyJWT             | JWT token encode/decode         |
| bcrypt            | Password hashing                |
| pydantic-settings | Environment variable management |

---

## 14. Angka Kebutuhan Gizi Harian (AKG) yang Digunakan

Platform NutriShare melacak 4 nutrisi utama:

| Nutrisi   | Satuan            | Keterangan                          |
| --------- | ----------------- | ----------------------------------- |
| Protein   | gram (g)          | Untuk pertumbuhan dan perbaikan sel |
| Kalori    | kilokalori (kkal) | Energi harian                       |
| Zat Besi  | miligram (mg)     | Pencegahan anemia                   |
| Vitamin C | miligram (mg)     | Daya tahan tubuh                    |

Setiap penerima mengisi kebutuhan harian saat registrasi, dan AKG Tracker menampilkan progres pemenuhan berdasarkan donasi yang diterima.

---

## 15. Kata Kunci & Istilah

| Istilah                  | Penjelasan                                                   |
| ------------------------ | ------------------------------------------------------------ |
| **TOPSIS**               | Metode pengambilan keputusan multi-kriteria                  |
| **CI Score**             | _Comprehensive Index_ — skor preferensi TOPSIS (-1 sampai 1) |
| **AKG**                  | Angka Kebutuhan Gizi Harian                                  |
| **Food Waste**           | Sisa makanan yang terbuang                                   |
| **Donor**                | Pihak yang memberikan donasi makanan                         |
| **Recipient / Penerima** | Pihak yang menerima donasi makanan                           |
| **Claim**                | Proses penerima mengklaim donasi                             |
| **Urgency Score**        | Skor urgensi kebutuhan penerima                              |
| **Emergency**            | Status darurat penerima (meningkatkan prioritas)             |
| **Gamifikasi**           | Sistem badge/pencapaian untuk motivasi donor                 |
| **WAL Mode**             | _Write-Ahead Logging_ — mode SQLite untuk performa           |

---

## 16. Panduan Penulisan Artikel

### Topik yang Relevan

1. **Food Waste & Sustainability** — NutriShare sebagai solusi food waste di Indonesia
2. **Teknologi untuk Sosial** — Bagaimana TOPSIS digunakan untuk distribusi pangan adil
3. **Gamifikasi untuk Dampak Sosial** — Sistem badge yang memotivasi donor
4. **Data-Driven Charity** — Transparansi alokasi donasi berbasis data nutrisi
5. **Open Source for Good** — NutriShare sebagai platform open-source
6. **Case Study** — Panti asuhan X menerima donasi dari hotel Y melalui NutriShare

### Angka Penting untuk Dikutip

- 5 kriteria TOPSIS yang digunakan (protein, urgensi, waktu, jarak, riwayat)
- 4 nutrisi yang dilacak (protein, kalori, zat besi, vitamin C)
- 6 tipe makanan yang didukung
- 5 level badge gamifikasi
- Rate limiting 20 request/menit

### Tone yang Disarankan

- **Informatif & faktual** — sertakan data teknis yang spesifik
- **Inspiratif** — tekankan dampak sosial
- **Aksesible** — jelaskan algoritma TOPSIS dengan bahasa sederhana
- **Bahasa Indonesia** — target audience adalah masyarakat Indonesia

---

_Terakhir diperbarui: 15 Juli 2026_
_Versi platform: NutriShare v2.0.0_
