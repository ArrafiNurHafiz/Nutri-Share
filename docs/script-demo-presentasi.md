# NutriShare — Complete Live Demonstration Script & Presenter Guide (Bilingual: English & Bahasa Indonesia)

Panduan lengkap peragaan langsung aplikasi web **NutriShare** saat presentasi di hadapan dewan juri / penguji, dilengkapi narasi dwibahasa (English & Bahasa Indonesia), rute antarmuka, aksi klik peraga, dan strategi tanya-jawab teknis.

---

## 📋 Presentation Blueprint / Rencana Presentasi

- **Recommended Duration / Durasi:** 6 – 8 Minutes / Menit
- **Display Setup / Rekomendasi Layar:** Dual Browser Window (Window 1: Donor & Admin, Window 2: Recipient & Public Map)
- **Core Message / Pesan Utama:**
  - *EN:* NutriShare is an intelligent, nutrition-optimized Decision Support System (DSS) using Shannon Entropy and TOPSIS based on Indonesian AKG standards, replacing unfair first-come-first-served food rescue.
  - *ID:* NutriShare adalah Sistem Pendukung Keputusan (DSS) berbasis optimasi gizi menggunakan Entropy-TOPSIS dan standar AKG Permenkes No. 28/2019, menggantikan sistem konvensional 'siapa cepat dia dapat'.

---

## 🛠️ Test Accounts & Route Matrix / Matriks Akun Uji Coba

| Role / Peran | Route / Rute | Account Context / Konteks Akun | Key Features to Highlight / Fitur Utama |
|---|---|---|---|
| **Public / Publik** | `/` | Visitor / Tamu | Problem statistics, 3 Pillars, Live impact metrics |
| **Donor (HoReCa)** | `/donor` | Hotel / Restoran Mitra | Quick preset, Macronutrient input, Real-time TOPSIS recommendation audit |
| **Recipient / Penerima** | `/recipient` | Panti Asuhan / Rumah Singgah | AKG Nutrition Gauge, Priority notification, Claim window, Leaflet tracking |
| **Admin** | `/admin` | Administrator Sistem | KYC Verification, Claim approval, CO2e & Protein macro analytics, Audit log |
| **Geospatial Map** | `/map` | Interactive Explore | Live geographic distribution of surplus and verified institutions |

---

## 🎬 Act 1: The Paradox & Platform Introduction (Latar Belakang & Pembuka)
**Duration / Durasi:** ~45 Seconds  
**Screen / Tampilan:** `http://localhost:5173/` (Landing Page)

### On-Screen Actions / Aksi Layar:
1. Buka landing page `/`.
2. Scroll perlahan di **Hero Section**, tunjukkan metrik live counter (Surplus Diselamatkan, Protein Tersalurkan, Lembaga Terverifikasi).
3. Sorot bagian **Three Pillars** (Prioritisasi Gizi, Alokasi Cerdas, Transparansi Penuh).

### Spoken Narrative / Naskah Presentasi:

#### 🇬🇧 English:
> *"Good morning/afternoon, distinguished judges.*
> 
> *Indonesia wastes 23 to 48 million tons of food annually, causing economic losses of over 500 trillion Rupiah. Yet, right in our neighborhood, orphanages and social shelters suffer from 'hidden hunger' and chronic micronutrient deficiencies.*
> 
> *Existing food rescue platforms rely on a flawed **'first-come, first-served'** mechanism, where whoever clicks fastest wins the food—regardless of whether they actually need it or whether the nutritional profile matches their dietary needs.*
> 
> *This is **NutriShare** — an integrated full-stack platform that transforms food surplus distribution through an intelligent, nutrition-first Decision Support System."*

#### 🇮🇩 Bahasa Indonesia:
> *"Selamat pagi/siang, Bapak/Ibu dewan juri yang terhormat.*
> 
> *Indonesia membuang 23 hingga 48 juta ton makanan per tahun dengan kerugian ekonomi lebih dari 500 triliun Rupiah. Namun di saat yang sama, panti asuhan dan rumah singgah di sekitar kita masih menghadapi 'hidden hunger' atau defisiensi mikronutrien kronis.*
> 
> *Platform penyelamatan pangan yang ada saat ini masih menggunakan model **'siapa cepat dia dapat'**, di mana siapa yang paling cepat menekan tombol klaim yang mendapatkan makanan—tanpa mempertimbangkan tingkat urgensi gizi.*
> 
> *Inilah **NutriShare** — platform terpadu yang mentransformasi redistribusi surplus pangan melalui Sistem Pendukung Keputusan cerdas berbasis pemenuhan gizi."*

---

## 🎬 Act 2: Donor Experience — Quick Listing & Nutrition Profiling (Sisi Donatur)
**Duration / Durasi:** ~90 Seconds  
**Screen / Tampilan:** `http://localhost:5173/donor` (Donor Dashboard)

### On-Screen Actions / Aksi Layar:
1. Masuk ke dashboard Donor (Hotel / Restoran).
2. Tunjukkan **Impact Badges** (Zero Waste Hero, Protein Champion) dan statistik donasi aktif.
3. Klik tombol **"Tambah Donasi Surplus" / "Create Food Listing"**.
4. Pilih salah satu preset cepat (contoh: *"Paket Nasi & Lauk Komplit"* atau *"Lauk Protein"*).
5. Tunjukkan form nutrisi yang terisi otomatis:
   - Jumlah porsi: `50 porsi`
   - Protein per porsi: `26 gram`
   - Kalori: `540 kkal`
   - Batas waktu konsumsi aman: `4 jam`
   - Tag mikronutrien (Zat Besi & Vitamin C)
6. Klik **"Publikasikan Donasi" / "Publish Listing"**.

### Spoken Narrative / Naskah Presentasi:

#### 🇬🇧 English:
> *"Let's examine the donor workflow—such as a banquet manager at a hotel.*
> 
> *At the close of an event, donors can log surplus food in seconds. Using smart presets, they input portion counts, the safe consumption time window, and the macronutrient profile—specifically protein, calories, and essential micronutrients.*
> 
> *The moment I click 'Publish', NutriShare does not merely broadcast this listing to a public board. Instead, our backend immediately feeds this food profile into our multi-criteria decision algorithm."*

#### 🇮🇩 Bahasa Indonesia:
> *"Mari kita lihat alur dari sisi donatur—misalnya pengelola banquet hotel.*
> 
> *Di akhir acara, staf donatur dapat mencatat surplus makanan dalam hitungan detik. Menggunakan preset cerdas, mereka memasukkan jumlah porsi, batas waktu aman konsumsi, dan profil nutrisi—terutama kandungan protein, kalori, serta mikronutrien.*
> 
> *Saat saya menekan tombol 'Publikasikan', NutriShare tidak sekadar menyebarkan makanan ke forum terbuka. Sistem backend kami langsung memasukkan profil makanan ini ke dalam kalkulasi algoritma keputusan multi-kriteria."*

---

## 🎬 Act 3: The Engine — Real-Time Hybrid Entropy-TOPSIS (Algoritma Keputusan)
**Duration / Durasi:** ~90 Seconds  
**Screen / Tampilan:** `http://localhost:5173/donor` → Klik **"Audit Rekomendasi TOPSIS"**

### On-Screen Actions / Aksi Layar:
1. Buka modal **TOPSIS Recommendation / Calculation Breakdown**.
2. Tunjukkan tabel urutan peringkat penerima (#1, #2, #3, dst.).
3. Tunjukkan kolom **Nilai Preferensi ($V_i$)** (contoh: `0.892`, `0.741`, `0.512`).
4. Paparkan 5 kriteria dinamis pada tampilan:
   - **$C_1$ Kebutuhan & Defisit Gizi:** Kecocokan makronutrien makanan dengan defisit AKG panti.
   - **$C_2$ Urgensi Kesehatan Lembaga:** Kelompok rentan (balita/lansia/anak asuh).
   - **$C_3$ Kesesuaian Makanan:** Kapasitas konsumsi dan penyimpanan panti.
   - **$C_4$ Jarak Geografis:** Jarak tempuh (Haversine) dalam kilometer.
   - **$C_5$ Riwayat Bantuan:** Penalti frekuensi agar distribusi merata.

### Spoken Narrative / Naskah Presentasi:

#### 🇬🇧 English:
> *"Here is the scientific core of NutriShare.*
> 
> *Our backend executes a **Hybrid Entropy-TOPSIS** algorithm. First, **Shannon Entropy** calculates dynamic objective weights ($w_j$) based on real-time matrix variance across all eligible shelters, removing human subjectivity.*
> 
> *Second, **TOPSIS** measures the Euclidean distance of each recipient from the Ideal Positive Solution ($A^+$) and Ideal Negative Solution ($A^-$), generating a relative closeness score ($V_i$).*
> 
> *As shown on screen, **Panti Asuhan Kasih Ibu** ranks #1 with a preference score of 0.892 because their children have an acute protein deficit and they are located within a 3.2 km radius. The system prioritizes actual physiological need over internet click speed."*

#### 🇮🇩 Bahasa Indonesia:
> *"Inilah inti inovasi ilmiah NutriShare.*
> 
> *Backend kami menjalankan algoritma **Hybrid Entropy-TOPSIS**. Pertama, **Shannon Entropy** menghitung bobot objektif secara dinamis ($w_j$) berdasarkan variansi data antar lembaga penerima, sehingga bebas dari bias manusia.*
> 
> *Kedua, metode **TOPSIS** mengukur jarak Euclidean setiap lembaga terhadap Solusi Ideal Positif ($A^+$) dan Solusi Ideal Negatif ($A^-$), menghasilkan skor kedekatan preferensi ($V_i$).*
> 
> *Seperti yang terlihat di layar, **Panti Asuhan Kasih Ibu** menempati peringkat #1 dengan skor preferensi 0,892 karena anak asuh mereka memiliki defisit protein tinggi dan berjarak 3,2 km dari lokasi donor. Sistem mengutamakan kebutuhan gizi nyata, bukan kecepatan koneksi internet."*

---

## 🎬 Act 4: Recipient Experience — AKG Tracking & Priority Claim (Sisi Penerima)
**Duration / Durasi:** ~90 Seconds  
**Screen / Tampilan:** Beralih ke `http://localhost:5173/recipient` (Recipient Dashboard)

### On-Screen Actions / Aksi Layar:
1. Masuk sebagai akun Penerima peringkat #1.
2. Tunjukkan **Widget Indikator AKG** (Target kalori & protein harian vs realisasi asupan berdasar Permenkes No. 28/2019).
3. Tunjukkan pop-up **Notifikasi Real-Time (SSE)** dan badge donasi prioritas.
4. Tunjukkan timer hitung mundur prioritas klaim (contoh: *"Sisa 15 menit sebelum dialihkan"*).
5. Klik tombol **"Klaim Donasi" / "Claim Food"**.

### Spoken Narrative / Naskah Presentasi:

#### 🇬🇧 English:
> *"Switching to the recipient's dashboard.*
> 
> *The shelter administrator monitors their daily **AKG Nutritional Fulfillment Gauge**. When the hotel published the donation, our Server-Sent Events (SSE) immediately delivered an exclusive priority alert to this top-ranked shelter.*
> 
> *They receive a dedicated time window to accept the food. If they cannot receive it and fail to claim within the window, NutriShare's **Automated Fallback Mechanism** seamlessly cascades the offer to Rank #2.*
> 
> *I will now click 'Claim Donation'. The status instantly updates to 'In Transit'."*

#### 🇮🇩 Bahasa Indonesia:
> *"Sekarang kita beralih ke dashboard lembaga penerima.*
> 
> *Pengelola panti memantau pemenuhan **AKG (Angka Kecukupan Gizi)** harian mereka. Saat donatur mempublikasikan makanan, Server-Sent Events (SSE) langsung mengirimkan notifikasi prioritas eksklusif ke panti peringkat teratas ini.*
> 
> *Panti memiliki jendela waktu khusus untuk merespons. Jika panti sedang berhalangan dan batas waktu terlewati, **Mekanisme Fallback Otomatis** NutriShare langsung mengalihkan donasi ke peringkat ke-2 agar makanan tidak terbuang.*
> 
> *Sekarang saya klik 'Klaim Donasi', dan status donasi langsung berubah menjadi 'Dalam Pengiriman'."*

---

## 🎬 Act 5: Real-Time Logistics & Handover Confirmation (Logistik & Serah Terima)
**Duration / Durasi:** ~60 Seconds  
**Screen / Tampilan:** `http://localhost:5173/recipient` → Buka **"Lacak Pengiriman" / Live Tracking**

### On-Screen Actions / Aksi Layar:
1. Buka modal **Peta Interaktif Leaflet**.
2. Tunjukkan visualisasi garis rute dan titik koordinat asal (Hotel) menuju tujuan (Panti).
3. Simulasikan penyelesaian pengantaran.
4. Klik tombol **"Konfirmasi Penerimaan" / Confirm Handover**.
5. Buka **Modal Ulasan & Rating** untuk mencatat verifikasi kelayakan makanan saat tiba.

### Spoken Narrative / Naskah Presentasi:

#### 🇬🇧 English:
> *"Once claimed, NutriShare coordinates delivery logistics. Both parties access an interactive Leaflet map showing real-time routing, coordinates, and estimated arrival time.*
> 
> *Upon delivery, the recipient inspects food freshness and confirms handover on the platform. This action closes the operational loop—instantly logging the nutrition into the shelter's intake history and awarding social impact badges to the donor."*

#### 🇮🇩 Bahasa Indonesia:
> *"Setelah diklaim, NutriShare mengoordinasikan logistik penjemputan. Kedua pihak dapat memantau rute pengantaran melalui peta interaktif Leaflet secara real-time.*
> 
> *Saat makanan tiba, penerima memeriksa kondisi fisik makanan dan menekan tombol konfirmasi penerimaan. Siklus distribusi selesai—asupan nutrisi langsung tercatat ke dalam buku besar gizi panti dan poin apresiasi bertambah di profil donatur."*

---

## 🎬 Act 6: Governance, Analytics & Admin Control (Tata Kelola & Admin)
**Duration / Durasi:** ~60 Seconds  
**Screen / Tampilan:** `http://localhost:5173/admin` (Admin Dashboard)

### On-Screen Actions / Aksi Layar:
1. Masuk ke dashboard `/admin`.
2. Tunjukkan **Metrik Dampak Makro**: Total Kilogram Makanan Diselamatkan, Estimasi Pengurangan Emisi CO2e, Total Porsi, dan Akumulasi Protein (gram).
3. Buka tab **"Verifikasi / KYC"** untuk menunjukkan proses validasi izin operasional lembaga dan sertifikasi keamanan pangan donatur.
4. Tunjukkan tabel **System Activity Audit Log**.

### Spoken Narrative / Naskah Presentasi:

#### 🇬🇧 English:
> *"Platform integrity is governed through our comprehensive Admin Dashboard.*
> 
> *To guarantee food safety and prevent fraud, every donor and recipient must pass a strict administrative KYC verification before joining. Furthermore, administrators gain full visibility over macro ecological impact—such as CO2e greenhouse gas emissions prevented and total protein delivered—supporting verifiable reporting for SDG 2, SDG 3, and SDG 12."*

#### 🇮🇩 Bahasa Indonesia:
> *"Integritas dan keamanan platform dikawal secara ketat melalui Dashboard Admin.*
> 
> *Untuk menjamin keamanan pangan dan mencegah penyalahgunaan, setiap donatur dan lembaga penerima wajib melalui verifikasi administratif (KYC). Selain itu, admin dapat memantau dampak ekologis makro—seperti estimasi reduksi emisi gas rumah kaca (CO2e) dan total protein tersalurkan—sebagai bukti capaian nyata SDG 2, 3, dan 12."*

---

## 🎬 Act 7: Closing Pitch (Penutup)
**Duration / Durasi:** ~30 Seconds  
**Screen / Tampilan:** Kembali ke Landing Page `/`

### Spoken Narrative / Naskah Presentasi:

#### 🇬🇧 English:
> *"In conclusion, NutriShare transforms surplus food from an environmental burden into measurable nutritional equity.*
> 
> *By combining mathematical precision through Entropy-TOPSIS, AKG national nutrition standards, and real-time logistics tracking, NutriShare proves that digital innovation can end food waste and nourish those who need it most.*
> 
> *Thank you very much. We look forward to your questions."*

#### 🇮🇩 Bahasa Indonesia:
> *"Sebagai kesimpulan, NutriShare mentransformasi limbah surplus pangan menjadi keadilan gizi sosial yang terukur.*
> 
> *Dengan memadukan ketepatan matematis Entropy-TOPSIS, standar gizi nasional AKG, dan pelacakan logistik terintegrasi, NutriShare membuktikan bahwa inovasi digital mampu menuntaskan pemborosan pangan sekaligus menyehatkan generasi bangsa.*
> 
> *Terima kasih. Kami siap menjawab pertanyaan Bapak/Ibu dewan juri."*

---

## 🛡️ Technical Q&A Defense Sheet / Panduan Menjawab Pertanyaan Juri

| Pertanyaan Juri (Question) | Jawaban Teknis & Operasional (Technical Defense) |
|---|---|
| **Kenapa tidak memakai grup WhatsApp atau GoFood saja?**<br>*(Why not use WhatsApp groups or GoFood?)* | **ID:** WhatsApp mengandalkan 'siapa cepat dia dapat' tanpa audit gizi dan menimbulkan persaingan tidak sehat. GoFood tidak memiliki pemodelan multi-kriteria AKG, pembatasan jangkauan aman, dan sistem fallback otomatis.<br>**EN:** WhatsApp lacks objective nutrition audits and favors fast fingers. Commercial apps lack multi-criteria AKG modeling, shelf-life safety constraints, and automated fallback ranking. |
| **Bagaimana jika makanan basi di perjalanan?**<br>*(What if food spoils during transit?)* | **ID:** Sistem mewajibkan input batas konsumsi aman (2–4 jam) dan penalti jarak ($C_4$). Penerima wajib memverifikasi kondisi fisik saat serah terima di aplikasi.<br>**EN:** We enforce strict safe-consumption windows (2–4h) and apply distance penalties ($C_4$). Recipients must inspect and log food condition upon arrival. |
| **Bagaimana mencegah kecurangan atau bias algoritma?**<br>*(How to prevent algorithm bias or favoritism?)* | **ID:** Bobot dihitung murni secara matematis oleh Shannon Entropy ($w_j$), dan kriteria $C_5$ memberikan penalti bagi panti yang baru saja menerima donasi agar alokasi merata.<br>**EN:** Shannon Entropy computes objective weights purely from data variance ($E_j$), while criterion $C_5$ penalizes recent recipients to ensure egalitarian distribution. |
| **Arsitektur apa yang menjamin respon real-time?**<br>*(What architecture ensures real-time responsiveness?)* | **ID:** Backend FastAPI asinkron dengan SQLModel/PostgreSQL, dipadukan dengan React 19 dan Server-Sent Events (SSE) untuk push notifikasi instan berlatensi rendah.<br>**EN:** Asynchronous FastAPI backend with SQLModel/PostgreSQL, paired with React 19 and Server-Sent Events (SSE) for low-latency real-time updates. |
