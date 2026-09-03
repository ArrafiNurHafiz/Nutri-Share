# PRD NUTRI-SHARE — Timeline, Milestones & Rencana Rilis

---

## 14.1 Timeline Pengembangan

### Phase 1: Foundation (Migration — Selesai)

| Task                             | Durasi      | Status     |
| -------------------------------- | ----------- | ---------- |
| Setup Python + FastAPI project   | 1 hari      | ✅ Selesai |
| Database models (10 tabel)       | 1 hari      | ✅ Selesai |
| Auth system (JWT + bcrypt)       | 1 hari      | ✅ Selesai |
| 42 API endpoints                 | 3 hari      | ✅ Selesai |
| TOPSIS algorithm (NumPy)         | 1 hari      | ✅ Selesai |
| Utils (logger, upload)           | 1 hari      | ✅ Selesai |
| Unit + Contract + Blackbox tests | 2 hari      | ✅ Selesai |
| **Subtotal**                     | **10 hari** |            |

### Phase 2: Frontend Compatibility (Selesai)

| Task                                        | Durasi     | Status     |
| ------------------------------------------- | ---------- | ---------- |
| API error format compatibility              | 1 hari     | ✅ Selesai |
| CSS/dark mode fixes                         | 1 hari     | ✅ Selesai |
| Registration form fixes (phone, validation) | 1 hari     | ✅ Selesai |
| Admin verify fix                            | 1 hari     | ✅ Selesai |
| Donor arrive/complete flow fix              | 1 hari     | ✅ Selesai |
| **Subtotal**                                | **5 hari** |            |

### Phase 3: Stabilisasi (Selesai)

| Task                                   | Durasi     | Status     |
| -------------------------------------- | ---------- | ---------- |
| Full audit backend (143 test)          | 1 hari     | ✅ Selesai |
| Full audit frontend (13 pages)         | 1 hari     | ✅ Selesai |
| Restruktur proyek (backend/ frontend/) | 1 hari     | ✅ Selesai |
| Cleanup file tidak terpakai            | 1 hari     | ✅ Selesai |
| **Subtotal**                           | **4 hari** |            |

### Phase 4: Dokumentasi (Selesai)

| Task                           | Durasi     | Status     |
| ------------------------------ | ---------- | ---------- |
| PRD Ringkasan + Arsitektur     | 1 hari     | ✅ Selesai |
| PRD Persona + User Stories     | 1 hari     | ✅ Selesai |
| PRD Database + API + Frontend  | 2 hari     | ✅ Selesai |
| PRD Auth + TOPSIS + Notifikasi | 1 hari     | ✅ Selesai |
| PRD Non-functional + Timeline  | 1 hari     | ✅ Selesai |
| **Subtotal**                   | **6 hari** |            |

### Total Timeline: ~25 hari

---

## 14.2 Milestones

| Milestone                   | Tanggal        | Deliverable                  | Status |
| --------------------------- | -------------- | ---------------------------- | ------ |
| M1: Backend Python complete | 2026-07-03     | 42 endpoint, 143 test ✅     | ✅     |
| M2: Migration complete      | 2026-07-04     | Semua fitur Node.js → Python | ✅     |
| M3: Bug fixes               | 2026-07-05     | Semua flow berfungsi normal  | ✅     |
| M4: Frontend audit          | 2026-07-06     | 13 halaman 200 OK            | ✅     |
| M5: PRD documentation       | 2026-07-07     | 15 file PRD lengkap          | ✅     |
| M6: Demo siap               | **2026-07-07** | Production-ready             | 🟢     |

---

## 14.3 Rencana Rilis

### v1.0.0 — MVP (Sekarang)

**Fitur:** Registrasi, login, create/claim/complete donasi, TOPSIS ranking, review, admin verify, dashboard, notifikasi SSE, dark mode.

### v2.0.0 — Kurir & GPS (Mendatang)

**Fitur:** Kurir relawan, assign delivery, live GPS tracking, tip system, max 2 delivery per kurir.

Estimasi: 10-14 hari setelah development dimulai.

### v2.1.0 — PWA & Mobile

**Fitur:** Service worker, push notification, installable PWA, mobile-friendly dashboard kurir.

### v3.0.0 — Scale & Enterprise

**Fitur:** PostgreSQL migration, email notification, laporan PDF, multi-kota, multi-bahasa, payment gateway.

---

## 14.4 Release Checklist

### Pra-Rilis

- [ ] Semua 143 test lulus
- [ ] Build frontend sukses (vite build)
- [ ] Production env vars siap
- [ ] JWT_SECRET diubah (bukan default)
- [ ] ADMIN_SECRET_KEY diubah (bukan default)
- [ ] Database backup
- [ ] SSL certificate aktif
- [ ] Domain terkonfigurasi

### Pasca-Rilis

- [ ] Monitoring uptime
- [ ] Backup database otomatis
- [ ] Bug tracker aktif
- [ ] User feedback collection

---

## 14.5 Resource Requirements

### Development

| Resource                      | Jumlah                |
| ----------------------------- | --------------------- |
| Backend developer (Python)    | 1 orang               |
| Frontend developer (React/TS) | 1 orang               |
| UI/UX designer                | 0 orang (TailwindCSS) |

### Infrastructure (Production)

| Resource        | Spesifikasi              | Estimasi Biaya   |
| --------------- | ------------------------ | ---------------- |
| VPS             | 2 CPU, 2GB RAM, 50GB SSD | ~Rp150.000/bln   |
| Domain          | .com / .id               | ~Rp200.000/thn   |
| SSL             | Let's Encrypt            | Gratis           |
| Database        | SQLite                   | Gratis           |
| **Total/tahun** |                          | **~Rp2.000.000** |

### Operational

| Role                       | Tanggung Jawab                                |
| -------------------------- | --------------------------------------------- |
| Admin platform (1-2 orang) | Verifikasi user, approve claims, monitoring   |
| Relawan (5-10 orang)       | Pengiriman donasi (setelah fitur kurir aktif) |
