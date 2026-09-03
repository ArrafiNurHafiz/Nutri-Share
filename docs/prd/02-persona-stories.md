# PRD NUTRI-SHARE — User Personas & User Stories

---

## 2.1 User Personas

### Persona 1: Donor — "Budi"

| Atribut           | Detail                                                           |
| ----------------- | ---------------------------------------------------------------- |
| **Nama**          | Budi Santoso                                                     |
| **Usia**          | 38 tahun                                                         |
| **Pekerjaan**     | Manajer Operasional Hotel Aston Yogyakarta                       |
| **Pendidikan**    | S1 Manajemen Perhotelan                                          |
| **Lokasi**        | Yogyakarta                                                       |
| **Status**        | Menikah, 2 anak                                                  |
| **Tech Literacy** | Menengah — bisa pakai aplikasi web, sering buka email & WhatsApp |

**Keseharian:**

- Mengelola operasional dapur hotel yang memproduksi 500+ porsi makanan/hari
- Rata-rata 10-15% porsi tidak terpakai karena cancellasi atau over-production
- Pernah buang 50 porsi nasi kotak karena tidak ada yang mengambil
- Ingin berkontribusi sosial tapi bingung cara distribusi yang tepat

**Pain Points:**

- Tidak punya waktu untuk mengantar makanan sendiri
- Khawatir makanan tidak sampai ke yang benar-benar membutuhkan
- Tidak tahu cara menghitung kandungan gizi makanan
- Tidak ada transparansi setelah makanan diberikan

**Goals:**

- Ingin surplus pangan hotel tersalurkan maksimal
- Ingin lihat laporan dampak donasi (berapa porsi, siapa yang terima)
- Ingin rating/reputasi baik sebagai kontributor

---

### Persona 2: Penerima — "Sari"

| Atribut           | Detail                                     |
| ----------------- | ------------------------------------------ |
| **Nama**          | Sari Wulandari                             |
| **Usia**          | 42 tahun                                   |
| **Pekerjaan**     | Pengurus Panti Asuhan Bunda, Yogyakarta    |
| **Pendidikan**    | S1 Psikologi                               |
| **Lokasi**        | Yogyakarta                                 |
| **Status**        | Belum menikah                              |
| **Tech Literacy** | Dasar — bisa WhatsApp, jarang buka website |

**Keseharian:**

- Mengurus 40 anak panti (usia 4-17 tahun)
- Anggaran makan Rp15.000/anak/hari — sering kurang
- Sangat memperhatikan gizi anak (protein, vitamin)
- Pernah terima donasi makanan basi karena tidak ada sistem kontrol

**Pain Points:**

- Sumber donasi tidak tetap — kadang banyak, kadang tidak ada
- Tidak bisa memilih jenis makanan yang sesuai kebutuhan gizi anak
- Tidak ada cara untuk melacak status gizi harian anak
- Sulit melaporkan dampak ke donatur potensial

**Goals:**

- Ingin mendapat donasi rutin sesuai kebutuhan gizi anak
- Ingin memantau kecukupan protein, kalori, vitamin anak
- Ingin memberikan rating/feedback untuk donor
- Ingin sistem darurat jika stok makanan menipis

---

### Persona 3: Admin — "Rina"

| Atribut           | Detail                               |
| ----------------- | ------------------------------------ |
| **Nama**          | Rina Permata                         |
| **Usia**          | 28 tahun                             |
| **Pekerjaan**     | Staf Program NUTRI-SHARE             |
| **Pendidikan**    | S1 Gizi                              |
| **Lokasi**        | Yogyakarta                           |
| **Status**        | Belum menikah                        |
| **Tech Literacy** | Tinggi — familiar dengan dasbor data |

**Keseharian:**

- Memverifikasi pendaftar baru (donor & penerima)
- Memantau klaim donasi dan menyetujuinya
- Mengatur skala prioritas (urgency score) untuk penerima
- Membuat laporan dampak bulanan

**Pain Points:**

- Verifikasi manual memakan waktu
- Sulit memutuskan penerima mana yang lebih prioritas
- Tidak ada dashboard untuk monitoring real-time

**Goals:**

- Ingin proses verifikasi cepat dan efisien
- Ingin lihat statistik real-time (donasi aktif, selesai, tren)
- Ingin pencarian cepat untuk data user/donasi

---

## 2.2 User Stories

### Auth & Registrasi

| ID    | Sebagai        | Saya ingin                                       | Agar                              | Prioritas |
| ----- | -------------- | ------------------------------------------------ | --------------------------------- | --------- |
| US-01 | Donor          | Mendaftar akun dengan data bisnis saya           | Dapat mempublikasikan donasi      | P0        |
| US-02 | Penerima       | Mendaftar dengan data lembaga dan kebutuhan gizi | Dapat menerima donasi yang sesuai | P0        |
| US-03 | Donor/Penerima | Login dengan email dan password                  | Mengakses dashboard saya          | P0        |
| US-04 | Donor/Penerima | Reset password jika lupa                         | Tetap bisa mengakses akun         | P0        |
| US-05 | Admin          | Mendaftar dengan admin key                       | Mengelola platform                | P0        |

### Dashboard Donor

| ID    | Sebagai | Saya ingin                                                  | Agar                       | Prioritas |
| ----- | ------- | ----------------------------------------------------------- | -------------------------- | --------- |
| US-06 | Donor   | Melihat statistik donasi saya                               | Memantau kontribusi        | P0        |
| US-07 | Donor   | Membuat donasi dengan data makanan & gizi                   | Mempublikasikan surplus    | P0        |
| US-08 | Donor   | Memilih dari katalog makanan                                | Input lebih cepat          | P1        |
| US-09 | Donor   | Upload foto makanan                                         | Dokumentasi visual         | P1        |
| US-10 | Donor   | Melihat status donasi saya (aktif/dalam perjalanan/selesai) | Tracking real-time         | P0        |
| US-11 | Donor   | Menyelesaikan donasi setelah konfirmasi penerima            | Menutup donasi             | P0        |
| US-12 | Donor   | Melihat ulasan dari penerima                                | Mengetahui kualitas donasi | P0        |
| US-13 | Donor   | Mendapat badge saat mencapai milestone donasi               | Apresiasi kontribusi       | P1        |

### Dashboard Penerima

| ID    | Sebagai  | Saya ingin                                         | Agar                     | Prioritas |
| ----- | -------- | -------------------------------------------------- | ------------------------ | --------- |
| US-14 | Penerima | Melihat donasi aktif lengkap dengan ranking TOPSIS | Tahu prioritas saya      | P0        |
| US-15 | Penerima | Mengklaim donasi prioritas #1                      | Mendapat makanan         | P0        |
| US-16 | Penerima | Melihat kecukupan gizi harian (AKG)                | Memantau nutrisi         | P0        |
| US-17 | Penerima | Mengkonfirmasi kedatangan kurir                    | Notifikasi donor         | P1        |
| US-18 | Penerima | Memberi rating & ulasan untuk donor                | Feedback kualitas        | P0        |
| US-19 | Penerima | Mengaktifkan status darurat                        | Permintaan bantuan cepat | P1        |
| US-20 | Penerima | Melihat riwayat donasi yang sudah diterima         | Dokumentasi              | P0        |

### Dashboard Admin

| ID    | Sebagai | Saya ingin                      | Agar                 | Prioritas |
| ----- | ------- | ------------------------------- | -------------------- | --------- |
| US-21 | Admin   | Melihat statistik & tren donasi | Monitoring platform  | P0        |
| US-22 | Admin   | Memverifikasi pengguna baru     | Hanya pengguna valid | P0        |
| US-23 | Admin   | Menyetujui klaim donasi         | Distribusi berjalan  | P0        |
| US-24 | Admin   | Mengatur urgency score penerima | Prioritas yang tepat | P0        |
| US-25 | Admin   | Mencari pengguna/donasi/klaim   | Temuan cepat         | P1        |
| US-26 | Admin   | Melihat log aktivitas           | Audit trail          | P1        |
| US-27 | Admin   | Menghapus pengguna bermasalah   | Keamanan platform    | P1        |

### Notifikasi

| ID    | Sebagai  | Saya ingin                                  | Agar                 | Prioritas |
| ----- | -------- | ------------------------------------------- | -------------------- | --------- |
| US-28 | Penerima | Mendapat notifikasi saat ada donasi baru    | Segera klaim         | P0        |
| US-29 | Donor    | Mendapat notifikasi saat klaim disetujui    | Tahu donasi diproses | P0        |
| US-30 | Admin    | Mendapat notifikasi saat ada klaim baru     | Segera review        | P0        |
| US-31 | Penerima | Mendapat notifikasi real-time tanpa refresh | Informasi cepat      | P0        |

---

## 2.3 Acceptance Criteria per Epic

### Epic 1: Registrasi & Verifikasi

| Kriteria                  | Skenario                                      |
| ------------------------- | --------------------------------------------- |
| Register donor sukses     | Input valid → response 200 "Berhasil daftar"  |
| Register recipient sukses | Input valid → response 200                    |
| Register email duplikat   | Email terdaftar → 409 "Email sudah terdaftar" |
| Register invalid data     | Field kosong → 422                            |
| Login sukses              | Email+password valid → 200 + Set-Cookie       |
| Login gagal               | Password salah → 401                          |
| Login belum diverifikasi  | Status pending → 403                          |
| Forgot password           | Email terdaftar → 200 + resetToken            |
| Reset password            | Token valid → 200 password berubah            |

### Epic 2: Donasi

| Kriteria                      | Skenario                                |
| ----------------------------- | --------------------------------------- |
| Buat donasi (donor verified)  | Form valid → 200 + TOPSIS jalan         |
| Buat donasi (bukan donor)     | Role bukan donor → 403                  |
| List donasi publik            | GET /donations → 200 array              |
| Detail donasi by ID           | ID valid → 200 + food_name + donor_name |
| Detail donasi not found       | ID 99999 → 404                          |
| Donasi aktif dengan ranking   | ?recipient_id → 200 array sorted        |
| Klaim donasi (penerima)       | Valid → 200 + notif admin               |
| Klaim donasi (bukan penerima) | Role bukan recipient → 403              |
| Approve klaim (admin)         | Valid → 200 + notif donor+penerima      |

### Epic 3: AKG

| Kriteria                 | Skenario                                        |
| ------------------------ | ----------------------------------------------- |
| AKG valid                | user_id valid → 200 + daily_needs + percentages |
| AKG tanpa user_id        | → 400                                           |
| AKG user tidak ditemukan | → 404                                           |

### Epic 4: Keamanan

| Kriteria               | Skenario                           |
| ---------------------- | ---------------------------------- |
| Admin tanpa auth       | → 401                              |
| Endpoint tidak dikenal | → 404 + "Endpoint tidak ditemukan" |
| Duplicate register     | → 409                              |
| Empty body             | → 422                              |
| Role tidak sesuai      | → 403                              |
