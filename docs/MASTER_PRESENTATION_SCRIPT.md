# NutriShare — Master Presentation Script & Live Demo Manual
> **Skrip Presentasi Master & Panduan Demo Langsung NutriShare**
> *Menyempurnakan & Menggabungkan `script1.docx` (Landing Page Narration) dan `script2.pdf` (Prototype Demo Walkthrough oleh Arrafi)*
> *Fokus Utama: Dual-Engine Inovasi — 1. Mesin Perhitungan Asupan & Defisit Gizi AKG Kemenkes RI + 2. Sistem Pendukung Keputusan Hybrid Shannon Entropy-TOPSIS*
> *Domain Demo Live: https://nutrishare.web.id/*

---

## 📋 Informasional & Metadata Presentasi

- **Judul Proyek:** NutriShare — Nutrition-Based Surplus Food Redistribution Platform
- **Tagline:** *"Sustainable Solutions for Zero Food Waste — Allocating Nutrition with Mathematical Precision"*
- **URL Platform Live:** **https://nutrishare.web.id/**
- **Inovasi Dual Engine Utama:**
  1. **Mesin Perhitungan AKG (Angka Kecukupan Gizi Kemenkes RI):** Menghitung target gizi harian (Kalori, Protein, Zat Besi, Vitamin C) lembaga sosial secara dinamis berdasarkan demografi penghuni panti dan melacak defisit gizi harian secara real-time.
  2. **Mesin Alokasi Hybrid Shannon Entropy - TOPSIS:** Menggantikan alokasi manual 'Siapa Cepat Dia Dapat' dengan alokasi presisi matematis berdasarkan defisit protein AKG, urgensi, masa simpan, jarak lokasi, dan pemerataan bantuan.
- **Fleksibilitas Demo Live:** **Narasi Adaptif & Situasional** — Pembicara secara dinamis menyebutkan nama lembaga sosial yang muncul sebagai **Peringkat #1 pada layar live** (contoh: Panti Asuhan Kasih Ibu, Rumah Singgah Sayap Ibu, dll.) sesuai hasil perhitungan riil TOPSIS saat demo.
- **Fitur Khusus Donor:** Flexi-Input Pangan (Pengisian Manual, 6+ Templat Preset Siap Pakai, dan **AI Nutrition Estimator** yang memberikan *estimasi* kandungan gizi berdasarkan **Tabel Komposisi Pangan Indonesia (TKPI) / AKG Kemenkes RI**).
- **Pembicara & Peran:**
  - **Pembicara 1 (Ayli / Nurul Layli):** Pembukaan, Latar Belakang Masalah, Visi Strategis, & Penutup.
  - **Pembicara 2 (Arrafi):** Walkthrough Landing Page, Live Prototype Demo (Dashboard Donor, Audit TOPSIS, Recipient Claim & Gauge AKG, Logistics Leaflet GIS, & Admin Governance).
- **Total Durasi:** ~8 – 9 Menit (Presentasi & Demo) + 5 Menit (Tanya Jawab / Q&A Defense)
- **Target Audiens:** Dewan Juri Lomba, Evaluator Akademis, & Pemangku Kepentingan Teknologi Pangan / Dampak Sosial
- **Tumpukan Teknologi:** React 19 + TypeScript + Vite + Tailwind CSS v4 | FastAPI Python 3.12+ | SQLModel + Supabase PostgreSQL | Leaflet GIS | Server-Sent Events (SSE)

---

## ⏱️ Alokasi Waktu & Peta Jalan Presentasi

| Bagian | Topik / Fitur Utama | Rute / Slide | Pembicara | Durasi |
| :--- | :--- | :--- | :--- | :--- |
| **Part 1** | Pembukaan & Paradoks Limbah Pangan vs Stunting | Slide 1 – 2 | Ayli | 01:30 |
| **Part 2** | Landing Page & Inovasi Dual Engine (AKG + TOPSIS) | `https://nutrishare.web.id/` | Ayli / Arrafi | 01:30 |
| **Part 3.0** | Orientasi Live Demo Landing Page | `https://nutrishare.web.id/` | Arrafi | 00:50 |
| **Part 3.1** | **Dashboard Donor: Manual, Preset & AI Estimator (TKPI Kemenkes)** | `https://nutrishare.web.id/donor` | Arrafi | 01:00 |
| **Part 3.2** | **Core Highlight: Audit Defisit AKG & Entropy-TOPSIS** | `/donor` / `/admin` modal | Arrafi | 01:30 |
| **Part 3.3** | **Dashboard Recipient: Widget Gauge AKG Real-Time & SSE Alert** | `https://nutrishare.web.id/recipient` | Arrafi | 00:45 |
| **Part 3.4** | Logistics Tracking (Leaflet GIS) & Closed-Loop AKG Handover | `/recipient` (Track) | Arrafi | 00:30 |
| **Part 3.5** | Admin Governance & Macro Impact Analytics | `https://nutrishare.web.id/admin` | Arrafi | 00:45 |
| **Part 4** | Transisi Penutup & Kesimpulan | Slide 5 / Closing | Arrafi → Ayli | 00:45 |
| **Appendix** | **Technical Q&A Defense Cheat Sheet (AKG & Matematika)** | - | Tim | ~05:00 |

---

## 🎭 Skenario & Naskah Presentasi Lengkap

---

### 📍 BAGIAN 1: PEMBUKAAN & STATEMENT MASALAH (~01:30)
**Pembicara:** Ayli (Nurul Layli)  
**Visual:** Slide Presentasi (Slide 1 & 2: Opening & Problem Statement)

#### 🎬 Teks Narasi (Spoken Script):
> *"Selamat pagi/siang Bapak/Ibu Dewan Juri yang terhormat. Saya **Nurul Layli** bersama rekan saya **Arrafi Nur Hafiz**, dengan bangga mempresentasikan **NutriShare** — platform redistribusi surplus pangan berbasis nutrisi pertama di Indonesia yang ditenagai oleh inovasi dual-engine: **Mesin Perhitungan Asupan & Defisit Gizi AKG Kemenkes** serta **Sistem Pendukung Keputusan Ilmiah Hybrid Shannon Entropy - TOPSIS**.*
>
> *Indonesia saat ini menghadapi paradoks yang sangat memprihatinkan. Data menunjukkan 23 hingga 48 juta ton makanan terbuang menjadi limbah setiap tahunnya, menimbulkan kerugian ekonomi hingga Rp 551 Triliun. Namun di sisi lain, 1 dari 4 remaja mengalami kelaparan tersembunyi (hidden hunger) dan 1 dari 3 balita kita menderita stunting akibat kekurangan gizi esensial.*
>
> *Sektor HoReCa — Hotel, Restoran, dan Katering — menghasilkan surplus pangan berkualitas tinggi setiap hari. Mengapa makanan layak ini tidak pernah sampai ke panti asuhan atau rumah singgah yang membutuhkan? Karena selama ini redistribusi dilakukan secara manual, sporadis, dan menganut prinsip konvensional 'Siapa Cepat, Dia Dapat' (First-Come, First-Served).*
>
> *Prinsip tersebut tidak adil dan buta gizi. Panti asuhan terdekat atau yang memiliki akses internet tercepat akan selalu menang, sementara panti dengan defisit gizi terbesar dan anak-anak yang paling kelaparan justru terabaikan. **NutriShare hadir membongkar kelemahan tersebut dengan menggabungkan pelacakan defisit gizi AKG dinamis dan alokasi presisi matematis berbasis data nutrisi serta urgensi nyata.**"*

---

### 📍 BAGIAN 2: WALKTHROUGH LANDING PAGE & FILOSOFI DUAL ENGINE (~01:30)
*(Penyempurnaan dari `script1.docx`)*  
**Pembicara:** Ayli (Transisi ke Arrafi) / Arrafi  
**Rute:** `https://nutrishare.web.id/`  
**Aksi Layar:** Scroll secara berurutan dari atas ke bawah untuk menampilkan setiap seksi landing page.

#### 1️⃣ Hero Section
- **Aksi Layar:** Tampilkan bagian paling atas landing page di https://nutrishare.web.id/. Arahkan kursor ke Headline dan Tagline.
- **Teks Narasi:**
  > *"Ini adalah Halaman Utama NutriShare di nutrishare.web.id — Nutrition-Based Food Rescue. Tagline kami menyuarakan filosofi utama kami: **'Sustainable Solutions for Zero Food Waste — Allocating Nutrition with Mathematical Precision.'** Kami menghubungkan surplus pangan HoReCa secara langsung ke panti asuhan dan rumah singgah terverifikasi melalui perhitungan gizi AKG dan alokasi matematis yang objektif — tanpa tebak-menebak atau preferensi manual."*

#### 2️⃣ Real-Time Social Impact & Pilar Teknologi Utama
- **Aksi Layar:** Scroll ke Seksi Statistik Dampak dan Fitur Utama.
- **Teks Narasi:**
  > *"Seluruh dampak sosial yang kami ciptakan dilacak secara live. Platform ini ditenagai oleh:
  > 1. **Mesin Perhitungan AKG (Angka Kecukupan Gizi Kemenkes RI)** yang menghitung target kebutuhan gizi harian (Kalori, Protein, Zat Besi, Vitamin C) panti secara dinamis berdasarkan demografi penghuni.
  > 2. **Mesin Hybrid Entropy-TOPSIS** yang menimbang secara ilmiah defisit protein AKG, urgensi, masa simpan, dan jarak lokasi.
  > 3. **Jaminan Keamanan Pangan HACCP 3-Tier & Telemetri Real-Time** dari dapur donor hingga meja makan penerima."*

#### 3️⃣ Katalog Donasi Terverifikasi & Keamanan Pangan 3-Tier
- **Aksi Layar:** Scroll ke Katalog Donasi Terverifikasi.
- **Teks Narasi:**
  > *"Sebelum donasi masuk ke dalam algoritma alokasi TOPSIS, setiap batch makanan wajib melewati **3-Tier Verification System** kami: yaitu validasi sensorik (organoleptik), pemantauan cold-chain/suhu, dan log digital penyerahan. Ini menjamin bahwa makanan yang sampai ke tangan anak-anak panti tidak hanya cepat, tetapi 100% aman disantap."*

#### 4️⃣ Cara Kerja & 5 Kriteria Matriks TOPSIS (Termasuk Pembobotan Defisit AKG)
- **Aksi Layar:** Scroll ke bagian 'Cara Kerja NutriShare' dan matriks pembobotan TOPSIS.
- **Teks Narasi:**
  > *"Alur kerja kami bekerja dalam empat langkah sederhana: Donor mempublikasikan data surplus, sistem menghitung bobot Entropy-TOPSIS secara otomatis, lembaga sosial dengan prioritas tertinggi menerima tawaran eksklusif, dan armada logistik mengantar donasi.*
  >
  > *Inilah keunggulan kompetitif utama kami — **5 Variabel Objektif Matriks TOPSIS**:*
  > *• **Kebutuhan Nutrisi AKG (Kecukupan Defisit Protein)** dengan bobot 28.4%,*
  > *• **Tingkat Urgensi & Batas Kedaluwarsa** sebesar 24.5%,*
  > *• **Kapasitas Penyimpanan & Masa Simpan** sebesar 18.2%,*
  > *• **Jarak Geografis (Logistik)** sebesar 15.6%, serta*
  > *• **Riwayat Penerimaan (Pemerataan Aid)** sebesar 13.3%.*
  >
  > *Kelima bobot ini selalu berjumlah tepat 100%, dihitung secara dinamis oleh Shannon Entropy tanpa bias manusia sedikit pun."*

#### 5️⃣ Ekosistem Terintegrasi & Impact Ledger
- **Aksi Layar:** Scroll ke Tiga Pilar Jaringan dan Ledger Dampak Terverifikasi.
- **Teks Narasi:**
  > *"Ekosistem NutriShare ditopang oleh 3 pilar: Donor HoReKa yang dapat mempublikasikan surplus kurang dari 2 menit; 24 Institusi Penerima Terverifikasi di Yogyakarta; dan Armada Logistik dengan rata-rata pengantaran di bawah 45 menit.*
  >
  > *Hingga saat ini, sistem kami telah berhasil menyelamatkan **555 kg makanan**, menyalurkan **185 porsi bergizi**, menjangkau lembaga sosial terverifikasi, dan mencegah **1,4 ton emisi CO2e** — setara dengan menanam lebih dari 120 bibit pohon. Semua data ini diperbarui secara live."*

#### 6️⃣ Closing Call-to-Action (CTA)
- **Aksi Layar:** Scroll ke bagian Footer/CTA.
- **Teks Narasi:**
  > *"NutriShare hadir dengan pesan sederhana: **Hentikan Pemborosan, Alokasikan Nutrisi.** Platform ini 100% gratis, patuh standar HACCP, dan terverifikasi secara matematis."*

---

### 📍 BAGIAN 3: LIVE PROTOTYPE DEMO (~05:00)
*(Penyempurnaan dari `script2.pdf` — Dibawakan secara penuh oleh Arrafi)*  
**Pembicara:** Arrafi Nur Hafiz  
**Lingkungan Demo:** `https://nutrishare.web.id/`

#### 0️⃣ Pendahuluan Demo & Orientasi Aplikasi (~50 detik)
- **Route:** `https://nutrishare.web.id/` (Aplikasi Web Live)
- **Aksi Layar:** Scroll halus melewati Hero Section, Cara Kerja, Keunggulan Fitur, hingga CTA.
- **Teks Narasi (Arrafi):**
  > *"Terima kasih Ayli. Izinkan saya, **Arrafi**, membawa Bapak/Ibu sekalian untuk melihat langsung demonstrasi platform NutriShare yang berjalan secara live di nutrishare.web.id.*
  >
  > *Di halaman utama live ini, pengunjung dan calon mitra dapat melihat langsung bagaimana misi penyelematan pangan kami diwujudkan melalui antarmuka modern. Kami menyajikan fitur unggulan yang tidak dimiliki platform lain: **Perhitungan Asupan Nutrisi Berdasarkan Standar AKG Kemenkes RI**, **Mesin Rekomendasi Hybrid Entropy-TOPSIS**, dan **Sistem Verifikasi Pengiriman Closed-Loop**.*
  >
  > *Sekarang, mari kita masuk ke alur pengguna yang sebenarnya, dimulai dari sisi Dashboard Donor."*

---

#### 1️⃣ Donor Flow & Multi-Mode Input (Manual, Preset, & AI Estimator Kemenkes) (~60 detik)
- **Route:** `https://nutrishare.web.id/donor`
- **Aksi Layar:**
  1. Klik tombol **"Add Surplus Donation"** (Tambah Donasi Pangan).
  2. Tunjukkan fleksibilitas input donor:
     - **Metode 1 (Manual Input):** Sorot form nama makanan, jumlah porsi, jam kedaluwarsa, kalori, protein, zat besi, dan vitamin C yang dapat diisi manual sesuai catatan dapur katering.
     - **Metode 2 (Smart Preset):** Klik templat **"Nasi Box Ayam & Lauk Komplit"** (28g protein, 580 kcal, 6 jam shelf life).
     - **Metode 3 (AI Nutrition Estimator):** Ketik nama makanan misalnya *"Nasi Rendang Daging Padang"*, lalu klik tombol **"Hitung Estimasi Gizi AI"** (Sparkles icon). Tunjukkan nilai gizi yang terisi otomatis.
- **Teks Narasi (Arrafi):**
  > *"Ini adalah Dashboard Donor di nutrishare.web.id/donor. Untuk memudahkan koki hotel atau manajer restoran mempublikasikan donasi dalam waktu kurang dari 2 menit, NutriShare menyediakan **3 Metode Input Pangan yang Sangat Fleksibel**:*
  >
  > *1. **Pengisian Manual Penuh:** Staf dapur dapat menginput nama makanan, porsi, jam kedaluwarsa, dan profil gizi secara manual sesuai spesifikasi katering mereka.*
  > *2. **Templat Preset Siap Pakai:** Cukup 1-klik memilih dari 6+ templat populer seperti Nasi Box Ayam, Pastry Bakery, atau Sup Sayur.*
  > *3. **Fitur AI Nutrition Estimator:** Donor cukup mengetik nama makanan, dan AI akan mengestimasi kandungan kalori, protein, zat besi, serta vitamin C secara otomatis.*
  >
  > *⚠️ **Penting untuk ditekankan:** Nilai yang dihasilkan oleh AI ini bersifat **ESTIMASI** (bukan kandungan analisis laboratorium pasti). Estimasi ini diturunkan secara ilmiah berdasarkan **Tabel Komposisi Pangan Indonesia (TKPI) dan Data Angka Kecukupan Gizi (AKG) dari Kementerian Kesehatan Republik Indonesia (Kemenkes RI)**, sehingga donor memiliki acuan gizi yang akurat tanpa perlu menghitung manual.*
  >
  > *Sekarang, saya tekan tombol **Publish Donation**."*

---

#### 2️⃣ Core Highlight: Audit Defisit AKG & Entropy-TOPSIS (~100 detik)
- **Route:** `https://nutrishare.web.id/donor` → Modal **"TOPSIS Recommendation Audit"** (atau via Dashboard Admin)
- **Aksi Layar:**
  1. Buka Modal Audit TOPSIS.
  2. Sorot Matriks Keputusan Berbobot dan Kriteria $C_1$ (% Defisit Protein AKG Terpenuhi).
  3. Tunjukkan 5 Kriteria (Kecukupan Protein AKG, Skor Urgensi, Masa Simpan, Jarak Geografis, Pemerataan).
  4. Tunjukkan Bobot Shannon Entropy dinamis dan Skor Preferensi Relatif ($V_i$).
  5. **Pengumuman Live Situasional:** Baca secara langsung nama lembaga sosial yang menempati **Peringkat #1 pada layar saat demo**.
- **Teks Narasi (Arrafi — Narasi Situasional Live):**
  > *"Inilah jantung utama dari NutriShare dan keunggulan teknologi kami yang paling krusial: **Modal Audit Alokasi Defisit AKG & TOPSIS**.*
  >
  > *Saat donasi dipublikasikan, sistem tidak melempar makanan ini ke papan publik pasar bebas. Sebaliknya, **Mesin Perhitungan AKG** kami terlebih dahulu mengambil data defisit protein harian setiap panti terhadap standar Kemenkes RI. Lalu, **Mesin Hybrid Entropy-TOPSIS** kami mengevaluasi seluruh panti asuhan terdaftar berdasarkan matriks keputusan objektif.*
  >
  > *Pertama, algoritma **Shannon Entropy** menganalisis variansi data aktual panti hari ini untuk menghitung bobot kriteria secara ilmiah tanpa campur tangan manusia.*
  > *Kedua, metode **TOPSIS** mengukur jarak Euclidean setiap panti terhadap Solusi Ideal Positif ($A^+$) — yaitu panti dengan defisit protein AKG & urgensi tertinggi — dan Solusi Ideal Negatif ($A^-$).*
  >
  > *Seperti yang terlihat secara langsung pada layar saat ini: **[Sebutkan Nama Panti di Layar, contoh: Panti Asuhan Kasih Ibu]** menempati **Peringkat #1** dengan Skor Preferensi ($V_i$) tertinggi. Mengapa sistem menempatkannya di posisi teratas? Karena algoritma TOPSIS secara dinamis menghitung defisit protein AKG harian mereka yang tinggi, urgensi penghuni, jarak lokasi yang dekat, serta jeda waktu yang lebih lama sejak menerima bantuan terakhir.*
  >
  > *Ini bukan penunjukan manual yang di-hardcode — ini adalah keadilan nutrisi berbasis AKG real-time yang beradaptasi dengan panti mana pun yang paling membutuhkan."*

---

#### 3️⃣ Recipient Dashboard: Widget Gauge AKG Real-Time & SSE Priority Claim (~45 detik)
- **Route:** `https://nutrishare.web.id/recipient`
- **Aksi Layar:**
  1. Sorot **Widget Gauge Progres Asupan Gizi AKG Kemenkes** yang menampilkan persentase harian Kalori, Protein, Zat Besi, dan Vitamin C.
  2. Tunjukkan Notifikasi Real-Time yang masuk via **Server-Sent Events (SSE)** untuk panti peringkat #1 di layar.
  3. Tunjukkan **Timer Hitung Mundur Prioritas Claim**.
  4. Klik tombol **"Claim Donation"**.
- **Teks Narasi (Arrafi — Narasi Situasional Live):**
  > *"Sekarang kita beralih ke Dashboard Penerima di nutrishare.web.id/recipient.*
  >
  > *Perhatikan **Widget Gauge Progres AKG Kemenkes** ini. Sistem kami secara kontinyu menghitung target asupan gizi harian (Kalori, Protein, Zat Besi, Vitamin C) berdasarkan jumlah dan rentang usia penghuni panti.*
  >
  > *Sebagai **panti peringkat #1 di layar saat ini**, mereka langsung menerima notifikasi prioritas secara instan tanpa perlu melakukan refresh halaman, ditenagai oleh **Server-Sent Events (SSE)**.*
  >
  > *Sistem memberikan jendela waktu prioritas (claim window). Jika dalam batas waktu tersebut donasi tidak diklaim, fitur **Tiered Shelf-Life Escalation** kami akan secara otomatis mengeskalasi donasi ke Panti Peringkat #2, sehingga makanan tidak pernah terbuang karena menunggu terlalu lama. Sekarang, saya tekan **Claim Donation**."*

---

#### 4️⃣ Logistics Dispatch, Live Tracking & Closed-Loop AKG Handover (~30 detik)
- **Route:** `https://nutrishare.web.id/recipient` → Modal **"Track Delivery"**
- **Aksi Layar:**
  1. Buka Peta Interaktif **Leaflet GIS**.
  2. Tunjukkan pergerakan posisi kurir secara real-time.
  3. Simulasi kedatangan kurir dan klik tombol **"Confirm Receipt"**. Arahkan kursor ke grafik Gauge AKG yang langsung naik.
- **Teks Narasi (Arrafi):**
  > *"Setelah donasi diklaim, sistem mengaktifkan pelacakan pengiriman langsung melalui **Peta Interaktif Leaflet**. Penerima dapat memantau posisi kurir secara real-time.*
  >
  > *Ketika makanan tiba di lokasi, pihak panti memverifikasi kondisi fisik makanan dan menekan tombol **Confirm Receipt**. Langkah ini menutup siklus pengiriman (closed-loop verification): muatan gizi dari 50 porsi donasi ini seketika di-ingest ke Mesin AKG dan memperbarui grafik gizi harian panti."*

---

#### 5️⃣ Admin Governance & Macro Impact Analytics (~45 detik)
- **Route:** `https://nutrishare.web.id/admin` (Dashboard Admin)
- **Aksi Layar:**
  1. Tunjukkan Tab **KYC Verification** (Verifikasi Dokumen Donor & Penerima).
  2. Tunjukkan Metrik Makro: Total Protein Terdistribusi (g/kg), Makanan Diselamatkan (kg), dan Estimasi Reduksi Emisi CO2e.
- **Teks Narasi (Arrafi):**
  > *"Terakhir, integritas dan keamanan seluruh ekosistem dikendalikan melalui **Dashboard Admin di nutrishare.web.id/admin**.*
  >
  > *Untuk mencegah penipuan dan risiko keamanan pangan, setiap donor dan penerima wajib melalui proses verifikasi legalitas **KYC (Know Your Customer)** sebelum dapat bertransaksi.*
  >
  > *Selain itu, Admin dapat memantau dampak makro secara transparan: total gram protein yang tersalurkan serta tonase emisi CO2e yang berhasil dicegah. Data terverifikasi ini secara langsung mendukung **SDG 2 (Tanpa Kelaparan)**, **SDG 3 (Kehidupan Sehat & Sejahtera)**, dan **SDG 12 (Konsumsi & Produksi Bertanggung Jawab)**."*

---

### 📍 BAGIAN 4: TRANSISI PENUTUP & KESIMPULAN (~00:45)
**Pembicara:** Arrafi → Ayli  
**Visual:** Slide 5 / Closing Slide Presentasi

#### 🎬 Teks Narasi Transisi (Arrafi):
> *"Demikianlah demonstrasi alur penuh platform NutriShare yang berjalan live di nutrishare.web.id — mulai dari input fleksibel donor dengan AI Estimator, pelacakan defisit gizi AKG, audit alokasi matematis TOPSIS, pengklaiman real-time, pengantaran teracak, hingga pelaporan dampak makro. Sekarang saya kembalikan kepada rekan saya, Ayli, untuk kesimpulan penutup."*

#### 🎬 Teks Narasi Penutup (Ayli):
> *"Terima kasih Arrafi. Bapak/Ibu Dewan Juri yang kami hormati, NutriShare telah membuktikan bahwa teknologi, ilmu gizi AKG, dan alokasi presisi matematis mampu mengubah masalah limbah pangan menjadi solusi kecukupan gizi yang adil dan bermartabat.*
>
> *Dengan NutriShare, tidak ada lagi makanan layak yang terbuang sia-sia, dan tidak ada lagi lembaga sosial rentan yang terlupakan. Mari bersama NutriShare: **Hentikan Pemborosan, Alokasikan Nutrisi.***
>
> *Sekian presentasi dari kami. Kami siap menerima pertanyaan dan masukan dari Bapak/Ibu Dewan Juri. Terima kasih."*

---

## 🛡️ LAMPIRAN TEKNIS & CHEAT SHEET Q&A DEFENSE
*(Garis Pertahanan Jawaban Lengkap & Detail untuk Sesi Tanya Jawab Juri)*

### 1. Bagaimana Mesin Perhitungan AKG (Angka Kecukupan Gizi Kemenkes RI) Bekerja?
- **Pertanyaan Juri:** *"Bagaimana NutriShare menghitung target kebutuhan gizi harian AKG dan defisit nutrisi lembaga penerima?"*
- **Jawaban:**
  1. **Profil Demografi Panti:** Saat pendaftar/pengaturan profil, lembaga sosial memasukkan total penghuni yang dikategorikan berdasarkan rentang usia (balita, anak, remaja, dewasa, lansia) dan kondisi kesehatan.
  2. **Perhitungan Target Baseline:** Mesin AKG menghitung target harian untuk 4 indikator utama berdasarkan Standar Angka Kecukupan Gizi (AKG Kemenkes RI):
     $$\text{Target Protein (g/hari)} = \sum_{a \in \text{rentang usia}} (\text{jumlah penghuni}_a \times \text{AKG\_Protein}_a)$$
     Rumus setara berlaku untuk Kalori (kcal), Zat Besi (mg), dan Vitamin C (mg).
  3. **Pelacakan Asupan Rolling 24-Jam:** Setiap donasi yang berhasil dikonfirmasi penerimaannya (`completed`), muatan gizinya dicatat:
     $$\text{Asupan Protein Hari Ini} = \sum_{\text{klaim 24 jam}} (\text{porsi} \times \text{protein per porsi})$$
  4. **Rasio Defisit & Input TOPSIS ($C_1$):**
     $$\text{Rasio Defisit} = 1.0 - \min\left(1.0, \frac{\text{Asupan Protein Hari Ini}}{\text{Target Protein}}\right)$$
     Rasio defisit ini langsung di-ingest ke Kriteria $C_1$ dalam matriks TOPSIS, memberikan prioritas lebih tinggi pada panti yang pemenuhan AKG-nya paling tertinggal.

---

### 2. Bagaimana Algoritma Hybrid Entropy-TOPSIS Bekerja Secara Matematis & Mengapa Ini Merupakan Keunggulan Utama Kami?
- **Pertanyaan Juri:** *"Mengapa NutriShare menggunakan Entropy-TOPSIS dan bagaimana tahapan matematisnya secara detail?"*
- **Jawaban:**
  Metode konvensional alokasi bantuan pangan umumnya menggunakan pendekatan *First-Come First-Served* (FCFS) atau bobot subjektif tetap. FCFS sangat rentan terhadap ketidakadilan karena panti yang memiliki sinyal internet cepat atau lokasi dekat akan selalu memonopoli donasi.

  **NutriShare mengatasi ini dengan algoritma 6 tahap Hybrid Shannon Entropy - TOPSIS:**
  1. **Formulasi Matriks Keputusan ($X_{m \times n}$):** Membentuk matriks alternatif panti ($m$) terhadap 5 kriteria ($n$).
  2. **Normalisasi Vektor ($R$):** Eliminasi satuan fisik (kg, km, jam) menjadi matriks tanpa dimensi:
     $$r_{ij} = \frac{x_{ij}}{\sqrt{\sum_{i=1}^{m} x_{ij}^2}}$$
  3. **Pembobotan Objektif Shannon Entropy ($w_j$):** Menghitung nilai entropi informasi $E_j$ untuk mengukur variansi data aktual:
     $$E_j = -k \sum_{i=1}^{m} p_{ij} \ln(p_{ij}) \quad \text{di mana } p_{ij} = \frac{r_{ij}}{\sum r_{ij}}$$
     Nilai derajat diversifikasi $d_j = 1 - E_j$ menentukan bobot objektif $w_j = \frac{d_j}{\sum d_j}$. Untuk menjamin stabilitas sistem, bobot ini digabung 50:50 dengan bobot kebijakan baseline.
  4. **Penentuan Solusi Ideal Positif ($A^+$) dan Negatif ($A^-$):**
     $$A^+ = \{ \max_i v_{ij} | j \in B \}, \quad A^- = \{ \min_i v_{ij} | j \in B \}$$
  5. **Hitung Jarak Euclidean ($S_i^+$ & $S_i^-$):** Mengukur seberapa dekat panti ke kondisi ideal gizi paling membutuhkan.
  6. **Skor Preferensi Relatif ($V_i$):**
     $$V_i = \frac{S_i^-}{S_i^+ + S_i^-}$$
     Panti dengan nilai $V_i$ terdekat ke 1.0 dipilih otomatis sebagai penerima Peringkat #1.

---

### 3. Bagaimana AI Nutrition Estimator Bekerja dan Mengapa Menekankan 'Estimasi'?
- **Pertanyaan Juri:** *"Bagaimana sistem mengestimasi nilai gizi makanan dan seberapa akurat hasilnya?"*
- **Jawaban:**
  - **Mekanisme Kerja:** AI Nutrition Estimator NutriShare memanfaatkan Natural Language Processing (NLP) ringan berbasis pangkalan pengetahuan **Tabel Komposisi Pangan Indonesia (TKPI)**. Saat donor menginput nama makanan (misal: *"Nasi Box Ayam Bakar"*), engine mencocokkan kata kunci bahan utama dan porsi standar.
  - **Penekanan Estimasi:** Kami secara eksplisit menyampaikan kepada pengguna dan juri bahwa nilai ini adalah **ESTIMASI (bukan kandungan pasti analisis laboratorium/uji kimia)**. Makanan olahan katering memiliki variasi resep, namun estimasi ini sangat krusial memberikan acuan gizi daripada tidak ada data gizi sama sekali.
  - **Referensi Baku:** Nilai rujukan kalori, protein, zat besi, dan vitamin C yang dipakai oleh engine diturunkan langsung dari **Standar Angka Kecukupan Gizi (AKG) Kemenkes RI**, sehingga tetap memiliki landasan ilmiah yang valid.
  - **Fleksibilitas Input:** Jika donor memiliki data hasil uji lab sendiri, donor bebas mengabaikan estimasi AI dan **menginput nilai gizi secara manual**.

---

### 4. Bagaimana NutriShare Menjamin Keamanan Pangan (Food Safety)?
- **Pertanyaan Juri:** *"Bagaimana mencegah keracunan makanan dari surplus yang disumbangkan?"*
- **Jawaban:**
  1. **Standar Penilaian 3-Tier HACCP:** Donor wajib menyertakan timestamp pembuatan dan batas shelf-life (maksimal 4 jam untuk makanan siap saji).
  2. **Filter Otomatis Kedaluwarsa:** Jika sisa masa simpan makanan $< 60$ menit, sistem secara otomatis menolak publikasi donasi untuk makanan basah.
  3. **Verifikasi Fisik Handover:** Penerima melakukan pengecekan sensorik (bau, warna, suhu) saat kurir menyerahkan makanan sebelum tombol *Confirm Receipt* ditekan.

---

### 5. Mengapa Menggunakan Server-Sent Events (SSE) Dibandingkan WebSocket?
- **Pertanyaan Juri:** *"Mengapa memilih SSE untuk notifikasi real-time?"*
- **Jawaban:**
  - NutriShare membutuhkan komunikasi **satu arah (one-way server-to-client)** yang efisien dari backend ke dashboard penerima saat donasi baru dipublikasikan.
  - SSE berjalan di atas protokol HTTP standar, lebih hemat energi/bandwidth, secara otomatis menangani *reconnection*, dan lebih bersahabat dengan infrastruktur cloud/serverless dibanding WebSocket yang membutuhkan koneksi duplex persisten.

---

### 6. Bagaimana Mencegah Monopoli Bantuan oleh Panti Terdekat (Pemerataan Aid)?
- **Pertanyaan Juri:** *"Apakah panti yang lokasinya dekat dengan hotel akan selalu mendapat donasi?"*
- **Jawaban:**
  - Tidak, karena NutriShare memiliki **Kriteria $C_5$ (Distribution History / Fairness Safeguard)** yang berbobot 13.3%.
  - Semakin sering atau semakin baru sebuah panti menerima donasi, skor $C_5$-nya akan menurun drastis. Hal ini memberikan penalti bagi panti yang baru menerima bantuan dan memberikan kesempatan lebih tinggi bagi panti yang belum menerima donasi selama beberapa hari, meskipun lokasinya sedikit lebih jauh.

---
