# PRD NUTRI-SHARE — Ringkasan Eksekutif

**File:** `00-index.md` | **Versi:** 2.0.0 | **Status:** Final | **Tanggal:** 2026-07-07

---

## 1.1 Nama Proyek

**NUTRI-SHARE** — Platform Distribusi Pangan Berbasis Gizi

---

## 1.2 Problem Statement

### Latar Belakang

Indonesia menghadapi paradoks pangan serius:

1. **Food Loss and Waste (FLW)** mencapai **23–48 juta ton per tahun** (BAPPENAS 2021)
2. Kerugian ekonomi akibat FLW: **Rp213–Rp551 triliun per tahun**
3. Sektor HoReKa (Hotel, Restoran, Kafe) menyumbang surplus pangan signifikan, terutama di Yogyakarta sebagai destinasi wisata
4. Di sisi lain, kelompok rentan (panti asuhan, rumah singgah, lembaga sosial) masih mengalami **hidden hunger** — kekurangan protein dan mikronutrien
5. Distribusi bantuan yang ada bersifat **first-come-first-served**, tidak memprioritaskan kebutuhan gizi
6. Tidak ada platform yang mengintegrasikan **standar Angka Kecukupan Gizi (AKG)** dalam distribusi surplus pangan

### Dampak Masalah

| Stakeholder                 | Dampak                                                                         |
| --------------------------- | ------------------------------------------------------------------------------ |
| Hotel/Restoran/Kafe         | Surplus pangan terbuang, biaya pembuangan limbah                               |
| Panti Asuhan/Lembaga Sosial | Bantuan tidak merata, kurang gizi pada anak                                    |
| Pemerintah                  | Target SDG 2 (Zero Hunger) dan SDG 12 (Responsible Consumption) belum tercapai |
| Lingkungan                  | Emisi metana dari pembusukan makanan di TPA                                    |

---

## 1.3 Visi & Misi

**Visi:** Menjadi platform distribusi pangan berbasis gizi terdepan di Indonesia yang menghubungkan surplus pangan dengan kebutuhan gizi masyarakat.

**Misi:**

1. Mengurangi food waste dengan menyalurkan surplus pangan bergizi
2. Memastikan distribusi objektif berdasarkan kebutuhan gizi (bukan first-come-first-served)
3. Memberikan transparansi penuh dalam setiap proses donasi
4. Mendukung pencapaian SDG 2 (Zero Hunger) dan SDG 12 (Responsible Consumption & Production)

---

## 1.4 Goals

| #   | Goal                                                                       | Metrik Keberhasilan                                  |
| --- | -------------------------------------------------------------------------- | ---------------------------------------------------- |
| G1  | Memungkinkan donor mempublikasikan surplus pangan dengan data gizi lengkap | Donor bisa membuat donasi dalam <3 menit             |
| G2  | Menentukan penerima prioritas secara objektif                              | TOPSIS mempertimbangkan 5 kriteria, bukan first-come |
| G3  | Memantau kecukupan gizi harian penerima                                    | AKG kalkulasi real-time setiap ada donasi selesai    |
| G4  | Transparansi penuh dari publikasi hingga selesai                           | Semua status bisa dilacak (active → completed)       |
| G5  | Real-time notification                                                     | SSE notifikasi <1 detik setelah event                |
| G6  | Memberikan apresiasi untuk donor aktif                                     | 5 level badges, top donors leaderboard               |
| G7  | 100% automated test coverage untuk semua endpoint                          | 143 test lulus                                       |

---

## 1.5 Non-Goals (Apa yang BUKAN scope)

| #   | Non-Goal                    | Alasan                                     |
| --- | --------------------------- | ------------------------------------------ |
| NG1 | Sistem kurir internal       | Akan dibangun di fase 2 (PRD terpisah)     |
| NG2 | Live GPS tracking real-time | Fase 2 setelah kurir                       |
| NG3 | Pembayaran/payment gateway  | Tidak relevan untuk platform donasi pangan |
| NG4 | Aplikasi mobile native      | Cukup PWA untuk MVP                        |
| NG5 | Multi bahasa                | Fase berikutnya                            |
| NG6 | Migrasi ke PostgreSQL       | Selama data <1GB, SQLite cukup             |

---

## 1.6 Target Pengguna

| Segmen       | Contoh                                        | Jumlah Potensial | Kebutuhan Utama                                          |
| ------------ | --------------------------------------------- | ---------------- | -------------------------------------------------------- |
| **Donor**    | Hotel, Restoran, Kafe, Katering di Yogyakarta | 500+             | Publikasi surplus mudah, tracking donasi, lihat reputasi |
| **Penerima** | Panti Asuhan, Rumah Singgah, Lembaga Sosial   | 200+             | Klaim donasi prioritas, monitoring gizi harian           |
| **Admin**    | Pengelola platform NUTRI-SHARE                | 3-5 orang        | Verifikasi, approve, pantau, laporan                     |
| **Publik**   | Masyarakat umum, donatur potensial            | Tak terbatas     | Lihat statistik, transparansi                            |

---

## 1.7 Teknologi

| Layer             | Teknologi    | Versi  | Alasan                                          |
| ----------------- | ------------ | ------ | ----------------------------------------------- |
| Backend Framework | FastAPI      | 0.139+ | Performa tinggi, OpenAPI otomatis, async native |
| ORM               | SQLModel     | 0.0.39 | Type-safe, integrasi Pydantic                   |
| Database          | SQLite (WAL) | 3.x    | Zero konfigurasi, cukup untuk skala awal        |
| Frontend          | React        | 19     | Ekosistem matang, Vite cepat                    |
| CSS               | TailwindCSS  | 4.3    | Utility-first, dark mode built-in               |
| Auth              | JWT + bcrypt | -      | httpOnly cookie, secure by default              |
| TOPSIS            | NumPy        | 2.5    | Vectorized, 10-50x lebih cepat dari JS          |
| Map               | Leaflet      | 1.9.4  | Open source, gratis, ringan                     |

---

## 1.8 Struktur Biaya

| Komponen                  | Biaya                  |
| ------------------------- | ---------------------- |
| Hosting (VPS)             | ~Rp150.000/bulan       |
| Domain                    | ~Rp200.000/tahun       |
| Map tiles (OpenStreetMap) | Gratis                 |
| Database (SQLite)         | Gratis                 |
| SSL (Let's Encrypt)       | Gratis                 |
| **Total estimasi**        | **~Rp2.000.000/tahun** |
