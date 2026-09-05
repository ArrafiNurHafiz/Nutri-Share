# NutriShare Production Maintenance Guide

Panduan pemeliharaan rutin, prosedur backup database, verifikasi restore, dan checklist rilis (_pre-release quality gate_) untuk NutriShare.

---

## 1. Jadwal & Checklist Pemeliharaan Rutin

### Harian (Daily)

- [ ] Pantau status uptime via health endpoint: `https://nutrishare.web.id/health`
- [ ] Periksa log error serverless Vercel untuk lonjakan error 5xx.
- [ ] Verifikasi ketersediaan database PostgreSQL.

### Mingguan (Weekly)

- [ ] Periksa kuota storage database dan connection pool.
- [ ] Tinjau aktivitas anomali pada tabel `activity_logs`.
- [ ] Bersihkan data pengujian jika ada proses audit yang baru selesai.

### Bulanan (Monthly)

- [ ] Audit keamanan dependensi: `npm audit` (frontend) & `pip-audit` / `safety` (backend).
- [ ] Lakukan uji restore database terisolasi (sesuai prosedur Section 2).
- [ ] Tinjau rata-rata latensi API dan optimasi query lambat.

---

## 2. Prosedur Backup & Restore Database

### A. Strategi Backup

- **Provider-Level Automated Snapshots:**
  Neon PostgreSQL menyediakan _point-in-time recovery (PITR)_ dan snapshot harian otomatis.
- **Manual Logical Dump (pg_dump):**
  Untuk arsip terisolasi, gunakan command:
  ```bash
  pg_dump "$DATABASE_URL" -Fc -f "nutrishare_backup_$(date +%Y%m%d_%H%M%S).dump"
  ```

### B. Prosedur Restore Terisolasi (Non-Destructive)

1. Buat database target sementara (_staging/test database_).
2. Terapkan file dump menggunakan:
   ```bash
   pg_restore -d "$TEST_DATABASE_URL" -v "nutrishare_backup.dump"
   ```
3. Verifikasi jumlah record dan integritas relasi foreign key.
4. Jangan pernah menimpa database produksi secara langsung tanpa rencana rollback.

---

## 3. Pre-Release Quality Gate Checklist

Sebelum melakukan deployment rilis baru ke production (`npx vercel --prod`):

- [ ] **1. Backend Tests:** `.venv/bin/pytest backend/tests/` $\to$ **100% PASS, 0 Failures, 0 Warnings**
- [ ] **2. Frontend Type Check:** `cd frontend && npm run lint` $\to$ **0 Type Errors**
- [ ] **3. Frontend Production Build:** `cd frontend && npm run build` $\to$ **0 Build Errors**
- [ ] **4. Security Validation:** Tidak ada kredensial/secret/password yang ter-commit ke git.
- [ ] **5. Git Working Tree:** Branch `main` bersih dan telah di-push ke GitHub remote.
- [ ] **6. Post-Deploy Health Check:** `curl -s https://nutrishare.web.id/health` $\to$ `HTTP 200 {"status": "ok"}`
