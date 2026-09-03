# PRD NUTRI-SHARE — Flow Bisnis & Status

---

## 10.1 Alur Lengkap Donasi

```
REGISTRASI
──────────
Donor daftar ──► Admin verifikasi ──► Status: verified
Penerima daftar ──► Admin verifikasi ──► Status: verified

PUBLIKASI
─────────
Donor login ──► Buat donasi (form 3 step) ──► Status: active
                  ↓
            Sistem jalankan TOPSIS ──► Ranking penerima
                  ↓
            Notifikasi ──► SSE ke semua penerima verified

KLAIM
─────
Penerima login ──► Lihat daftar aktif (sorted by TOPSIS CI)
                  ↓
            Penerima #1 klik "Klaim"
                  ↓
            INSERT claim (status: pending)
                  ↓
            Notifikasi ──► SSE ke admin: "Klaim Baru!"

APPROVAL
────────
Admin login ──► Lihat claims pending
                  ↓
            Admin klik "Approve"
                  ↓
            UPDATE claim (status: approved)
            UPDATE donation (status: claimed, claimed_by, claimed_at)
                  ↓
            Notifikasi ──► SSE ke donor + penerima

PENGIRIMAN
──────────
Penerima login ──► Lihat "Dalam Perjalanan"
                  ↓
            Penerima klik "Konfirmasi Sampai" (POST /arrived)
                  ↓
            UPDATE donation (arrived_at)
                  ↓
Donor login ──► Lihat "Kurir Sampai" + tombol "Selesai"
                  ↓
            Donor klik "Selesai" (POST /complete)
                  ↓
            UPDATE donation (status: completed, completed_at)
            UPDATE donor_profiles (total_donations +1)
            UPDATE recipient_profiles (last_received_donation)
                  ↓
            Notifikasi ──► SSE: Donasi selesai

REVIEW
──────
Penerima login ──► Klik "Beri Ulasan" ──► Modal rating + komentar
                  ↓
            INSERT review
                  ↓
            Notifikasi ──► SSE ke donor: "Ulasan Baru!"
```

## 10.2 State Machine

### Status Donasi

```
                  ┌──────────┐
     ┌────────────│  active  │◄──── Donasi dipublikasi
     │            └────┬─────┘
     │                 │
     │      Penerima klaim (rank #1 TOPSIS)
     │                 │
     │                 ▼
     │            ┌──────────┐
     │            │  claimed  │◄──── Admin approve
     │            └────┬─────┘
     │                 │
     │          Penerima konfirmasi sampai
     │                 │
     │                 ▼
     │            ┌──────────┐
     │            │  arrived  │◄──── (field arrived_at)
     │            └────┬─────┘
     │                 │
     │          Donor konfirmasi selesai
     │                 │
     │                 ▼
     │            ┌───────────┐
     ├────────────│ completed  │◄──── Donasi berhasil!
     │            └───────────┘
     │
     └── expired (jika valid_until lewat)
```

### Status User

```
pending ──► verified ──► (aktif)
pending ──► rejected ──► (blokir)
```

### Status Emergency

```
none ──► pending ──► active ──► none
  │         │            │
  │    Penerima      Admin
  │    minta        selesaikan
  │    bantuan      darurat
  └── (toggle langsung)
```

## 10.3 Visual Status (Badge Colors)

| Status Donasi           | Label        | Background | Text Color |
| ----------------------- | ------------ | ---------- | ---------- |
| active                  | AKTIF        | `#E8F5E9`  | `#2D7A4F`  |
| claimed (tanpa arrived) | DIKLAIM      | `#E3F2FD`  | `#1565C0`  |
| claimed (arrived)       | KURIR SAMPAI | `#FFF3E0`  | `#E65100`  |
| completed               | SELESAI      | `#F3F4F6`  | `#6B7280`  |
| expired                 | KADALUARSA   | `#FEF2F2`  | `#E53935`  |

| Status User | Label         | Background | Text Color |
| ----------- | ------------- | ---------- | ---------- |
| pending     | Pending       | `#FEF9C3`  | `#A16207`  |
| verified    | Terverifikasi | `#DCFCE7`  | `#15803D`  |
| rejected    | Ditolak       | `#FEE2E2`  | `#B91C1C`  |

## 10.4 AKG Flow Detail

```
GET /api/recipient/akg?user_id=7

Input:
  recipient_profiles.daily_protein_need
  recipient_profiles.daily_calorie_need
  recipient_profiles.daily_iron_need
  recipient_profiles.daily_vitamin_c_need

Proses:
  1. SELECT donations WHERE claimed_by=7 AND status='completed'
     AND completed_at BETWEEN hari_ini 00:00 - 23:59
  2. total_protein = SUM(protein_per_portion * portion_count)
  3. total_calories = SUM(calorie_per_portion * portion_count)
  4. total_iron = SUM(iron_mg * portion_count)
  5. total_vitamin_c = SUM(vitamin_c_mg * portion_count)
  6. pct = min(100, round(total / daily_need * 100))
  7. overall = round((pct_protein + pct_calories + pct_iron + pct_vitamin_c) / 4)

Output:
  { daily_needs, today_intake, percentages, overall_percentage, donations_today }
```
