# NutriShare — Presentation Script / Skrip Presentasi

> A bilingual presentation script (English & Indonesian) for explaining NutriShare: a nutrition-based food surplus distribution platform powered by Hybrid Entropy-TOPSIS algorithm.
>
> Durasi perkiraan: 25–35 menit
> Estimated duration: 25–35 minutes

---

## Slide 1: Opening / Pembukaan

**English:**
Good morning/afternoon everyone. Today I am going to present **NutriShare**, a digital platform designed to bridge the gap between food surplus in the HoReCa sector — Hotels, Restaurants, and Cafes — and the nutritional needs of vulnerable social institutions such as orphanages and shelters. The platform uses a scientific decision-making algorithm called Hybrid Entropy-TOPSIS to ensure that every food donation reaches the recipient who needs it most, not the fastest.

---

**Bahasa Indonesia:**
Selamat pagi/siang semuanya. Hari ini saya akan mempresentasikan **NutriShare**, sebuah platform digital yang dirancang untuk menjembatani kesenjangan antara surplus pangan di sektor HoReCa — Hotel, Restoran, dan Kafe — dengan kebutuhan gizi lembaga sosial rentan seperti panti asuhan dan rumah singgah. Platform ini menggunakan algoritma pengambilan keputusan ilmiah bernama Hybrid Entropy-TOPSIS untuk memastikan bahwa setiap donasi makanan sampai kepada penerima yang paling membutuhkan, bukan yang tercepat.

---

## Slide 2: Background & Problem / Latar Belakang & Masalah

**English:**
Indonesia faces a paradox: 23 to 48 million tons of food loss and waste every year — an economic loss of IDR 213 to 551 trillion — while simultaneously, 1 in 4 adolescents experience hidden hunger due to micronutrient deficiency, and 1 in 3 toddlers suffer from stunting. The HoReCa sector is the largest contributor to food waste, yet much of this surplus is still fit for consumption. The core problem is distribution: surplus food is not reaching people in need because there is no intelligent, data-driven allocation system.

---

**Bahasa Indonesia:**
Indonesia menghadapi paradoks: 23 hingga 48 juta ton kehilangan dan limbah pangan setiap tahun — kerugian ekonomi mencapai Rp 213 hingga Rp 551 triliun — sementara pada saat yang sama, 1 dari 4 remaja mengalami kelaparan tersembunyi akibat kekurangan mikronutrien, dan 1 dari 3 balita menderita stunting. Sektor HoReCa adalah kontributor terbesar limbah pangan, padahal sebagian besar surplus ini masih layak dikonsumsi. Masalah utamanya adalah distribusi: makanan surplus tidak sampai ke orang yang membutuhkan karena tidak ada sistem alokasi yang cerdas dan berbasis data.

---

## Slide 3: What is NutriShare? / Apa itu NutriShare?

**English:**
NutriShare is a full-stack web application that connects food donors — hotels, restaurants, and cafes — with verified recipients — orphanages and social institutions. What makes it unique is the **Hybrid Entropy-TOPSIS algorithm**, a multi-criteria decision-making method that scientifically determines which recipient should receive each donation. The platform also features real-time notifications, live courier tracking, nutritional intake monitoring, and a gamification system to encourage donor participation.

---

**Bahasa Indonesia:**
NutriShare adalah aplikasi web full-stack yang menghubungkan donor makanan — hotel, restoran, dan kafe — dengan penerima terverifikasi — panti asuhan dan lembaga sosial. Yang membuatnya unik adalah **algoritma Hybrid Entropy-TOPSIS**, metode pengambilan keputusan multi-kriteria yang secara ilmiah menentukan penerima mana yang paling berhak menerima setiap donasi. Platform ini juga dilengkapi notifikasi real-time, pelacakan kurir langsung, pemantauan asupan gizi, dan sistem gamifikasi untuk mendorong partisipasi donor.

---

## Slide 4: Platform Overview / Gambaran Platform

**English:**
The platform has four main user roles:

1. **Donor** — Hotels, restaurants, and cafes that publish food surplus.
2. **Recipient** — Orphanages and social institutions that receive and claim donations.
3. **Courier** — Handles the physical delivery from donor to recipient.
4. **Admin** — Verifies users, approves claims, and monitors the entire ecosystem.

The workflow is simple: Donors publish food with nutritional data -> TOPSIS algorithm ranks eligible recipients -> Top-ranked recipient gets priority to claim -> Courier delivers with live tracking -> Recipient confirms receipt and leaves a review.

---

**Bahasa Indonesia:**
Platform ini memiliki empat peran pengguna utama:

1. **Donor** — Hotel, restoran, dan kafe yang mempublikasikan surplus makanan.
2. **Penerima (Recipient)** — Panti asuhan dan lembaga sosial yang menerima dan mengklaim donasi.
3. **Kurir (Courier)** — Menangani pengiriman fisik dari donor ke penerima.
4. **Admin** — Memverifikasi pengguna, menyetujui klaim, dan memantau seluruh ekosistem.

Alur kerjanya sederhana: Donor mempublikasikan makanan dengan data gizi -> Algoritma TOPSIS memberi peringkat penerima yang memenuhi syarat -> Penerima peringkat teratas mendapat prioritas klaim -> Kurir mengantar dengan pelacakan langsung -> Penerima mengonfirmasi penerimaan dan memberikan ulasan.

---

## Slide 5: Technology Stack / Tumpukan Teknologi

**English:**
NutriShare is built with modern, production-ready technologies:

- **Backend:** Python 3.13+, FastAPI, SQLModel ORM, async SQLite (development) / Supabase PostgreSQL (production)
- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS 4, Motion (animations)
- **Authentication:** JWT tokens with httpOnly cookies, bcrypt password hashing
- **Real-time:** Server-Sent Events (SSE) for live notifications
- **Database:** SQLite with WAL mode for development, Supabase PostgreSQL for production
- **Testing:** Pytest (backend), Playwright (E2E frontend)
- **Mapping:** Leaflet + React-Leaflet for location-based features

---

**Bahasa Indonesia:**
NutriShare dibangun dengan teknologi modern dan siap-produksi:

- **Backend:** Python 3.13+, FastAPI, SQLModel ORM, SQLite asinkron (pengembangan) / Supabase PostgreSQL (produksi)
- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS 4, Motion (animasi)
- **Autentikasi:** Token JWT dengan httpOnly cookies, hashing password bcrypt
- **Real-time:** Server-Sent Events (SSE) untuk notifikasi langsung
- **Database:** SQLite dengan mode WAL untuk pengembangan, Supabase PostgreSQL untuk produksi
- **Testing:** Pytest (backend), Playwright (E2E frontend)
- **Pemetaan:** Leaflet + React-Leaflet untuk fitur berbasis lokasi

---

## Slide 6: System Architecture / Arsitektur Sistem

**English:**
The system follows a clean three-tier architecture:

1. **Presentation Layer (Frontend):** React SPA with lazy-loaded pages, global auth context, and a component library. The frontend communicates with the backend exclusively through RESTful JSON APIs.

2. **Application Layer (Backend):** FastAPI application with modular routers organized by domain — auth, donations, public stats, admin, reviews, notifications, and activity logs. Cross-cutting concerns like CORS, security headers, CSRF protection, and rate limiting are handled by middleware.

3. **Data Layer (Database):** SQLModel ORM manages 9 tables forming the complete data model: Users, Donor Profiles, Recipient Profiles, Donations, TOPSIS Results, Notifications, Claims, Reviews, and Activity Logs.

The architecture emphasizes separation of concerns: models define the schema, schemas define API contracts, services encapsulate business logic, and routers handle HTTP concerns.

---

**Bahasa Indonesia:**
Sistem ini mengikuti arsitektur tiga lapis yang bersih:

1. **Layer Presentasi (Frontend):** React SPA dengan halaman lazy-loaded, konteks auth global, dan pustaka komponen. Frontend berkomunikasi dengan backend melalui API RESTful JSON.

2. **Layer Aplikasi (Backend):** Aplikasi FastAPI dengan router modular yang diorganisir berdasarkan domain — auth, donasi, statistik publik, admin, ulasan, notifikasi, dan log aktivitas. Masalah lintas-seperti CORS, header keamanan, proteksi CSRF, dan pembatasan kecepatan ditangani oleh middleware.

3. **Layer Data (Database):** SQLModel ORM mengelola 9 tabel yang membentuk model data lengkap: Pengguna, Profil Donor, Profil Penerima, Donasi, Hasil TOPSIS, Notifikasi, Klaim, Ulasan, dan Log Aktivitas.

Arsitektur ini menekankan pemisahan tanggung jawab: model mendefinisikan skema, skema mendefinisikan kontrak API, layanan merangkum logika bisnis, dan router menangani urusan HTTP.

---

## Slide 7: The Hybrid Entropy-TOPSIS Algorithm / Algoritma Hybrid Entropy-TOPSIS

**English:**
This is the heart of NutriShare. TOPSIS stands for **Technique for Order Preference by Similarity to Ideal Solution**. Here is how it works:

1. When a donor publishes a donation, the system identifies all eligible recipients.
2. It evaluates each recipient against **5 weighted criteria**:
   - **Nutrition Satisfaction** — How much the donation fulfills the recipient's daily nutritional needs (protein, calories, iron, vitamin C)
   - **Urgency Score** — The recipient's self-reported urgency level
   - **Time-to-Expire** — How soon the food will expire (fresher food gets more time to find the right recipient)
   - **Geographic Distance** — Proximity between donor and recipient
   - **Recency of Receipt** — How long since the recipient last received a donation (fairness factor)

3. **Entropy weighting** — Instead of using subjective human-determined weights, Shannon Entropy analyzes the data itself to calculate objective weights. This removes human bias completely.
4. The algorithm calculates the ideal best solution and the ideal worst solution, then ranks recipients based on which one is closest to the ideal.
5. The top-ranked recipient receives a priority notification and has the first right to claim.

This ensures donations are allocated based on **data-driven need**, not speed, connection, or luck.

---

**Bahasa Indonesia:**
Ini adalah jantung dari NutriShare. TOPSIS adalah singkatan dari **Technique for Order Preference by Similarity to Ideal Solution**. Berikut cara kerjanya:

1. Ketika donor mempublikasikan donasi, sistem mengidentifikasi semua penerima yang memenuhi syarat.
2. Setiap penerima dievaluasi berdasarkan **5 kriteria berbobot**:
   - **Kecukupan Gizi** — Seberapa banyak donasi memenuhi kebutuhan gizi harian penerima (protein, kalori, zat besi, vitamin C)
   - **Skor Urgensi** — Tingkat urgensi yang dilaporkan sendiri oleh penerima
   - **Waktu Kedaluwarsa** — Seberapa cepat makanan akan kedaluwarsa (makanan yang lebih segar mendapat lebih banyak waktu untuk menemukan penerima yang tepat)
   - **Jarak Geografis** — Kedekatan antara donor dan penerima
   - **Rekam Terakhir Penerimaan** — Seberapa lama sejak penerima terakhir menerima donasi (faktor keadilan)

3. **Pembobotan Entropy** — Alih-alih menggunakan bobot subjektif yang ditentukan manusia, Shannon Entropy menganalisis data itu sendiri untuk menghitung bobot objektif. Ini menghilangkan bias manusia sepenuhnya.
4. Algoritma menghitung solusi ideal terbaik dan solusi ideal terburuk, kemudian memberi peringkat penerima berdasarkan siapa yang paling dekat dengan solusi ideal.
5. Penerima peringkat teratas menerima notifikasi prioritas dan memiliki hak pertama untuk mengklaim.

Ini memastikan donasi dialokasikan berdasarkan **kebutuhan berbasis data**, bukan kecepatan, koneksi, atau keberuntungan.

---

## Slide 8: User Registration & Authentication / Pendaftaran & Autentikasi Pengguna

**English:**
NutriShare has a comprehensive authentication system:

- **Registration:** New users can register as donors (business entities) or recipients (social institutions). Forms include detailed fields — for donors: business name, type, address, location coordinates; for recipients: institution name, type, resident count, age range, health conditions, and daily nutritional needs.

- **Verification:** New accounts start with "pending" status. Admin must verify each account before it can create or claim donations. This ensures trust and accountability.

- **Login:** Uses email and password. The system generates a JWT token stored in an httpOnly secure cookie — this prevents XSS attacks since JavaScript cannot access the token.

- **Password Reset:** A token-based reset flow. Users request a reset via email, receive a token, and can set a new password.

- **Rate Limiting:** Login and registration endpoints are rate-limited to prevent brute force attacks.

---

**Bahasa Indonesia:**
NutriShare memiliki sistem autentikasi yang komprehensif:

- **Pendaftaran:** Pengguna baru dapat mendaftar sebagai donor (entitas bisnis) atau penerima (lembaga sosial). Formulir mencakup bidang detail — untuk donor: nama bisnis, jenis, alamat, koordinat lokasi; untuk penerima: nama institusi, jenis, jumlah penghuni, rentang usia, kondisi kesehatan, dan kebutuhan gizi harian.

- **Verifikasi:** Akun baru dimulai dengan status "pending". Admin harus memverifikasi setiap akun sebelum dapat membuat atau mengklaim donasi. Ini memastikan kepercayaan dan akuntabilitas.

- **Login:** Menggunakan email dan password. Sistem menghasilkan token JWT yang disimpan dalam httpOnly cookie yang aman — ini mencegah serangan XSS karena JavaScript tidak dapat mengakses token.

- **Reset Password:** Alur reset berbasis token. Pengguna meminta reset melalui email, menerima token, dan dapat mengatur password baru.

- **Pembatasan Kecepatan:** Endpoint login dan pendaftaran dibatasi kecepatannya untuk mencegah serangan brute force.

---

## Slide 9: Donor Features / Fitur Donor

**English:**
After registration and verification, donors can:

1. **Publish Donations** — Upload food surplus with complete details: food name, type, portion count, nutritional content (protein, calories, iron, vitamin C), expiration time, pickup location, and photos.

2. **View Donation History** — See all published donations with their current status: active, claimed, completed, or expired.

3. **Monitor Rankings** — For each donation, see which recipients were ranked by TOPSIS and who claimed it.

4. **Receive Reviews** — After a donation is completed, recipients can leave ratings and reviews. Donors accumulate ratings and badges.

5. **Earn Badges** — The gamification system awards badges based on donation volume and review scores. Examples include "First Donation," "Generous Donor," and "Top Rated."

6. **View Dashboard** — A comprehensive dashboard showing donation statistics, average rating, active listings, and impact data.

---

**Bahasa Indonesia:**
Setelah pendaftaran dan verifikasi, donor dapat:

1. **Mempublikasikan Donasi** — Mengunggah surplus makanan dengan detail lengkap: nama makanan, jenis, jumlah porsi, kandungan gizi (protein, kalori, zat besi, vitamin C), waktu kedaluwarsa, lokasi pengambilan, dan foto.

2. **Melihat Riwayat Donasi** — Melihat semua donasi yang dipublikasikan dengan status saat ini: aktif, diklaim, selesai, atau kedaluwarsa.

3. **Memantau Peringkat** — Untuk setiap donasi, melihat penerima mana yang diperingkatkan oleh TOPSIS dan siapa yang mengklaimnya.

4. **Menerima Ulasan** — Setelah donasi selesai, penerima dapat memberikan peringkat dan ulasan. Donor mengumpulkan peringkat dan lencana.

5. **Mendapatkan Lencana** — Sistem gamifikasi memberikan lencana berdasarkan volume donasi dan skor ulasan. Contohnya termasuk "Donasi Pertama," "Donor Dermawan," dan "Peringkat Teratas."

6. **Melihat Dashboard** — Dashboard komprehensif yang menampilkan statistik donasi, peringkat rata-rata, daftar aktif, dan data dampak.

---

## Slide 10: Recipient Features / Fitur Penerima

**English:**
Recipients — orphanages and social institutions — can:

1. **View Available Donations** — Browse active donations ranked by TOPSIS specifically for them.

2. **Claim Donations** — When a donation is published and TOPSIS ranks them highly, they receive a priority notification. They can claim the donation with a single click.

3. **Track Delivery Live** — Once a claim is approved by admin, a courier is assigned. Recipients can track the courier's location in real-time on a map.

4. **Monitor Nutritional Intake (AKG)** — The system tracks daily nutritional intake: calories, protein, iron, and vitamin C based on donations received. Visual progress bars show how close they are to meeting their daily requirements (Angka Kecukupan Gizi).

5. **Request Emergency Status** — Institutions in urgent need can toggle emergency status, which increases their urgency score in the TOPSIS calculation.

6. **Leave Reviews** — After receiving a donation, recipients can rate and review the donor, contributing to the donor's reputation.

7. **View Receipt History** — A complete log of all donations received with nutritional breakdowns.

---

**Bahasa Indonesia:**
Penerima — panti asuhan dan lembaga sosial — dapat:

1. **Melihat Donasi Tersedia** — Menelusuri donasi aktif yang diperingkatkan oleh TOPSIS khusus untuk mereka.

2. **Mengklaim Donasi** — Ketika donasi dipublikasikan dan TOPSIS memberi peringkat tinggi pada mereka, mereka menerima notifikasi prioritas. Mereka dapat mengklaim donasi dengan satu klik.

3. **Melacak Pengiriman Langsung** — Setelah klaim disetujui admin, kurir ditugaskan. Penerima dapat melacak lokasi kurir secara real-time di peta.

4. **Memantau Asupan Gizi (AKG)** — Sistem melacak asupan gizi harian: kalori, protein, zat besi, dan vitamin C berdasarkan donasi yang diterima. Bilah progres visual menunjukkan seberapa dekat mereka dengan memenuhi kebutuhan harian.

5. **Meminta Status Darurat** — Lembaga yang sangat membutuhkan dapat mengaktifkan status darurat, yang meningkatkan skor urgensi mereka dalam perhitungan TOPSIS.

6. **Memberikan Ulasan** — Setelah menerima donasi, penerima dapat menilai dan mengulas donor, berkontribusi pada reputasi donor.

7. **Melihat Riwayat Penerimaan** — Log lengkap semua donasi yang diterima dengan rincian gizi.

---

## Slide 11: Admin Features / Fitur Admin

**English:**
The Admin Dashboard is the command center of NutriShare:

1. **User Management** — View all registered users (donors and recipients), filter by status, verify pending accounts, or reject with reason.

2. **Claim Management** — View all pending claims with donor and recipient details, approve or reject claims, and monitor completed deliveries.

3. **Analytics & Trends** — Interactive charts showing donation volume over time, completion rates, top donors, and monthly trends.

4. **Search** — Search across all users by name, email, or business/institution name.

5. **Emergency Management** — View and respond to institutions that have activated emergency status.

6. **Activity Logs** — A complete audit trail of all system activities.

7. **User Deletion** — Remove users with full cascade cleanup of related records when necessary.

---

**Bahasa Indonesia:**
Dashboard Admin adalah pusat komando NutriShare:

1. **Manajemen Pengguna** — Melihat semua pengguna terdaftar (donor dan penerima), memfilter berdasarkan status, memverifikasi akun yang tertunda, atau menolak dengan alasan.

2. **Manajemen Klaim** — Melihat semua klaim yang tertunda dengan detail donor dan penerima, menyetujui atau menolak klaim, dan memantau pengiriman yang selesai.

3. **Analitik & Tren** — Grafik interaktif yang menunjukkan volume donasi dari waktu ke waktu, tingkat penyelesaian, donor teratas, dan tren bulanan.

4. **Pencarian** — Mencari di semua pengguna berdasarkan nama, email, atau nama bisnis/institusi.

5. **Manajemen Darurat** — Melihat dan merespons institusi yang telah mengaktifkan status darurat.

6. **Log Aktivitas** — Jejak audit lengkap dari semua aktivitas sistem.

7. **Penghapusan Pengguna** — Menghapus pengguna dengan pembersihan kaskade penuh dari catatan terkait jika diperlukan.

---

## Slide 12: Landing Page Features / Fitur Halaman Utama

**English:**
The landing page serves as the public face of NutriShare and includes:

1. **Hero Section** — A full-screen hero with background imagery, animated headline "Nutritious Food Right on Target", and calls-to-action for registration.

2. **Impact Counters** — Animated counters showing total food waste saved (kg), children and elderly helped, and portions distributed. These numbers come from the live API.

3. **Problem Statement** — Two-column data presentation: food loss statistics (23-48 million tons/year) vs hidden hunger (1 in 4 adolescents with micronutrient deficiency).

4. **How It Works** — A four-step flow: Publish -> TOPSIS -> Claim -> Distribution, with a highlighted explanation of the Hybrid Entropy-TOPSIS algorithm.

5. **Three Pillars** — Alternating editorial cards explaining each ecosystem role: Donor, Recipient, and Courier.

6. **Impact + Testimonials** — Quote cards from real users showing social proof.

7. **Food Heroes of the Month** — A ranked card display of top donors with period filter (All Time / This Month). Each card shows rank, business name, donation count, type, and rating.

8. **Call to Action** — A gradient banner encouraging registration with both donor and recipient paths.

---

**Bahasa Indonesia:**
Halaman utama berfungsi sebagai wajah publik NutriShare dan mencakup:

1. **Bagian Hero** — Hero layar penuh dengan gambar latar belakang, judul animasi "Makanan Bergizi Tepat Sasaran", dan ajakan bertindak untuk pendaftaran.

2. **Penghitung Dampak** — Penghitung animasi yang menunjukkan total sampah makanan yang diselamatkan (kg), anak-anak dan lansia yang dibantu, serta porsi yang didistribusikan. Angka-angka ini berasal dari API langsung.

3. **Pernyataan Masalah** — Presentasi data dua kolom: statistik kehilangan pangan (23-48 juta ton/tahun) vs kelaparan tersembunyi (1 dari 4 remaja dengan kekurangan mikronutrien).

4. **Cara Kerja** — Alur empat langkah: Publikasikan -> TOPSIS -> Klaim -> Distribusi, dengan penjelasan yang disorot tentang algoritma Hybrid Entropy-TOPSIS.

5. **Tiga Pilar** — Kartu editorial bergantian yang menjelaskan setiap peran ekosistem: Donor, Penerima, dan Kurir.

6. **Dampak + Testimoni** — Kartu kutipan dari pengguna nyata yang menunjukkan bukti sosial.

7. **Pahlawan Makanan Bulan Ini** — Tampilan kartu peringkat donor teratas dengan filter periode (Sepanjang Waktu / Bulan Ini). Setiap kartu menunjukkan peringkat, nama bisnis, jumlah donasi, jenis, dan peringkat.

8. **Ajakan Bertindak** — Spanduk gradien yang mendorong pendaftaran dengan jalur donor dan penerima.

---

## Slide 13: Dashboard Features / Fitur Dashboard

**English:**
Each user role has a dedicated dashboard:

**Donor Dashboard:**

- Donation overview with count, average rating, and badge summary
- Active / Claimed / Completed / Expired donation breakdown
- TOPSIS panel showing the algorithm's ranking for each donation
- Activity feed showing recent events
- Map view showing donor location and courier routes

**Recipient Dashboard:**

- Real-time AKG (Angka Kecukupan Gizi) intake summary with progress bars for calories, protein, iron, and vitamin C
- Available donations sorted by TOPSIS priority
- Live courier tracking modal
- Emergency status toggle
- Donation receipt history with nutritional data
- Review submission form

**Admin Dashboard:**

- User tables with status filters
- Claim queue with approval workflow
- Analytics with trend charts
- Global search
- Emergency management

---

**Bahasa Indonesia:**
Setiap peran pengguna memiliki dashboard khusus:

**Dashboard Donor:**

- Ikhtisar donasi dengan jumlah, peringkat rata-rata, dan ringkasan lencana
- Rincian donasi Aktif / Diklaim / Selesai / Kedaluwarsa
- Panel TOPSIS yang menunjukkan peringkat algoritma untuk setiap donasi
- Umpan aktivitas yang menunjukkan peristiwa terbaru
- Tampilan peta yang menunjukkan lokasi donor dan rute kurir

**Dashboard Penerima:**

- Ringkasan asupan AKG real-time dengan bilah progres untuk kalori, protein, zat besi, dan vitamin C
- Donasi tersedia yang diurutkan berdasarkan prioritas TOPSIS
- Modal pelacakan kurir langsung
- Toggle status darurat
- Riwayat penerimaan donasi dengan data gizi
- Formulir pengiriman ulasan

**Dashboard Admin:**

- Tabel pengguna dengan filter status
- Antrian klaim dengan alur kerja persetujuan
- Analitik dengan grafik tren
- Pencarian global
- Manajemen darurat

---

## Slide 14: Notification System / Sistem Notifikasi

**English:**
NutriShare has a dual notification system:

1. **Real-time SSE (Server-Sent Events):** When a donation is published, the TOPSIS algorithm immediately sends a priority notification to the top-ranked recipient via an SSE channel. This enables instant awareness without polling.

2. **Polling Fallback:** For production environments where persistent SSE connections are not ideal, the system provides a standard polling endpoint (`GET /api/notifications`).

3. **Notification Types:**
   - New donation available matching recipient criteria
   - Claim approved or rejected
   - Courier assigned and location updates
   - Donation completed
   - New review received (for donors)
   - Account verified (for new users)
   - Emergency status changes

Notifications are stored in the database and can be marked as read.

---

**Bahasa Indonesia:**
NutriShare memiliki sistem notifikasi ganda:

1. **SSE Real-time (Server-Sent Events):** Ketika donasi dipublikasikan, algoritma TOPSIS segera mengirimkan notifikasi prioritas ke penerima peringkat teratas melalui saluran SSE. Ini memungkinkan kesadaran instan tanpa polling.

2. **Polling Cadangan:** Untuk lingkungan produksi di mana koneksi SSE persisten tidak ideal, sistem menyediakan endpoint polling standar (`GET /api/notifications`).

3. **Jenis Notifikasi:**
   - Donasi baru tersedia yang sesuai dengan kriteria penerima
   - Klaim disetujui atau ditolak
   - Kurir ditugaskan dan pembaruan lokasi
   - Donasi selesai
   - Ulasan baru diterima (untuk donor)
   - Akun terverifikasi (untuk pengguna baru)
   - Perubahan status darurat

Notifikasi disimpan dalam database dan dapat ditandai sebagai telah dibaca.

---

## Slide 15: Gamification System / Sistem Gamifikasi

**English:**
To encourage sustained participation, NutriShare includes a gamification system that awards badges to donors based on:

1. **Donation Milestones:**
   - First Donation (1 donation)
   - Active Donor (5 donations)
   - Generous Donor (10 donations)
   - Food Hero (25 donations)
   - Legendary Donor (50+ donations)

2. **Quality Milestones:**
   - Rising Star (1+ review with good rating)
   - Top Rated (5+ reviews with 4.5+ average)
   - Community Favorite (10+ reviews with 4.5+ average)

Badges are calculated on-demand via the `/api/donors/{id}/badges` endpoint and displayed on donor profiles and cards.

---

**Bahasa Indonesia:**
Untuk mendorong partisipasi berkelanjutan, NutriShare menyertakan sistem gamifikasi yang memberikan lencana kepada donor berdasarkan:

1. **Pencapaian Donasi:**
   - Donasi Pertama (1 donasi)
   - Donor Aktif (5 donasi)
   - Donor Dermawan (10 donasi)
   - Pahlawan Pangan (25 donasi)
   - Donor Legendaris (50+ donasi)

2. **Pencapaian Kualitas:**
   - Bintang Naik Daun (1+ ulasan dengan peringkat baik)
   - Peringkat Teratas (5+ ulasan dengan rata-rata 4.5+)
   - Favorit Komunitas (10+ ulasan dengan rata-rata 4.5+)

Lencana dihitung sesuai permintaan melalui endpoint `/api/donors/{id}/badges` dan ditampilkan di profil dan kartu donor.

---

## Slide 16: Security Features / Fitur Keamanan

**English:**
NutriShare implements multiple layers of security:

1. **JWT Authentication** — Tokens stored in httpOnly cookies, preventing JavaScript access and XSS token theft.
2. **Password Security** — Passwords hashed with bcrypt, never stored in plain text.
3. **CSRF Protection** — Origin and Referer headers are validated on all state-changing requests.
4. **Security Headers** — Content Security Policy (CSP), HTTP Strict Transport Security (HSTS), X-Content-Type-Options, X-Frame-Options.
5. **Rate Limiting** — In-memory sliding window rate limiter on sensitive endpoints (login, registration).
6. **Input Validation** — All inputs validated by Pydantic schemas on the backend and Zod-equivalent validation on the frontend.
7. **File Upload Security** — MIME type validation, magic byte checking, file size limits (5MB), and sanitized filenames.

---

**Bahasa Indonesia:**
NutriShare menerapkan beberapa lapisan keamanan:

1. **Autentikasi JWT** — Token disimpan dalam httpOnly cookie, mencegah akses JavaScript dan pencurian token XSS.
2. **Keamanan Password** — Password di-hash dengan bcrypt, tidak pernah disimpan dalam teks biasa.
3. **Proteksi CSRF** — Header Origin dan Referer divalidasi pada semua permintaan yang mengubah status.
4. **Header Keamanan** — Content Security Policy (CSP), HTTP Strict Transport Security (HSTS), X-Content-Type-Options, X-Frame-Options.
5. **Pembatasan Kecepatan** — Pembatas kecepatan sliding window in-memory pada endpoint sensitif (login, pendaftaran).
6. **Validasi Input** — Semua input divalidasi oleh skema Pydantic di backend dan validasi setara Zod di frontend.
7. **Keamanan Unggah File** — Validasi tipe MIME, pemeriksaan magic byte, batas ukuran file (5MB), dan nama file yang dibersihkan.

---

## Slide 17: Data Model & Database / Model Data & Database

**English:**
The database consists of 9 interrelated tables:

1. **users** — Core user accounts with role (donor/recipient/admin), status (pending/verified/rejected), and password reset fields.
2. **donor_profiles** — Business details: name, type (hotel/restaurant/cafe/catering), address, coordinates, phone, logo, total donations.
3. **recipient_profiles** — Institution details: name, type (orphanage/shelter/social institution), resident count, age range, health conditions, daily nutritional needs (protein, calories, iron, vitamin C), urgency score, emergency status.
4. **donations** — Food details: name, type, portion count, nutritional content, expiration, pickup location, status lifecycle (active -> claimed -> completed/expired).
5. **topsis_results** — Algorithm output: donation_id, recipient_id, rank, criteria values, weights, normalized scores, distance to ideal.
6. **notifications** — User notifications: title, message, type, read status, related donation.
7. **claims** — Donation claims: recipient, TOPSIS rank at claim time, status (pending/approved/rejected/completed), admin notes.
8. **reviews** — Recipient feedback on donors: rating (1-5), comment, timestamps.
9. **activity_logs** — Audit trail: user, action, details, timestamp.

---

**Bahasa Indonesia:**
Database terdiri dari 9 tabel yang saling terkait:

1. **users** — Akun pengguna inti dengan peran (donor/penerima/admin), status (tertunda/terverifikasi/ditolak), dan bidang reset password.
2. **donor_profiles** — Detail bisnis: nama, jenis (hotel/restoran/kafe/katering), alamat, koordinat, telepon, logo, total donasi.
3. **recipient_profiles** — Detail institusi: nama, jenis (panti asuhan/rumah singgah/lembaga sosial), jumlah penghuni, rentang usia, kondisi kesehatan, kebutuhan gizi harian (protein, kalori, zat besi, vitamin C), skor urgensi, status darurat.
4. **donations** — Detail makanan: nama, jenis, jumlah porsi, kandungan gizi, kedaluwarsa, lokasi pengambilan, siklus status (aktif -> diklaim -> selesai/kedaluwarsa).
5. **topsis_results** — Output algoritma: id donasi, id penerima, peringkat, nilai kriteria, bobot, skor ternormalisasi, jarak ke ideal.
6. **notifications** — Notifikasi pengguna: judul, pesan, jenis, status baca, donasi terkait.
7. **claims** — Klaim donasi: penerima, peringkat TOPSIS saat klaim, status (tertunda/disetujui/ditolak/selesai), catatan admin.
8. **reviews** — Umpan balik penerima tentang donor: peringkat (1-5), komentar, stempel waktu.
9. **activity_logs** — Jejak audit: pengguna, tindakan, detail, stempel waktu.

---

## Slide 18: API Endpoints Overview / Ikhtisar Endpoint API

**English:**
The backend exposes over 30 RESTful endpoints organized into 10 router modules:

| Router        | Endpoints                                                                                    |
| ------------- | -------------------------------------------------------------------------------------------- |
| Auth          | Register (donor/recipient/admin), Login, Logout, Me, Forgot Password, Reset Password         |
| Public        | Stats, Top Donors (with period filter), Map Data, Donor Badges                               |
| Donations     | Create, List, Active List, Detail, Claim, Arrived, Complete                                  |
| Recipient     | AKG Data, Emergency Toggle                                                                   |
| Admin         | User List, Verify User, Claim List, Approve Claim, Emergency Management, Search, Delete User |
| Dashboard     | Stats, Trends                                                                                |
| Reviews       | Create Review, List Reviews by Donor                                                         |
| Notifications | List, Mark as Read                                                                           |
| Activity      | Activity Logs                                                                                |
| TOPSIS        | Get Ranking by Donation                                                                      |

All endpoints are prefixed with `/api` and protected by appropriate authentication and authorization middleware.

---

**Bahasa Indonesia:**
Backend mengekspos lebih dari 30 endpoint RESTful yang diorganisir ke dalam 10 modul router:

| Router        | Endpoint                                                                                                   |
| ------------- | ---------------------------------------------------------------------------------------------------------- |
| Auth          | Daftar (donor/penerima/admin), Masuk, Keluar, Saya, Lupa Password, Reset Password                          |
| Public        | Statistik, Donor Teratas (dengan filter periode), Data Peta, Lencana Donor                                 |
| Donations     | Buat, Daftar, Daftar Aktif, Detail, Klaim, Tiba, Selesai                                                   |
| Recipient     | Data AKG, Toggle Darurat                                                                                   |
| Admin         | Daftar Pengguna, Verifikasi Pengguna, Daftar Klaim, Setujui Klaim, Manajemen Darurat, Cari, Hapus Pengguna |
| Dashboard     | Statistik, Tren                                                                                            |
| Reviews       | Buat Ulasan, Daftar Ulasan berdasarkan Donor                                                               |
| Notifications | Daftar, Tandai Dibaca                                                                                      |
| Activity      | Log Aktivitas                                                                                              |
| TOPSIS        | Dapatkan Peringkat berdasarkan Donasi                                                                      |

Semua endpoint diawali dengan `/api` dan dilindungi oleh middleware autentikasi dan otorisasi yang sesuai.

---

## Slide 19: Testing & Quality Assurance / Pengujian & Jaminan Kualitas

**English:**
NutriShare has comprehensive test coverage:

1. **Backend Tests (Pytest):**
   - **test_auth.py** — Authentication flows: login, register, password reset, token validation, duplicate email prevention.
   - **test_topsis.py** — TOPSIS algorithm: distance calculations, single-recipient shortcut, edge cases.
   - **test_gamification.py** — Badge calculation: thresholds, combinations, empty states.
   - **test_api_compat.py** — Contract tests: ensures all public endpoints return expected JSON shapes matching the original Node.js API.
   - **full_flow_test.py** — End-to-end simulation: register -> login -> create donation -> claim -> admin verify -> complete.
   - **blackbox_test.py** — Pure HTTP endpoint testing without backend imports: validates status codes, JSON shapes, auth guards, rate limiting.

2. **Frontend Tests:**
   - Playwright E2E tests for critical user flows.

3. **Coverage:** 95%+ of critical paths covered across all test suites. The white-box analysis identified only non-critical code quality improvements (medium and low priority).

---

**Bahasa Indonesia:**
NutriShare memiliki cakupan pengujian yang komprehensif:

1. **Pengujian Backend (Pytest):**
   - **test_auth.py** — Alur autentikasi: login, daftar, reset password, validasi token, pencegahan email duplikat.
   - **test_topsis.py** — Algoritma TOPSIS: perhitungan jarak, pintasan penerima tunggal, kasus tepi.
   - **test_gamification.py** — Perhitungan lencana: ambang batas, kombinasi, keadaan kosong.
   - **test_api_compat.py** — Pengujian kontrak: memastikan semua endpoint publik mengembalikan bentuk JSON yang diharapkan sesuai dengan API Node.js asli.
   - **full_flow_test.py** — Simulasi ujung-ke-ujung: daftar -> masuk -> buat donasi -> klaim -> verifikasi admin -> selesai.
   - **blackbox_test.py** — Pengujian endpoint HTTP murni tanpa impor backend: memvalidasi kode status, bentuk JSON, pengaman auth, pembatasan kecepatan.

2. **Pengujian Frontend:**
   - Pengujian E2E Playwright untuk alur pengguna kritis.

3. **Cakupan:** 95%+ jalur kritis tercakup di semua suite pengujian. Analisis white-box hanya mengidentifikasi peningkatan kualitas kode yang tidak kritis (prioritas sedang dan rendah).

---

## Slide 20: Live Demo / Demo Langsung

**English:**
Let me now demonstrate the application live:

1. **Landing Page** — I will show the hero section, impact counters, problem statement, how-it-works flow, three pillars, testimonials, and the Food Heroes leaderboard. I will toggle between "All Time" and "This Month" to show the period filter.

2. **Registration** — I will register a new donor account with business details and location picking from the map.

3. **Admin Verification** — I will show the admin panel verifying the new account.

4. **Donation Flow** — The verified donor publishes a food donation with nutritional data. I will show the TOPSIS algorithm ranking recipients.

5. **Recipient Claim** — The top-ranked recipient receives a notification and claims the donation.

6. **Admin Approval** — The admin approves the claim.

7. **Delivery & Completion** — The courier delivers, the recipient confirms, and leaves a review.

8. **Dashboard Overview** — I will show the donor dashboard with statistics, the recipient dashboard with AKG tracking, and the admin dashboard with analytics.

---

**Bahasa Indonesia:**
Izinkan saya sekarang mendemonstrasikan aplikasi langsung:

1. **Halaman Utama** — Saya akan menunjukkan bagian hero, penghitung dampak, pernyataan masalah, alur cara kerja, tiga pilar, testimoni, dan papan peringkat Pahlawan Makanan. Saya akan beralih antara "Sepanjang Waktu" dan "Bulan Ini" untuk menunjukkan filter periode.

2. **Pendaftaran** — Saya akan mendaftarkan akun donor baru dengan detail bisnis dan pemilihan lokasi dari peta.

3. **Verifikasi Admin** — Saya akan menunjukkan panel admin memverifikasi akun baru.

4. **Alur Donasi** — Donor yang terverifikasi mempublikasikan donasi makanan dengan data gizi. Saya akan menunjukkan algoritma TOPSIS memberi peringkat penerima.

5. **Klaim Penerima** — Penerima peringkat teratas menerima notifikasi dan mengklaim donasi.

6. **Persetujuan Admin** — Admin menyetujui klaim.

7. **Pengiriman & Penyelesaian** — Kurir mengirimkan, penerima mengonfirmasi, dan memberikan ulasan.

8. **Ikhtisar Dashboard** — Saya akan menunjukkan dashboard donor dengan statistik, dashboard penerima dengan pelacakan AKG, dan dashboard admin dengan analitik.

---

## Slide 21: Impact & Future Development / Dampak & Pengembangan Masa Depan

**English:**
Since its launch, NutriShare has demonstrated measurable impact:

- **450 kg** of food waste prevented
- **150 portions** distributed
- **8 partners** registered and verified
- **2 completed donations** with positive reviews

**Future Development Plans:**

1. **Mobile Application** — Native mobile apps for Android and iOS for easier on-the-go access.
2. **Advanced Analytics** — Machine learning models to predict food surplus patterns and optimize distribution routes.
3. **Expanded Coverage** — Integration with more HoReCa partners and social institutions across Indonesia.
4. **Carbon Footprint Tracking** — Measure the environmental impact of food waste reduction.
5. **Corporate Social Responsibility (CSR) Dashboard** — Dedicated reporting for corporate partners.
6. **Multi-language Support** — Full internationalization (i18n) for broader accessibility.

---

**Bahasa Indonesia:**
Sejak diluncurkan, NutriShare telah menunjukkan dampak yang terukur:

- **450 kg** limbah makanan yang dicegah
- **150 porsi** didistribusikan
- **8 mitra** terdaftar dan terverifikasi
- **2 donasi selesai** dengan ulasan positif

**Rencana Pengembangan Masa Depan:**

1. **Aplikasi Mobile** — Aplikasi mobile native untuk Android dan iOS untuk akses yang lebih mudah saat bepergian.
2. **Analitik Lanjutan** — Model pembelajaran mesin untuk memprediksi pola surplus makanan dan mengoptimalkan rute distribusi.
3. **Cakupan yang Diperluas** — Integrasi dengan lebih banyak mitra HoReCa dan lembaga sosial di seluruh Indonesia.
4. **Pelacakan Jejak Karbon** — Mengukur dampak lingkungan dari pengurangan limbah makanan.
5. **Dashboard CSR** — Pelaporan khusus untuk mitra perusahaan.
6. **Dukungan Multi-bahasa** — Internasionalisasi penuh (i18n) untuk aksesibilitas yang lebih luas.

---

## Slide 22: Thank You / Terima Kasih

**English:**
Thank you for your attention. I have presented NutriShare — a platform that transforms food surplus into targeted nutrition using data-driven algorithms.

**Key Takeaways:**

- 23-48 million tons/year of food waste can be reduced through intelligent redistribution.
- The Hybrid Entropy-TOPSIS algorithm ensures fair, objective allocation.
- Technology bridges the gap between surplus and need efficiently.
- Every donation is tracked, measured, and optimized.

**Questions?**

Contact / Information:

- GitHub Repository: [URL]
- Documentation: [URL]

---

**Bahasa Indonesia:**
Terima kasih atas perhatian Anda. Saya telah mempresentasikan NutriShare — sebuah platform yang mengubah surplus makanan menjadi nutrisi yang tepat sasaran menggunakan algoritma berbasis data.

**Poin Penting:**

- 23-48 juta ton/tahun limbah makanan dapat dikurangi melalui redistribusi cerdas.
- Algoritma Hybrid Entropy-TOPSIS memastikan alokasi yang adil dan objektif.
- Teknologi menjembatani kesenjangan antara surplus dan kebutuhan secara efisien.
- Setiap donasi dilacak, diukur, dan dioptimalkan.

**Pertanyaan?**

Kontak / Informasi:

- Repositori GitHub: [URL]
- Dokumentasi: [URL]

---

_End of presentation script / Akhir skrip presentasi_
