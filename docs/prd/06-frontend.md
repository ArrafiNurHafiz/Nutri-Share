# PRD NUTRI-SHARE — Frontend Pages & Components

---

## 6.1 Daftar Route

| Route                 | Halaman             | File                            | Lazy Load | Auth Guard     |
| --------------------- | ------------------- | ------------------------------- | --------- | -------------- |
| `/`                   | Home                | `pages/Home.tsx`                | ✅        | -              |
| `/tentang`            | About               | `pages/About.tsx`               | ✅        | -              |
| `/cara-kerja`         | How It Works        | `pages/HowItWorks.tsx`          | ✅        | -              |
| `/dampak`             | Impact              | `pages/Impact.tsx`              | ✅        | -              |
| `/pahlawan`           | Heroes (Top Donors) | `pages/Heroes.tsx`              | ✅        | -              |
| `/login`              | Login               | `pages/Auth.tsx` (export Login) | ✅        | -              |
| `/lupa-password`      | Forgot Password     | `pages/ForgotPassword.tsx`      | ✅        | -              |
| `/reset-password`     | Reset Password      | `pages/ResetPassword.tsx`       | ✅        | -              |
| `/register/donor`     | Register Donor      | `pages/RegisterDonor.tsx`       | ✅        | -              |
| `/register/recipient` | Register Recipient  | `pages/RegisterRecipient.tsx`   | ✅        | -              |
| `/donor`              | Donor Dashboard     | `pages/DonorDashboard.tsx`      | ✅        | role=donor     |
| `/recipient`          | Recipient Dashboard | `pages/RecipientDashboard.tsx`  | ✅        | role=recipient |
| `/admin`              | Admin Dashboard     | `pages/AdminDashboard.tsx`      | ✅        | role=admin     |
| `*`                   | 404 NotFound        | `pages/NotFound.tsx`            | ✅        | -              |

## 6.2 Detail Fitur Per Halaman

### 6.2.1 Home (`/`)

| Bagian             | Konten                                                                                                    |
| ------------------ | --------------------------------------------------------------------------------------------------------- |
| Navbar             | Fixed, transparan → solid saat scroll, menu mobile, dark mode, tombol Masuk & Donasi                      |
| Hero Section       | Background gradient, judul "Makanan Bergizi untuk Mereka yang Membutuhkan", subjudul, CTA "Donasi Pangan" |
| Fitur Unggulan     | Grid 4 card: Smart Allocation (TOPSIS), Donor Publikasi, Presisi Gizi (AKG), Dampak Nyata (SDGs)          |
| Cara Kerja Singkat | 3 langkah: Publikasi → Alokasi Cerdas → Serah Terima                                                      |
| Statistik Dampak   | Animated counter: Kg Food Waste, Anak & Lansia Terbantu, Mitra HoReKa                                     |
| Preview Pahlawan   | Grid logo hotel/restoran/kafe dengan nama                                                                 |
| CTA Footer         | Hijau solid "Mulai Donasi" + "Daftar Penerima"                                                            |

### 6.2.2 About (`/tentang`)

| Bagian   | Konten                                                          |
| -------- | --------------------------------------------------------------- |
| Hero     | Gradient hijau-biru, judul "Tentang NUTRI-SHARE"                |
| Problem  | Statistik FLW Indonesia (23-48 ton/tahun, Rp213-551 T kerugian) |
| Solution | 3 card: Presisi Gizi (AKG), Hybrid Entropy-TOPSIS, SDGs Impact  |
| Team     | 3 card profil tim                                               |

### 6.2.3 HowItWorks (`/cara-kerja`)

| Bagian      | Konten                                                                                |
| ----------- | ------------------------------------------------------------------------------------- |
| Hero        | Gradient, "Bagaimana Cara Kerjanya?"                                                  |
| 3 Steps     | bg-white cards: Donor Publikasi, TOPSIS Alokasi, Kurir Antar (masing-masing 4 bullet) |
| Alur Sistem | Grid 6 card: Registrasi → Publikasi → TOPSIS → Klaim → Tracking → Selesai             |

### 6.2.4 Impact (`/dampak`)

| Bagian            | Konten                                 |
| ----------------- | -------------------------------------- |
| Hero              | "Dampak Nyata"                         |
| Animated Counters | Kg terselamatkan, Anak terbantu, Mitra |
| Masalah vs Solusi | 6 kolom (3 masalah + 3 solusi)         |
| SDGs              | 3 card SDG 2, 12, 17                   |

### 6.2.5 Heroes (`/pahlawan`)

**Data API:** `GET /api/public/top-donors`

| Bagian | Konten                                                                |
| ------ | --------------------------------------------------------------------- |
| Hero   | Badge "Setiap Donor Adalah Pahlawan"                                  |
| Stats  | 3 card (muncul setelah fetch): Total Donasi, Donor Aktif, Rating      |
| Filter | Semua / Hotel / Restoran / Kafe                                       |
| Cards  | Rank badge, logo, nama, tipe, jumlah donasi, rating                   |
| States | Loading (skeleton), empty (icon + "Belum Ada Data"), error (fallback) |

### 6.2.6 Login (`/login`)

| Bagian | Konten                                                      |
| ------ | ----------------------------------------------------------- |
| Layout | Kiri ilustrasi gradient, kanan form                         |
| Form   | Email (validasi format), Password (show/hide toggle, min 6) |
| Submit | Loading spinner, success → redirect dashboard               |
| Links  | Lupa password, Daftar Donor, Daftar Penerima                |

### 6.2.7 Register Donor (`/register/donor`)

| Bagian   | Konten                                                                                       |
| -------- | -------------------------------------------------------------------------------------------- |
| Layout   | Kiri gambar hero, kanan form scroll                                                          |
| Form     | Grid 2 kolom: Nama Bisnis, Tipe (dropdown), Email, Password, Alamat, Telepon, LocationPicker |
| Validasi | Real-time onBlur + on submit: required, email format, password min 6                         |
| Map      | Leaflet drag marker, default Yogyakarta (-7.7956, 110.3695)                                  |

### 6.2.8 Register Recipient (`/register/recipient`)

| Bagian     | Konten                                                                                                          |
| ---------- | --------------------------------------------------------------------------------------------------------------- |
| Layout     | Kanan gambar hero (reverse), kiri form                                                                          |
| Form       | Nama Lembaga, Tipe, Email, Password, Jumlah Penghuni, Telepon, Kebutuhan Gizi (4 input), Alamat, LocationPicker |
| Gizi Input | Grid 4 kolom: Protein(g), Kalori(kkal), Zat Besi(mg), Vitamin C(mg)                                             |

### 6.2.9 Donor Dashboard (`/donor`)

**Auth:** role=donor required

| Fitur             | Detail                                                                                    |
| ----------------- | ----------------------------------------------------------------------------------------- |
| Header            | Nama bisnis, tipe, rating, total donasi badge                                             |
| Badges            | Baris badge 🌱⭐🏆👑❤️                                                                    |
| Quick Stats       | 4 card: Total Donasi, Total Porsi, Rating, Ulasan                                         |
| Buat Donasi       | 3 step form collapsible: (1) Info makanan + katalog + upload foto (2) Gizi (3) Konfirmasi |
| Katalog           | 10 makanan preset dengan data gizi (Nasi Kotak, Ayam Goreng, dll)                         |
| Upload Foto       | JPEG/PNG/WEBP max 5MB, preview                                                            |
| Filter            | Semua / Aktif / Dalam Perjalanan / Selesai                                                |
| Donation Cards    | Nama, status badge, porsi, valid_until, tombol Lacak/Selesai                              |
| LiveTrackingModal | Peta + marker donor/kurir/penerima + progress bar + konfirmasi                            |
| Reviews           | Card ulasan penerima                                                                      |
| SSE               | Notifikasi real-time                                                                      |

**States:** Loading (spinner), empty (EmptyState), error (toast + fallback)

### 6.2.10 Recipient Dashboard (`/recipient`)

**Auth:** role=recipient required

| Fitur       | Detail                                                              |
| ----------- | ------------------------------------------------------------------- |
| Header      | Nama institusi, urgency, emergency toggle, notif bell               |
| Quick Stats | Donasi Diterima, Protein, Kalori, Rating                            |
| AKG Chart   | Radar chart (Chart.js) + progress bar 4 nutrient                    |
| Transit     | Dalam Perjalanan (Konfirmasi Sampai) + Kurir Sampai (Terkonfirmasi) |
| 3 Tabs      | Donasi Tersedia (TOPSIS rank), Riwayat, Peta Distribusi             |
| Klaim       | Button per donasi aktif                                             |
| Emergency   | none→pending→active toggle                                          |

### 6.2.11 Admin Dashboard (`/admin`)

**Auth:** role=admin required

| Fitur      | Detail                                                                                |
| ---------- | ------------------------------------------------------------------------------------- |
| Header     | Stats bar + search global + refresh + dark mode                                       |
| 4 Tabs     | Overview, Verifikasi, Data, Aktivitas                                                 |
| Overview   | Bar chart 7 hari + total portions/protein                                             |
| Verifikasi | Daftar penerima pending (dropdown urgency 1-5 + Verifikasi) + klaim pending (Approve) |
| Data       | 2 tabel (donor + penerima) sortable, tombol verifikasi + hapus                        |
| Search     | Debounce 300ms, dropdown hasil                                                        |
| Aktivitas  | List log (auto-refresh 15s)                                                           |
| Delete     | ConfirmDialog sebelum hapus                                                           |

## 6.3 Komponen Bersama

| Komponen          | Path                               | Props                               | States                                    |
| ----------------- | ---------------------------------- | ----------------------------------- | ----------------------------------------- |
| Navbar            | `components/Navbar.tsx`            | -                                   | scroll (hide/show), mobileOpen, dark mode |
| Footer            | `components/Footer.tsx`            | -                                   | -                                         |
| LoadingSpinner    | `components/LoadingSpinner.tsx`    | size, label                         | animasi spin                              |
| EmptyState        | `components/EmptyState.tsx`        | icon, title, description            | -                                         |
| ErrorBoundary     | `components/ErrorBoundary.tsx`     | children                            | error state + fallback UI                 |
| ConfirmDialog     | `components/ConfirmDialog.tsx`     | message, onConfirm, onCancel        | open/closed                               |
| SEO               | `components/SEO.tsx`               | title, description                  | -                                         |
| LocationPicker    | `components/LocationPicker.tsx`    | lat, lng, onChange                  | map ready                                 |
| LiveTrackingModal | `components/LiveTrackingModal.tsx` | donation, user, onClose, onComplete | progress, arrived, confirmed, done        |
| ProfileModal      | `components/ProfileModal.tsx`      | user, profile, onClose, onUpdate    | loading                                   |
| ReviewModal       | `components/ReviewModal.tsx`       | donationId, donorId, onClose        | rating, loading                           |

## 6.4 API Calls (dari Frontend)

| Endpoint                                   | Dipanggil dari            | Metode          |
| ------------------------------------------ | ------------------------- | --------------- |
| `GET /api/auth/me`                         | AuthContext.refresh()     | On mount        |
| `POST /api/auth/login`                     | AuthContext.login()       | Submit form     |
| `POST /api/auth/logout`                    | AuthContext.logout()      | Klik logout     |
| `POST /api/auth/register/donor`            | RegisterDonor             | Submit form     |
| `POST /api/auth/register/recipient`        | RegisterRecipient         | Submit form     |
| `POST /api/auth/forgot-password`           | ForgotPassword            | Submit form     |
| `POST /api/auth/reset-password`            | ResetPassword             | Submit form     |
| `PUT /api/users/{id}/profile`              | ProfileModal              | Submit form     |
| `GET /api/donations?donor_id=N`            | DonorDashboard            | On load         |
| `POST /api/donations`                      | DonorDashboard            | Submit form     |
| `GET /api/donations/{id}`                  | LiveTrackingModal         | Polling 3s      |
| `POST /api/donations/{id}/claim`           | RecipientDashboard        | Klik klaim      |
| `POST /api/donations/{id}/arrived`         | RecipientDashboard        | Klik konfirmasi |
| `POST /api/donations/{id}/complete`        | DonorDashboard            | Klik selesai    |
| `GET /api/donations/active?recipient_id=N` | RecipientDashboard        | On load         |
| `GET /api/donations/transit`               | Recipient/Donor Dashboard | On load         |
| `GET /api/donations/history`               | RecipientDashboard        | On load         |
| `GET /api/recipient/akg?user_id=N`         | RecipientDashboard        | On load         |
| `POST /api/recipient/emergency`            | RecipientDashboard        | Klik toggle     |
| `POST /api/reviews`                        | ReviewModal               | Submit form     |
| `GET /api/donors/{id}/reviews`             | DonorDashboard            | On load         |
| `GET /api/donors/{id}/badges`              | DonorDashboard            | On load         |
| `GET /api/topsis/{donation_id}`            | RecipientDashboard        | Lihat rank      |
| `GET /api/notifications?user_id=N`         | Donor/Recipient Dashboard | Polling 30s     |
| `POST /api/notifications/{id}/read`        | Donor Dashboard           | Klik notif      |
| `GET /api/notifications/subscribe`         | Donor/Recipient Dashboard | SSE on mount    |
| `GET /api/admin/users`                     | AdminDashboard            | On load         |
| `POST /api/admin/users/{id}/verify`        | AdminDashboard            | Klik verify     |
| `DELETE /api/admin/users/{id}`             | AdminDashboard            | Confirm hapus   |
| `POST /api/admin/claims/{id}/approve`      | AdminDashboard            | Klik approve    |
| `GET /api/admin/claims`                    | AdminDashboard            | On load         |
| `GET /api/admin/search`                    | AdminDashboard            | Search input    |
| `POST /api/admin/topsis/run`               | AdminDashboard            | Klik button     |
| `GET /api/dashboard/stats`                 | AdminDashboard + Home     | On load         |
| `GET /api/dashboard/trends`                | AdminDashboard            | On load         |
| `GET /api/public/top-donors`               | Heroes                    | On load         |
| `GET /api/map/data`                        | RecipientDashboard        | On load         |
| `GET /api/activity-logs`                   | AdminDashboard            | Polling 15s     |
| `POST /api/upload`                         | DonorDashboard            | Upload foto     |
