# PRD NUTRI-SHARE — Pengembangan ke Depan

---

## 15.1 Fitur yang Direncanakan

| #   | Fitur                    | Prioritas | Status   | Estimasi   |
| --- | ------------------------ | --------- | -------- | ---------- |
| 1   | **Sistem Kurir Relawan** | 🔴 Tinggi | PRD siap | 10-14 hari |
| 2   | **Live GPS Tracking**    | 🔴 Tinggi | PRD siap | 3-4 hari   |
| 3   | **Rate Limiting**        | 🟡 Sedang | Belum    | 1 hari     |
| 4   | **Dashboard Mobile**     | 🟡 Sedang | Belum    | -          |
| 5   | **Notifikasi Email**     | 🟡 Sedang | Belum    | -          |
| 6   | **Multi Bahasa (i18n)**  | 🟢 Rendah | Belum    | -          |
| 7   | **Payment Gateway**      | 🟢 Rendah | Belum    | -          |
| 8   | **AI Rekomendasi Menu**  | 🟢 Rendah | Belum    | -          |
| 9   | **Laporan PDF**          | 🟢 Rendah | Belum    | -          |
| 10  | **Chat Kurir**           | 🟢 Rendah | Belum    | -          |

## 15.2 Detail Fitur

### 15.2.1 Kurir Relawan

PRD lengkap: `docs/prd-courier-delivery-system.md`

**Fitur:**

- Role `courier` + registrasi + verifikasi admin
- Tabel `deliveries`, `courier_profiles`, `courier_locations`
- Dashboard kurir: list delivery, tombol pickup/deliver, GPS
- Admin: assign kurir ke delivery
- Live GPS: Geolocation API browser, update tiap 10 detik
- Tip system: donatur bisa memberi tip sukarela
- Max 2 delivery per kurir

### 15.2.2 Live GPS Tracking

- Browser Geolocation API (`navigator.geolocation.watchPosition`)
- Kirim posisi tiap 10 detik → `POST /api/courier/location`
- Donor/penerima polling → `GET /api/deliveries/{id}/track`
- Marker kurir bergerak real-time di peta Leaflet

## 15.3 Catatan Arsitektur

### Database Migration

Untuk perubahan skema ke depan:

```bash
pip install alembic
alembic init migrations
```

### PostgreSQL Migration

Jika data >1GB, migrasi ke PostgreSQL:

1. Install `asyncpg`
2. Ganti connection string
3. Migration script

### File Storage

Upload foto saat ini di `frontend/public/uploads/`. Untuk production:

- Gunakan object storage (S3/MinIO)
- Simpan URL di database, bukan file path lokal

### Background Tasks

TOPSIS jalan sync di request thread. Untuk banyak data:

- Celery/Redis queue
- Background task processing

### Caching

Belum ada cache layer. Untuk scale:

- Redis untuk cache query
- Cache session store

### Monitoring

- Prometheus + Grafana untuk metrics
- Log aggregation (Loki/Datadog)
- Uptime monitoring (UptimeRobot)
