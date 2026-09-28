# NutriShare — Master Presentation Script & Live Demo Manual
> **Master Presentation Script & Live Demo Walkthrough Manual**
> *Refining & Unifying `script1.docx` (Landing Page Narration) and `script2.pdf` (Prototype Demo Walkthrough by Arrafi)*
> *Primary Pillars: Dual-Engine Innovation — 1. National RDA (AKG Kemenkes) Nutritional Intake & Deficit Engine + 2. Hybrid Shannon Entropy-TOPSIS Decision Support System*
> *Live Demo Domain: https://nutrishare.web.id/*

---

## 📋 Presentation Information & Metadata

- **Project Title:** NutriShare — Nutrition-Based Surplus Food Redistribution Platform
- **Tagline:** *"Sustainable Solutions for Zero Food Waste — Allocating Nutrition with Mathematical Precision"*
- **Live Platform URL:** **https://nutrishare.web.id/**
- **Dual Core Engines (Core Innovation):**
  1. **National RDA (AKG Kemenkes RI) Calculation Engine:** Dynamically calculates daily nutritional intake targets (Calories, Protein, Iron, Vitamin C) based on shelter resident demographics and tracks daily deficit fulfillment in real time.
  2. **Hybrid Shannon Entropy - TOPSIS Allocation Engine:** Replaces unfair 'First-Come, First-Served' races with multi-criteria decision optimization based on RDA protein deficits, urgency, shelf life, proximity, and aid fairness.
- **Donor Specific Features:** Flexi-Food Input (Full Manual Input, 6+ Preset Templates, and **AI Nutrition Estimator** providing *estimations* of nutritional content based on the **Indonesian Food Composition Database (TKPI) / Ministry of Health RDA Standards**).
- **Speakers & Roles:**
  - **Speaker 1 (Ayli / Nurul Layli):** Opening, Problem Statement, Strategic Vision, & Closing.
  - **Speaker 2 (Arrafi):** Walkthrough Landing Page, Live Prototype Demo (Donor Dashboard, TOPSIS Audit, Recipient AKG Tracking, Logistics Leaflet GIS, & Admin Governance).
- **Total Duration:** ~8 – 9 Minutes (Presentation & Demo) + 5 Minutes (Q&A Defense)
- **Target Audience:** Grand Jury, Academic Evaluators, & Food-Tech / Social Impact Stakeholders
- **Technology Stack:** React 19 + TypeScript + Vite + Tailwind CSS v4 | FastAPI Python 3.12+ | SQLModel + Supabase PostgreSQL | Leaflet GIS | Server-Sent Events (SSE)

---

## ⏱️ Presentation Timeline & Roadmap

| Part | Topic / Key Feature | Route / Slide | Speaker | Duration |
| :--- | :--- | :--- | :--- | :--- |
| **Part 1** | Opening & Food Waste Paradox vs Stunting | Slide 1 – 2 | Ayli | 01:30 |
| **Part 2** | Landing Page & Dual Engine Philosophy (AKG + TOPSIS) | `https://nutrishare.web.id/` | Ayli / Arrafi | 01:30 |
| **Part 3.0** | Live Demo Landing Page Orientation | `https://nutrishare.web.id/` | Arrafi | 00:50 |
| **Part 3.1** | **Donor Dashboard: Manual, Preset & AI Estimator (TKPI MOH)** | `https://nutrishare.web.id/donor` | Arrafi | 01:00 |
| **Part 3.2** | **Core Highlight: RDA (AKG) Deficit & Entropy-TOPSIS Audit** | `/donor` / `/admin` modal | Arrafi | 01:30 |
| **Part 3.3** | **Recipient Dashboard: Real-Time RDA (AKG) Gauge & SSE Alert** | `https://nutrishare.web.id/recipient` | Arrafi | 00:45 |
| **Part 3.4** | Logistics Tracking (Leaflet GIS) & Closed-Loop AKG Handover | `/recipient` (Track) | Arrafi | 00:30 |
| **Part 3.5** | Admin Governance & Macro Impact Analytics | `https://nutrishare.web.id/admin` | Arrafi | 00:45 |
| **Part 4** | Closing Transition & Conclusion | Slide 5 / Closing | Arrafi → Ayli | 00:45 |
| **Appendix** | **Technical Q&A Defense Cheat Sheet (AKG & Mathematics)** | - | Team | ~05:00 |

---

## 🎭 Full Presentation Script & Scenario

---

### 📍 PART 1: OPENING & PROBLEM STATEMENT (~01:30)
**Speaker:** Ayli (Nurul Layli)  
**Visual:** Presentation Slides (Slide 1 & 2: Opening & Problem Statement)

#### 🎬 Spoken Script:
> *"Good morning/afternoon distinguished members of the jury. I am **Nurul Layli**, together with my colleague **Arrafi Nur Hafiz**, proud to present **NutriShare** — Indonesia's first nutrition-based food surplus redistribution platform powered by a dual-engine architecture: **National RDA (AKG Kemenkes) Intake Calculation** and **Hybrid Shannon Entropy - TOPSIS Decision Support System**.*
>
> *Indonesia currently faces a deeply concerning paradox. Data from KLHK and Bappenas shows that 23 to 48 million tons of food are wasted every year, inflicting economic losses of up to IDR 551 Trillion. Yet simultaneously, 1 in 4 adolescents suffers from hidden hunger, and 1 in 3 toddlers suffers from stunting due to essential micronutrient deficiencies.*
>
> *The HoReCa sector — Hotels, Restaurants, and Catering — produces high-quality surplus food daily. Why does this edible food never reach orphanages or shelters in need? Because redistribution has historically been manual, sporadic, and bound to the conventional 'First-Come, First-Served' principle.*
>
> *That principle is inherently unfair and nutrition-blind. Nearby orphanages or those with the fastest internet access always win, while shelters with the highest nutritional deficits and the hungriest children are left behind. **NutriShare breaks this flaw by combining dynamic RDA (AKG) nutritional deficit tracking with mathematical precision allocation based on real data and genuine urgency.**"*

---

### 📍 PART 2: LANDING PAGE WALKTHROUGH & DUAL-ENGINE PHILOSOPHY (~01:30)
*(Refining `script1.docx`)*  
**Speaker:** Ayli (Transition to Arrafi) / Arrafi  
**Route:** `https://nutrishare.web.id/`  
**Screen Action:** Smoothly scroll sequentially from top to bottom to display each landing page section.

#### 1️⃣ Hero Section
- **Screen Action:** Display the top hero section at https://nutrishare.web.id/. Hover cursor over the Headline and Tagline.
- **Spoken Script:**
  > *"This is the NutriShare Homepage at nutrishare.web.id — Nutrition-Based Food Rescue. Our tagline embodies our core philosophy: **'Sustainable Solutions for Zero Food Waste — Allocating Nutrition with Mathematical Precision.'** We connect HoReCa food surplus directly to verified orphanages and shelters through objective RDA (AKG) nutritional calculations and mathematical allocation — without guesswork or manual preference."*

#### 2️⃣ Real-Time Social Impact & Core Technological Pillars
- **Screen Action:** Scroll to Impact Statistics and Key Features.
- **Spoken Script:**
  > *"All the social impact we generate is tracked live. The platform is dually powered by:
  > 1. **The RDA (AKG Kemenkes) Calculation Engine**, dynamically calculating daily caloric, protein, iron, and vitamin C targets for each institution based on resident demographics.
  > 2. **The Hybrid Entropy-TOPSIS Engine**, scientifically weighing RDA protein deficits, urgency, shelf life, and geographic distance.
  > 3. **HACCP 3-Tier Food Safety Assurance & Telemetry**, providing complete audit transparency from donor kitchen to recipient table."*

#### 3️⃣ Verified Food Catalog & 3-Tier Food Safety
- **Screen Action:** Scroll to the Verified Surplus Food Catalog.
- **Spoken Script:**
  > *"Before any donation enters the TOPSIS allocation algorithm, every batch of food must pass our **3-Tier Verification System**: organoleptic sensory validation, cold-chain temperature monitoring, and digital handover logs. This guarantees that food arriving at orphanages is not only fast, but 100% safe to consume."*

#### 4️⃣ How It Works & 5 TOPSIS Criteria Matrix (Including AKG Deficit Weighting)
- **Screen Action:** Scroll to 'How NutriShare Works' and the TOPSIS Criteria Weighting Matrix.
- **Spoken Script:**
  > *"Our workflow operates in four simple steps: Donors publish surplus data, the system computes Entropy-TOPSIS weights automatically, the highest-priority shelter receives an exclusive offer, and our logistics fleet delivers the donation.*
  >
  > *Here is our primary competitive advantage — the **5 Objective Variables of the TOPSIS Matrix**:*
  > *• **RDA (AKG) Nutritional Need (Protein Deficit Fulfillment)** weighted at 28.4%,*
  > *• **Urgency Level & Expiry Limit** at 24.5%,*
  > *• **Storage Capacity & Shelf Life** at 18.2%,*
  > *• **Geographic Distance (Logistics)** at 15.6%, and*
  > *• **Distribution History (Fairness Safeguard)** at 13.3%.*
  >
  > *These five weights always sum to exactly 100%, dynamically calculated by Shannon Entropy without human bias."*

#### 5️⃣ Integrated Ecosystem & Impact Ledger
- **Screen Action:** Scroll to the Three Ecosystem Pillars and Verified Impact Ledger.
- **Spoken Script:**
  > *"The NutriShare ecosystem is anchored by 3 pillars: HoReCa Donors publishing surplus in under 2 minutes; 24 Verified Recipient Institutions across Yogyakarta; and a Logistics Fleet with an average delivery time under 45 minutes.*
  >
  > *To date, our system has rescued **555 kg of food**, served **185 nutritious meals**, reached verified institutions, and prevented **1.4 tons of CO2e emissions** — equivalent to planting over 120 tree seedlings. All data is updated live."*

#### 6️⃣ Closing Call-to-Action (CTA)
- **Screen Action:** Scroll to Footer / CTA section.
- **Spoken Script:**
  > *"NutriShare comes with a simple mandate: **Stop Waste. Allocate Nutrition.** This platform is 100% free, HACCP compliant, and mathematically verified."*

---

### 📍 PART 3: LIVE PROTOTYPE DEMO (~05:00)
*(Refining `script2.pdf` — Presented fully by Arrafi)*  
**Speaker:** Arrafi Nur Hafiz  
**Demo Environment:** `https://nutrishare.web.id/`

#### 0️⃣ Demo Introduction & App Orientation (~50 seconds)
- **Route:** `https://nutrishare.web.id/` (Live Web Application)
- **Screen Action:** Smoothly scroll past Hero Section, How It Works, Features, and CTA.
- **Spoken Script (Arrafi):**
  > *"Thank you, Ayli. Allow me, **Arrafi**, to guide you through a live walkthrough of the NutriShare platform running live at nutrishare.web.id.*
  >
  > *On this live platform, visitors and potential partners can see how our food rescue mission is brought to life through a modern interface. We present key features unmatched by other platforms: **RDA (AKG Kemenkes) Nutritional Intake Calculation**, **The Hybrid Entropy-TOPSIS Recommendation Engine**, and **Closed-Loop Delivery Verification**.*
  >
  > *Now, let's dive into the actual user flow, starting from the Donor Dashboard."*

---

#### 1️⃣ Donor Flow & Multi-Mode Input (Manual, Preset, & AI Estimator AKG) (~60 seconds)
- **Route:** `https://nutrishare.web.id/donor`
- **Screen Action:**
  1. Click **"Add Surplus Donation"**.
  2. Demonstrate donor input flexibility:
     - **Mode 1 (Manual Input):** Highlight form fields for food name, portion count, shelf-life hours, calories, protein, iron, and vitamin C that can be filled manually according to catering records.
     - **Mode 2 (Smart Preset):** Click the template **"Complete Rice & Side Dish Package"** (28g protein, 580 kcal, 6-hr shelf life).
     - **Mode 3 (AI Nutrition Estimator):** Type food name e.g., *"Nasi Rendang Daging Padang"*, then click **"Calculate AI Nutrition Estimate"** (Sparkles icon). Show auto-filled nutritional values.
- **Spoken Script (Arrafi):**
  > *"This is the Donor Dashboard at nutrishare.web.id/donor. To enable hotel chefs or restaurant managers to publish donations in under 2 minutes, NutriShare provides **3 Highly Flexible Food Input Methods**:*
  >
  > *1. **Full Manual Input:** Kitchen staff can manually enter food name, portion count, shelf-life, and nutritional breakdown based on their catering records.*
  > *2. **Ready-to-Use Preset Templates:** 1-click selection from 6+ popular templates such as Chicken Rice Box, Bakery Pastries, or Vegetable Soup.*
  > *3. **AI Nutrition Estimator Feature:** Donors simply type the food name, and the AI automatically estimates calorie, protein, iron, and vitamin C content.*
  >
  > *⚠️ **Crucial emphasis:** The values generated by this AI are **ESTIMATIONS** (not exact laboratory analysis). These estimations are derived scientifically from the **Indonesian Food Composition Database (TKPI) and Recommended Dietary Allowances (RDA/AKG) from the Ministry of Health of the Republic of Indonesia (Kemenkes RI)**, giving donors an accurate nutritional benchmark without manual calculation.*
  >
  > *Now, I will click **Publish Donation**."*

---

#### 2️⃣ Core Highlight: RDA (AKG) Deficit & Entropy-TOPSIS Allocation Audit (~100 seconds)
- **Route:** `https://nutrishare.web.id/donor` → **"TOPSIS Recommendation Audit"** Modal (or via Admin Dashboard)
- **Screen Action:**
  1. Open the TOPSIS Audit Modal.
  2. Highlight the Weighted Decision Matrix and Criterion $C_1$ (% Protein RDA Deficit Fulfilled).
  3. Show the 5 Criteria (Protein RDA Fulfillment, Urgency Score, Shelf Life, Geographic Distance, Distribution History).
  4. Display dynamic Shannon Entropy weights and Relative Closeness Preference Scores ($V_i$).
  5. **Dynamic Live Announcement:** Read out loud the institution name currently ranking **#1 on screen** during the live run.
- **Spoken Script (Arrafi — Situational Live Phrasing):**
  > *"This is the heart of NutriShare and our most critical technological advantage: **The RDA (AKG) Deficit & TOPSIS Allocation Audit Modal**.*
  >
  > *When a donation is published, the system does not dump this food into an open public marketplace. Instead, our **RDA Calculation Engine** first retrieves each orphanage's daily protein deficit relative to Ministry of Health standards. Then, our **Hybrid Entropy-TOPSIS Engine** evaluates all registered orphanages against an objective decision matrix.*
  >
  > *First, the **Shannon Entropy** algorithm analyzes the variance in real data across orphanages today to compute criteria weights scientifically without human intervention.*
  > *Second, **TOPSIS** measures the Euclidean distance of each orphanage to the Positive Ideal Solution ($A^+$) — the shelter with the highest RDA protein deficit & urgency — and the Negative Ideal Solution ($A^-$).*
  >
  > *As shown on screen in this live instance: **[Announce Name on Screen, e.g., Kasih Ibu Orphanage]** ranks **#1** with the highest Relative Closeness Preference Score ($V_i$). Why did our engine rank them first? Because the TOPSIS algorithm dynamically calculated their high daily protein RDA deficit, urgent resident needs, close geographic proximity, and longer period without aid.*
  >
  > *This isn't a hardcoded choice — it is real-time, RDA-driven nutritional equity that adapts to whichever institution needs it most."*

---

#### 3️⃣ Recipient Dashboard: Real-Time RDA (AKG) Gauge & SSE Priority Claim (~45 seconds)
- **Route:** `https://nutrishare.web.id/recipient`
- **Screen Action:**
  1. Highlight the **RDA (AKG Kemenkes) Nutritional Intake Progress Gauge Widget** showing daily percentages for Calories, Protein, Iron, and Vitamin C.
  2. Display Real-Time Notification arriving via **Server-Sent Events (SSE)** for the #1 ranked institution.
  3. Highlight the **Priority Claim Countdown Timer**.
  4. Click **"Claim Donation"**.
- **Spoken Script (Arrafi — Situational Live Phrasing):**
  > *"Now we switch to the Recipient Dashboard at nutrishare.web.id/recipient.*
  >
  > *Notice this prominent **RDA (AKG Kemenkes) Progress Gauge Widget**. Our system continuously calculates the institution's daily nutritional intake targets for Calories, Protein, Iron, and Vitamin C based on their resident headcount and age distribution.*
  >
  > *As the **#1 ranked institution on screen**, they instantly receive a priority notification without refreshing the page, powered by **Server-Sent Events (SSE)**.*
  >
  > *The system provides a priority response window. If unclaimed within this window, our **Tiered Shelf-Life Escalation** feature automatically cascades the offer to Rank #2, ensuring food never spoils while waiting. Now, I click **Claim Donation**."*

---

#### 4️⃣ Logistics Dispatch, Live Tracking & Closed-Loop AKG Handover (~30 seconds)
- **Route:** `https://nutrishare.web.id/recipient` → **"Track Delivery"** Modal
- **Screen Action:**
  1. Open **Leaflet GIS Interactive Map**.
  2. Show live courier movement tracking.
  3. Simulate arrival and click **"Confirm Receipt"**. Point kursor to the updated RDA AKG gauge.
- **Spoken Script (Arrafi):**
  > *"Once claimed, the system activates real-time delivery tracking via **Leaflet GIS Interactive Maps**. Recipients can monitor courier location live.*
  >
  > *When food arrives on site, shelter staff verify physical food condition and tap **Confirm Receipt**. This closes the delivery loop (closed-loop verification): the nutrient payload of these 50 portions is immediately ingested into our RDA Engine, instantly updating the shelter's daily AKG progress chart."*

---

#### 5️⃣ Admin Governance & Macro Impact Analytics (~45 seconds)
- **Route:** `https://nutrishare.web.id/admin` (Admin Dashboard)
- **Screen Action:**
  1. Show **KYC Verification** Tab (Legal Document Audit for Donors & Recipients).
  2. Highlight Macro Metrics: Total Protein Delivered (g/kg), Food Rescued (kg), and Estimated CO2e Reduction.
- **Spoken Script (Arrafi):**
  > *"Finally, platform integrity and safety are governed through the **Admin Dashboard at nutrishare.web.id/admin**.*
  >
  > *To prevent fraud and food safety risks, every donor and recipient must undergo legal **KYC (Know Your Customer)** verification before transacting.*
  >
  > *Furthermore, Admins can monitor macro-level impact transparently: total grams of protein delivered and tons of CO2e emissions prevented. This verified data directly supports **SDG 2 (Zero Hunger)**, **SDG 3 (Good Health and Well-being)**, and **SDG 12 (Responsible Consumption and Production)**."*

---

### 📍 PART 4: CLOSING TRANSITION & CONCLUSION (~00:45)
**Speaker:** Arrafi → Ayli  
**Visual:** Slide 5 / Closing Presentation Slide

#### 🎬 Transition Script (Arrafi):
> *"That concludes our complete live platform walkthrough on nutrishare.web.id — from flexible donor input with AI Estimator, RDA nutritional deficit tracking, TOPSIS mathematical audit, real-time claiming, tracked delivery, to macro impact reporting. I will now hand it back to Ayli for our closing remarks."*

#### 🎬 Conclusion Script (Ayli):
> *"Thank you, Arrafi. Honorable members of the jury, NutriShare has proven that technology, RDA nutritional science, and mathematical precision allocation can transform food waste into fair and dignified nutritional equity.*
>
> *With NutriShare, no wholesome food goes to waste, and no vulnerable institution is left behind. Join us at NutriShare: **Stop Waste. Allocate Nutrition.***
>
> *Thank you for your time. We are ready to take your questions."*

---

## 🛡️ TECHNICAL APPENDIX & Q&A DEFENSE CHEAT SHEET
*(Comprehensive Defense Answers for Jury Q&A Session)*

### 1. How Does the RDA (AKG Kemenkes RI) Calculation Engine Work?
- **Jury Question:** *"How does NutriShare compute daily RDA (AKG) targets and nutrient deficits for recipient institutions?"*
- **Answer:**
  1. **Demographic Profiling:** During registration/profile setup, recipient institutions enter their total resident count broken down by age brackets (infants, children, adolescents, adults, elderly) and health conditions.
  2. **Baseline Target Computation:** The RDA Engine calculates daily baseline targets for 4 key indicators based on Ministry of Health (Kemenkes RI) Standards:
     $$\text{Target Protein (g/day)} = \sum_{a \in \text{age groups}} (\text{count}_a \times \text{RDA\_Protein}_a)$$
     Similar target formulas apply for Calories (kcal), Iron (mg), and Vitamin C (mg).
  3. **24-Hour Rolling Intake Tracking:** Whenever a donation claim is confirmed (`completed`), the system logs the delivered nutrient payload:
     $$\text{Protein Intake Today} = \sum_{\text{claims in 24h}} (\text{portion\_count} \times \text{protein\_per\_portion})$$
  4. **Defisit Ratio & TOPSIS Input ($C_1$):**
     $$\text{Deficit Ratio} = 1.0 - \min\left(1.0, \frac{\text{Protein Intake Today}}{\text{Target Protein}}\right)$$
     This deficit ratio feeds directly into TOPSIS Criterion $C_1$, giving higher priority to institutions furthest from meeting their daily AKG standards.

---

### 2. How Does the Hybrid Entropy-TOPSIS Algorithm Work Mathematically & Why Is It Our Primary Advantage?
- **Jury Question:** *"Why does NutriShare use Entropy-TOPSIS and what are the detailed mathematical steps?"*
- **Answer:**
  Conventional food rescue platforms use *First-Come First-Served* (FCFS) or fixed subjective weights. FCFS is inherently unfair because shelters with fast internet or nearby locations monopolize donations.

  **NutriShare solves this using a 6-stage Hybrid Shannon Entropy - TOPSIS algorithm:**
  1. **Decision Matrix Formulation ($X_{m \times n}$):** Forms matrix of candidate shelters ($m$) against 5 criteria ($n$).
  2. **Vector Normalization ($R$):** Eliminates physical units (kg, km, hours) into dimensionless matrix:
     $$r_{ij} = \frac{x_{ij}}{\sqrt{\sum_{i=1}^{m} x_{ij}^2}}$$
  3. **Shannon Entropy Objective Weighting ($w_j$):** Computes information entropy $E_j$ to measure actual data dispersion:
     $$E_j = -k \sum_{i=1}^{m} p_{ij} \ln(p_{ij}) \quad \text{where } p_{ij} = \frac{r_{ij}}{\sum r_{ij}}$$
     Degree of diversification $d_j = 1 - E_j$ determines objective weight $w_j = \frac{d_j}{\sum d_j}$. For stability, this weight is blended 50:50 with policy baseline weights.
  4. **Determine Positive ($A^+$) and Negative ($A^-$) Ideal Solutions:**
     $$A^+ = \{ \max_i v_{ij} | j \in B \}, \quad A^- = \{ \min_i v_{ij} | j \in B \}$$
  5. **Euclidean Distance Calculation ($S_i^+$ & $S_i^-$):** Measures geometric distance of each shelter to ideal nutritional need.
  6. **Relative Closeness Score ($V_i$):**
     $$V_i = \frac{S_i^-}{S_i^+ + S_i^-}$$
     The shelter with $V_i$ closest to 1.0 is automatically selected as Rank #1 Recipient.

---

### 3. How Does the AI Nutrition Estimator Work and Why Emphasize 'Estimation'?
- **Jury Question:** *"How does the system estimate nutritional content and how accurate is it?"*
- **Answer:**
  - **Mechanism:** NutriShare's AI Nutrition Estimator uses lightweight Natural Language Processing (NLP) matched against the **Indonesian Food Composition Database (TKPI)**. When donors type food names (e.g., *"Nasi Box Ayam Bakar"*), the engine matches primary ingredient keywords and standard portions.
  - **Emphasis on Estimation:** We explicitly clarify that these values are **ESTIMATIONS (not lab analysis / chemical testing)**. Catering recipes vary, but this estimation is vital in providing a nutritional benchmark where none would otherwise exist.
  - **Official Reference:** Calorie, protein, iron, and vitamin C reference values used by the engine are benchmarked against the **Ministry of Health (Kemenkes RI) RDA Standards**, maintaining scientific validity.
  - **Input Flexibility:** Donors with lab test data can override the AI estimate and **enter exact values manually**.

---

### 4. How Does NutriShare Guarantee Food Safety?
- **Jury Question:** *"How do you prevent food poisoning from donated surplus?"*
- **Answer:**
  1. **HACCP 3-Tier Assessment Standard:** Donors must specify preparation timestamp and max shelf-life (max 4 hours for cooked meals).
  2. **Automated Expiry Filtering:** If remaining shelf-life $< 60$ minutes, the system automatically rejects donation publication for perishable foods.
  3. **Physical Handover Verification:** Recipients conduct organoleptic checks (smell, color, temperature) upon courier delivery before clicking *Confirm Receipt*.

---

### 5. Why Use Server-Sent Events (SSE) Over WebSockets?
- **Jury Question:** *"Why choose SSE for real-time notifications?"*
- **Answer:**
  - NutriShare requires efficient **one-way server-to-client** notification when new donations are published.
  - SSE runs over standard HTTP, is bandwidth/energy efficient, supports automatic reconnection, and is cloud/serverless friendly compared to persistent duplex WebSockets.

---

### 6. How Do You Prevent Aid Monopolies by Nearby Shelters (Fairness Safeguard)?
- **Jury Question:** *"Will shelters closest to hotels always win donations?"*
- **Answer:**
  - No, because NutriShare includes **Criterion $C_5$ (Distribution History / Fairness Safeguard)** weighted at 13.3%.
  - The more recently a shelter received a donation, its $C_5$ score drops significantly. This penalizes recent recipients and gives higher priority to shelters that haven't received aid in days, even if located slightly further away.

---
