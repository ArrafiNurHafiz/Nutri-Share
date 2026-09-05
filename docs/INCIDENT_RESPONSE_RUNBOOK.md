# NutriShare Incident Response Runbook

Panduan penanganan insiden operasional dan kegagalan sistem (_Disaster Recovery & Incident Response_) untuk platform NutriShare di lingkungan produksi.

---

## 1. Klasifikasi Severity Insiden

| Level                | Kriteria                                                                              | Target Response Time (MTTR) |
| :------------------- | :------------------------------------------------------------------------------------ | :-------------------------: |
| **SEV-1 (Critical)** | Website down total, database corrupt/tidak dapat diakses, kebocoran data autentikasi. |        $< 15$ Menit         |
| **SEV-2 (High)**     | Endpoint inti gagal (klaim donasi error, submit review gagal, login gagal).           |        $< 30$ Menit         |
| **SEV-3 (Medium)**   | Penurunan performa (latensi tinggi > 2s), gambar/asset lambat termuat.                |          $< 2$ Jam          |
| **SEV-4 (Low)**      | Bug minor tampilan, typo label, warning non-blocking.                                 |         $< 24$ Jam          |

---

## 2. Prosedur Penanganan Berdasarkan Skenario

### Skenario A: Website Down / 502 Bad Gateway

1. **Periksa Uptime & Health Endpoint:**
   - Jalankan `curl -I https://nutrishare.web.id/health`
   - Periksa Vercel Dashboard / Deployment status.
2. **Periksa Log Backend:**
   - Buka Vercel Logs: `vercel logs nutrishare-api.vercel.app`
   - Cari baris error dengan level `ERROR` atau `CRITICAL`.
3. **Analisis Akar Masalah:**
   - Apakah error berasal dari deployment baru? $\to$ Lakukan instant rollback via Vercel Dashboard ke commit stabil sebelumnya.
   - Apakah database connection timeout? $\to$ Lanjut ke Skenario B.
4. **Verifikasi Pasca Perbaikan:**
   - Pastikan `/health` mengembalikan `HTTP 200 {"status": "ok"}`.

---

### Skenario B: Database Connection Failure / Pool Exhaustion

1. **Periksa Status Provider Database (Neon/PostgreSQL):**
   - Buka Neon Console $\to$ Periksa metrik CPU, Active Connections, dan Storage.
   - Pastikan database tidak mengalami batas kuota koneksi.
2. **Tangani Cold Start vs Outage:**
   - Jika database berada pada mode _suspended_ (tier serverless), request pertama akan memakan waktu 2–3s untuk _wake-up_.
   - Jika database down, periksa status page provider.
3. **Lakukan Safe Connection Test:**
   - Akses `/health/detailed` untuk memverifikasi blok `"database": {"status": "healthy"}`.
4. **Perhatian Keamanan:**
   - **JANGAN** mengubah data atau menghapus tabel di database produksi secara langsung tanpa instruksi terdokumentasi.

---

### Skenario C: Lonjakan Error API (API Error Spike)

1. **Filter Log Berdasarkan `X-Request-ID`:**
   - Tangkap `X-Request-ID` dari header response yang gagal.
   - Lakukan penelusuran log untuk menemukan exception traceback yang relevan.
2. **Validasi Skema & Origin:**
   - Periksa apakah error disebabkan oleh kegagalan CSRF / Origin mismatch pada request POST/PUT/DELETE.
   - Pastikan frontend mengirim header origin `https://nutrishare.web.id`.
3. **Deploy Hotfix:**
   - Terapkan perbaikan, jalankan suite pengujian lokal: `.venv/bin/pytest backend/tests/`.
   - Deploy ke produksi: `npx vercel --prod --yes`.

---

### Skenario D: Insiden Keamanan / Compromised Secret

1. **Containment:**
   - Segera lakukan rotasi `JWT_SECRET` pada environment variable Vercel dan backend.
   - Merotasi `JWT_SECRET` secara instan akan membatalkan seluruh sesi token yang sedang aktif.
2. **Rotasi Database Credentials:**
   - Perbarui password database di Neon/PostgreSQL dan update `DATABASE_URL` di Vercel.
3. **Audit Log Aktivitas:**
   - Query tabel `activity_logs` untuk mengidentifikasi aksi anomali yang dilakukan sebelum rotasi.
