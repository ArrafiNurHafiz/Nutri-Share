# PRD NUTRI-SHARE — Non-Functional Requirements, KPI & Risiko

---

## 12.1 Non-Functional Requirements

### 12.1.1 Performa

| Metrik                   | Target   | Catatan                |
| ------------------------ | -------- | ---------------------- |
| Response time API (p95)  | <200ms   | Untuk 95% request      |
| Response time API (p99)  | <500ms   | Untuk 99% request      |
| TOPSIS calculation       | <100ms   | Untuk 100 recipient    |
| SSE notification latency | <1 detik | Dari event → browser   |
| Frontend page load       | <2 detik | First contentful paint |
| Concurrent users         | 100      | VPS 2GB minimal        |
| Database size            | <1GB     | SQLite optimal         |

### 12.1.2 Ketersediaan (Availability)

| Metrik              | Target                 |
| ------------------- | ---------------------- |
| Uptime              | 99.5% (non-production) |
| Waktu startup       | <5 detik               |
| Recovery dari crash | <30 detik              |
| Backup database     | Otomatis setiap 24 jam |

### 12.1.3 Keamanan

| Aspek            | Standar                         |
| ---------------- | ------------------------------- |
| Password storage | bcrypt (cost=12)                |
| Token expiry     | 7 hari                          |
| Session          | httpOnly cookie                 |
| SQL Injection    | Parameterized queries           |
| XSS              | React auto-escape               |
| CORS             | Origin validation di production |
| Secrets          | Environment variables           |

### 12.1.4 Skalabilitas

| Aspek                        | Capacity |
| ---------------------------- | -------- |
| Maks user                    | 10.000   |
| Maks donasi/hari             | 1.000    |
| Maks perhitungan TOPSIS/hari | 10.000   |
| Maks notifikasi SSE/user     | 100/jam  |

### 12.1.5 Kompatibilitas

| Browser       | Minimum Version |
| ------------- | --------------- |
| Chrome        | 90+             |
| Firefox       | 90+             |
| Safari        | 15+             |
| Edge          | 90+             |
| Mobile Chrome | 90+             |
| Mobile Safari | 15+             |

---

## 12.2 KPI (Key Performance Indicators)

### 12.2.1 KPI Launch

| KPI                           | Target             | Periode | Cara Ukur                       |
| ----------------------------- | ------------------ | ------- | ------------------------------- |
| Jumlah donor terdaftar        | 50+                | 3 bulan | Database                        |
| Jumlah penerima terdaftar     | 30+                | 3 bulan | Database                        |
| Total donasi tersalurkan      | 500+ porsi         | 3 bulan | Database                        |
| Rata-rata rating donor        | 4.5+               | 3 bulan | Database reviews                |
| Waktu dari publikasi ke klaim | <24 jam            | 3 bulan | Selisih created_at - claimed_at |
| User engagement (login/hari)  | 30% user terdaftar | 3 bulan | Activity log                    |

### 12.2.2 KPI Teknis

| KPI               | Target    | Cara Ukur         |
| ----------------- | --------- | ----------------- |
| Test coverage     | >80%      | coverage report   |
| API availability  | >99%      | Uptime monitoring |
| Error rate        | <1%       | Log analysis      |
| Response time p95 | <200ms    | API monitoring    |
| Build time        | <30 detik | CI pipeline       |

---

## 12.3 Risiko & Mitigasi

| #   | Risiko                                      | Dampak                | Probabilitas | Mitigasi                     |
| --- | ------------------------------------------- | --------------------- | ------------ | ---------------------------- |
| R1  | SQLite write contention saat banyak request | Lambat/error          | Rendah       | WAL mode, busy_timeout 5000  |
| R2  | Database file corrupt                       | Hilang data           | Rendah       | Backup harian, WAL journal   |
| R3  | TOPSIS lambat untuk banyak recipient        | Response lambat       | Rendah       | NumPy vectorized (vs loop)   |
| R4  | Cookie tidak terkirim (beda domain)         | Auth gagal            | Sedang       | CORS config, Vite proxy      |
| R5  | SSE koneksi putus                           | Notif tidak terkirim  | Rendah       | Fallback polling 30s         |
| R6  | User daftar palsu                           | Data kotor            | Sedang       | Verifikasi admin             |
| R7  | File upload malware                         | Security              | Rendah       | Limit tipe file, size limit  |
| R8  | Fleet readiness                             | Demo gagal            | Sedang       | Full test suite, CI pipeline |
| R9  | Kurang dokumentasi                          | Sulit maintenance     | Sedang       | PRD ini, docstrings, README  |
| R10 | Browser lama tidak support                  | User tidak bisa akses | Rendah       | Target modern browser        |

---

## 12.4 Asumsi & Dependensi

### Asumsi

| #   | Asumsi                                                         |
| --- | -------------------------------------------------------------- |
| A1  | User memiliki koneksi internet stabil                          |
| A2  | User menggunakan browser modern (Chrome/Firefox/Safari/Edge)   |
| A3  | Donor memiliki data kandungan gizi makanan (bisa dari kemasan) |
| A4  | Penerima jujur dalam mengisi data kebutuhan gizi               |
| A5  | Admin akan memverifikasi user dalam <24 jam                    |
| A6  | Database SQLite cukup untuk 1 tahun pertama                    |
| A7  | Donor/penerima berlokasi di area Yogyakarta (jarak <50km)      |

### Dependensi Eksternal

| Dependensi              | Fungsi            | Risiko Jika Gagal             |
| ----------------------- | ----------------- | ----------------------------- |
| OpenStreetMap (leaflet) | Peta interaktif   | Map tidak tampil              |
| Google Fonts            | Tipografi         | Font fallback ke system       |
| Lucide React            | Ikon              | Ikon tidak tampil             |
| Chart.js                | Grafik            | Chart tidak tampil            |
| bcrypt                  | Hashing password  | Auth gagal total              |
| NumPy                   | TOPSIS vectorized | TOPSIS lambat (fallback loop) |
