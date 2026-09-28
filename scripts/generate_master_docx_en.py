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

def build_master_script_docx_en(output_path: str):
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
    run_sub = p_sub.add_run("Master Presentation Script & Live Demo Walkthrough Manual (English Version)\n(Primary Focus: Dual-Engine Innovation — 1. MOH RDA Nutritional Intake Engine + 2. Hybrid Entropy-TOPSIS Decision Support System)")
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
    r_m = p_meta.add_run("📋 Executive Summary & Innovation Pillars:\n"
                         "• Speakers: Nurul Layli (Opening & Closing) & Arrafi Nur Hafiz (Landing Page & Prototype Demo)\n"
                         "• Est. Duration: 8 – 9 Minutes Presentation + 5 Minutes Q&A Defense\n"
                         "• Dual Engine Innovation: 1. National RDA (AKG Kemenkes) Calculation Engine + 2. Hybrid Shannon Entropy - TOPSIS Decision Support System.\n"
                         "• Donor Dashboard: Full Manual Input, 6+ Preset Templates, & AI Nutrition Estimator (TKPI / MOH RDA Standards).\n"
                         "• Live Demo Domain: https://nutrishare.web.id/")
    r_m.font.name = "Arial"
    r_m.font.size = Pt(9.5)
    r_m.font.color.rgb = c_sub

    doc.add_paragraph().paragraph_format.space_after = Pt(12)

    # Section 1: Overview Timeline
    h1 = doc.add_heading(level=1)
    h1.paragraph_format.space_before = Pt(14)
    h1.paragraph_format.space_after = Pt(6)
    r_h1 = h1.add_run("1. Presentation Timeline & Roadmap")
    r_h1.font.name = "Arial"
    r_h1.font.color.rgb = c_primary

    # Table
    table = doc.add_table(rows=1, cols=5)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(table)

    headers = ["Part", "Topic / Key Feature", "Route / Screen", "Speaker", "Duration"]
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
        ("Part 1", "Opening & Food Waste Paradox vs Stunting", "Slide 1-2", "Ayli", "01:30"),
        ("Part 2", "Landing Page & Dual Engine (RDA + TOPSIS)", "https://nutrishare.web.id/", "Ayli / Arrafi", "01:30"),
        ("Part 3.0", "Live Demo Landing Page Orientation", "https://nutrishare.web.id/", "Arrafi", "00:50"),
        ("Part 3.1", "Donor Dashboard: Manual, Preset & AI Estimator", "https://nutrishare.web.id/donor", "Arrafi", "01:00"),
        ("Part 3.2", "Core Highlight: RDA Deficit & Entropy-TOPSIS Audit", "/donor modal", "Arrafi", "01:30"),
        ("Part 3.3", "Recipient Dashboard: Real-Time RDA Gauge & SSE Alert", "https://nutrishare.web.id/recipient", "Arrafi", "00:45"),
        ("Part 3.4", "Logistics Dispatch & Closed-Loop RDA Handover", "/recipient (Track)", "Arrafi", "00:30"),
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
    r_h2 = h2.add_run("2. Full Presentation Script & Screen Actions")
    r_h2.font.name = "Arial"
    r_h2.font.color.rgb = c_primary

    sections = [
        ("PART 1: OPENING & PROBLEM STATEMENT (~01:30)", "Ayli", [
            ("Background & Dual-Engine Innovation",
             "Slide 1 & 2",
             "Display opening slide and food waste vs stunting paradox charts.",
             "Good morning/afternoon distinguished members of the jury. I am Nurul Layli, together with my colleague Arrafi Nur Hafiz, proud to present NutriShare — Indonesia's first nutrition-based food surplus redistribution platform powered by a dual-engine architecture: National RDA (AKG Kemenkes) Intake Calculation and Hybrid Shannon Entropy - TOPSIS Decision Support System.\n\n"
             "Indonesia faces a 23-48 million ton food waste paradox, while 1 in 4 adolescents suffers from hidden hunger and 1 in 3 toddlers suffers from stunting.\n\n"
             "Conventional redistribution uses 'First-Come First-Served' which is unfair and nutrition-blind. NutriShare breaks this flaw by combining dynamic RDA (AKG) nutritional deficit tracking with mathematical precision allocation.")
        ]),
        ("PART 2: LANDING PAGE & DUAL-ENGINE PHILOSOPHY (~01:30)", "Ayli / Arrafi", [
            ("Landing Page Walkthrough & Dual Engine Pillars",
             "https://nutrishare.web.id/",
             "Smooth scroll from Hero Section -> Real-Time Impact -> Verified Catalog -> How It Works (TOPSIS 5 Criteria) -> Integrated Network -> Ledger.",
             "1️⃣ Hero Section: Tagline: 'Sustainable Solutions for Zero Food Waste — Allocating Nutrition with Mathematical Precision.' We connect HoReCa surplus directly to verified shelters through RDA calculations and objective mathematical allocation.\n\n"
             "2️⃣ Real-Time Social Impact: Powered by RDA Calculation Engine, Entropy-TOPSIS Engine, HACCP 3-Tier Safety, and Real-Time Telemetry.\n\n"
             "3️⃣ 5 TOPSIS Criteria Matrix: Protein RDA Deficit Fulfillment (28.4%), Urgency & Expiry (24.5%), Shelf Life (18.2%), Geographic Distance (15.6%), and Distribution History (13.3%). Dynamically calculated by Shannon Entropy.\n\n"
             "4️⃣ Impact Ledger: Rescued 555 kg of food, served 185 nutritious meals, and prevented 1.4 tons of CO2e emissions.")
        ]),
        ("PART 3: LIVE PROTOTYPE DEMO (~05:00)", "Arrafi Nur Hafiz", [
            ("0️⃣ Demo Introduction & App Orientation",
             "https://nutrishare.web.id/",
             "Smooth scroll past live landing page at nutrishare.web.id.",
             "Thank you, Ayli. Allow me, Arrafi, to guide you through a live walkthrough of NutriShare running live at nutrishare.web.id. We present key features unmatched by other platforms: RDA (AKG Kemenkes) Nutritional Intake Calculation, Hybrid Entropy-TOPSIS Engine, and Closed-Loop Verification."),
            ("1️⃣ Donor Dashboard: Manual, Preset & AI Estimator (TKPI MOH)",
             "https://nutrishare.web.id/donor",
             "Click 'Add Surplus Donation' -> Show Manual Input -> Show Smart Preset 'Chicken Rice Box' -> Type food name & click 'Calculate AI Nutrition Estimate'.",
             "This is the Donor Dashboard at nutrishare.web.id/donor. NutriShare provides 3 Flexible Input Methods:\n"
             "1. Full Manual Input: Enter portions, shelf-life, and nutrients manually.\n"
             "2. Ready-to-Use Preset Templates: 1-click selection from 6+ templates.\n"
             "3. AI Nutrition Estimator Feature: Type food name, AI estimates calories, protein, iron, & vitamin C.\n\n"
             "⚠️ Crucial emphasis: These AI values are ESTIMATIONS (not exact laboratory analysis), derived scientifically from the Indonesian Food Composition Database (TKPI) & MOH RDA Standards."),
            ("2️⃣ Core Highlight: RDA Deficit & Entropy-TOPSIS Allocation Audit",
             "https://nutrishare.web.id/donor modal Audit TOPSIS",
             "Open TOPSIS Audit Modal, highlight Criterion C1 (% Protein RDA Deficit), 5 Criteria, Shannon Entropy weights, and Preference Score Vi.",
             "This is the heart of NutriShare: The RDA Deficit & TOPSIS Audit Modal. The RDA Engine retrieves each orphanage's protein deficit relative to MOH standards. The Entropy-TOPSIS Engine measures Euclidean distance to Positive Ideal (A+) and Negative Ideal (A-). Whichever shelter appears at Rank #1 on screen is ranked first because of high protein RDA deficit, resident urgency, close proximity, and time without aid."),
            ("3️⃣ Recipient Dashboard: Real-Time RDA Gauge & SSE Priority Claim",
             "https://nutrishare.web.id/recipient",
             "Highlight RDA (AKG Kemenkes) Intake Gauge Widget, real-time SSE notification, Claim Timer, and Click 'Claim Donation'.",
             "On the Recipient Dashboard at nutrishare.web.id/recipient, notice this RDA (AKG Kemenkes) Progress Gauge Widget computing daily intake targets. As the #1 ranked institution on screen, they instantly receive a priority notification via Server-Sent Events (SSE). If unclaimed in the priority window, cascaded via Tiered Shelf-Life Escalation to Rank #2."),
            ("4️⃣ Logistics Dispatch, Live Tracking & Closed-Loop RDA Handover",
             "/recipient -> Track Delivery",
             "Open Leaflet GIS Map, simulate courier movement, click 'Confirm Receipt'. Point kursor to updated RDA gauge.",
             "Once claimed, delivery is tracked real-time via Leaflet Map. When food arrives, shelter staff verify condition and tap Confirm Receipt — closing the delivery loop (closed-loop verification): nutrient payload is ingested into the RDA Engine, updating daily AKG charts."),
            ("5️⃣ Admin Governance & Macro Impact Analytics",
             "https://nutrishare.web.id/admin",
             "Show KYC Verification Tab, Total Protein delivered, and CO2e reduction.",
             "Finally, platform integrity is governed via Admin Dashboard through KYC verification. Admins monitor macro impact: total protein delivered and CO2e prevented supporting SDGs 2, 3, and 12.")
        ]),
        ("PART 4: CLOSING TRANSITION & CONCLUSION (~00:45)", "Arrafi -> Ayli", [
            ("Conclusion & Call to Action",
             "Slide 5 / Closing Slide",
             "Arrafi makes closing transition, Ayli concludes presentation.",
             "Arrafi: That concludes our complete live platform walkthrough on nutrishare.web.id from flexible donor input with AI Estimator, RDA deficit tracking, TOPSIS audit, to macro reporting. I hand it back to Ayli.\n\n"
             "Ayli: Thank you, Arrafi. NutriShare proves technology, RDA nutritional science, and mathematical precision allocation can transform food waste into fair nutritional equity. Join us at NutriShare: Stop Waste. Allocate Nutrition. Thank you.")
        ])
    ]

    for sec_title, sec_speaker, items in sections:
        h_sec = doc.add_heading(level=2)
        h_sec.paragraph_format.space_before = Pt(12)
        h_sec.paragraph_format.space_after = Pt(4)
        r_sec = h_sec.add_run(f"{sec_title} — [Speaker: {sec_speaker}]")
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
            r_sc = p_s.add_run(f"🗣️ Speaker Narration:\n\"{script_text}\"")
            r_sc.font.name = "Arial"
            r_sc.font.size = Pt(9.5)
            r_sc.font.color.rgb = c_dark

            doc.add_paragraph().paragraph_format.space_after = Pt(6)

    # Section 3: Technical Q&A Defense
    h3 = doc.add_heading(level=1)
    h3.paragraph_format.space_before = Pt(16)
    h3.paragraph_format.space_after = Pt(6)
    r_h3 = h3.add_run("3. Technical Q&A Defense Cheat Sheet (Jury Q&A Guide)")
    r_h3.font.name = "Arial"
    r_h3.font.color.rgb = c_primary

    qa_list = [
        ("1. How Does the RDA (AKG Kemenkes RI) Calculation Engine Work?",
         "Jury Question: How does NutriShare compute daily RDA (AKG) targets and nutrient deficits for recipient institutions?\n"
         "Answer: 1) Demographic profiling by resident age brackets during registration. 2) Baseline daily targets calculated for 4 nutrients based on MOH RDA Standards (Protein, Calories, Iron, Vit C). 3) 24-hour rolling intake tracking on completed claims. 4) Deficit ratio = 1.0 - (Intake / Target), fed directly into TOPSIS Criterion C1."),
        ("2. Mathematical Method of Hybrid Entropy-TOPSIS (Core Advantage)",
         "Jury Question: Why does NutriShare use Entropy-TOPSIS and what are the detailed mathematical steps?\n"
         "Answer: FCFS is inherently unfair. NutriShare uses 6 TOPSIS stages: 1) Decision Matrix X. 2) Vector Normalization R. 3) Shannon Entropy E_j computing objective weight w_j blended 50:50 with policy weights. 4) Positive (A+) and Negative (A-) Ideal Solutions. 5) Euclidean Distances S_i+ and S_i-. 6) Relative Closeness Score V_i."),
        ("3. AI Nutrition Estimator Mechanism & 'Estimation' Emphasis",
         "Jury Question: How does the system estimate nutritional values and how accurate is it?\n"
         "Answer: The AI Estimator uses NLP matching food names against the Indonesian Food Composition Database (TKPI). We emphasize these values are ESTIMATIONS (not laboratory analysis), maintaining vital scientific validity benchmarked against MOH RDA Standards."),
        ("4. Food Safety & 3-Tier HACCP Standards",
         "Jury Question: How do you prevent food poisoning from donated surplus?\n"
         "Answer: Via 3-Tier HACCP Assurance: 1) Timestamp & shelf-life max 4h. 2) Automated expiry filtering if sisa shelf-life < 60 mins. 3) Physical organoleptic checks during handover before Confirm Receipt."),
        ("5. Why Server-Sent Events (SSE) over WebSockets?",
         "Jury Question: Why choose SSE for real-time notifications?\n"
         "Answer: One-way server-to-client notifications over standard HTTP, bandwidth efficient, auto-reconnect, and cloud/serverless friendly."),
        ("6. Preventing Aid Monopolies by Nearby Shelters (Fairness Safeguard)",
         "Jury Question: Will shelters closest to hotels always win donations?\n"
         "Answer: No. Criterion C5 (Distribution History / Fairness Safeguard) measures days since last donation. Recent recipients receive a C5 score penalty, giving fair priority to shelters that haven't received aid in days.")
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
    print(f"Successfully generated English master DOCX at: {output_path}")

if __name__ == '__main__':
    os.makedirs('docs', exist_ok=True)
    build_master_script_docx_en('docs/MASTER_PRESENTATION_SCRIPT_EN.docx')
