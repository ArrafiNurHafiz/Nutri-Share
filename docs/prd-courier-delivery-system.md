# PRD: Sistem Kurir & Delivery Management NUTRI-SHARE

| Metadata         |                |
| ---------------- | -------------- |
| **Status**       | Draft          |
| **Author**       | Claude Fabel 5 |
| **Tanggal**      | 2026-07-07     |
| **Target Rilis** | Q4 2026        |

---

## 1. Ringkasan Eksekutif

Saat ini NUTRI-SHARE hanya memfasilitasi pertemuan antara donor dan penerima tanpa sistem pengiriman. Donor/penerima harus mengatur logistik sendiri. PRD ini mengusulkan **sistem kurir relawan** dengan live GPS tracking, manajemen delivery, dan sistem tip, sehingga platform dapat mengelola pengiriman dari hulu ke hilir secara end-to-end.

---

## 2. Masalah & Latar Belakang

### 2.1 Masalah Saat Ini

| Masalah                     | Dampak                                      |
| --------------------------- | ------------------------------------------- |
| Tidak ada sistem pengiriman | Donor/penerima bingung cara mengirim barang |
| Tracking hanya simulasi     | Tidak bisa lihat posisi kurir real-time     |
| Tidak ada kurir terdaftar   | Tidak ada sumber daya pengiriman            |
| Tidak ada insentif          | Sukarelawan kurang termotivasi              |

### 2.2 Goal

1. ✅ Memungkinkan kurir relawan mendaftar dan mengambil tugas pengiriman
2. ✅ Live GPS tracking real-time posisi kurir
3. ✅ Manajemen delivery end-to-end (assign → pickup → antar → selesai)
4. ✅ Sistem tip untuk mengapresiasi relawan
5. ✅ Maks 2 delivery per kurir untuk menjaga kualitas

---

## 3. Target Pengguna

| Peran             | Deskripsi                                     | Kebutuhan                                       |
| ----------------- | --------------------------------------------- | ----------------------------------------------- |
| **Kurir Relawan** | Masyarakat umum yang ingin bantu antar donasi | Lihat tugas, ambil barang, antar, terima tip    |
| **Admin**         | Pengelola platform                            | Assign kurir, pantau delivery, verifikasi kurir |
| **Donor**         | Penyumbang makanan                            | Lihat status pengiriman, kasih tip              |
| **Penerima**      | Lembaga penerima                              | Lihat tracking kurir, konfirmasi terima         |

---

## 4. Alur Sistem

### 4.1 Flow Lengkap

```
[1] Donor Publikasi Donasi
        ↓
[2] Sistem TOPSIS → Peringkat Penerima
        ↓
[3] Penerima #1 Klaim Donasi
        ↓
[4] Admin Approve Klaim + Assign Kurir Relawan
        ↓
[5] Kurir Terima Tugas → Ambil Barang di Donor (pickup)
        ↓
[6] GPS Tracking Aktif → Donor & Penerima Bisa Lacak
        ↓
[7] Kurir Antar ke Penerima (deliver)
        ↓
[8] Penerima Konfirmasi Terima
        ↓
[9] Donasi Selesai → Donatur Bisa Tip Kurir (opsional)
```

### 4.2 Status Diagram

```
DONASI:
active → claimed → in_delivery → completed

DELIVERY:
assigned → picked_up → in_transit → delivered → completed
```

### 4.3 Mapping Status

| Status Donasi | Status Delivery | Deskripsi                         |
| ------------- | --------------- | --------------------------------- |
| `active`      | —               | Dipublikasi, menunggu klaim       |
| `claimed`     | —               | Diklaim, menunggu approve admin   |
| `in_delivery` | `assigned`      | Kurir ditugaskan, menunggu pickup |
| `in_delivery` | `picked_up`     | Barang sudah diambil kurir        |
| `in_delivery` | `in_transit`    | Kurir dalam perjalanan            |
| `in_delivery` | `delivered`     | Kurir sampai di penerima          |
| `completed`   | `completed`     | Penerima konfirmasi, selesai      |

---

## 5. Fitur Detail

### 5.1 Registrasi Kurir Relawan

| Field           | Tipe   | Validasi                         |
| --------------- | ------ | -------------------------------- |
| Nama            | String | Required                         |
| Email           | String | Required, unique, valid format   |
| Password        | String | Min 6 karakter                   |
| No. Telepon     | String | Required                         |
| Jenis Kendaraan | Enum   | `motor` / `mobil`                |
| Wilayah Operasi | String | Required (kecamatan/kota)        |
| Foto KTP        | Upload | Opsional, untuk verifikasi admin |

Setelah daftar → status `pending` → admin verifikasi.

### 5.2 Dashboard Kurir

**Halaman: `/courier`**

3 Tab:

1. **Siap Ambil** (assigned) — delivery yang ditugaskan tapi belum diambil
   - Tombol: **"Ambil Barang"** → `POST /courier/deliveries/{id}/pickup`
   - Info: nama makanan, alamat donor, jarak

2. **Dalam Perjalanan** (picked_up / in_transit)
   - Tombol: **"Sudah Sampai"** → `POST /courier/deliveries/{id}/deliver`
   - Tombol: **"Aktifkan GPS"** → mulai kirim posisi
   - Info: alamat penerima, sisa jarak

3. **Riwayat** (delivered / completed)
   - Total pengiriman selesai
   - Tip yang diterima (total)

**Statistik:**

- Total pengiriman
- Delivery aktif (sedang dikerjakan)
- Rating rata-rata
- Total tip diterima

### 5.3 Live GPS Tracking

**Pada sisi kurir (pengirim posisi):**

```javascript
// Browser Geolocation API — berjalan di background
navigator.geolocation.watchPosition(
  (pos) => {
    // Kirim ke API tiap 10 detik
    fetch("/api/courier/location", {
      method: "POST",
      body: JSON.stringify({
        delivery_id: activeDeliveryId,
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      }),
    });
  },
  (err) => {
    /* fallback ke manual */
  },
  { enableHighAccuracy: true, maximumAge: 5000 },
);
```

**Pada sisi donor/penerima (penerima posisi):**

- Polling `GET /api/deliveries/{donation_id}/track` tiap 5 detik
- Marker kurir bergerak di peta Leaflet
- Info: status, estimated time, jarak tersisa

**Jika GPS tidak tersedia:**

- Fallback: kurir bisa pilih lokasi manual di peta
- Notifikasi: "Aktifkan GPS untuk tracking akurat"

### 5.4 Admin Assign Kurir

**Di Admin Dashboard, tab baru: "Pengiriman"**

Flow:

1. Lihat klaim pending → Approve
2. Setelah approve, modal assign kurir muncul
3. Pilih kurir dari dropdown (filter: verified, tidak sedang max delivery)
4. Konfirmasi → delivery dibuat dengan status `assigned`

**Aturan Assignment:**

- Kurir aktif maksimal **2 delivery** bersamaan
- Jika sudah 2 delivery aktif → tidak muncul di dropdown
- Admin bisa lihat jumlah delivery aktif per kurir

### 5.5 Sistem Tip

**Kapan:** Setelah delivery selesai (status `completed`)

**Siapa:** Donatur (pemilik donasi)

**Cara:**

1. Setelah delivery completed, muncul modal/notif ke donatur
2. Donatur bisa pilih nominal: Rp5.000 / Rp10.000 / Rp20.000 / Lainnya
3. Atau "Lewati" (tanpa tip)
4. Tip tercatat di tabel `deliveries.tip_amount`

**Tampilan di Kurir:**

- Total tip diterima (hari ini / minggu ini / semua)
- Riwayat tip per delivery

### 5.6 Notifikasi Terkait Delivery

| Trigger              | Penerima | Pesan                                                    |
| -------------------- | -------- | -------------------------------------------------------- |
| Admin assign kurir   | Kurir    | "Anda ditugaskan mengantar {food_name} ke {institution}" |
| Kurir pickup         | Donor    | "{courier_name} sudah mengambil donasi Anda!"            |
| Kurir mulai antar    | Penerima | "Kurir sedang dalam perjalanan menuju lokasi Anda"       |
| Kurir sampai         | Penerima | "Kurir telah sampai! Silakan konfirmasi penerimaan"      |
| Delivery selesai     | Donor    | "Donasi {food_name} telah sampai ke {institution}"       |
| Selesai + tip prompt | Donor    | "Donasi selesai! Beri tip untuk kurir?"                  |

---

## 6. Database Schema

### 6.1 Tabel Baru

#### `deliveries`

```sql
CREATE TABLE deliveries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    donation_id INTEGER NOT NULL REFERENCES donations(id),
    courier_id INTEGER NOT NULL REFERENCES users(id),
    status TEXT NOT NULL DEFAULT 'assigned'
        CHECK(status IN ('assigned','picked_up','in_transit','delivered','completed')),
    pickup_at TEXT,
    delivered_at TEXT,
    completed_at TEXT,
    tip_amount REAL,
    tip_paid INTEGER NOT NULL DEFAULT 0,
    notes TEXT,
    created_at TEXT NOT NULL
);
```

#### `courier_profiles`

```sql
CREATE TABLE courier_profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    vehicle_type TEXT NOT NULL CHECK(vehicle_type IN ('motor','mobil')),
    service_area TEXT NOT NULL DEFAULT '',
    total_deliveries INTEGER NOT NULL DEFAULT 0,
    rating REAL NOT NULL DEFAULT 0,
    phone TEXT NOT NULL DEFAULT '',
    photo_url TEXT NOT NULL DEFAULT ''
);
```

#### `courier_locations`

```sql
CREATE TABLE courier_locations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    courier_id INTEGER NOT NULL REFERENCES users(id),
    delivery_id INTEGER NOT NULL REFERENCES deliveries(id),
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    recorded_at TEXT NOT NULL
);
```

### 6.2 Modifikasi Tabel yang Ada

#### `users` — tambah role `courier`

```sql
-- constraint sudah mencakup, tapi perlu update data
-- role TEXT CHECK(role IN ('donor','recipient','admin','courier'))
```

#### `notifications` — tambah tipe `delivery_assigned`, `courier_picked_up`, `courier_arrived`, `tip_received`

```sql
-- type TEXT CHECK(type IN ('donation_available','claim_approved','verification','system','delivery_assigned','courier_picked_up','courier_in_transit','courier_arrived','tip_received'))
```

---

## 7. API Design

### 7.1 Courier Endpoints

#### `POST /api/auth/register/courier`

Register kurir baru.

Request:

```json
{
  "name": "Budi Kurir",
  "email": "budi@email.com",
  "password": "rahasia123",
  "phone": "08123456789",
  "vehicle_type": "motor",
  "service_area": "Yogyakarta Kota"
}
```

Response: `{ "message": "Berhasil daftar. Menunggu verifikasi admin." }`

#### `GET /api/courier/deliveries`

List delivery untuk kurir yang login.

Query params: `?status=assigned`

Response:

```json
[
  {
    "id": 1,
    "donation_id": 5,
    "status": "assigned",
    "food_name": "Nasi Kotak",
    "portion_count": 50,
    "donor_name": "Hotel Aston",
    "donor_address": "Jl. Malioboro",
    "donor_lat": -7.7956,
    "donor_lon": 110.3695,
    "recipient_name": "Panti Asuhan Bunda",
    "recipient_address": "Jl. Kaliurang",
    "recipient_lat": -7.7691,
    "recipient_lon": 110.4062,
    "pickup_at": null,
    "created_at": "2026-07-07T..."
  }
]
```

#### `POST /api/courier/deliveries/{id}/pickup`

Kurir konfirmasi ambil barang.

Response: `{ "message": "Barang berhasil diambil" }`

#### `POST /api/courier/deliveries/{id}/deliver`

Kurir konfirmasi barang sampai.

Response: `{ "message": "Barang berhasil diantar" }`

#### `POST /api/courier/location`

Kirim posisi GPS kurir.

Request:

```json
{
  "delivery_id": 1,
  "latitude": -7.7821,
  "longitude": 110.3878
}
```

Response: `{ "message": "Posisi diperbarui" }`

#### `GET /api/courier/stats`

Statistik kurir.

Response:

```json
{
  "total_deliveries": 15,
  "active_deliveries": 1,
  "total_tips": 50000,
  "rating": 4.8
}
```

### 7.2 Admin Delivery Endpoints

#### `GET /api/admin/couriers`

List semua kurir (verified).

#### `POST /api/admin/deliveries/assign`

Assign kurir ke donasi.

Request:

```json
{
  "claim_id": 3,
  "courier_id": 12
}
```

Response: `{ "message": "Kurir ditugaskan", "delivery_id": 1 }`

#### `GET /api/admin/deliveries`

List semua delivery.

### 7.3 Tracking Endpoint

#### `GET /api/deliveries/{donation_id}/track`

Tracking info publik.

Response:

```json
{
  "delivery_id": 1,
  "status": "in_transit",
  "courier_name": "Budi Kurir",
  "courier_phone": "08123456789",
  "current_location": { "lat": -7.7821, "lon": 110.3878 },
  "last_updated": "2026-07-07T10:30:00Z",
  "donor_location": { "lat": -7.7956, "lon": 110.3695 },
  "recipient_location": { "lat": -7.7691, "lon": 110.4062 }
}
```

### 7.4 Tip Endpoint

#### `POST /api/deliveries/{id}/tip`

Donatur beri tip.

Request:

```json
{
  "amount": 10000
}
```

Response: `{ "message": "Tip berhasil diberikan" }`

---

## 8. Aturan Bisnis

| Aturan                            | Logika                                                                                                                  |
| --------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| **Max 2 delivery per kurir**      | Hitung delivery dengan status `assigned`/`picked_up`/`in_transit` untuk kurir tersebut. Jika ≥ 2, tidak bisa di-assign. |
| **Kurir harus verified**          | Cek `users.status == 'verified'` sebelum assign                                                                         |
| **GPS wajib saat aktif delivery** | Jika kurir pickup tanpa GPS, tampilkan peringatan. Tapi tetap bisa lanjut (tidak blocking)                              |
| **Tip opsional**                  | Donatur bisa skip, tidak ada paksaan                                                                                    |
| **1 delivery = 1 donasi**         | Tidak ada batch delivery untuk donasi berbeda                                                                           |
| **Delivery expire**               | Jika kurir tidak pickup dalam 2 jam sejak assign, status auto-cancel dan admin dapat notif                              |

---

## 9. UI/UX

### 9.1 Courier Dashboard (Mobile-First)

```
┌──────────────────────────────┐
│ 🔔  Dashboard Kurir   👤    │
├──────────────────────────────┤
│ 📊 Statistik                 │
│ ┌──────┬──────┬──────┐      │
│ │ 15   │ 1    │ Rp50k│      │
│ │Total │Aktif │ Tip  │      │
│ └──────┴──────┴──────┘      │
├──────────────────────────────┤
│ 📋 Siap Ambil (2)            │
│ ┌──────────────────────┐     │
│ │ 🍱 Nasi Kotak        │     │
│ │ 📍 Hotel Aston       │     │
│ │ 🕐 30 menit lalu     │     │
│ │ [🗺️ Lacak] [📦 Ambil]│     │
│ └──────────────────────┘     │
│ ┌──────────────────────┐     │
│ │ 🍱 Sayur Sop         │     │
│ │ 📍 Restoran Sari     │     │
│ │ [🗺️ Lacak] [📦 Ambil]│     │
│ └──────────────────────┘     │
├──────────────────────────────┤
│ 🚚 Dalam Perjalanan (1)      │
│ ┌──────────────────────┐     │
│ │ 🔴 LIVE GPS AKTIF    │     │
│ │ 🍱 Nasi Goreng       │     │
│ │ 📍 Panti Asuhan A    │     │
│ │ 📏 2.5 km lagi       │     │
│ │ [✅ Antar Sampai]    │     │
│ └──────────────────────┘     │
└──────────────────────────────┘
```

### 9.2 Live Tracking Modal

```
┌──────────────────────────────┐
│ 🔴 Live Tracking     [X]    │
│ Nasi Kotak → Panti Asuhan   │
├──────────────────────────────┤
│                              │
│        🟢 (donor)            │
│          ●━━━━━━━━━          │
│          ┃                   │
│     🟠━━┛ (kurir) ← ──      │  → Bergerak real-time
│          ┃                   │
│          ●━━━━━━━━━          │
│        🔵 (penerima)         │
│                              │
│        🗺️ (peta Leaflet)    │
│                              │
├──────────────────────────────┤
│ ████████████░░░░ 65%         │
│ 🕐 Estimasi: 5 menit lagi    │
└──────────────────────────────┘
```

---

## 10. Risk & Mitigasi

| Risk                      | Dampak          | Mitigasi                                      |
| ------------------------- | --------------- | --------------------------------------------- |
| Kurir tidak pickup        | Donasi tertunda | Auto-cancel + notif admin setelah 2 jam       |
| GPS mati/dimatikan        | Tracking hilang | Fallback ke manual, notif "GPS nonaktif"      |
| Kurir tidak datang        | Penerima kecewa | Rating system, riwayat kurir                  |
| Tip system disalahgunakan | Eksploitasi     | Batas nominal tip, log transaksi              |
| Kurir ambil >2 delivery   | Kualitas turun  | System hard-block ≥ 2                         |
| Donasi perishable (basi)  | Makanan rusak   | Prioritas delivery untuk valid_until terdekat |

---

## 11. File Structure

### Backend Baru

```
backend/
├── routers/
│   ├── courier.py              # Baru — endpoint kurir
│   └── deliveries.py           # Baru — admin assign + tracking
├── services/
│   └── delivery.py             # Baru — logic delivery
```

### Frontend Baru

```
frontend/src/
├── pages/
│   ├── CourierDashboard.tsx     # Baru — dashboard kurir
│   └── RegisterCourier.tsx      # Baru — registrasi kurir
├── components/
│   └── LiveTrackingModal.tsx    # Update — GPS real + polling
```

### Files yang Dimodifikasi

| File                                    | Modifikasi                                       |
| --------------------------------------- | ------------------------------------------------ |
| `backend/models.py`                     | Tambah Delivery, CourierProfile, CourierLocation |
| `backend/schemas.py`                    | Tambah schema baru                               |
| `backend/main.py`                       | Register router baru                             |
| `backend/services/notifications.py`     | Tipe notifikasi delivery                         |
| `backend/routers/donations.py`          | Status `in_delivery`                             |
| `frontend/src/main.tsx`                 | Route baru                                       |
| `frontend/src/types.ts`                 | Tipe baru                                        |
| `frontend/src/pages/AdminDashboard.tsx` | Tab "Pengiriman"                                 |

---

## 12. Timeline Estimasi

| Phase       | Fitur                                             | Estimasi       |
| ----------- | ------------------------------------------------- | -------------- |
| **Phase 1** | Registrasi kurir, model DB, dashboard kurir basic | 3-4 hari       |
| **Phase 2** | Admin assign, pickup/deliver flow, notifikasi     | 2-3 hari       |
| **Phase 3** | Live GPS tracking, update LiveTrackingModal       | 3-4 hari       |
| **Phase 4** | Tip system, rating, batch validation, testing     | 2-3 hari       |
| **Total**   |                                                   | **10-14 hari** |

---

## 13. Pertanyaan Open untuk Nanti

- [ ] Apakah kurir perlu dilihat rating-nya oleh admin sebelum assign?
- [ ] Apakah perlu fitur "wilayah operasi" untuk filter assignment?
- [ ] Metode pembayaran tip? (transfer, QRIS, saldo platform?)
- [ ] Apakah perlu fitur chat antara donor/penerima dengan kurir?
- [ ] Berapa batas maksimal tip per transaksi?
