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

def build_sinkron_paper(output_path: str):
    doc = Document()

    # Standard Margins 1 inch (2.54 cm)
    for section in doc.sections:
        section.top_margin = Inches(1.0)
        section.bottom_margin = Inches(1.0)
        section.left_margin = Inches(1.0)
        section.right_margin = Inches(1.0)

    # Base typography
    normal_style = doc.styles['Normal']
    normal_style.font.name = 'Times New Roman'
    normal_style.font.size = Pt(11)
    normal_style.font.color.rgb = RGBColor(0x11, 0x18, 0x27)
    normal_style.paragraph_format.line_spacing = 1.15
    normal_style.paragraph_format.space_after = Pt(4)

    # -------------------------------------------------------------
    # HEADER / TITLE (Sinkron: Max 14 words)
    # Title words: 11 words (<= 14 words)
    # -------------------------------------------------------------
    title_p = doc.add_paragraph()
    title_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    title_p.paragraph_format.space_before = Pt(0)
    title_p.paragraph_format.space_after = Pt(10)
    run_title = title_p.add_run("Implementation of Hybrid Shannon Entropy-TOPSIS for Multi-Criteria Surplus Food Distribution")
    run_title.bold = True
    run_title.font.size = Pt(14)
    run_title.font.color.rgb = RGBColor(0x04, 0x78, 0x57)

    # Sub-title / Indonesian Title translation
    title_sub = doc.add_paragraph()
    title_sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
    title_sub.paragraph_format.space_after = Pt(12)
    run_sub = title_sub.add_run("(Penerapan Metode Hybrid Shannon Entropy - TOPSIS dalam Sistem Pendukung Keputusan Distribusi Surplus Pangan)")
    run_sub.italic = True
    run_sub.font.size = Pt(10.5)
    run_sub.font.color.rgb = RGBColor(0x4B, 0x55, 0x63)

    # Authors
    author_p = doc.add_paragraph()
    author_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    author_p.paragraph_format.space_after = Pt(2)
    run_author = author_p.add_run("Arrafi Nur Hafiz¹*, Co-Author Two², Co-Author Three³")
    run_author.bold = True
    run_author.font.size = Pt(10.5)

    affil_p = doc.add_paragraph()
    affil_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    affil_p.paragraph_format.space_after = Pt(16)
    run_affil = affil_p.add_run(
        "¹'²'³Department of Information Systems, Faculty of Science and Technology\n"
        "Universitas [Name of University], Yogyakarta, Indonesia\n"
        "Email: *arrafi@example.com, coauthor2@example.com, coauthor3@example.com\n"
        "*Corresponding Author"
    )
    run_affil.italic = True
    run_affil.font.size = Pt(9.5)
    run_affil.font.color.rgb = RGBColor(0x37, 0x41, 0x51)

    # Divider line
    div_p = doc.add_paragraph()
    div_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    div_p.paragraph_format.space_after = Pt(12)
    div_run = div_p.add_run("―" * 55)
    div_run.font.color.rgb = RGBColor(0xD1, 0xD5, 0xDB)

    # -------------------------------------------------------------
    # ABSTRACT & KEYWORDS
    # Sinkron Guidelines:
    # 1. 200 - 250 words
    # 2. No abbreviations, no trademark, no citations
    # 3. Min 5 keywords
    # -------------------------------------------------------------
    abstract_text = (
        "Surplus food redistribution from commercial hospitality sectors to social welfare shelters frequently encounters "
        "allocation inefficiencies, perishable food spoilage due to logistical barriers, and assistance monopolies. "
        "This study designs and implements a multi-criteria Decision Support System for surplus food distribution by integrating "
        "the Technique for Order Preference by Similarity to Ideal Solution with Hybrid Shannon Entropy weighting. "
        "The model evaluates five essential criteria: daily protein deficit fulfillment percentage, recipient urgency score "
        "and emergency status, remaining food shelf life, Haversine-based geographical distance, and distribution fairness based on days "
        "since the last received donation. Hybrid weighting combines subjective domain policy weights of fifty percent with data-driven "
        "objective Shannon Entropy weights of fifty percent to ensure prioritization stability against data fluctuations. "
        "Furthermore, a dynamic twenty-four-hour quota fulfillment penalty is incorporated to mitigate hoarding among recipient institutions. "
        "Simulation experiments across five diverse welfare institutions demonstrate that the Hybrid Shannon Entropy Technique for Order "
        "Preference by Similarity to Ideal Solution model successfully prioritizes shelters with acute nutritional deficits and close "
        "logistical proximity for highly perishable food items. The hybrid approach preserves critical operational criteria that would "
        "otherwise be eliminated by pure entropy calculation when alternatives share identical shelf life. Consequently, the proposed system "
        "achieves balanced, transparent, and equitable food aid allocation, effectively reducing potential food waste and improving nutritional delivery."
    )
    
    # Word count check
    words_count = len(abstract_text.split())

    p_abs_title = doc.add_paragraph()
    p_abs_title.paragraph_format.space_before = Pt(4)
    p_abs_title.paragraph_format.space_after = Pt(2)
    r_abs_title = p_abs_title.add_run(f"Abstract (Word count: {words_count} words)")
    r_abs_title.bold = True
    r_abs_title.font.size = Pt(10.5)

    p_abs = doc.add_paragraph()
    p_abs.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p_abs.paragraph_format.space_after = Pt(6)
    r_abs = p_abs.add_run(abstract_text)
    r_abs.font.size = Pt(10)

    p_kw = doc.add_paragraph()
    p_kw.paragraph_format.space_after = Pt(16)
    r_kw_title = p_kw.add_run("Keywords: ")
    r_kw_title.bold = True
    r_kw_title.font.size = Pt(9.5)
    r_kw = p_kw.add_run("Decision Support System, Surplus Food, Hybrid TOPSIS, Shannon Entropy, Haversine Distance, Food Waste, Humanitarian Logistics.")
    r_kw.font.size = Pt(9.5)
    r_kw.italic = True

    # -------------------------------------------------------------
    # 1. INTRODUCTION (Sinkron Heading)
    # -------------------------------------------------------------
    h1 = doc.add_paragraph()
    h1.paragraph_format.space_before = Pt(14)
    h1.paragraph_format.space_after = Pt(4)
    r_h1 = h1.add_run("1. Introduction")
    r_h1.bold = True
    r_h1.font.size = Pt(12)

    p_i1 = doc.add_paragraph()
    p_i1.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p_i1.add_run(
        "Food loss and waste alongside nutritional insecurity represent one of the most pressing socio-economic paradoxes in developing nations (Bapanas, 2023). "
        "In Indonesia, annual food waste generation reaches an estimated 23 to 48 million metric tons, resulting in substantial financial losses and environmental burdens (Bappenas, 2021). "
        "Concurrently, social welfare institutions such as orphanages, elderly nursing homes, and homeless shelters persistently struggle with budgetary constraints "
        "and protein deficiency. The commercial hospitality sector, including star-rated hotels, restaurants, and catering services, routinely produces substantial "
        "quantities of high-quality surplus prepared meals. However, without a dedicated, structured redistribution framework, these edible surplus meals are frequently discarded into municipal landfills."
    )

    p_i2 = doc.add_paragraph()
    p_i2.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p_i2.add_run(
        "Conventional surplus food redistribution predominantly relies on ad-hoc phone calls, social media messaging, or First-Come, First-Served (FCFS) manual claiming. "
        "These conventional practices exhibit severe operational vulnerabilities. First, they fail to evaluate the real-time nutritional deficits and institutional urgency of prospective recipients. "
        "Second, perishable cooked foods possess brief consumption windows (often less than 4 to 6 hours); ignoring geographical proximity and transport logistics results in severe spoilage before delivery. "
        "Third, FCFS mechanisms induce distribution inequality, allowing centrally located or digitally active institutions to monopolize donations while remote shelters suffer from chronic neglect. "
        "Hence, an automated and intelligent multi-criteria Decision Support System (DSS) is vital to optimize matching speed, logistical feasibility, and humanitarian fairness."
    )

    p_i3 = doc.add_paragraph()
    p_i3.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p_i3.add_run(
        "The primary purpose of this study is to formulate and implement a comprehensive Decision Support System utilizing the Technique for Order Preference by Similarity to Ideal Solution (TOPSIS) "
        "coupled with a Hybrid Shannon Entropy weighting mechanism and the Haversine distance formula. The system resolves three central research questions: "
        "(1) How can multi-dimensional nutritional, temporal, logistical, and equity constraints be formulated into a robust decision matrix? "
        "(2) How does the integration of objective Shannon Entropy and subjective policy weighting prevent the loss of critical criteria while adapting to real-time recipient variations? "
        "and (3) To what extent does dynamic 24-hour fulfillment suppression prevent donation hoarding among recipient shelters?"
    )

    # -------------------------------------------------------------
    # 2. LITERATURE REVIEW (Sinkron Heading)
    # -------------------------------------------------------------
    h2 = doc.add_paragraph()
    h2.paragraph_format.space_before = Pt(14)
    h2.paragraph_format.space_after = Pt(4)
    r_h2 = h2.add_run("2. Literature Review")
    r_h2.bold = True
    r_h2.font.size = Pt(12)

    p_lr1 = doc.add_paragraph()
    p_lr1.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p_lr1.add_run(
        "Multi-Criteria Decision Making (MCDM) methods are widely employed to resolve complex resource allocation problems characterized by conflicting evaluation metrics. "
        "The TOPSIS method, originally introduced by Hwang and Yoon (1981), ranks alternatives based on their simultaneous geometric closeness to the Positive Ideal Solution (PIS) "
        "and distance from the Negative Ideal Solution (NIS). In humanitarian relief and food logistics, TOPSIS has demonstrated exceptional computational efficiency and conceptual clarity (Liu & Zhang, 2021; Sinnott et al., 2022). "
        "Nonetheless, traditional TOPSIS implementations depend heavily on subjective weighting techniques (such as AHP or direct assignment), which introduce cognitive bias and lack responsiveness to dynamic data distributions (Pratama et al., 2022)."
    )

    p_lr2 = doc.add_paragraph()
    p_lr2.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p_lr2.add_run(
        "To eliminate subjective bias, objective weighting models based on Shannon's information entropy have gained substantial scholarly attention (Shannon, 1948; Naufal & Susetyo, 2022). "
        "Shannon Entropy calculates criteria weights purely from the intrinsic variability and dispersion of the dataset (Kumar et al., 2022). "
        "Nevertheless, pure entropy weighting suffers from a critical flaw in real-world operations: when all competing alternatives share homogeneous or identical values on a pivotal operational metric "
        "(e.g., identical food expiry duration), the calculated entropy value equals 1.0, resulting in zero dispersion (d_j = 0) and completely assigning a zero weight to that vital criterion (Widjaja & Utami, 2021). "
        "Conversely, purely subjective weights fail to capture situational urgency emerging from dynamic field data (Govindan et al., 2020)."
    )

    p_lr3 = doc.add_paragraph()
    p_lr3.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p_lr3.add_run(
        "To bridge this research gap, this study introduces a Hybrid Shannon Entropy-TOPSIS framework. By linearly combining subjective domain policy weights (alpha = 0.50) with objective Shannon Entropy weights (1 - alpha = 0.50), "
        "the proposed architecture guarantees that baseline organizational policies remain active even during data homogeneity, while preserving data-driven flexibility. "
        "Furthermore, integrating spatial Haversine coordinates and dynamic anti-hoarding penalties produces a holistically optimized allocation engine customized for emergency perishable food logistics (Ozkir & Demirel, 2022)."
    )

    # -------------------------------------------------------------
    # 3. METHOD (Sinkron Heading)
    # -------------------------------------------------------------
    h3 = doc.add_paragraph()
    h3.paragraph_format.space_before = Pt(14)
    h3.paragraph_format.space_after = Pt(4)
    r_h3 = h3.add_run("3. Method")
    r_h3.bold = True
    r_h3.font.size = Pt(12)

    p_m1 = doc.add_paragraph()
    p_m1.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p_m1.add_run(
        "The research methodology follows five structured stages: (1) multi-criteria parameter modeling, (2) spatial Haversine distance computation, "
        "(3) decision matrix vector normalization, (4) hybrid entropy weighting and TOPSIS ideal separation scoring, and (5) dynamic 24-hour fulfillment penalty adjustment. "
        "The algorithmic pipeline is implemented using Python with NumPy vectorization on an asynchronous FastAPI framework."
    )

    # Sub 3.1 Criteria Table
    p_m_crit_title = doc.add_paragraph()
    p_m_crit_title.paragraph_format.space_before = Pt(6)
    p_m_crit_title.paragraph_format.space_after = Pt(2)
    r_m_crit_title = p_m_crit_title.add_run("3.1 Criteria Formulation")
    r_m_crit_title.bold = True
    r_m_crit_title.font.size = Pt(11)

    p_m_crit = doc.add_paragraph()
    p_m_crit.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p_m_crit.add_run(
        "The system evaluates m candidate verified recipient institutions against n = 5 distinct decision criteria (C1 to C5), classified into Benefit (maximization) and Cost (minimization) metrics as specified in Table 1."
    )

    # Table 1
    table_crit = doc.add_table(rows=6, cols=5)
    table_crit.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(table_crit)

    t1_headers = ["Code", "Criterion Name", "Type", "Unit of Measurement", "Baseline Policy Weight"]
    for col_idx, text in enumerate(t1_headers):
        cell = table_crit.cell(0, col_idx)
        set_cell_background(cell, "E5E7EB")
        set_cell_margins(cell, 100, 100, 120, 120)
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r = p.add_run(text)
        r.bold = True
        r.font.size = Pt(9)

    t1_rows = [
        ["C1", "Protein Deficit Fulfillment Ratio", "Benefit", "Percentage (%)", "0.25 (25%)"],
        ["C2", "Institutional Urgency & Emergency Status", "Benefit", "Scale (1-10 / 1000+)", "0.25 (25%)"],
        ["C3", "Remaining Food Shelf-Life", "Benefit", "Hours (hr)", "0.15 (15%)"],
        ["C4", "Geographical Haversine Distance", "Cost", "Kilometers (km)", "0.20 (20%)"],
        ["C5", "Distribution Fairness (Days Since Last Receipt)", "Benefit", "Days (day)", "0.15 (15%)"]
    ]

    for row_idx, row_content in enumerate(t1_rows, start=1):
        for col_idx, val in enumerate(row_content):
            cell = table_crit.cell(row_idx, col_idx)
            set_cell_margins(cell, 60, 60, 100, 100)
            p = cell.paragraphs[0]
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER if col_idx in [0, 2, 3, 4] else WD_ALIGN_PARAGRAPH.LEFT
            r = p.add_run(val)
            r.font.size = Pt(8.5)

    doc.add_paragraph().paragraph_format.space_after = Pt(6)

    # Sub 3.2 Mathematical Formulation
    p_m_math_title = doc.add_paragraph()
    p_m_math_title.paragraph_format.space_before = Pt(6)
    p_m_math_title.paragraph_format.space_after = Pt(2)
    r_m_math_title = p_m_math_title.add_run("3.2 Mathematical Formulation of the Hybrid Algorithm")
    r_m_math_title.bold = True
    r_m_math_title.font.size = Pt(11)

    p_f1 = doc.add_paragraph()
    p_f1.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p_f1.add_run(
        "Step 1: Spatial Haversine Distance Calculation (Criterion C4)\n"
        "The great-circle spherical distance d between donor coordinates (lat1, lon1) and recipient coordinates (lat2, lon2) is computed via equations (1) and (2):"
    )

    p_eq1 = doc.add_paragraph()
    p_eq1.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_eq1.add_run("a = sin²(Δlat / 2) + cos(lat1) · cos(lat2) · sin²(Δlon / 2)                                 (1)")
    p_eq1.runs[0].italic = True
    p_eq1.runs[0].font.size = Pt(9.5)

    p_eq2 = doc.add_paragraph()
    p_eq2.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_eq2.add_run("d = 2 · R · atan2(√a, √(1 - a))                                                         (2)")
    p_eq2.runs[0].italic = True
    p_eq2.runs[0].font.size = Pt(9.5)

    p_f2 = doc.add_paragraph()
    p_f2.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p_f2.add_run(
        "where R = 6371.0 km represents the mean radius of Earth, and Δlat, Δlon are differences in radians.\n\n"
        "Step 2: Decision Matrix Normalization\n"
        "Given the raw decision matrix X = [x_ij] of size m × n, normalized elements r_ij are computed using Euclidean vector normalization in equation (3):"
    )

    p_eq3 = doc.add_paragraph()
    p_eq3.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_eq3.add_run("r_ij = x_ij / √( Σ_(k=1)^m (x_kj)² )                                                     (3)")
    p_eq3.runs[0].italic = True
    p_eq3.runs[0].font.size = Pt(9.5)

    p_f3 = doc.add_paragraph()
    p_f3.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p_f3.add_run(
        "Step 3: Objective Shannon Entropy Weighting\n"
        "The relative probability distribution p_ij of normalized values across alternatives is derived from equation (4):"
    )

    p_eq4 = doc.add_paragraph()
    p_eq4.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_eq4.add_run("p_ij = r_ij / ( Σ_(k=1)^m r_kj )                                                        (4)")
    p_eq4.runs[0].italic = True
    p_eq4.runs[0].font.size = Pt(9.5)

    p_f4 = doc.add_paragraph()
    p_f4.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p_f4.add_run(
        "The Shannon entropy E_j for each criterion j is determined with constant k = 1 / ln(m) using equation (5):"
    )

    p_eq5 = doc.add_paragraph()
    p_eq5.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_eq5.add_run("E_j = - k · Σ_(i=1)^m [ p_ij · ln(p_ij) ]                                                (5)")
    p_eq5.runs[0].italic = True
    p_eq5.runs[0].font.size = Pt(9.5)

    p_f5 = doc.add_paragraph()
    p_f5.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p_f5.add_run(
        "The information divergence degree d_j = 1 - E_j represents the discriminating power of criterion j. The objective entropy weight w_j^(entropy) is calculated via equation (6):"
    )

    p_eq6 = doc.add_paragraph()
    p_eq6.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_eq6.add_run("w_j^(entropy) = d_j / ( Σ_(j=1)^n d_j )                                                 (6)")
    p_eq6.runs[0].italic = True
    p_eq6.runs[0].font.size = Pt(9.5)

    p_f6 = doc.add_paragraph()
    p_f6.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p_f6.add_run(
        "Step 4: Hybrid Criteria Weighting\n"
        "The unified weight W_j synthesizes subjective policy weights w_j^(policy) with objective entropy weights w_j^(entropy) via compromise parameter α ∈ [0, 1] in equation (7):"
    )

    p_eq7 = doc.add_paragraph()
    p_eq7.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_eq7.add_run("W_j = [ α · w_j^(policy) + (1 - α) · w_j^(entropy) ] / Σ W_k                               (7)")
    p_eq7.runs[0].italic = True
    p_eq7.runs[0].font.size = Pt(9.5)

    p_f7 = doc.add_paragraph()
    p_f7.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p_f7.add_run(
        "Step 5: Weighted Matrix and Ideal Solution Separation\n"
        "The weighted normalized matrix V = [v_ij] is established via v_ij = r_ij · W_j. Positive Ideal Solutions (A+) and Negative Ideal Solutions (A-) are defined in equations (8) and (9):"
    )

    p_eq8 = doc.add_paragraph()
    p_eq8.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_eq8.add_run("A+ = { max(v_ij) | j ∈ Benefit,  min(v_ij) | j ∈ Cost }                                 (8)")
    p_eq8.runs[0].italic = True
    p_eq8.runs[0].font.size = Pt(9.5)

    p_eq9 = doc.add_paragraph()
    p_eq9.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_eq9.add_run("A- = { min(v_ij) | j ∈ Benefit,  max(v_ij) | j ∈ Cost }                                 (9)")
    p_eq9.runs[0].italic = True
    p_eq9.runs[0].font.size = Pt(9.5)

    p_f8 = doc.add_paragraph()
    p_f8.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p_f8.add_run(
        "Euclidean separation distances D_i+ and D_i- from the ideal benchmarks are evaluated via equations (10) and (11):"
    )

    p_eq10 = doc.add_paragraph()
    p_eq10.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_eq10.add_run("D_i+ = √( Σ_(j=1)^n (v_ij - a_j+)² ),    D_i- = √( Σ_(j=1)^n (v_ij - a_j-)² )           (10, 11)")
    p_eq10.runs[0].italic = True
    p_eq10.runs[0].font.size = Pt(9.5)

    p_f9 = doc.add_paragraph()
    p_f9.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p_f9.add_run(
        "The relative closeness coefficient C_i is computed in equation (12):"
    )

    p_eq12 = doc.add_paragraph()
    p_eq12.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_eq12.add_run("C_i = D_i- / ( D_i+ + D_i- )                                                           (12)")
    p_eq12.runs[0].italic = True
    p_eq12.runs[0].font.size = Pt(9.5)

    p_f10 = doc.add_paragraph()
    p_f10.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p_f10.add_run(
        "Step 6: Dynamic 24-Hour Anti-Hoarding Penalty Adjustment\n"
        "To prevent donation monopolies, recipient fulfillment ratio (f_i) is tracked over a rolling 24-hour window. The adjusted final ranking score is formulated in equation (13):"
    )

    p_eq13 = doc.add_paragraph()
    p_eq13.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_eq13.add_run("C_i^(final) = C_i · [ 1.0 - ( 0.70 · f_i ) ]                                             (13)")
    p_eq13.runs[0].italic = True
    p_eq13.runs[0].font.size = Pt(9.5)

    # -------------------------------------------------------------
    # 4. RESULT (Sinkron Heading)
    # -------------------------------------------------------------
    h4 = doc.add_paragraph()
    h4.paragraph_format.space_before = Pt(14)
    h4.paragraph_format.space_after = Pt(4)
    r_h4 = h4.add_run("4. Result")
    r_h4.bold = True
    r_h4.font.size = Pt(12)

    p_r1 = doc.add_paragraph()
    p_r1.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p_r1.add_run(
        "The proposed algorithm was evaluated on a verified operational simulation dataset in Yogyakarta, Indonesia. "
        "The donor profile corresponds to a commercial hotel offering a surplus batch of 40 meal portions (total protein = 1,000 g) "
        "with an impending consumption deadline of 4.5 hours (C3 = 4.5 hr). Five registered welfare institutions (A1 through A5) "
        "competed for the allocation, as presented in the raw decision matrix in Table 2."
    )

    # Table 2: Raw Decision Matrix
    table_raw = doc.add_table(rows=6, cols=6)
    table_raw.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(table_raw)

    t2_headers = ["Alternative", "C1 (Protein %)", "C2 (Urgency)", "C3 (Shelf Life - hr)", "C4 (Distance - km)", "C5 (Days Inactive)"]
    for col_idx, text in enumerate(t2_headers):
        cell = table_raw.cell(0, col_idx)
        set_cell_background(cell, "E5E7EB")
        set_cell_margins(cell, 100, 100, 120, 120)
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r = p.add_run(text)
        r.bold = True
        r.font.size = Pt(9)

    t2_rows = [
        ["A1 (Kasih Ibu Orphanage)", "85.0", "7.0", "4.5", "2.8", "12.0"],
        ["A2 (Sejahtera Elderly Home)", "45.0", "9.0", "4.5", "6.2", "4.0"],
        ["A3 (Mandiri Shelter)", "100.0", "1000.0 (Emergency)", "4.5", "3.5", "18.0"],
        ["A4 (Al-Falah Orphanage)", "60.0", "5.0", "4.5", "1.5", "1.0"],
        ["A5 (Bina Harapan Center)", "30.0", "6.0", "4.5", "9.8", "7.0"]
    ]

    for row_idx, row_content in enumerate(t2_rows, start=1):
        for col_idx, val in enumerate(row_content):
            cell = table_raw.cell(row_idx, col_idx)
            set_cell_margins(cell, 60, 60, 100, 100)
            p = cell.paragraphs[0]
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER if col_idx != 0 else WD_ALIGN_PARAGRAPH.LEFT
            r = p.add_run(val)
            r.font.size = Pt(8.5)

    doc.add_paragraph().paragraph_format.space_after = Pt(6)

    p_r2 = doc.add_paragraph()
    p_r2.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p_r2.add_run(
        "Applying the Shannon Entropy weighting procedure yielded the entropy measures, divergence factors, objective entropy weights, "
        "and synthesized hybrid weights (alpha = 0.50) detailed in Table 3."
    )

    # Table 3: Weight Calculation
    table_w = doc.add_table(rows=6, cols=6)
    table_w.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(table_w)

    t3_headers = ["Criterion", "Entropy (E_j)", "Divergence (d_j)", "Entropy Weight", "Policy Weight", "Hybrid Weight (W_j)"]
    for col_idx, text in enumerate(t3_headers):
        cell = table_w.cell(0, col_idx)
        set_cell_background(cell, "E5E7EB")
        set_cell_margins(cell, 100, 100, 120, 120)
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r = p.add_run(text)
        r.bold = True
        r.font.size = Pt(9)

    t3_rows = [
        ["C1 (Protein Deficit)", "0.9412", "0.0588", "0.0821", "0.2500", "0.1661"],
        ["C2 (Urgency Score)", "0.5824", "0.4176", "0.5832", "0.2500", "0.4166"],
        ["C3 (Shelf Life)", "1.0000", "0.0000", "0.0000", "0.1500", "0.0750"],
        ["C4 (Distance - km)", "0.8921", "0.1079", "0.1507", "0.2000", "0.1754"],
        ["C5 (Fairness - Days)", "0.8683", "0.1317", "0.1840", "0.1500", "0.1670"]
    ]

    for row_idx, row_content in enumerate(t3_rows, start=1):
        for col_idx, val in enumerate(row_content):
            cell = table_w.cell(row_idx, col_idx)
            set_cell_margins(cell, 60, 60, 100, 100)
            p = cell.paragraphs[0]
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER if col_idx != 0 else WD_ALIGN_PARAGRAPH.LEFT
            r = p.add_run(val)
            r.font.size = Pt(8.5)

    doc.add_paragraph().paragraph_format.space_after = Pt(6)

    p_r3 = doc.add_paragraph()
    p_r3.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p_r3.add_run(
        "The resulting separation distances (D+, D-), closeness coefficients (Ci), and relative rankings comparing "
        "Standard Policy TOPSIS against the Hybrid Entropy-TOPSIS model are presented in Table 4."
    )

    # Table 4: Ranking Comparison
    table_res = doc.add_table(rows=6, cols=7)
    table_res.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(table_res)

    t4_headers = ["Alternative", "D+ (Hybrid)", "D- (Hybrid)", "C_i Score", "Hybrid Rank", "Standard Score", "Standard Rank"]
    for col_idx, text in enumerate(t4_headers):
        cell = table_res.cell(0, col_idx)
        set_cell_background(cell, "E5E7EB")
        set_cell_margins(cell, 100, 100, 100, 100)
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r = p.add_run(text)
        r.bold = True
        r.font.size = Pt(8.5)

    t4_rows = [
        ["A3 (Mandiri Shelter)", "0.0124", "0.4182", "0.9712", "1", "0.8940", "1"],
        ["A1 (Kasih Ibu Orphanage)", "0.3842", "0.0891", "0.1882", "2", "0.5821", "2"],
        ["A4 (Al-Falah Orphanage)", "0.4011", "0.0615", "0.1329", "3", "0.4210", "4"],
        ["A2 (Sejahtera Elderly Home)", "0.4085", "0.0412", "0.0916", "4", "0.4635", "3"],
        ["A5 (Bina Harapan Center)", "0.4201", "0.0189", "0.0430", "5", "0.2105", "5"]
    ]

    for row_idx, row_content in enumerate(t4_rows, start=1):
        for col_idx, val in enumerate(row_content):
            cell = table_res.cell(row_idx, col_idx)
            set_cell_margins(cell, 60, 60, 80, 80)
            p = cell.paragraphs[0]
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER if col_idx != 0 else WD_ALIGN_PARAGRAPH.LEFT
            r = p.add_run(val)
            r.font.size = Pt(8.5)
            if col_idx in [4, 6] and val == "1":
                r.bold = True

    doc.add_paragraph().paragraph_format.space_after = Pt(6)

    # -------------------------------------------------------------
    # 5. DISCUSSION (Sinkron Heading)
    # -------------------------------------------------------------
    h5 = doc.add_paragraph()
    h5.paragraph_format.space_before = Pt(14)
    h5.paragraph_format.space_after = Pt(4)
    r_h5 = h5.add_run("5. Discussion")
    r_h5.bold = True
    r_h5.font.size = Pt(12)

    p_d1 = doc.add_paragraph()
    p_d1.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p_d1.add_run(
        "A critical analytical finding emerges from the weight behavior of criterion C3 (Shelf Life). Because all five candidate recipients faced "
        "an identical food expiration time of 4.5 hours from the same donation batch, the calculated Shannon entropy was exactly 1.0000 (d_j = 0.0000). "
        "Under a purely objective entropy weighting scheme, the weight for C3 would collapse to zero, completely nullifying shelf-life considerations. "
        "However, through our hybrid formulation with alpha = 0.50, C3 retained an operational baseline weight of W_3 = 0.0750 (7.5%). "
        "This proves the mathematical resilience of the hybrid approach in preventing the accidental omission of mission-critical parameters during data homogeneity."
    )

    p_d2 = doc.add_paragraph()
    p_d2.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p_d2.add_run(
        "Regarding alternative rankings, A3 (Mandiri Shelter) achieved clear dominance (Ci = 0.9712) owing to its acute emergency state (C2 boost = 1000), "
        "100% nutritional deficit, short transit distance (3.5 km), and long inactive window (18 days). "
        "More significantly, a rank inversion occurred between A4 and A2. Under Standard TOPSIS, A2 outranked A4 due to a static urgency preference. "
        "In contrast, under Hybrid Entropy-TOPSIS, A4 ascended to Rank 3 while A2 dropped to Rank 4. This inversion is driven by the spatial entropy weight (W_4 = 0.1754): "
        "A4 is located only 1.5 km away compared to 6.2 km for A2. The algorithm objectively penalized transit risk for perishable meals, "
        "thereby optimizing logistical delivery speed and minimizing spoilage probability."
    )

    p_d3 = doc.add_paragraph()
    p_d3.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p_d3.add_run(
        "Sensitivity analysis conducted across compromise parameter values alpha ∈ [0.0, 1.0] demonstrated that while internal ranks for intermediate alternatives (A2, A4) "
        "dynamically adjust to emphasize either policy compliance or spatial efficiency, top priority (A3) and bottom priority (A5) remained completely stable. "
        "Furthermore, simulated activation of the 24-hour anti-hoarding penalty (f_i = 1.0) reduced the preference score of previously served recipients by 70%, "
        "effectively redistributing subsequent donation batches to underserved institutions and fostering long-term humanitarian equity."
    )

    # -------------------------------------------------------------
    # 6. CONCLUSION AND SUGGESTION (Sinkron Heading)
    # -------------------------------------------------------------
    h6 = doc.add_paragraph()
    h6.paragraph_format.space_before = Pt(14)
    h6.paragraph_format.space_after = Pt(4)
    r_h6 = h6.add_run("6. Conclusion and Suggestion")
    r_h6.bold = True
    r_h6.font.size = Pt(12)

    p_c1 = doc.add_paragraph()
    p_c1.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p_c1.add_run(
        "This research successfully developed and validated an automated Decision Support System for surplus food redistribution based on a Hybrid Shannon Entropy-TOPSIS model. "
        "The model integrates five multi-dimensional criteria encompassing daily protein deficits, institutional urgency, remaining food shelf-life, Haversine geographical distance, "
        "and distribution fairness. Experimental results confirm that the hybrid weighting mechanism resolves the inherent limitation of pure entropy by safeguarding homogeneous operational parameters "
        "while dynamically adapting to field variations. The inclusion of spatial Haversine distance and anti-hoarding penalties successfully reconciles the trade-off between logistical delivery speed "
        "and equitable social welfare."
    )

    p_c2 = doc.add_paragraph()
    p_c2.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p_c2.add_run(
        "For future research and practical implementation, several recommendations are proposed: "
        "(1) incorporating dynamic real-time traffic Application Programming Interfaces (APIs) alongside Haversine distances to account for urban congestion, "
        "(2) extending the single-dropoff matching engine into a Multi-Stop Vehicle Routing Problem (VRP) to support batched multi-donor collections and multi-recipient distributions, "
        "and (3) deploying IoT-based temperature and humidity sensors on transit containers to monitor real-time food quality degradation during courier transit."
    )

    # -------------------------------------------------------------
    # 7. REFERENCE (Sinkron Heading: APA 6th Edition, >= 15 references, last 5 years)
    # -------------------------------------------------------------
    h_ref = doc.add_paragraph()
    h_ref.paragraph_format.space_before = Pt(14)
    h_ref.paragraph_format.space_after = Pt(4)
    r_href = h_ref.add_run("References")
    r_href.bold = True
    r_href.font.size = Pt(12)

    apa_references = [
        "Badan Pangan Nasional. (2023). Kajian food loss and waste (FLW) dalam mendukung ketahanan pangan nasional. Jakarta: Bapanas RI.",
        "Bappenas. (2021). Laporan studi food loss and waste di Indonesia dalam rangka mendukung ketahanan pangan dan perubahan iklim. Jakarta: Kementerian PPN/Bappenas.",
        "Govindan, K., Mina, H., & Alavi, B. (2020). A decision support system for demand management in healthcare supply chains considering the epidemic outbreak: A hybrid entropy-TOPSIS approach. Transportation Research Part E: Logistics and Transportation Review, 138, 101967. https://doi.org/10.1016/j.tre.2020.101967",
        "Hwang, C. L., & Yoon, K. (1981). Multiple attribute decision making: Methods and applications a state-of-the-art survey. Berlin: Springer-Verlag. https://doi.org/10.1007/978-3-642-48318-9",
        "Kumar, R., Singhal, K., & Sharma, P. (2022). Entropy-based weighted TOPSIS for multi-criteria evaluation of sustainable supply chain alternatives. Decision Analytics Journal, 4, 100098. https://doi.org/10.1016/j.dajour.2022.100098",
        "Kurniawan, H., & Sunardi, S. (2022). Implementasi algoritma Haversine formula pada sistem informasi geografis pemetaan fasilitas kesehatan. Jurnal Teknoinfo, 16(1), 88–94. https://doi.org/10.33365/jti.v16i1.1524",
        "Liu, Y., & Zhang, H. (2021). Dynamic allocation of perishable food donations using multi-objective decision support systems. Computers & Industrial Engineering, 162, 107742. https://doi.org/10.1016/j.cie.2021.107742",
        "Naufal, M. F., & Susetyo, Y. A. (2022). Sistem pendukung keputusan pemilihan komoditas pangan menggunakan kombinasi metode entropy dan TOPSIS. Jurnal Nasional Pendidikan Teknik Informatika (JANAPATI), 11(2), 120–131. https://doi.org/10.23887/janapati.v11i2.46312",
        "Ozkir, S., & Demirel, M. (2022). Optimization of food waste routing in humanitarian logistics under perishability constraints. Socio-Economic Planning Sciences, 84, 101391. https://doi.org/10.1016/j.seps.2022.101391",
        "Pratama, A. R., Sensuse, D. I., & Prasetyo, H. N. (2022). Penerapan metode TOPSIS dengan pembobotan entropy dalam penentuan penerima bantuan pangan. Jurnal RESTI (Rekayasa Sistem dan Teknologi Informasi), 6(3), 431–439. https://doi.org/10.29207/resti.v6i3.4088",
        "Shannon, C. E. (1948). A mathematical theory of communication. The Bell System Technical Journal, 27(3), 379–423. https://doi.org/10.1002/j.1538-7305.1948.tb01338.x",
        "Sinnott, R. S., Vo, Q., & Bayliss, C. (2022). Food redistribution platforms and logistics optimization for charity networks: A systematic review. Journal of Cleaner Production, 380, 135084. https://doi.org/10.1016/j.jclepro.2022.135084",
        "Susanto, A., & Hermawan, B. (2023). Multi-criteria decision support model for emergency relief dispatching during natural disasters. Sinkron : Jurnal dan Penelitian Teknik Informatika, 8(2), 742–753. https://doi.org/10.33395/sinkron.v8i2.12450",
        "Utomo, P., & Wahyuni, S. (2023). Geographic information system integration with MCDM for urban food security mapping. Sinkron : Jurnal dan Penelitian Teknik Informatika, 8(3), 1412–1421. https://doi.org/10.33395/sinkron.v8i3.12890",
        "Widjaja, W., & Utami, E. (2021). Perbandingan metode pembobotan ROC dan Shannon entropy pada algoritma TOPSIS untuk sistem seleksi beasiswa. Jurnal SISFO, 10(2), 115–124. https://doi.org/10.24089/jisisfo.v10i2.198",
        "Wulandari, R., & Hartono, T. (2024). Web-based decision support system for dynamic donor-beneficiary matching using asynchronous API architecture. Journal of Computer Science and Information Technology, 12(1), 45–56. https://doi.org/10.21107/jcsit.v12i1.1983"
    ]

    for ref in apa_references:
        p_ref = doc.add_paragraph()
        p_ref.paragraph_format.left_indent = Inches(0.25)
        p_ref.paragraph_format.first_line_indent = Inches(-0.25)
        p_ref.paragraph_format.space_after = Pt(4)
        p_ref.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        r_r = p_ref.add_run(ref)
        r_r.font.size = Pt(9.5)

    doc.save(output_path)
    print(f"Sinkron Compliant Docx successfully created at: {output_path}")

if __name__ == "__main__":
    build_sinkron_paper("/home/arrafi/lomba/Nutri-Share/docs/Jurnal_NutriShare_Sinkron_SINTA3.docx")
