# PRD NUTRI-SHARE — API Endpoints (42 Endpoint)

---

## 5.1 Daftar Lengkap Endpoint

### Auth Module (9 endpoint) — `routers/auth.py`

| #   | Method | Path                           | Auth      | Request Body / Params                                                                                                                        | Response 200                      | Error              |
| --- | ------ | ------------------------------ | --------- | -------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- | ------------------ |
| 1   | POST   | `/api/auth/register/donor`     | -         | `{business_name, email, password, business_type, address, latitude, longitude, phone}`                                                       | `{message: "Berhasil daftar..."}` | 409 email duplikat |
| 2   | POST   | `/api/auth/register/recipient` | -         | `{institution_name, email, password, institution_type, address, lat, lng, phone, resident_count, age_range, health_condition, daily_*_need}` | `{message: "Berhasil daftar..."}` | 409 email duplikat |
| 3   | POST   | `/api/auth/register/admin`     | Admin Key | `{name, email, password, admin_key}`                                                                                                         | `{message, user}`                 | 403 key salah      |
| 4   | POST   | `/api/auth/login`              | -         | `{email, password}`                                                                                                                          | `{user, profile}` + Set-Cookie    | 401/403            |
| 5   | POST   | `/api/auth/logout`             | -         | -                                                                                                                                            | `{message: "Logout berhasil"}`    | -                  |
| 6   | GET    | `/api/auth/me`                 | JWT       | -                                                                                                                                            | `{user, profile}`                 | 401                |
| 7   | POST   | `/api/auth/forgot-password`    | -         | `{email}`                                                                                                                                    | `{message, resetToken?}`          | 404                |
| 8   | POST   | `/api/auth/reset-password`     | Token     | `{token, password}`                                                                                                                          | `{message}`                       | 400                |
| 9   | PUT    | `/api/users/{id}/profile`      | JWT       | `{name?, email?, password?, ...}`                                                                                                            | `{message, user, profile}`        | 403/404            |

### Donation Module (9 endpoint) — `routers/donations.py`

| #   | Method | Path                           | Auth      | Fungsi                                         |
| --- | ------ | ------------------------------ | --------- | ---------------------------------------------- |
| 10  | POST   | `/api/donations`               | Donor     | Buat donasi + jalankan TOPSIS + notif penerima |
| 11  | GET    | `/api/donations`               | -         | List donasi (query: donor_id, page, limit)     |
| 12  | GET    | `/api/donations/active`        | -         | Donasi aktif dengan TOPSIS rank + donor_name   |
| 13  | GET    | `/api/donations/transit`       | JWT       | Donasi claimed (query: user_id, role)          |
| 14  | GET    | `/api/donations/history`       | Recipient | Riwayat claim approved                         |
| 15  | GET    | `/api/donations/{id}`          | -         | Detail donasi + donor_name                     |
| 16  | POST   | `/api/donations/{id}/claim`    | Recipient | Klaim donasi + notif admin                     |
| 17  | POST   | `/api/donations/{id}/arrived`  | Recipient | Konfirmasi kurir sampai                        |
| 18  | POST   | `/api/donations/{id}/complete` | Donor     | Selesaikan donasi + update counter             |

### Recipient Module (2 endpoint) — `routers/recipient.py`

| #   | Method | Path                       | Auth | Fungsi                             |
| --- | ------ | -------------------------- | ---- | ---------------------------------- |
| 19  | GET    | `/api/recipient/akg`       | -    | Hitung AKG harian (query: user_id) |
| 20  | POST   | `/api/recipient/emergency` | -    | Toggle darurat (body: user_id)     |

### Review Module (2 endpoint) — `routers/reviews.py`

| #   | Method | Path                       | Auth | Fungsi                    |
| --- | ------ | -------------------------- | ---- | ------------------------- |
| 21  | POST   | `/api/reviews`             | JWT  | Buat ulasan + notif donor |
| 22  | GET    | `/api/donors/{id}/reviews` | -    | Lihat ulasan donor        |

### TOPSIS Module (2 endpoint) — `routers/topsis.py`

| #   | Method | Path                        | Auth  | Fungsi                    |
| --- | ------ | --------------------------- | ----- | ------------------------- |
| 23  | GET    | `/api/topsis/{donation_id}` | -     | Lihat ranking TOPSIS      |
| 24  | POST   | `/api/admin/topsis/run`     | Admin | Re-run TOPSIS semua aktif |

### Notification Module (3 endpoint) — `routers/notifications.py`

| #   | Method | Path                           | Auth | Fungsi                           |
| --- | ------ | ------------------------------ | ---- | -------------------------------- |
| 25  | GET    | `/api/notifications`           | -    | List notif user (query: user_id) |
| 26  | POST   | `/api/notifications/{id}/read` | JWT  | Tandai notif dibaca              |
| 27  | GET    | `/api/notifications/subscribe` | -    | SSE real-time (query: user_id)   |

### Admin Module (7 endpoint) — `routers/admin.py`

| #   | Method | Path                              | Auth  | Fungsi                      |
| --- | ------ | --------------------------------- | ----- | --------------------------- |
| 28  | GET    | `/api/admin/users`                | Admin | List semua user + profil    |
| 29  | POST   | `/api/admin/users/{id}/verify`    | Admin | Verifikasi + urgency score  |
| 30  | GET    | `/api/admin/claims`               | Admin | List semua klaim            |
| 31  | POST   | `/api/admin/claims/{id}/approve`  | Admin | Setujui klaim + notif       |
| 32  | POST   | `/api/admin/users/{id}/emergency` | Admin | Toggle darurat penerima     |
| 33  | DELETE | `/api/admin/users/{id}`           | Admin | Hapus user + semua data     |
| 34  | GET    | `/api/admin/search`               | Admin | Pencarian global (query: q) |

### Dashboard & Public Module (6 endpoint)

| #   | Method | Path                      | Auth | Fungsi           |
| --- | ------ | ------------------------- | ---- | ---------------- |
| 35  | GET    | `/api/dashboard/stats`    | -    | Statistik publik |
| 36  | GET    | `/api/dashboard/trends`   | -    | Tren 7 hari      |
| 37  | GET    | `/api/public/top-donors`  | -    | Top 3 donor      |
| 38  | GET    | `/api/map/data`           | -    | Data peta        |
| 39  | GET    | `/api/donors/{id}/badges` | -    | Badge donor      |
| 40  | GET    | `/api/activity-logs`      | JWT  | Log aktivitas    |

### Upload & Health (2 endpoint)

| #   | Method | Path          | Auth | Fungsi                           |
| --- | ------ | ------------- | ---- | -------------------------------- |
| 41  | POST   | `/api/upload` | JWT  | Upload foto (JPEG/PNG/WEBP, 5MB) |
| 42  | GET    | `/health`     | -    | Health check                     |

---

## 5.2 Format Request/Response Detail

### Auth: Login

**Request:**

```json
POST /api/auth/login
Content-Type: application/json
{
  "email": "admin@test.com",
  "password": "admin123"
}
```

**Response 200:**

```json
{
  "user": {
    "id": 8,
    "name": "Admin Test",
    "email": "admin@test.com",
    "role": "admin",
    "status": "verified"
  },
  "profile": null
}
```

**Set-Cookie:** `nutrishare_token=eyJ...; HttpOnly; Max-Age=604800; Path=/; SameSite=Lax`

**Response 401:**

```json
{ "message": "Kredensial tidak valid" }
```

### Donasi: Create

**Request:**

```json
POST /api/donations
Cookie: nutrishare_token=eyJ...
Content-Type: application/json
{
  "food_name": "Nasi Goreng Spesial",
  "food_type": "makanan_berat",
  "portion_count": "50",
  "protein_per_portion": "15",
  "calorie_per_portion": "350",
  "hours_valid": "24",
  "pickup_latitude": -7.7956,
  "pickup_longitude": 110.3695,
  "notes": "Harap segera diambil",
  "iron_mg": "2",
  "vitamin_c_mg": "5"
}
```

**Response 200:**

```json
{ "message": "Donasi berhasil dipublikasikan!" }
```

### Penerima: AKG

**Request:**

```json
GET /api/recipient/akg?user_id=7
```

**Response 200:**

```json
{
  "date": "2026-07-07",
  "daily_needs": {
    "protein": 2000.0,
    "calories": 65000.0,
    "iron": 350.0,
    "vitamin_c": 2500.0
  },
  "today_intake": {
    "protein": 750.0,
    "calories": 17500.0,
    "iron": 100.0,
    "vitamin_c": 250.0
  },
  "percentages": {
    "protein": 38,
    "calories": 27,
    "iron": 29,
    "vitamin_c": 10
  },
  "overall_percentage": 26,
  "donations_today": [
    {
      "id": 1,
      "food_name": "Nasi Goreng Spesial",
      "portion_count": 50,
      "protein_total": 750.0,
      "calorie_total": 17500.0,
      "iron_total": 100.0,
      "vitamin_c_total": 250.0,
      "completed_at": "2026-07-07T10:30:00Z"
    }
  ]
}
```

---

## 5.3 Format Error

| Status | Format               | Contoh                                    |
| ------ | -------------------- | ----------------------------------------- |
| 400    | `{"message": "..."}` | `{"message": "Email wajib diisi"}`        |
| 401    | `{"message": "..."}` | `{"message": "Belum login"}`              |
| 403    | `{"message": "..."}` | `{"message": "Tidak punya akses"}`        |
| 404    | `{"message": "..."}` | `{"message": "Donasi tidak ditemukan"}`   |
| 409    | `{"message": "..."}` | `{"message": "Email sudah terdaftar"}`    |
| 422    | `{"message": "..."}` | `{"message": "Field required"}`           |
| 500    | `{"message": "..."}` | `{"message": "Terjadi kesalahan server"}` |

---

## 5.4 Autentikasi per Modul

```
PUBLIC (tidak perlu auth):
  /health
  /api/auth/login, /register/*, /forgot-password, /reset-password
  /api/dashboard/*
  /api/public/*
  /api/map/data
  /api/donors/*/badges
  /api/donors/*/reviews
  /api/donations (GET)
  /api/notifications (GET)
  /api/topsis/*
  /api/recipient/akg

JWT COOKIE (perlu login):
  /api/auth/me, /auth/logout
  /api/users/*/profile
  /api/donations (POST, transit, history)
  /api/reviews (POST)
  /api/notifications/*/read
  /api/activity-logs
  /api/upload

JWT + ROLE DONOR:
  POST /api/donations
  POST /api/donations/*/complete

JWT + ROLE RECIPIENT:
  POST /api/donations/*/claim
  POST /api/donations/*/arrived
  GET /api/donations/history

JWT + ROLE ADMIN:
  ALL /api/admin/*
  POST /api/admin/topsis/run

SSE (public dengan query user_id):
  GET /api/notifications/subscribe
```
