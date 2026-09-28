import os
import docx
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import parse_xml
from docx.oxml.ns import nsdecls

def set_cell_background(cell, fill_hex):
    tcPr = cell._element.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=120, bottom=120, left=180, right=180):
    tcPr = cell._element.get_or_add_tcPr()
    tcMar = parse_xml(f'''
        <w:tcMar {nsdecls("w")}>
            <w:top w:w="{top}" w:type="dxa"/>
            <w:bottom w:w="{bottom}" w:type="dxa"/>
            <w:left w:w="{left}" w:type="dxa"/>
            <w:right w:w="{right}" w:type="dxa"/>
        </w:tcMar>
    ''')
    tcPr.append(tcMar)

def set_table_borders(table, color="D3D3D3"):
    tblPr = table._element.xpath('w:tblPr')
    if tblPr:
        borders = parse_xml(f'''
            <w:tblBorders {nsdecls("w")}>
                <w:top w:val="single" w:sz="6" w:space="0" w:color="{color}"/>
                <w:bottom w:val="single" w:sz="8" w:space="0" w:color="047857"/>
                <w:left w:val="none"/>
                <w:right w:val="none"/>
                <w:insideH w:val="single" w:sz="4" w:space="0" w:color="{color}"/>
                <w:insideV w:val="none"/>
            </w:tblBorders>
        ''')
        tblPr[0].append(borders)

def build_master_script_docx(output_path: str):
    doc = Document()

    # Page setup - Margins 1 inch
    for section in doc.sections:
        section.top_margin = Inches(1.0)
        section.bottom_margin = Inches(1.0)
        section.left_margin = Inches(1.0)
        section.right_margin = Inches(1.0)

    # Styles & Colors
    c_primary = RGBColor(4, 120, 87)       # Emerald Green #047857
    c_dark = RGBColor(15, 23, 42)          # Slate 900
    c_sub = RGBColor(71, 85, 105)          # Slate 600
    c_gold = RGBColor(212, 137, 59)        # Warm Gold Accent

    # Title
    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_title.paragraph_format.space_before = Pt(0)
    p_title.paragraph_format.space_after = Pt(4)
    run_title = p_title.add_run("NUTRISHARE")
    run_title.font.name = "Arial"
    run_title.font.size = Pt(22)
    run_title.font.bold = True
    run_title.font.color.rgb = c_primary

    p_sub = doc.add_paragraph()
    p_sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_sub.paragraph_format.space_after = Pt(14)
    run_sub = p_sub.add_run("Master Presentation Script & Live Demo Walkthrough Manual\n(Fokus Utama: Dual-Engine Inovasi — 1. Perhitungan Asupan & Defisit Gizi AKG Kemenkes RI + 2. Decision Support System Hybrid Entropy-TOPSIS)\nDomain Demo: https://nutrishare.web.id/")
    run_sub.font.name = "Arial"
    run_sub.font.size = Pt(12)
    run_sub.font.bold = True
    run_sub.font.color.rgb = c_dark

    # Meta box
    tbl_meta = doc.add_table(rows=1, cols=1)
    tbl_meta.alignment = WD_TABLE_ALIGNMENT.CENTER
    cell_meta = tbl_meta.rows[0].cells[0]
    set_cell_background(cell_meta, "F8FAFC")
    set_cell_margins(cell_meta, top=140, bottom=140, left=200, right=200)
    p_meta = cell_meta.paragraphs[0]
    p_meta.paragraph_format.space_after = Pt(0)
    r_m = p_meta.add_run("📋 Ringkasan Eksekutif & Inovasi Dual-Engine Proyek:\n"
                         "• Pembicara: Nurul Layli (Opening & Closing) & Arrafi Nur Hafiz (Landing Page & Prototype Demo)\n"
                         "• Est. Durasi: 8 – 9 Menit Presentasi + 5 Menit Tanya Jawab (Q&A Defense)\n"
                         "• Dual Engine Advantage: 1. Mesin Perhitungan Target & Defisit AKG Kemenkes RI + 2. Sistem Pendukung Keputusan Hybrid Shannon Entropy - TOPSIS.\n"
                         "• Dashboard Donor: Input Manual, 6+ Templat Preset, & AI Nutrition Estimator (Estimasi berbasis TKPI / AKG Kemenkes RI).\n"
                         "• Domain Live Demo: https://nutrishare.web.id/")
    r_m.font.name = "Arial"
    r_m.font.size = Pt(9.5)
    r_m.font.color.rgb = c_sub

    doc.add_paragraph().paragraph_format.space_after = Pt(12)

    # Section 1: Overview Timeline
    h1 = doc.add_heading(level=1)
    h1.paragraph_format.space_before = Pt(14)
    h1.paragraph_format.space_after = Pt(6)
    r_h1 = h1.add_run("1. Rencana Alokasi Waktu Presentasi")
    r_h1.font.name = "Arial"
    r_h1.font.color.rgb = c_primary

    # Table
    table = doc.add_table(rows=1, cols=5)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(table)

    headers = ["Bagian", "Topik / Fitur Utama", "Rute / Screen", "Pembicara", "Durasi"]
    hdr_cells = table.rows[0].cells
    for i, title in enumerate(headers):
        hdr_cells[i].text = title
        set_cell_background(hdr_cells[i], "047857")
        p = hdr_cells[i].paragraphs[0]
        p.runs[0].font.bold = True
        p.runs[0].font.color.rgb = RGBColor(255, 255, 255)
        p.runs[0].font.name = "Arial"
        p.runs[0].font.size = Pt(9.5)

    data = [
        ("Part 1", "Pembukaan & Paradoks Limbah Pangan vs Stunting", "Slide 1-2", "Ayli", "01:30"),
        ("Part 2", "Landing Page & Dual Engine (AKG + TOPSIS)", "https://nutrishare.web.id/", "Ayli / Arrafi", "01:30"),
        ("Part 3.0", "Landing Page Demo Overview", "https://nutrishare.web.id/", "Arrafi", "00:50"),
        ("Part 3.1", "Dashboard Donor: Manual, Preset & AI Estimator", "https://nutrishare.web.id/donor", "Arrafi", "01:00"),
        ("Part 3.2", "Core Highlight: Audit Defisit AKG & Entropy-TOPSIS", "/donor modal", "Arrafi", "01:30"),
        ("Part 3.3", "Dashboard Recipient: Widget Gauge AKG & SSE Alert", "https://nutrishare.web.id/recipient", "Arrafi", "00:45"),
        ("Part 3.4", "Logistics Dispatch & Closed-Loop AKG Handover", "/recipient (Track)", "Arrafi", "00:30"),
        ("Part 3.5", "Admin Governance & Macro Impact Analytics", "https://nutrishare.web.id/admin", "Arrafi", "00:45"),
        ("Part 4", "Transisi & Closing Statement", "Slide 5 / Closing", "Arrafi -> Ayli", "00:45"),
    ]

    for row_idx, row_data in enumerate(data):
        row_cells = table.add_row().cells
        bg_color = "F9FAFB" if row_idx % 2 == 1 else "FFFFFF"
        for i, val in enumerate(row_data):
            row_cells[i].text = val
            set_cell_background(row_cells[i], bg_color)
            set_cell_margins(row_cells[i], top=80, bottom=80, left=100, right=100)
            p = row_cells[i].paragraphs[0]
            if len(p.runs) > 0:
                p.runs[0].font.name = "Arial"
                p.runs[0].font.size = Pt(9)
                p.runs[0].font.color.rgb = c_dark

    doc.add_paragraph().paragraph_format.space_after = Pt(14)

    # Section 2: Detailed Script
    h2 = doc.add_heading(level=1)
    h2.paragraph_format.space_before = Pt(14)
    h2.paragraph_format.space_after = Pt(6)
    r_h2 = h2.add_run("2. Naskah Presentasi & Panduan Aksi Layar")
    r_h2.font.name = "Arial"
    r_h2.font.color.rgb = c_primary

    sections = [
        ("BAGIAN 1: PEMBUKAAN & STATEMENT MASALAH (~01:30)", "Ayli", [
            ("Latar Belakang & Inovasi Dual-Engine",
             "Slide 1 & 2",
             "Tampilkan slide pembuka dan grafik paradoks limbah vs stunting.",
             "Selamat pagi/siang Bapak/Ibu Dewan Juri yang terhormat. Saya Nurul Layli bersama rekan saya Arrafi Nur Hafiz, dengan bangga mempresentasikan NutriShare — platform redistribusi surplus pangan berbasis nutrisi pertama di Indonesia yang ditenagai oleh inovasi dual-engine: Mesin Perhitungan Asupan & Defisit Gizi AKG Kemenkes serta Sistem Pendukung Keputusan Ilmiah Hybrid Shannon Entropy - TOPSIS.\n\n"
             "Indonesia saat ini menghadapi paradoks memprihatinkan: 23-48 juta ton makanan terbuang (rugi Rp 551 Triliun), sementara 1 dari 4 remaja mengalami kelaparan tersembunyi dan 1 dari 3 balita menderita stunting.\n\n"
             "Redistribusi konvensional menganut 'Siapa Cepat Dia Dapat' yang tidak adil dan membawa kebutaan gizi. NutriShare membongkar kelemahan tersebut dengan menggabungkan pelacakan defisit gizi AKG dinamis dan alokasi presisi matematis.")
        ]),
        ("BAGIAN 2: LANDING PAGE & FILOSOFI DUAL ENGINE (~01:30)", "Ayli / Arrafi", [
            ("Walkthrough Landing Page & Dual Engine Pillars",
             "https://nutrishare.web.id/",
             "Scroll halus dari Hero Section -> Real-Time Impact -> Verified Catalog -> How It Works (TOPSIS 5 Criteria) -> Integrated Network -> Ledger.",
             "1️⃣ Hero Section: Tagline kami di nutrishare.web.id: 'Sustainable Solutions for Zero Food Waste — Allocating Nutrition with Mathematical Precision.' Kami menghubungkan surplus pangan HoReCa secara langsung ke lembaga sosial terverifikasi melalui perhitungan AKG dan alokasi matematis objektif.\n\n"
             "2️⃣ Real-Time Social Impact: Dampak sosial dilacak live ditenagai Mesin Perhitungan AKG Kemenkes, Mesin Entropy-TOPSIS, Keamanan Pangan HACCP 3-Tier, dan Telemetri Real-Time.\n\n"
             "3️⃣ 5 Variabel Matriks TOPSIS: Kecukupan Defisit Protein AKG (28.4%), Urgensi & Expiry (24.5%), Masa Simpan (18.2%), Jarak Geografis (15.6%), dan Riwayat Pemerataan (13.3%). Total 100% dinamis tanpa bias manusia.\n\n"
             "4️⃣ Impact Ledger: Berhasil menyelamatkan 555 kg makanan, 185 porsi bergizi, dan mencegah 1.4 ton emisi CO2e (~120 bibit pohon).")
        ]),
        ("BAGIAN 3: LIVE PROTOTYPE DEMO (~05:00)", "Arrafi Nur Hafiz", [
            ("0️⃣ Orientasi Demo & Landing Page Walkthrough",
             "https://nutrishare.web.id/",
             "Scroll halus melalui landing page live di nutrishare.web.id.",
             "Terima kasih Ayli. Izinkan saya, Arrafi, membawa Bapak/Ibu sekalian untuk melihat langsung demonstrasi platform NutriShare yang berjalan secara live di nutrishare.web.id. Kami menyajikan fitur unggulan: Perhitungan Asupan Nutrisi Berdasarkan Standar AKG Kemenkes RI, Mesin Rekomendasi Hybrid Entropy-TOPSIS, dan Verifikasi Pengiriman Closed-Loop."),
            ("1️⃣ Dashboard Donor: Input Manual, Preset & AI Estimator (TKPI Kemenkes)",
             "https://nutrishare.web.id/donor",
             "Klik 'Add Surplus Donation' -> Tunjukkan Manual Input -> Tunjukkan Smart Preset 'Nasi Box Ayam' -> Ketik nama makanan & klik 'Hitung Estimasi Gizi AI'.",
             "Ini adalah Dashboard Donor di nutrishare.web.id/donor. NutriShare menyediakan 3 Metode Input Fleksibel:\n"
             "1. Pengisian Manual Penuh: Mengisi porsi, shelf-life, dan nilai gizi secara manual.\n"
             "2. Templat Preset Siap Pakai: 1-klik memilih dari 6+ templat populer seperti Nasi Box Ayam atau Pastry.\n"
             "3. Fitur AI Nutrition Estimator: Cukup mengetik nama makanan, dan AI akan mengestimasi kalori, protein, zat besi, & vitamin C secara otomatis.\n\n"
             "⚠️ Penting untuk ditekankan: Nilai AI ini bersifat ESTIMASI (bukan kandungan pasti analisis laboratorium). Estimasi diturunkan secara ilmiah berdasarkan Tabel Komposisi Pangan Indonesia (TKPI) & Data AKG Kemenkes RI."),
            ("2️⃣ Core Highlight: Audit Defisit AKG & Entropy-TOPSIS",
             "https://nutrishare.web.id/donor modal Audit TOPSIS",
             "Buka Modal Audit TOPSIS, sorot Kriteria C1 (% Defisit Protein AKG), 5 Kriteria, Shannon Entropy weights, dan Skor Preferensi Vi.",
             "Inilah jantung utama NutriShare: Modal Audit TOPSIS. Mesin AKG mengambil data defisit protein harian panti terhadap standar Kemenkes RI. Lalu Mesin Entropy-TOPSIS mengukur jarak Euclidean setiap panti ke Solusi Ideal Positif (A+) dan Negatif (A-). Panti yang muncul di Peringkat #1 pada layar saat ini menempati posisi teratas karena memiliki defisit protein AKG yang parah, urgensi penghuni, jarak dekat, dan lama tidak menerima donasi. Ini bukti keadilan alokasi berbasis AKG real-time."),
            ("3️⃣ Recipient Dashboard: Widget Gauge AKG Real-Time & SSE Priority Claim",
             "https://nutrishare.web.id/recipient",
             "Tunjukkan Widget Gauge AKG Kemenkes (Kalori, Protein, Zat Besi, Vit C), Notifikasi SSE real-time, Timer Claim, dan Klik 'Claim Donation'.",
             "Di sisi penerima di nutrishare.web.id/recipient, perhatikan Widget Gauge Progres AKG Kemenkes ini yang menghitung target gizi harian berdasarkan demografi penghuni. Sebagai panti peringkat #1 di layar saat ini, mereka langsung menerima notifikasi prioritas instan via Server-Sent Events (SSE). Jika tidak diklaim dalam timer prioritas, donasi dikaskadekan via Tiered Shelf-Life Escalation ke peringkat #2. Saya tekan Claim Donation sekarang."),
            ("4️⃣ Logistics Dispatch, Live Tracking & Closed-Loop AKG Handover",
             "https://nutrishare.web.id/recipient -> Track Delivery",
             "Buka Peta Leaflet GIS, simulasi pergerakan kurir, klik 'Confirm Receipt'. Arahkan kursor ke grafik Gauge AKG.",
             "Setelah diklaim, pengiriman dilacak real-time via Peta Leaflet. Ketika makanan tiba, penerima memverifikasi kondisi fisik dan menekan Confirm Receipt — menutup siklus pengiriman (closed-loop verification): muatan gizi 50 porsi ini seketika di-ingest ke Mesin AKG dan memperbarui grafik gizi harian panti."),
            ("5️⃣ Admin Governance & Macro Impact Analytics",
             "https://nutrishare.web.id/admin",
             "Tunjukkan Tab KYC Verification, Total Protein delivered, dan CO2e reduction.",
             "Terakhir, integritas ekosistem dikendalikan via Dashboard Admin di nutrishare.web.id/admin melalui verifikasi KYC donor & penerima. Admin memantau dampak makro: total protein dan reduksi CO2e yang mendukung SDG 2, 3, dan 12.")
        ]),
        ("BAGIAN 4: TRANSISI & CLOSING STATEMENT (~00:45)", "Arrafi -> Ayli", [
            ("Kesimpulan & Call to Action",
             "Slide 5 / Closing Slide",
             "Arrafi melakukan transisi penutup, Ayli menutup presentasi.",
             "Arrafi: Demikianlah demonstrasi alur penuh platform NutriShare dari input fleksibel donor dengan AI Estimator, pelacakan defisit gizi AKG, audit matematis TOPSIS, hingga analitik makro. Saya kembalikan ke Ayli.\n\n"
             "Ayli: Terima kasih Arrafi. NutriShare membuktikan bahwa alokasi presisi matematis & ilmu gizi AKG mampu mengubah limbah pangan menjadi kecukupan gizi yang adil dan bermartabat. Mari bersama NutriShare: Hentikan Pemborosan, Alokasikan Nutrisi. Terima kasih.")
        ])
    ]

    for sec_title, sec_speaker, items in sections:
        h_sec = doc.add_heading(level=2)
        h_sec.paragraph_format.space_before = Pt(12)
        h_sec.paragraph_format.space_after = Pt(4)
        r_sec = h_sec.add_run(f"{sec_title} — [Pembicara: {sec_speaker}]")
        r_sec.font.name = "Arial"
        r_sec.font.size = Pt(11)
        r_sec.font.color.rgb = c_primary

        for item_title, route, action, script_text in items:
            p_subt = doc.add_paragraph()
            p_subt.paragraph_format.space_before = Pt(6)
            p_subt.paragraph_format.space_after = Pt(2)
            r_st = p_subt.add_run(f"📌 {item_title}")
            r_st.font.name = "Arial"
            r_st.font.size = Pt(10)
            r_st.font.bold = True
            r_st.font.color.rgb = c_dark

            # Route & Action Box
            tbl_box = doc.add_table(rows=1, cols=1)
            tbl_box.alignment = WD_TABLE_ALIGNMENT.CENTER
            cell_box = tbl_box.rows[0].cells[0]
            set_cell_background(cell_box, "F1F5F9")
            set_cell_margins(cell_box, top=80, bottom=80, left=140, right=140)
            p_b = cell_box.paragraphs[0]
            p_b.paragraph_format.space_after = Pt(0)
            r_act = p_b.add_run(f"📍 Route: {route}\n👉 Action: {action}")
            r_act.font.name = "Arial"
            r_act.font.size = Pt(8.5)
            r_act.font.color.rgb = c_sub
            r_act.font.italic = True

            # Script Box
            tbl_scr = doc.add_table(rows=1, cols=1)
            tbl_scr.alignment = WD_TABLE_ALIGNMENT.CENTER
            cell_scr = tbl_scr.rows[0].cells[0]
            set_cell_background(cell_scr, "ECFDF5")  # Emerald light
            set_cell_margins(cell_scr, top=100, bottom=100, left=160, right=160)
            p_s = cell_scr.paragraphs[0]
            p_s.paragraph_format.space_after = Pt(0)
            r_sc = p_s.add_run(f"🗣️ Narasi Pembicara:\n\"{script_text}\"")
            r_sc.font.name = "Arial"
            r_sc.font.size = Pt(9.5)
            r_sc.font.color.rgb = c_dark

            doc.add_paragraph().paragraph_format.space_after = Pt(6)

    # Section 3: Technical Q&A Defense
    h3 = doc.add_heading(level=1)
    h3.paragraph_format.space_before = Pt(16)
    h3.paragraph_format.space_after = Pt(6)
    r_h3 = h3.add_run("3. Technical Q&A Defense Cheat Sheet (Panduan Jawaban Juri)")
    r_h3.font.name = "Arial"
    r_h3.font.color.rgb = c_primary

    qa_list = [
        ("1. Cara Kerja Mesin Perhitungan AKG (Angka Kecukupan Gizi Kemenkes RI)",
         "Pertanyaan Juri: Bagaimana NutriShare menghitung target gizi harian dan defisit nutrisi panti?\n"
         "Jawaban: 1) Profil demografi panti berdasarkan rentang usia penghuni. 2) Target baseline harian disesuaikan dengan Standar AKG Kemenkes RI (Protein, Kalori, Zat Besi, Vit C). 3) Pelacakan Asupan Rolling 24 Jam saat penerimaan makanan diselesaikan. 4) Rasio defisit gizi = 1.0 - (Asupan / Target) yang langsung dimasukkan ke Kriteria C1 pada TOPSIS."),
        ("2. Rumus & Metode Hybrid Entropy-TOPSIS (Keunggulan Utama)",
         "Pertanyaan Juri: Mengapa menggunakan Entropy-TOPSIS dan bagaimana tahapan matematisnya secara detail?\n"
         "Jawaban: FCFS konvensional tidak adil. NutriShare menggunakan 6 tahapan TOPSIS: 1) Matriks Keputusan X. 2) Normalisasi Vektor R. 3) Shannon Entropy E_j menghitung bobot diversifikasi data w_j digabung 50:50 dengan bobot kebijakan. 4) Solusi Ideal Positif (A+) dan Negatif (A-). 5) Jarak Euclidean S_i+ dan S_i-. 6) Skor Relative Closeness V_i. Skor terdekat ke 1.0 menjadi Peringkat #1."),
        ("3. Cara Kerja AI Nutrition Estimator & Penekanan 'Estimasi'",
         "Pertanyaan Juri: Bagaimana sistem mengestimasi nilai gizi dan seberapa akurat hasilnya?\n"
         "Jawaban: AI Estimator menggunakan NLP mencocokkan kata kunci makanan dengan Tabel Komposisi Pangan Indonesia (TKPI). Kami menekankan bahwa nilai ini adalah ESTIMASI (bukan kandungan pasti laboratorium), namun sangat krusial sebagai acuan berbasis AKG Kemenkes RI. Donor tetap dapat menginput nilai gizi secara manual."),
        ("4. Keamanan Pangan & Standar 3-Tier HACCP",
         "Pertanyaan Juri: Bagaimana mencegah risiko keracunan makanan?\n"
         "Jawaban: Melalui 3-Tier HACCP Assurance: 1) Timestamp pembuatan & shelf-life max 4 jam. 2) Filter otomatis kedaluwarsa jika sisa shelf-life < 60 menit. 3) Verifikasi fisik organoleptik saat handover sebelum penerima menekan Confirm Receipt."),
        ("5. Mengapa Server-Sent Events (SSE) bukan WebSocket?",
         "Pertanyaan Juri: Mengapa memilih SSE untuk notifikasi real-time?\n"
         "Jawaban: Komunikasi bersifat satu arah (one-way server-to-client). SSE berjalan di atas HTTP standar, lebih efisien bandwidth, mendukung auto-reconnect, dan kompatibel dengan cloud/serverless."),
        ("6. Pencegahan Monopoli Bantuan oleh Panti Terdekat (Pemerataan Aid)",
         "Pertanyaan Juri: Apakah panti terdekat akan selalu menang?\n"
         "Jawaban: Tidak. Kriteria C5 (Distribution History / Fairness Safeguard) memperhitungkan jumlah hari sejak donasi terakhir diterima. Panti yang baru saja menerima donasi mendapatkan penalti skor C5, memberikan kesempatan adil bagi panti yang belum menerima bantuan beberapa hari.")
    ]

    for qa_title, qa_content in qa_list:
        p_q = doc.add_paragraph()
        p_q.paragraph_format.space_before = Pt(4)
        p_q.paragraph_format.space_after = Pt(2)
        r_qt = p_q.add_run(f"❓ {qa_title}")
        r_qt.font.name = "Arial"
        r_qt.font.size = Pt(10)
        r_qt.font.bold = True
        r_qt.font.color.rgb = c_gold

        tbl_qa = doc.add_table(rows=1, cols=1)
        tbl_qa.alignment = WD_TABLE_ALIGNMENT.CENTER
        cell_qa = tbl_qa.rows[0].cells[0]
        set_cell_background(cell_qa, "FFFBEB")  # Amber light
        set_cell_margins(cell_qa, top=100, bottom=100, left=160, right=160)
        p_qa = cell_qa.paragraphs[0]
        p_qa.paragraph_format.space_after = Pt(0)
        r_qac = p_qa.add_run(qa_content)
        r_qac.font.name = "Arial"
        r_qac.font.size = Pt(9)
        r_qac.font.color.rgb = c_dark

        doc.add_paragraph().paragraph_format.space_after = Pt(6)

    doc.save(output_path)
    print(f"Successfully generated master DOCX at: {output_path}")

if __name__ == '__main__':
    os.makedirs('docs', exist_ok=True)
    build_master_script_docx('docs/MASTER_PRESENTATION_SCRIPT.docx')
    build_master_script_docx('docs/script1_perfected.docx')
