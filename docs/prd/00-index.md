# PRD NUTRI-SHARE — Daftar Isi

**Versi:** 2.0.0 | **Status:** Final | **Tanggal:** 2026-07-07

---

| #   | File                          | Bagian                                                                      |
| --- | ----------------------------- | --------------------------------------------------------------------------- |
| 00  | `00-index.md`                 | 📑 Daftar Isi & Glossary                                                    |
| 01  | `01-ringkasan.md`             | 📌 Ringkasan Eksekutif, Problem Statement, Goals, Target Pengguna           |
| 02  | `02-persona-stories.md`       | 👤 User Personas (3 persona), User Stories (31 US), Acceptance Criteria     |
| 03  | `03-arsitektur.md`            | 🏗️ Arsitektur Sistem, Diagram Alur, Tech Stack, Struktur Direktori          |
| 04  | `04-database.md`              | 🗄️ Database Schema — 10 Tabel lengkap dengan field, tipe, constraints       |
| 05  | `05-backend-api.md`           | 🔌 API Endpoints — 42 endpoint, format req/res, auth matrix                 |
| 06  | `06-frontend.md`              | 🖥️ Frontend — 14 halaman, 11 komponen, daftar API calls                     |
| 07  | `07-auth-security.md`         | 🔐 Auth & Keamanan — JWT, cookie, role guard, validasi, security headers    |
| 08  | `08-topsis.md`                | 🧮 TOPSIS Algorithm — 5 kriteria, 8 step, trigger points                    |
| 09  | `09-notifikasi-gamifikasi.md` | 🔔 Notifikasi & Gamification — SSE, 5 badges, top donors                    |
| 10  | `10-flow-status.md`           | 🔄 Flow Bisnis & State Machine — 7 tahap, status donasi/user/emergency, AKG |
| 11  | `11-ui-ux.md`                 | 🎨 UI/UX Design System — Warna, tipografi, komponen, dark mode              |
| 12  | `12-non-functional.md`        | ⚡ Non-Functional Requirements — Performa, KPI, Risiko, Asumsi              |
| 13  | `13-testing-deployment.md`    | 🧪 Testing (143 test) & Deployment (dev/prod)                               |
| 14  | `14-timeline-milestones.md`   | 📅 Timeline, Milestones, Release Plan, Resource Requirements                |
| 15  | `15-future.md`                | 🔮 Pengembangan ke Depan — 10 fitur, catatan arsitektur                     |

---

## Glossary / Daftar Istilah

| Istilah      | Definisi                                                                                        |
| ------------ | ----------------------------------------------------------------------------------------------- |
| **AKG**      | Angka Kecukupan Gizi — standar kebutuhan nutrisi harian berdasarkan Permenkes No. 28 Tahun 2019 |
| **TOPSIS**   | Technique for Order of Preference by Similarity to Ideal Solution — algoritma decision support  |
| **Entropy**  | Shannon Entropy — metode perhitungan bobot kriteria secara objektif                             |
| **CI Score** | Closeness Coefficient — skor akhir TOPSIS (0-1), semakin tinggi semakin prioritas               |
| **SSE**      | Server-Sent Events — teknologi real-time notification satu arah                                 |
| **Donor**    | Pengguna yang mendonasikan makanan (Hotel/Restoran/Kafe)                                        |
| **Penerima** | Pengguna yang menerima makanan (Panti Asuhan/Lembaga Sosial)                                    |
| **Admin**    | Pengelola platform yang memverifikasi dan memantau                                              |
| **HoReKa**   | Hotel, Restoran, dan Kafe — sektor penyumbang surplus pangan                                    |
| **FLW**      | Food Loss and Waste — kehilangan dan pemborosan pangan                                          |
| **SDG**      | Sustainable Development Goals — Tujuan Pembangunan Berkelanjutan PBB                            |
| **JWT**      | JSON Web Token — token autentikasi berbasis JSON                                                |
| **bcrypt**   | Algoritma hashing password yang aman                                                            |
| **WAL**      | Write-Ahead Logging — mode SQLite untuk performa concurrent                                     |
| **Claims**   | Permintaan/pengajuan klaim donasi oleh penerima                                                 |
| **Pickup**   | Lokasi pengambilan donasi (di tempat donor)                                                     |
