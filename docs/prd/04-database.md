# PRD NUTRI-SHARE — Database Schema (10 Tabel)

**Engine:** SQLite 3 — WAL mode + foreign_keys ON + busy_timeout 5000 + synchronous NORMAL

---

## Tabel 1: users

Tabel utama untuk semua pengguna (donor, penerima, admin).

| #   | Field              | Type    | Constraints                                                 | Default   | Deskripsi                             |
| --- | ------------------ | ------- | ----------------------------------------------------------- | --------- | ------------------------------------- |
| 1   | id                 | INTEGER | PK AUTOINCREMENT                                            |           | Primary key                           |
| 2   | name               | TEXT    | NOT NULL                                                    |           | Nama lengkap pengguna                 |
| 3   | email              | TEXT    | NOT NULL UNIQUE                                             |           | Email login                           |
| 4   | password           | TEXT    | NOT NULL                                                    |           | bcrypt hash (60+ chars)               |
| 5   | role               | TEXT    | NOT NULL CHECK(role IN ('donor','recipient','admin'))       |           | Role pengguna                         |
| 6   | status             | TEXT    | NOT NULL CHECK(status IN ('pending','verified','rejected')) | 'pending' | Status verifikasi                     |
| 7   | reset_token        | TEXT    | NULLABLE                                                    | NULL      | Token reset password (32 char random) |
| 8   | reset_token_expiry | TEXT    | NULLABLE                                                    | NULL      | ISO timestamp kadaluarsa token        |

**Index:** UNIQUE(email)

**Foreign Keys:** none

**Sample Data:**

```json
{
  "id": 1,
  "name": "Admin",
  "email": "admin@test.com",
  "password": "$2b$12$...",
  "role": "admin",
  "status": "verified"
}
```

---

## Tabel 2: donor_profiles

Profil khusus untuk pengguna dengan role `donor`.

| #   | Field           | Type    | Constraints                                                         | Default | Deskripsi                       |
| --- | --------------- | ------- | ------------------------------------------------------------------- | ------- | ------------------------------- |
| 1   | id              | INTEGER | PK AUTOINCREMENT                                                    |         | Primary key                     |
| 2   | user_id         | INTEGER | NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE              |         | Relasi ke users                 |
| 3   | business_name   | TEXT    | NOT NULL                                                            |         | Nama bisnis/entitas             |
| 4   | business_type   | TEXT    | NOT NULL CHECK(IN ('hotel','restoran','kafe','katering','lainnya')) |         | Jenis usaha                     |
| 5   | address         | TEXT    | NOT NULL DEFAULT ''                                                 | ''      | Alamat lengkap                  |
| 6   | latitude        | REAL    | NOT NULL DEFAULT 0                                                  | 0       | Koordinat lokasi pickup         |
| 7   | longitude       | REAL    | NOT NULL DEFAULT 0                                                  | 0       | Koordinat lokasi pickup         |
| 8   | phone           | TEXT    | NOT NULL DEFAULT ''                                                 | ''      | Nomor telepon kontak            |
| 9   | logo_url        | TEXT    | NOT NULL DEFAULT ''                                                 | ''      | URL logo bisnis                 |
| 10  | total_donations | INTEGER | NOT NULL DEFAULT 0                                                  | 0       | Counter otomatis donasi selesai |

**Relasi:** User(1) → DonorProfile(1) — one-to-one

---

## Tabel 3: recipient_profiles

Profil khusus untuk pengguna dengan role `recipient`.

| #   | Field                  | Type    | Constraints                                                                    | Default | Deskripsi                       |
| --- | ---------------------- | ------- | ------------------------------------------------------------------------------ | ------- | ------------------------------- |
| 1   | id                     | INTEGER | PK AUTOINCREMENT                                                               |         | Primary key                     |
| 2   | user_id                | INTEGER | NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE                         |         | Relasi ke users                 |
| 3   | institution_name       | TEXT    | NOT NULL                                                                       |         | Nama lembaga                    |
| 4   | institution_type       | TEXT    | NOT NULL CHECK(IN ('panti_asuhan','rumah_singgah','lembaga_sosial','lainnya')) |         | Jenis lembaga                   |
| 5   | address                | TEXT    | NOT NULL DEFAULT ''                                                            | ''      | Alamat lengkap                  |
| 6   | latitude               | REAL    | NOT NULL DEFAULT 0                                                             | 0       | Koordinat lokasi                |
| 7   | longitude              | REAL    | NOT NULL DEFAULT 0                                                             | 0       | Koordinat lokasi                |
| 8   | phone                  | TEXT    | NOT NULL DEFAULT ''                                                            | ''      | Nomor telepon                   |
| 9   | resident_count         | INTEGER | NOT NULL DEFAULT 0                                                             | 0       | Jumlah penghuni yang ditanggung |
| 10  | age_range              | TEXT    | NOT NULL DEFAULT ''                                                            | ''      | Rentang usia penghuni           |
| 11  | health_condition       | TEXT    | NOT NULL DEFAULT ''                                                            | ''      | Kondisi kesehatan umum          |
| 12  | daily_protein_need     | REAL    | NOT NULL DEFAULT 0                                                             | 0       | Kebutuhan protein/hari (gram)   |
| 13  | daily_calorie_need     | REAL    | NOT NULL DEFAULT 0                                                             | 0       | Kebutuhan kalori/hari (kkal)    |
| 14  | daily_iron_need        | REAL    | NOT NULL DEFAULT 0                                                             | 0       | Kebutuhan zat besi/hari (mg)    |
| 15  | daily_vitamin_c_need   | REAL    | NOT NULL DEFAULT 0                                                             | 0       | Kebutuhan vitamin C/hari (mg)   |
| 16  | urgency_score          | INTEGER | NOT NULL DEFAULT 1                                                             | 1       | Skor urgensi (1-5)              |
| 17  | emergency              | TEXT    | NOT NULL DEFAULT 'none' CHECK(IN ('none','pending','active'))                  | 'none'  | Status darurat                  |
| 18  | last_received_donation | TEXT    | NULLABLE                                                                       | NULL    | ISO timestamp terakhir terima   |
| 19  | document_url           | TEXT    | NOT NULL DEFAULT ''                                                            | ''      | URL dokumen pendukung           |

**Relasi:** User(1) → RecipientProfile(1) — one-to-one

---

## Tabel 4: donations

Data donasi makanan yang dipublikasikan donor.

| #   | Field               | Type    | Constraints                                                                             | Default  | Deskripsi                          |
| --- | ------------------- | ------- | --------------------------------------------------------------------------------------- | -------- | ---------------------------------- |
| 1   | id                  | INTEGER | PK AUTOINCREMENT                                                                        |          | Primary key                        |
| 2   | donor_id            | INTEGER | NOT NULL REFERENCES users(id)                                                           |          | Pembuat donasi                     |
| 3   | food_name           | TEXT    | NOT NULL                                                                                |          | Nama makanan                       |
| 4   | food_type           | TEXT    | NOT NULL CHECK(IN ('makanan_berat','sayur','lauk_protein','snack','minuman','lainnya')) |          | Kategori makanan                   |
| 5   | portion_count       | INTEGER | NOT NULL                                                                                |          | Jumlah porsi                       |
| 6   | protein_per_portion | REAL    | NOT NULL DEFAULT 0                                                                      | 0        | Protein per porsi (gram)           |
| 7   | calorie_per_portion | REAL    | NOT NULL DEFAULT 0                                                                      | 0        | Kalori per porsi (kkal)            |
| 8   | iron_mg             | REAL    | NULLABLE                                                                                | NULL     | Zat besi per porsi (mg)            |
| 9   | vitamin_c_mg        | REAL    | NULLABLE                                                                                | NULL     | Vitamin C per porsi (mg)           |
| 10  | valid_until         | TEXT    | NOT NULL                                                                                |          | ISO timestamp batas layak konsumsi |
| 11  | pickup_latitude     | REAL    | NOT NULL                                                                                |          | Koordinat pickup                   |
| 12  | pickup_longitude    | REAL    | NOT NULL                                                                                |          | Koordinat pickup                   |
| 13  | photo_url           | TEXT    | NOT NULL DEFAULT ''                                                                     | ''       | URL foto makanan                   |
| 14  | notes               | TEXT    | NOT NULL DEFAULT ''                                                                     | ''       | Catatan tambahan                   |
| 15  | status              | TEXT    | NOT NULL DEFAULT 'active' CHECK(IN ('active','claimed','completed','expired'))          | 'active' | Status donasi                      |
| 16  | claimed_by          | INTEGER | NULLABLE                                                                                | NULL     | ID penerima yang klaim             |
| 17  | claimed_at          | TEXT    | NULLABLE                                                                                | NULL     | ISO timestamp klaim                |
| 18  | arrived_at          | TEXT    | NULLABLE                                                                                | NULL     | ISO timestamp konfirmasi sampai    |
| 19  | completed_at        | TEXT    | NULLABLE                                                                                | NULL     | ISO timestamp selesai              |
| 20  | created_at          | TEXT    | NOT NULL                                                                                |          | ISO timestamp dibuat               |

**Relasi:** Donor(1) → Donations(N), Recipient(1) → Donations(N) via claimed_by

---

## Tabel 5: topsis_results

Hasil perhitungan TOPSIS untuk setiap pasangan donasi-penerima.

| #   | Field         | Type    | Constraints                                         | Default | Deskripsi                                    |
| --- | ------------- | ------- | --------------------------------------------------- | ------- | -------------------------------------------- |
| 1   | id            | INTEGER | PK AUTOINCREMENT                                    |         | Primary key                                  |
| 2   | donation_id   | INTEGER | NOT NULL REFERENCES donations(id) ON DELETE CASCADE |         | Donasi                                       |
| 3   | recipient_id  | INTEGER | NOT NULL REFERENCES users(id)                       |         | Penerima                                     |
| 4   | rank_position | INTEGER | NOT NULL                                            |         | Peringkat (1=terbaik)                        |
| 5   | raw_c1        | REAL    | NOT NULL DEFAULT 0                                  | 0       | Nilai mentah kriteria 1 (protein)            |
| 6   | raw_c2        | REAL    | NOT NULL DEFAULT 0                                  | 0       | Nilai mentah kriteria 2 (urgensi)            |
| 7   | raw_c3        | REAL    | NOT NULL DEFAULT 0                                  | 0       | Nilai mentah kriteria 3 (waktu)              |
| 8   | raw_c4        | REAL    | NOT NULL DEFAULT 0                                  | 0       | Nilai mentah kriteria 4 (jarak)              |
| 9   | raw_c5        | REAL    | NOT NULL DEFAULT 0                                  | 0       | Nilai mentah kriteria 5 (riwayat)            |
| 10  | weight_c1     | REAL    | NOT NULL DEFAULT 0                                  | 0       | Bobot entropy kriteria 1                     |
| 11  | weight_c2     | REAL    | NOT NULL DEFAULT 0                                  | 0       | Bobot entropy kriteria 2                     |
| 12  | weight_c3     | REAL    | NOT NULL DEFAULT 0                                  | 0       | Bobot entropy kriteria 3                     |
| 13  | weight_c4     | REAL    | NOT NULL DEFAULT 0                                  | 0       | Bobot entropy kriteria 4                     |
| 14  | weight_c5     | REAL    | NOT NULL DEFAULT 0                                  | 0       | Bobot entropy kriteria 5                     |
| 15  | d_plus        | REAL    | NOT NULL DEFAULT 0                                  | 0       | Euclidean distance dari solusi ideal positif |
| 16  | d_minus       | REAL    | NOT NULL DEFAULT 0                                  | 0       | Euclidean distance dari solusi ideal negatif |
| 17  | ci_score      | REAL    | NOT NULL DEFAULT 0                                  | 0       | Closeness coefficient (0-1)                  |
| 18  | calculated_at | TEXT    | NOT NULL                                            |         | ISO timestamp kalkulasi                      |

**Relasi:** Donation(1) → TopsisResults(N), Recipient(1) → TopsisResults(N)

---

## Tabel 6: notifications

Notifikasi untuk user (real-time via SSE + polling).

| #   | Field               | Type    | Constraints                                                                        | Default | Deskripsi                      |
| --- | ------------------- | ------- | ---------------------------------------------------------------------------------- | ------- | ------------------------------ |
| 1   | id                  | INTEGER | PK AUTOINCREMENT                                                                   |         | Primary key                    |
| 2   | user_id             | INTEGER | NOT NULL REFERENCES users(id) ON DELETE CASCADE                                    |         | Target notifikasi              |
| 3   | title               | TEXT    | NOT NULL                                                                           |         | Judul notifikasi               |
| 4   | message             | TEXT    | NOT NULL                                                                           |         | Isi pesan notifikasi           |
| 5   | type                | TEXT    | NOT NULL CHECK(IN ('donation_available','claim_approved','verification','system')) |         | Tipe notifikasi                |
| 6   | is_read             | INTEGER | NOT NULL DEFAULT 0                                                                 | 0       | Status baca (0=belum, 1=sudah) |
| 7   | related_donation_id | INTEGER | NULLABLE                                                                           | NULL    | Donasi terkait (jika ada)      |
| 8   | created_at          | TEXT    | NOT NULL                                                                           |         | ISO timestamp dibuat           |

---

## Tabel 7: claims

Riwayat klaim donasi oleh penerima.

| #   | Field                | Type    | Constraints                                                            | Default   | Deskripsi                            |
| --- | -------------------- | ------- | ---------------------------------------------------------------------- | --------- | ------------------------------------ |
| 1   | id                   | INTEGER | PK AUTOINCREMENT                                                       |           | Primary key                          |
| 2   | donation_id          | INTEGER | NOT NULL REFERENCES donations(id)                                      |           | Donasi yang diklaim                  |
| 3   | recipient_id         | INTEGER | NOT NULL REFERENCES users(id)                                          |           | Penerima yang klaim                  |
| 4   | topsis_rank_at_claim | INTEGER | NOT NULL DEFAULT 99                                                    | 99        | Peringkat TOPSIS saat klaim diajukan |
| 5   | status               | TEXT    | NOT NULL DEFAULT 'pending' CHECK(IN ('pending','approved','rejected')) | 'pending' | Status klaim                         |
| 6   | admin_note           | TEXT    | NULLABLE                                                               | NULL      | Catatan dari admin                   |
| 7   | created_at           | TEXT    | NOT NULL                                                               |           | ISO timestamp klaim dibuat           |
| 8   | reviewed_at          | TEXT    | NULLABLE                                                               | NULL      | ISO timestamp direview admin         |
| 9   | reviewed_by          | INTEGER | NULLABLE                                                               | NULL      | ID admin yang mereview               |

---

## Tabel 8: reviews

Ulasan dari penerima untuk donor.

| #   | Field        | Type    | Constraints                                 | Default | Deskripsi               |
| --- | ------------ | ------- | ------------------------------------------- | ------- | ----------------------- |
| 1   | id           | INTEGER | PK AUTOINCREMENT                            |         | Primary key             |
| 2   | donation_id  | INTEGER | NOT NULL REFERENCES donations(id)           |         | Donasi terkait          |
| 3   | donor_id     | INTEGER | NOT NULL REFERENCES users(id)               |         | Donor yang dinilai      |
| 4   | recipient_id | INTEGER | NOT NULL REFERENCES users(id)               |         | Penerima pemberi ulasan |
| 5   | rating       | INTEGER | NOT NULL CHECK(rating >= 1 AND rating <= 5) |         | Rating bintang (1-5)    |
| 6   | comment      | TEXT    | NOT NULL DEFAULT ''                         | ''      | Komentar ulasan         |
| 7   | created_at   | TEXT    | NOT NULL                                    |         | ISO timestamp dibuat    |

---

## Tabel 9: activity_logs

Log aktivitas untuk audit trail.

| #   | Field      | Type    | Constraints         | Default | Deskripsi                                       |
| --- | ---------- | ------- | ------------------- | ------- | ----------------------------------------------- |
| 1   | id         | INTEGER | PK AUTOINCREMENT    |         | Primary key                                     |
| 2   | user_id    | INTEGER | NOT NULL            |         | ID pelaku                                       |
| 3   | action     | TEXT    | NOT NULL            |         | Kode aksi (login, donasi_buat, klaim_buat, dll) |
| 4   | details    | TEXT    | NOT NULL DEFAULT '' | ''      | Detail tambahan                                 |
| 5   | created_at | TEXT    | NOT NULL            |         | ISO timestamp aksi                              |

---

## Entity Relationship

```
users
  │
  ├──1:1── donor_profiles
  ├──1:1── recipient_profiles
  │
  ├──1:N── donations (sebagai donor_id)
  │           │
  │           ├──1:N── topsis_results (dihapus cascade)
  │           ├──1:N── claims
  │           └──1:N── reviews
  │
  ├──1:N── notifications
  ├──1:N── activity_logs
  └──1:N── topsis_results (sebagai recipient_id)
```

## Migration

Satu-satunya migration dilakukan saat startup di `create_tables()`:

```python
ALTER TABLE users ADD COLUMN reset_token TEXT
ALTER TABLE users ADD COLUMN reset_token_expiry TEXT
```

(Try/except — jika kolom sudah ada, skip.)
