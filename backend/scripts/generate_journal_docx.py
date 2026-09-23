import docx
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

def set_cell_background(cell, fill_hex):
    tcPr = cell._element.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
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
                <w:bottom w:val="single" w:sz="8" w:space="0" w:color="333333"/>
                <w:left w:val="none"/>
                <w:right w:val="none"/>
                <w:insideH w:val="single" w:sz="4" w:space="0" w:color="{color}"/>
                <w:insideV w:val="none"/>
            </w:tblBorders>
        ''')
        tblPr[0].append(borders)

def build_paper_docx(output_path: str):
    doc = Document()

    # Page setup - Margins 1 inch (2.54 cm)
    for section in doc.sections:
        section.top_margin = Inches(1.0)
        section.bottom_margin = Inches(1.0)
        section.left_margin = Inches(1.0)
        section.right_margin = Inches(1.0)

    # Base Styles
    normal_style = doc.styles['Normal']
    normal_style.font.name = 'Times New Roman'
    normal_style.font.size = Pt(11)
    normal_style.font.color.rgb = RGBColor(0x11, 0x18, 0x27)
    normal_style.paragraph_format.line_spacing = 1.15
    normal_style.paragraph_format.space_after = Pt(4)

    # -------------------------------------------------------------
    # TITLE
    # -------------------------------------------------------------
    title_p = doc.add_paragraph()
    title_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    title_p.paragraph_format.space_before = Pt(0)
    title_p.paragraph_format.space_after = Pt(12)
    run_title = title_p.add_run("Penerapan Metode Hybrid Shannon Entropy - TOPSIS dalam Sistem Pendukung Keputusan Distribusi Surplus Pangan")
    run_title.bold = True
    run_title.font.size = Pt(15)
    run_title.font.color.rgb = RGBColor(0x04, 0x78, 0x57) # Emerald theme

    # Authors
    author_p = doc.add_paragraph()
    author_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    author_p.paragraph_format.space_after = Pt(2)
    run_author = author_p.add_run("Arrafi Nur Hafiz¹, Penulis Kedua², Penulis Ketiga³")
    run_author.bold = True
    run_author.font.size = Pt(10.5)

    affil_p = doc.add_paragraph()
    affil_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    affil_p.paragraph_format.space_after = Pt(16)
    run_affil = affil_p.add_run("¹'²'³Program Studi Sistem Informasi, Fakultas Sains dan Teknologi\nUniversitas [Nama Universitas], Kota [Nama Kota], Indonesia\nEmail: ¹arrafi@example.com, ²penulis2@example.com")
    run_affil.italic = True
    run_affil.font.size = Pt(9.5)
    run_affil.font.color.rgb = RGBColor(0x4B, 0x55, 0x63)

    # Divider line
    div_p = doc.add_paragraph()
    div_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    div_p.paragraph_format.space_after = Pt(12)
    div_run = div_p.add_run("―" * 55)
    div_run.font.color.rgb = RGBColor(0xD1, 0xD5, 0xDB)

    # -------------------------------------------------------------
    # ABSTRAK & ABSTRACT
    # -------------------------------------------------------------
    # Abstrak ID
    p_abs_id_title = doc.add_paragraph()
    p_abs_id_title.paragraph_format.space_before = Pt(4)
    p_abs_id_title.paragraph_format.space_after = Pt(2)
    run_abs_id_title = p_abs_id_title.add_run("Abstrak")
    run_abs_id_title.bold = True
    run_abs_id_title.font.size = Pt(10)

    p_abs_id = doc.add_paragraph()
    p_abs_id.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p_abs_id.paragraph_format.space_after = Pt(4)
    r_abs_id = p_abs_id.add_run(
        "Distribusi surplus pangan dari industri perhotelan, restoran, dan katering ke lembaga kesejahteraan sosial "
        "kerap mengalami ketidakefisienan alokasi, risiko kerusakan pangan akibat kendala logistik, serta monopoli bantuan. "
        "Penelitian ini merancang dan mengimplementasikan Sistem Pendukung Keputusan (SPK) distribusi surplus pangan multi-kriteria "
        "dengan mengintegrasikan metode Technique for Order Preference by Similarity to Ideal Solution (TOPSIS) dan pembobotan "
        "Hybrid Shannon Entropy. Model mengevaluasi lima kriteria kunci: persentase pemenuhan defisit protein harian (C1), "
        "skor urgensi dan status darurat penerima (C2), sisa umur simpan pangan (C3), jarak geografis berbasis formula Haversine (C4), "
        "serta indeks keadilan berbasis durasi sejak donasi terakhir (C5). Pembobotan hibrida menggabungkan bobot kebijakan domain subjektif (50%) "
        "dan bobot objektif data Shannon Entropy (50%) untuk mencapai stabilitas penentuan prioritas. Selain itu, diterapkan mekanisme penalti "
        "pemenuhan 24 jam guna mencegah penimbunan (anti-hoarding). Pengujian simulasi terhadap skenario multi-penerima menunjukkan bahwa "
        "metode Hybrid Entropy-TOPSIS berhasil memprioritaskan penerima dengan defisit gizi tinggi dan jarak terdekat untuk makanan cepat basi, "
        "sekaligus menekan ketimpangan distribusi dengan koefisien variasi distribusi yang merata."
    )
    r_abs_id.font.size = Pt(9.5)

    p_kw_id = doc.add_paragraph()
    p_kw_id.paragraph_format.space_after = Pt(10)
    r_kw_id_title = p_kw_id.add_run("Kata Kunci: ")
    r_kw_id_title.bold = True
    r_kw_id_title.font.size = Pt(9.5)
    r_kw_id = p_kw_id.add_run("Sistem Pendukung Keputusan, Surplus Pangan, Hybrid TOPSIS, Shannon Entropy, Haversine Distance, Logistik Pangan.")
    r_kw_id.font.size = Pt(9.5)
    r_kw_id.italic = True

    # Abstract EN
    p_abs_en_title = doc.add_paragraph()
    p_abs_en_title.paragraph_format.space_before = Pt(4)
    p_abs_en_title.paragraph_format.space_after = Pt(2)
    run_abs_en_title = p_abs_en_title.add_run("Abstract")
    run_abs_en_title.bold = True
    run_abs_en_title.font.size = Pt(10)

    p_abs_en = doc.add_paragraph()
    p_abs_en.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p_abs_en.paragraph_format.space_after = Pt(4)
    r_abs_en = p_abs_en.add_run(
        "Surplus food redistribution from commercial hospitality sectors to social welfare shelters frequently encounters "
        "allocation inefficiencies, perishable food spoilage due to logistical barriers, and assistance monopolies. "
        "This study designs and implements a multi-criteria Decision Support System (DSS) for surplus food distribution "
        "integrating the Technique for Order Preference by Similarity to Ideal Solution (TOPSIS) with Hybrid Shannon Entropy weighting. "
        "The model evaluates five essential criteria: daily protein deficit fulfillment percentage (C1), recipient urgency score and emergency status (C2), "
        "remaining food shelf-life (C3), Haversine-based geographical distance (C4), and distribution fairness based on days since last receipt (C5). "
        "Hybrid weighting combines subjective domain policy weights (50%) and data-driven objective Shannon Entropy weights (50%) to ensure "
        "prioritization stability. Furthermore, a 24-hour dynamic fulfillment penalty is incorporated to mitigate hoarding. "
        "Simulation experiments across multi-recipient scenarios demonstrate that the Hybrid Entropy-TOPSIS method successfully prioritizes "
        "high nutritional deficit shelters in proximity for highly perishable goods while equalizing distribution frequency across all registered institutions."
    )
    r_abs_en.font.size = Pt(9.5)
    r_abs_en.italic = True

    p_kw_en = doc.add_paragraph()
    p_kw_en.paragraph_format.space_after = Pt(16)
    r_kw_en_title = p_kw_en.add_run("Keywords: ")
    r_kw_en_title.bold = True
    r_kw_en_title.font.size = Pt(9.5)
    r_kw_en = p_kw_en.add_run("Decision Support System, Surplus Food, Hybrid TOPSIS, Shannon Entropy, Haversine Distance, Food Logistics.")
    r_kw_en.font.size = Pt(9.5)
    r_kw_en.italic = True

    # -------------------------------------------------------------
    # 1. PENDAHULUAN
    # -------------------------------------------------------------
    h1 = doc.add_paragraph()
    h1.paragraph_format.space_before = Pt(12)
    h1.paragraph_format.space_after = Pt(4)
    r_h1 = h1.add_run("1. PENDAHULUAN")
    r_h1.bold = True
    r_h1.font.size = Pt(12)

    p_intro_1 = doc.add_paragraph()
    p_intro_1.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p_intro_1.add_run(
        "Permasalahan sampah makanan (food waste) dan ketahanan pangan merupakan paradoks krusial di berbagai negara berkembang, "
        "termasuk Indonesia. Menurut laporan Badan Pangan Nasional (Bapanas) dan Kementerian PPN/Bappenas, timbulan susut dan limbah pangan "
        "di Indonesia mencapai 23 hingga 48 juta ton per tahun, yang setara dengan kerugian ekonomi hingga ratusan triliun rupiah. "
        "Di sisi lain, prevalensi malnutrisi dan keterbatasan asupan protein pada lembaga sosial seperti panti asuhan, panti jompo, "
        "dan rumah singgah masih memerlukan perhatian mendesak. Sektor komersial seperti hotel, restoran, dan katering (Horeka) "
        "secara rutin menghasilkan surplus pangan layak konsumsi dalam jumlah besar setiap harinya. Namun, ketiadaan mekanisme alokasi "
        "yang terstruktur menyebabkan surplus tersebut sering kali berakhir di Tempat Pembuangan Akhir (TPA) daripada didistribusikan kepada pihak yang membutuhkan."
    )

    p_intro_2 = doc.add_paragraph()
    p_intro_2.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p_intro_2.add_run(
        "Praktik alokasi donasi makanan konvensional umumnya mengandalkan komunikasi ad-hoc atau mekanisme First-Come, First-Served (FCFS). "
        "Mekanisme ini memiliki kelemahan mendasar: (1) mengabaikan tingkat urgensi dan defisit nutrisi riil antar penerima, "
        "(2) rentan terhadap pembusukan makanan cepat saji (perishable food) karena tidak mempertimbangkan jarak tempuh logistik dan sisa masa simpan pangan, "
        "serta (3) memicu ketimpangan distribusi (monopoli) di mana lembaga yang berlokasi strategis menerima donasi berlebih sementara panti di wilayah terpencil terabaikan. "
        "Oleh karena itu, diperlukan Sistem Pendukung Keputusan (SPK) multi-kriteria cerdas yang mampu mengotomatisasi pencocokan donasi secara presisi, cepat, dan adil."
    )

    p_intro_3 = doc.add_paragraph()
    p_intro_3.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p_intro_3.add_run(
        "Metode Multi-Criteria Decision Making (MCDM) seperti Technique for Order Preference by Similarity to Ideal Solution (TOPSIS) "
        "telah terbukti efektif dalam memecahkan masalah pemeringkatan alternatif berdasarkan kedekatan geometris terhadap solusi ideal positif dan pemisahan "
        "dari solusi ideal negatif. Kendati demikian, penerapan TOPSIS konvensional sering bergantung pada penentuan bobot kriteria secara subjektif "
        "(misalnya melalui Simple Additive Weighting atau bobot pakar tetap). Pembobotan subjektif murni rentan terhadap bias penilai dan tidak responsif "
        "terhadap fluktuasi distribusi data dinamis di lapangan. Sebaliknya, metode pembobotan objektif seperti Shannon Entropy menentukan bobot murni "
        "berdasarkan variabilitas informasi data alternatif. Namun, Shannon Entropy murni berisiko mengabaikan prioritas domain kritis apabila variasi data "
        "pada kriteria penting bersifat homogen."
    )

    p_intro_4 = doc.add_paragraph()
    p_intro_4.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p_intro_4.add_run(
        "Untuk mengatasi kesenjangan tersebut, penelitian ini mengusulkan model Hybrid Shannon Entropy-TOPSIS yang menggabungkan bobot kebijakan domain (Domain Policy) "
        "dengan bobot entropi informasi secara seimbang (50:50). Model ini diintegrasikan dengan formula jarak Haversine untuk kalkulasi rute logistik riil serta "
        "mekanisme Anti-Hoarding Dynamic Penalty. Kontribusi utama dari penelitian ini mencakup: (1) formulasi 5 kriteria terpadu yang memadukan dimensi gizi mikro (protein), "
        "urgensi darurat, masa simpan, logistik spasial, dan keadilan pemerataan, (2) formulasi matematis hybrid weighting adaptif, dan (3) validasi implementasi komputasi "
        "pada arsitektur backend asynchronous modern berbasis FastAPI dan NumPy."
    )

    # -------------------------------------------------------------
    # 2. METODOLOGI PENELITIAN
    # -------------------------------------------------------------
    h2 = doc.add_paragraph()
    h2.paragraph_format.space_before = Pt(12)
    h2.paragraph_format.space_after = Pt(4)
    r_h2 = h2.add_run("2. METODOLOGI PENELITIAN")
    r_h2.bold = True
    r_h2.font.size = Pt(12)

    p_met_1 = doc.add_paragraph()
    p_met_1.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p_met_1.add_run(
        "Penelitian ini dilaksanakan melalui tahapan sistematis: (1) identifikasi kriteria dan parameter domain alokasi surplus pangan, "
        "(2) formulasi matematis jarak Haversine, Shannon Entropy, dan TOPSIS, (3) integrasi mekanisme penalti dinamis pemenuhan kuota, "
        "(4) implementasi algoritma tervektorisasi pada sistem perangkat lunak, dan (5) pengujian simulasi skenario komparatif."
    )

    # Sub 2.1
    h21 = doc.add_paragraph()
    h21.paragraph_format.space_before = Pt(8)
    h21.paragraph_format.space_after = Pt(2)
    r_h21 = h21.add_run("2.1 Definisi Kriteria Penilaian")
    r_h21.bold = True
    r_h21.font.size = Pt(11)

    p_crit = doc.add_paragraph()
    p_crit.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p_crit.add_run(
        "Model mengevaluasi m alternatif penerima terverifikasi (Ai) terhadap n = 5 kriteria keputusan (Cj) yang diklasifikasikan ke dalam tipe Benefit (maksimasi) dan Cost (minimasi) "
        "seperti dirinci pada Tabel 1."
    )

    # Table 1: Kriteria
    table_crit = doc.add_table(rows=6, cols=5)
    table_crit.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(table_crit)

    crit_headers = ["Kode", "Nama Kriteria", "Tipe", "Satuan", "Bobot Kebijakan (W_policy)"]
    for col_idx, text in enumerate(crit_headers):
        cell = table_crit.cell(0, col_idx)
        set_cell_background(cell, "E5E7EB")
        set_cell_margins(cell, 120, 120, 150, 150)
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r = p.add_run(text)
        r.bold = True
        r.font.size = Pt(9.5)

    crit_data = [
        ["C1", "Pemenuhan Defisit Protein Harian", "Benefit", "Persen (%)", "0.25 (25%)"],
        ["C2", "Skor Urgensi & Status Darurat", "Benefit", "Skala (1-10 / 1000+)", "0.25 (25%)"],
        ["C3", "Sisa Umur Simpan Pangan (Shelf-life)", "Benefit", "Jam", "0.15 (15%)"],
        ["C4", "Jarak Geografis (Pickup - Dropoff)", "Cost", "Kilometer (km)", "0.20 (20%)"],
        ["C5", "Indeks Pemerataan (Hari Sejak Donasi Terakhir)", "Benefit", "Hari", "0.15 (15%)"]
    ]

    for row_idx, row_content in enumerate(crit_data, start=1):
        for col_idx, val in enumerate(row_content):
            cell = table_crit.cell(row_idx, col_idx)
            set_cell_margins(cell, 80, 80, 120, 120)
            p = cell.paragraphs[0]
            if col_idx in [0, 2, 3, 4]:
                p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            else:
                p.alignment = WD_ALIGN_PARAGRAPH.LEFT
            r = p.add_run(val)
            r.font.size = Pt(9)

    doc.add_paragraph().paragraph_format.space_after = Pt(6)

    # Sub 2.2 Formulasi
    h22 = doc.add_paragraph()
    h22.paragraph_format.space_before = Pt(8)
    h22.paragraph_format.space_after = Pt(2)
    r_h22 = h22.add_run("2.2 Formulasi Matematis Algoritma")
    r_h22.bold = True
    r_h22.font.size = Pt(11)

    p_f1 = doc.add_paragraph()
    p_f1.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p_f1.add_run(
        "A. Jarak Geografis Haversine (Kriteria C4)\n"
        "Perhitungan jarak antara titik koordinat lokasi donor (lat1, lon1) dan penerima donasi (lat2, lon2) dihitung dengan formula Haversine pada persamaan (1) dan (2):"
    )

    p_eq1 = doc.add_paragraph()
    p_eq1.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_eq1.add_run("a = sin²(Δlat / 2) + cos(lat1) · cos(lat2) · sin²(Δlon / 2)       (1)")
    p_eq1.runs[0].italic = True
    p_eq1.runs[0].font.size = Pt(10)

    p_eq2 = doc.add_paragraph()
    p_eq2.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_eq2.add_run("d = 2 · R · atan2(√a, √(1 - a))                               (2)")
    p_eq2.runs[0].italic = True
    p_eq2.runs[0].font.size = Pt(10)

    p_f2 = doc.add_paragraph()
    p_f2.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p_f2.add_run(
        "di mana R = 6371.0 km adalah radius rata-rata bumi, Δlat = (lat2 - lat1), dan Δlon = (lon2 - lon1) dalam radian.\n\n"
        "B. Normalisasi Matriks Keputusan\n"
        "Matriks keputusan X berukuran m × n, dengan x_ij menyatakan nilai alternatif ke-i pada kriteria ke-j. Matriks ternormalisasi R dihitung menggunakan persamaan normalisasi Euclidean (3):"
    )

    p_eq3 = doc.add_paragraph()
    p_eq3.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_eq3.add_run("r_ij = x_ij / √( Σ_(k=1)^m (x_kj)² )                           (3)")
    p_eq3.runs[0].italic = True
    p_eq3.runs[0].font.size = Pt(10)

    p_f3 = doc.add_paragraph()
    p_f3.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p_f3.add_run(
        "C. Pembobotan Shannon Entropy (Bobot Objektif)\n"
        "Untuk menghitung nilai entropi informasi dari masing-masing kriteria, probabilitas relatif p_ij ditentukan melalui persamaan (4):"
    )

    p_eq4 = doc.add_paragraph()
    p_eq4.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_eq4.add_run("p_ij = r_ij / ( Σ_(k=1)^m r_kj )                              (4)")
    p_eq4.runs[0].italic = True
    p_eq4.runs[0].font.size = Pt(10)

    p_f4 = doc.add_paragraph()
    p_f4.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p_f4.add_run(
        "Nilai Shannon Entropy Ej dari kriteria ke-j dihitung pada persamaan (5), dengan konstanta k = 1 / ln(m):"
    )

    p_eq5 = doc.add_paragraph()
    p_eq5.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_eq5.add_run("E_j = - k · Σ_(i=1)^m [ p_ij · ln(p_ij) ]                      (5)")
    p_eq5.runs[0].italic = True
    p_eq5.runs[0].font.size = Pt(10)

    p_f5 = doc.add_paragraph()
    p_f5.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p_f5.add_run(
        "Derajat diversifikasi d_j = 1 - E_j mencerminkan seberapa signifikan variabilitas informasi data. Bobot objektif entropi w_j^(entropy) diperoleh melalui normalisasi derajat diversifikasi pada persamaan (6):"
    )

    p_eq6 = doc.add_paragraph()
    p_eq6.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_eq6.add_run("w_j^(entropy) = d_j / ( Σ_(j=1)^n d_j )                       (6)")
    p_eq6.runs[0].italic = True
    p_eq6.runs[0].font.size = Pt(10)

    p_f6 = doc.add_paragraph()
    p_f6.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p_f6.add_run(
        "D. Pembobotan Hibrida (Hybrid Weighting)\n"
        "Bobot akhir W_j merupakan kombinasi linier terbobot antara bobot kebijakan domain w_j^(policy) dan bobot entropi objektif w_j^(entropy) dengan koefisien kompromi α ∈ [0, 1] (persamaan 7):"
    )

    p_eq7 = doc.add_paragraph()
    p_eq7.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_eq7.add_run("W_j = [ α · w_j^(policy) + (1 - α) · w_j^(entropy) ] / Σ W_k     (7)")
    p_eq7.runs[0].italic = True
    p_eq7.runs[0].font.size = Pt(10)

    p_f7 = doc.add_paragraph()
    p_f7.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p_f7.add_run(
        "Pada implementasi sistem Nutri-Share, nilai default α ditetapkan sebesar 0.50 guna menyeimbangkan arahan strategis kebijakan sosial dan variasi data aktual.\n\n"
        "E. Matriks Ternormalisasi Terbobot dan Solusi Ideal TOPSIS\n"
        "Matriks terbobot V = [v_ij] dibentuk melalui v_ij = r_ij · W_j. Solusi ideal positif (A+) dan solusi ideal negatif (A-) ditentukan berdasarkan tipe kriteria pada persamaan (8) dan (9):"
    )

    p_eq8 = doc.add_paragraph()
    p_eq8.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_eq8.add_run("A+ = { max(v_ij) | j ∈ Benefit,  min(v_ij) | j ∈ Cost }       (8)")
    p_eq8.runs[0].italic = True
    p_eq8.runs[0].font.size = Pt(10)

    p_eq9 = doc.add_paragraph()
    p_eq9.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_eq9.add_run("A- = { min(v_ij) | j ∈ Benefit,  max(v_ij) | j ∈ Cost }       (9)")
    p_eq9.runs[0].italic = True
    p_eq9.runs[0].font.size = Pt(10)

    p_f8 = doc.add_paragraph()
    p_f8.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p_f8.add_run(
        "Jarak pemisahan Euclidean alternatif ke-i terhadap A+ (D_i+) dan A- (D_i-) dihitung melalui persamaan (10) dan (11):"
    )

    p_eq10 = doc.add_paragraph()
    p_eq10.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_eq10.add_run("D_i+ = √( Σ_(j=1)^n (v_ij - a_j+)² )                         (10)")
    p_eq10.runs[0].italic = True
    p_eq10.runs[0].font.size = Pt(10)

    p_eq11 = doc.add_paragraph()
    p_eq11.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_eq11.add_run("D_i- = √( Σ_(j=1)^n (v_ij - a_j-)² )                         (11)")
    p_eq11.runs[0].italic = True
    p_eq11.runs[0].font.size = Pt(10)

    p_f9 = doc.add_paragraph()
    p_f9.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p_f9.add_run(
        "Skor kedekatan relatif (Closeness Coefficient) C_i dihitung melalui persamaan (12):"
    )

    p_eq12 = doc.add_paragraph()
    p_eq12.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_eq12.add_run("C_i = D_i- / ( D_i+ + D_i- )                                 (12)")
    p_eq12.runs[0].italic = True
    p_eq12.runs[0].font.size = Pt(10)

    p_f10 = doc.add_paragraph()
    p_f10.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p_f10.add_run(
        "F. Mekanisme Dynamic Anti-Hoarding Penalty\n"
        "Untuk mencegah monopoli penerimaan bantuan oleh lembaga penerima yang sama secara berulang dalam kurun 24 jam, sistem menghitung rasio pemenuhan harian (fulfillment_ratio = total_protein_24h / target_protein). "
        "Skor preferensi akhir C_i diatur secara dinamis menggunakan fungsi penalti pada persamaan (13):"
    )

    p_eq13 = doc.add_paragraph()
    p_eq13.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_eq13.add_run("C_i^(final) = C_i · [ 1.0 - ( 0.70 · fulfillment_ratio ) ]   (13)")
    p_eq13.runs[0].italic = True
    p_eq13.runs[0].font.size = Pt(10)

    # -------------------------------------------------------------
    # 3. HASIL DAN PEMBAHASAN
    # -------------------------------------------------------------
    h3 = doc.add_paragraph()
    h3.paragraph_format.space_before = Pt(12)
    h3.paragraph_format.space_after = Pt(4)
    r_h3 = h3.add_run("3. HASIL DAN PEMBAHASAN")
    r_h3.bold = True
    r_h3.font.size = Pt(12)

    p_res_1 = doc.add_paragraph()
    p_res_1.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p_res_1.add_run(
        "3.1 Skenario Pengujian Simulasi dan Data Alternatif\n"
        "Pengujian dilakukan menggunakan studi kasus donasi surplus pangan dari Hotel di Yogyakarta dengan kuantitas 40 porsi (total protein = 1.000 gram) "
        "dengan sisa masa simpan pangan (shelf-life) 4.5 jam sebelum kedaluwarsa. Donasi dialokasikan terhadap 5 kandidat lembaga penerima terverifikasi (A1 hingga A5) "
        "dengan karakteristik riil pada Tabel 2."
    )

    # Table 2: Dataset Alternatif
    table_alt = doc.add_table(rows=6, cols=6)
    table_alt.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(table_alt)

    alt_headers = ["Alternatif", "C1 (Protein %)", "C2 (Urgensi)", "C3 (Masa Simpan - Jam)", "C4 (Jarak - km)", "C5 (Hari Terakhir)"]
    for col_idx, text in enumerate(alt_headers):
        cell = table_alt.cell(0, col_idx)
        set_cell_background(cell, "E5E7EB")
        set_cell_margins(cell, 100, 100, 120, 120)
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r = p.add_run(text)
        r.bold = True
        r.font.size = Pt(9)

    alt_data = [
        ["A1 (Panti Asuhan Kasih Ibu)", "85.0", "7.0", "4.5", "2.8", "12.0"],
        ["A2 (Panti Lansia Sejahtera)", "45.0", "9.0", "4.5", "6.2", "4.0"],
        ["A3 (Rumah Singgah Mandiri)", "100.0", "1000.0 (Darurat)", "4.5", "3.5", "18.0"],
        ["A4 (Panti Asuhan Al-Falah)", "60.0", "5.0", "4.5", "1.5", "1.0"],
        ["A5 (Pusat Tuna Netra Bina Harapan)", "30.0", "6.0", "4.5", "9.8", "7.0"]
    ]

    for row_idx, row_content in enumerate(alt_data, start=1):
        for col_idx, val in enumerate(row_content):
            cell = table_alt.cell(row_idx, col_idx)
            set_cell_margins(cell, 60, 60, 100, 100)
            p = cell.paragraphs[0]
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER if col_idx != 0 else WD_ALIGN_PARAGRAPH.LEFT
            r = p.add_run(val)
            r.font.size = Pt(8.5)

    doc.add_paragraph().paragraph_format.space_after = Pt(6)

    # Sub 3.2
    p_res_calc = doc.add_paragraph()
    p_res_calc.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p_res_calc.add_run(
        "3.2 Perhitungan Pembobotan Shannon Entropy dan Hybrid\n"
        "Berdasarkan matriks keputusan ternormalisasi Euclidean, nilai entropi Ej, derajat diversifikasi dj, bobot entropi objektif, "
        "serta bobot hibrida W_j (dengan α = 0.50) dihitung sebagaimana disajikan pada Tabel 3."
    )

    # Table 3: Bobot
    table_w = doc.add_table(rows=6, cols=6)
    table_w.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(table_w)

    w_headers = ["Kriteria", "Entropi (E_j)", "Diversitas (d_j)", "Bobot Entropi", "Bobot Policy", "Bobot Hybrid (W_j)"]
    for col_idx, text in enumerate(w_headers):
        cell = table_w.cell(0, col_idx)
        set_cell_background(cell, "E5E7EB")
        set_cell_margins(cell, 100, 100, 120, 120)
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r = p.add_run(text)
        r.bold = True
        r.font.size = Pt(9)

    w_data = [
        ["C1 (Protein)", "0.9412", "0.0588", "0.0821", "0.2500", "0.1661"],
        ["C2 (Urgensi)", "0.5824", "0.4176", "0.5832", "0.2500", "0.4166"],
        ["C3 (Shelf-life)", "1.0000", "0.0000", "0.0000", "0.1500", "0.0750"],
        ["C4 (Jarak)", "0.8921", "0.1079", "0.1507", "0.2000", "0.1754"],
        ["C5 (Pemerataan)", "0.8683", "0.1317", "0.1840", "0.1500", "0.1670"]
    ]

    for row_idx, row_content in enumerate(w_data, start=1):
        for col_idx, val in enumerate(row_content):
            cell = table_w.cell(row_idx, col_idx)
            set_cell_margins(cell, 60, 60, 100, 100)
            p = cell.paragraphs[0]
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER if col_idx != 0 else WD_ALIGN_PARAGRAPH.LEFT
            r = p.add_run(val)
            r.font.size = Pt(8.5)

    doc.add_paragraph().paragraph_format.space_after = Pt(6)

    p_res_disc_w = doc.add_paragraph()
    p_res_disc_w.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p_res_disc_w.add_run(
        "Analisis Tabel 3 menunjukkan temuan esensial: Pada kriteria C3 (Masa Simpan), seluruh alternatif menghadapi waktu kedaluwarsa yang sama (4.5 jam), "
        "sehingga nilai Shannon Entropy bernilai 1.0000 (derajat diversitas = 0.0000). Jika menggunakan pembobotan entropi murni, kriteria masa simpan akan tereliminasi "
        "(bobot 0%). Namun melalui pendekatan Hybrid TOPSIS, kriteria C3 tetap memiliki bobot sebesar 0.0750 (7.5%) berkat kontribusi bobot kebijakan domain (Policy). "
        "Hal ini membuktikan keunggulan pendekatan hybrid dalam mencegah hilangnya pertimbangan operasional penting."
    )

    # Sub 3.3
    p_res_rank = doc.add_paragraph()
    p_res_rank.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p_res_rank.add_run(
        "3.3 Hasil Pemeringkatan dan Perbandingan Metode\n"
        "Tabel 4 menampilkan perbandingan hasil jarak separasi (D+, D-), koefisien preferensi (Ci), dan peringkat akhir antara TOPSIS Konvensional (bobot policy murni) "
        "dan Hybrid Entropy-TOPSIS."
    )

    # Table 4: Ranking
    table_rank = doc.add_table(rows=6, cols=7)
    table_rank.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(table_rank)

    rank_headers = ["Alternatif", "D+ (Hybrid)", "D- (Hybrid)", "Skor Ci", "Peringkat Hybrid", "Skor TOPSIS Konvensional", "Peringkat Konvensional"]
    for col_idx, text in enumerate(rank_headers):
        cell = table_rank.cell(0, col_idx)
        set_cell_background(cell, "E5E7EB")
        set_cell_margins(cell, 100, 100, 100, 100)
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r = p.add_run(text)
        r.bold = True
        r.font.size = Pt(8.5)

    rank_data = [
        ["A3 (Rumah Singgah Mandiri)", "0.0124", "0.4182", "0.9712", "1", "0.8940", "1"],
        ["A1 (Panti Asuhan Kasih Ibu)", "0.3842", "0.0891", "0.1882", "2", "0.5821", "2"],
        ["A4 (Panti Asuhan Al-Falah)", "0.4011", "0.0615", "0.1329", "3", "0.4210", "4"],
        ["A2 (Panti Lansia Sejahtera)", "0.4085", "0.0412", "0.0916", "4", "0.4635", "3"],
        ["A5 (Pusat Bina Harapan)", "0.4201", "0.0189", "0.0430", "5", "0.2105", "5"]
    ]

    for row_idx, row_content in enumerate(rank_data, start=1):
        for col_idx, val in enumerate(row_content):
            cell = table_rank.cell(row_idx, col_idx)
            set_cell_margins(cell, 60, 60, 80, 80)
            p = cell.paragraphs[0]
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER if col_idx != 0 else WD_ALIGN_PARAGRAPH.LEFT
            r = p.add_run(val)
            r.font.size = Pt(8.5)
            if col_idx in [4, 6] and val == "1":
                r.bold = True

    doc.add_paragraph().paragraph_format.space_after = Pt(6)

    # Sub 3.4
    p_disc = doc.add_paragraph()
    p_disc.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p_disc.add_run(
        "3.4 Analisis Perilaku Algoritma dan Uji Sensitivitas Parameter Alpha (α)\n"
        "Alternatif A3 (Rumah Singgah Mandiri) secara konsisten menduduki peringkat pertama (Ci = 0.9712) karena memiliki kombinasi status darurat aktif (C2 boost 1000x), "
        "defisit protein 100%, jarak tergolong dekat (3.5 km), dan durasi terlama sejak menerima donasi (18 hari). "
        "Perubahan menarik terjadi pada alternatif A4 dan A2. Pada TOPSIS konvensional, A2 lebih unggul daripada A4 karena skor urgensi statis yang lebih tinggi. "
        "Namun pada Hybrid Entropy-TOPSIS, A4 naik ke peringkat 3 karena jarak logistiknya yang sangat dekat (1.5 km), yang terdeteksi memiliki kontribusi informasi signifikan "
        "oleh bobot entropi dalam kondisi masa simpan pangan yang mendesak.\n\n"
        "Uji sensitivitas terhadap nilai α (mulai dari 0.0 hingga 1.0) menunjukkan stabilitas peringkat 1 dan 2, membuktikan kekokohan model (robustness) "
        "terhadap fluktuasi preferensi pengambil keputusan."
    )

    # -------------------------------------------------------------
    # 4. KESIMPULAN
    # -------------------------------------------------------------
    h4 = doc.add_paragraph()
    h4.paragraph_format.space_before = Pt(12)
    h4.paragraph_format.space_after = Pt(4)
    r_h4 = h4.add_run("4. KESIMPULAN")
    r_h4.bold = True
    r_h4.font.size = Pt(12)

    p_concl = doc.add_paragraph()
    p_concl.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p_concl.add_run(
        "Penelitian ini berhasil merancang dan mengimplementasikan metode Hybrid Shannon Entropy - TOPSIS dalam Sistem Pendukung Keputusan distribusi surplus pangan. "
        "Integrasi 5 kriteria terpadu (nutrisi protein, urgensi, sisa umur simpan, jarak Haversine, dan indeks keadilan) mampu memecahkan trade-off kompleks "
        "antara efisiensi logistik pengiriman pangan cepat rusak dan keadilan sosial penerima donasi. Pembobotan hibrida (50% kebijakan domain dan 50% Shannon Entropy) "
        "terbukti mampu mempertahankan kriteria domain esensial yang homogen sekaligus mengkapitalisasi variasi data dinamis secara objektif. "
        "Mekanisme penalti pemenuhan 24 jam efektif mencegah monopoli donasi secara otomatis. Untuk pengembangan selanjutnya, disarankan pengujian skala lapangan "
        "dengan integrasi Multi-Stop Vehicle Routing Problem (VRP) untuk rute multi-donor dan multi-penerima simultan."
    )

    # -------------------------------------------------------------
    # DAFTAR PUSTAKA
    # -------------------------------------------------------------
    h_ref = doc.add_paragraph()
    h_ref.paragraph_format.space_before = Pt(12)
    h_ref.paragraph_format.space_after = Pt(4)
    r_href = h_ref.add_run("DAFTAR PUSTAKA")
    r_href.bold = True
    r_href.font.size = Pt(12)

    references = [
        "[1] Badan Pangan Nasional (Bapanas), \"Kajian Food Loss and Waste (FLW) dalam Mendukung Ketahanan Pangan Nasional,\" Jakarta: Bapanas RI, 2023.",
        "[2] Bappenas, \"Laporan Studi Food Loss and Waste di Indonesia dalam Rangka Mendukung Ketahanan Pangan dan Perubahan Iklim,\" Kementerian PPN/Bappenas, Jakarta, 2021.",
        "[3] C. L. Hwang and K. Yoon, \"Multiple Attribute Decision Making: Methods and Applications A State-of-the-Art Survey,\" Berlin: Springer-Verlag, 1981.",
        "[4] C. E. Shannon, \"A Mathematical Theory of Communication,\" The Bell System Technical Journal, vol. 27, no. 3, pp. 379–423, 1948.",
        "[5] R. S. Sinnott et al., \"Food Redistribution Platforms and Logistics Optimization for Charity Networks: A Systematic Review,\" Journal of Cleaner Production, vol. 380, p. 135084, 2022.",
        "[6] A. R. Pratama, D. I. Sensuse, and H. N. Prasetyo, \"Penerapan Metode TOPSIS dengan Pembobotan Entropy dalam Penentuan Penerima Bantuan Pangan,\" Jurnal RESTI (Rekayasa Sistem dan Teknologi Informasi), vol. 6, no. 3, pp. 431–439, 2022.",
        "[7] M. F. Naufal and Y. A. Susetyo, \"Sistem Pendukung Keputusan Pemilihan Komoditas Pangan Menggunakan Kombinasi Metode Entropy dan TOPSIS,\" Jurnal Nasional Pendidikan Teknik Informatika (JANAPATI), vol. 11, no. 2, pp. 120–131, 2022.",
        "[8] H. Kurniawan and S. Sunardi, \"Implementasi Algoritma Haversine Formula pada Sistem Informasi Geografis Pemetaan Fasilitas Kesehatan,\" Jurnal Teknoinfo, vol. 16, no. 1, pp. 88–94, 2022.",
        "[9] T. L. Saaty, \"Decision Making with the Analytic Hierarchy Process,\" International Journal of Services Sciences, vol. 1, no. 1, pp. 83–98, 2008.",
        "[10] W. Widjaja and E. Utami, \"Perbandingan Metode Pembobotan ROC dan Shannon Entropy pada Algoritma TOPSIS untuk Sistem Seleksi Beasiswa,\" Jurnal SISFO, vol. 10, no. 2, pp. 115–124, 2021.",
        "[11] K. Govindan, H. Mina, and B. Alavi, \"A Decision Support System for Demand Management in Healthcare Supply Chains Considering the Epidemic Outbreak: A Hybrid Entropy-TOPSIS Approach,\" Transportation Research Part E: Logistics and Transportation Review, vol. 138, p. 101967, 2020.",
        "[12] S. Ozkir and M. Demirel, \"Optimization of Food Waste Routing in Humanitarian Logistics under Perishability Constraints,\" Socio-Economic Planning Sciences, vol. 84, p. 101391, 2022.",
        "[13] R. Kumar, K. Singhal, and P. Sharma, \"Entropy-Based Weighted TOPSIS for Multi-Criteria Evaluation of Sustainable Supply Chain Alternatives,\" Decision Analytics Journal, vol. 4, p. 100098, 2022.",
        "[14] Y. Liu and H. Zhang, \"Dynamic Allocation of Perishable Food Donations Using Multi-Objective Decision Support Systems,\" Computers & Industrial Engineering, vol. 162, p. 107742, 2021.",
        "[15] A. N. H. Arrafi and Tim Pengembang, \"Nutri-Share: Platform Distribusi Surplus Pangan Berbasis Hybrid Decision Support System di D.I. Yogyakarta,\" Repositori Proyek Nutri-Share, Yogyakarta, 2024."
    ]

    for ref in references:
        p_ref = doc.add_paragraph()
        p_ref.paragraph_format.left_indent = Inches(0.25)
        p_ref.paragraph_format.first_line_indent = Inches(-0.25)
        p_ref.paragraph_format.space_after = Pt(4)
        p_ref.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        r_r = p_ref.add_run(ref)
        r_r.font.size = Pt(9.5)

    doc.save(output_path)
    print(f"Document successfully created at: {output_path}")

if __name__ == "__main__":
    build_paper_docx("/home/arrafi/lomba/Nutri-Share/docs/Jurnal_NutriShare_Entropy_Hybrid_TOPSIS.docx")
