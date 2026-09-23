# NutriShare — Complete Live Demonstration Script & Presenter Guide (English)

An exhaustive, end-to-end presentation and live software demonstration manual for the **NutriShare** Web Platform. Designed for competitive pitch presentations, academic defenses, and technical evaluations before judges.

---

## 📋 Presentation Blueprint

- **Recommended Total Duration:** 6 – 8 Minutes
- **Setup Recommendation:** Split-screen or two browser windows (Window A: Donor/Admin, Window B: Recipient/Public)
- **Key Message:** *NutriShare is not a simple 'first-come, first-served' food classifieds app; it is an intelligent, nutrition-optimized Decision Support System (DSS) using Shannon Entropy and TOPSIS based on Indonesian AKG standards.*

---

## 🛠️ Pre-Demo Checklist & Test Accounts

| Role | Route | Test Account / Credential Context | Key Features to Highlight |
|---|---|---|---|
| **Public / Visitor** | `/` | Guest | Problem stats, 3 Pillars, Real-time metrics |
| **Donor (HoReCa)** | `/donor` | Hotel / Resto Partner | Quick-fill presets, Macronutrient input, Real-time TOPSIS recommendation audit |
| **Recipient** | `/recipient` | Orphanage / Social Shelter | AKG Nutrition Tracker, Priority claim window, Fallback logic, Leaflet transit tracking |
| **Admin** | `/admin` | System Administrator | KYC Verification, Claim monitoring, Macro SDG/CO2 impact analytics, Audit logs |
| **Geospatial Map** | `/map` | Interactive Explore | Live geographic distribution of surplus and social institutions |

---

## 🎬 Act 1: The Paradox & Platform Introduction
**Duration:** ~45 Seconds  
**Screen / Route:** `http://localhost:5173/` (Landing Page)

### Actions on Screen:
1. Open the landing page.
2. Slowly scroll through the **Hero Section**, highlight the live counter (Surplus Rescued, Protein Distributed, Active Institutions).
3. Hover over the **Three Pillars section** (Nutritional Prioritization, Smart Allocation, Full Traceability).

### Spoken Narrative:
> *"Good morning/afternoon, distinguished judges.*
> 
> *Indonesia wastes between 23 to 48 million tons of food annually, incurring an economic loss of over 500 trillion Rupiah. Yet, right in our neighborhood, orphanages and social shelters battle 'hidden hunger' and micronutrient deficiencies.*
> 
> *Existing food rescue platforms operate on a flawed **'first-come, first-served'** model, where whoever clicks fastest gets the food—regardless of whether they actually need it or whether the nutrition matches their dietary requirements.*
> 
> *This is **NutriShare** — an integrated full-stack platform that transforms food surplus distribution through a scientific, nutrition-first Decision Support System."*

---

## 🎬 Act 2: Donor Experience — Seamless Listing & Nutritional Profiling
**Duration:** ~90 Seconds  
**Screen / Route:** `http://localhost:5173/donor` (Donor Dashboard)

### Actions on Screen:
1. Log in as a Donor (e.g., *Grand Mercure Hotel / Resto Partner*).
2. Point out the **Impact Badges** (Zero Waste Champion, Nutrition Contributor) and the **Active Listings**.
3. Click the **"Tambah Donasi Surplus" / "Create Food Listing"** button.
4. Select a rapid preset (e.g., *"Paket Nasi & Lauk Komplit"* or *"Lauk Protein"*).
5. Show the pre-populated nutritional metrics:
   - Portions: `50 portions`
   - Protein per portion: `26 grams`
   - Calories: `540 kcal`
   - Safe consumption time window: `4 hours`
   - Micronutrients (Iron & Vitamin C tags)
6. Click **"Publikasikan Donasi" / "Publish Listing"**.

### Spoken Narrative:
> *"Let's step into the shoes of a food donor—such as a banquet manager at a hotel.*
> 
> *At the end of an event, the donor needs to log surplus food in seconds. Through our pre-configured nutritional presets and smart form, they define the portion count, safe consumption window, and macronutrient profile—specifically protein, calories, and micronutrients.*
> 
> *The moment I click 'Publish', NutriShare does not merely broadcast this listing to a public feed. Instead, our backend immediately feeds this food profile into our intelligent decision engine."*

---

## 🎬 Act 3: The Brain of NutriShare — Real-Time Hybrid Entropy-TOPSIS Engine
**Duration:** ~90 Seconds  
**Screen / Route:** `http://localhost:5173/donor` → Click **"Audit TOPSIS" / "Rekomendasi Penerima"**

### Actions on Screen:
1. Open the **TOPSIS Recommendation Modal / Calculation Breakdown**.
2. Point out the recipient table ranked from Rank #1 down to lowest.
3. Show the **Preference Score ($V_i$)** column (e.g., `0.892`, `0.741`, `0.512`).
4. Explain the 5 dynamic criteria cards shown on the interface:
   - **$C_1$ Nutritional Density & Gap:** Matches food macro profile with recipient's AKG deficiency.
   - **$C_2$ Health Urgency & Institution Type:** High-risk groups (children/elderly/toddlers).
   - **$C_3$ Dietary Suitability:** Capacity to store and consume within safe shelf-life.
   - **$C_4$ Geographic Distance:** Haversine distance in kilometers from donor.
   - **$C_5$ Aid History:** Fair distribution penalty to prevent monopolization.

### Spoken Narrative:
> *"Here is what makes NutriShare uniquely scientific.*
> 
> *Our backend runs a **Hybrid Entropy-TOPSIS** algorithm. First, **Shannon Entropy** calculates dynamic objective weights ($w_j$) based on data variance across all eligible shelters. It eliminates human subjectivity and bias.*
> 
> *Second, **TOPSIS** measures the Euclidean distance of each recipient from the Ideal Positive Solution ($A^+$) and Ideal Negative Solution ($A^-$), computing a relative closeness score ($V_i$).*
> 
> *As you can see on screen, **Panti Asuhan Kasih Ibu** is ranked #1 with a preference score of 0.892, because their children have an acute protein deficit and they are within a 3.2 km delivery radius. The system gives priority to actual nutritional necessity, not internet speed."*

---

## 🎬 Act 4: Recipient Experience — AKG Tracking, Priority Notification & Claim
**Duration:** ~90 Seconds  
**Screen / Route:** Switch to `http://localhost:5173/recipient` (Recipient Dashboard)

### Actions on Screen:
1. Switch to the Recipient tab (logged in as the Rank #1 shelter).
2. Point out the **AKG Nutritional Intake Monitor** widget (showing daily protein and caloric targets vs actual received intake per Permenkes No. 28/2019).
3. Show the **Real-Time Notification Pop-up / Priority Badge** indicating they have been matched with the hotel's surplus.
4. Highlight the **Priority Countdown Timer** (e.g., *"15 minutes remaining to claim before fallback"*).
5. Click **"Klaim Donasi" / "Claim Food"**.

### Spoken Narrative:
> *"Now switching to the recipient's view.*
> 
> *On their dashboard, the shelter administrator tracks their daily **AKG Nutritional Fulfillment Gauge**. When our donor published the high-protein meals, our Server-Sent Events (SSE) dispatched an exclusive priority notification to this top-ranked shelter.*
> 
> *They receive a dedicated time window to accept the donation. If this shelter cannot accept the delivery and fails to claim within the window, NutriShare's **Automated Fallback Mechanism** immediately cascades the donation to Rank #2.*
> 
> *I will now click 'Claim Donation'. The donation status instantly shifts to 'In Transit'."*

---

## 🎬 Act 5: Real-Time Logistics & Quality Handover
**Duration:** ~60 Seconds  
**Screen / Route:** `http://localhost:5173/recipient` → Click **"Lacak Pengiriman" / Live Tracking**

### Actions on Screen:
1. Open the **Interactive Leaflet Map modal**.
2. Show the visual route connection between Donor Coordinates (Hotel) and Recipient Coordinates (Shelter).
3. Explain the courier dispatch / pickup flow.
4. Show the **"Konfirmasi Penerimaan" / Confirm Handover** action.
5. Demonstrate the **Review & Rating Modal** where recipients log food quality condition and submit proof.

### Spoken Narrative:
> *"Once claimed, NutriShare coordinates logistics. Both donor and recipient have access to an interactive Leaflet map rendering the precise routing, distance, and ETA.*
> 
> *When the courier delivers the meal, the recipient inspects food freshness and confirms handover on the platform. This action closes the loop, immediately updating the institution's historical nutrition ledger and releasing impact points to the donor."*

---

## 🎬 Act 6: Governance, Analytics & Verification (Admin Control)
**Duration:** ~60 Seconds  
**Screen / Route:** `http://localhost:5173/admin` (Admin Dashboard)

### Actions on Screen:
1. Open `/admin`.
2. Review the **Macro Dashboard Metrics**: Total kilograms saved, Estimated CO2e greenhouse gas reduction, Total Portions, and Protein Delivered.
3. Switch to the **"Verifikasi / KYC"** tab to show institutional background checks (validating legal shelter permits and food safety certifications for donors).
4. Show the immutable **System Activity Audit Log**.

### Spoken Narrative:
> *"Behind the scenes, platform integrity is governed by our Admin Dashboard.*
> 
> *To prevent fraud and guarantee food safety, every donor and recipient undergoes strict administrative verification before participating. Furthermore, administrators have full visibility over macro environmental impact—including greenhouse gas emissions prevented and total protein delivered—supporting institutional reporting for SDG 2, SDG 3, and SDG 12."*

---

## 🎬 Act 7: Summary & Concluding Pitch
**Duration:** ~30 Seconds  
**Screen / Route:** Return to Landing Page or Summary Slide

### Spoken Narrative:
> *"In summary, NutriShare transforms surplus food from a waste management liability into measurable nutritional equity.*
> 
> *By bridging the gap between HoReCa surplus and vulnerable communities through mathematical rigor, real-time automation, and rigorous safety governance, NutriShare proves that technology can turn food waste into human flourishing.*
> 
> *Thank you very much. We are now ready for your questions."*

---

## 🛡️ Judge Defense & Technical Q&A Cheat Sheet

| Potential Judge Question | Technical / Operational Answer Strategy |
|---|---|
| **"Why not just use GoFood/GrabFood or WhatsApp groups?"** | WhatsApp and chat groups rely on manual negotiation and 'fastest fingers', ignoring nutritional balance and distance feasibility. Commercial delivery apps do not have multi-criteria decision modeling, AKG deficit profiling, or automated priority fallback mechanisms. |
| **"What if the food is spoiled by the time it reaches the orphanage?"** | NutriShare enforces a strict 'Safe Consumption Window' (typically 2–4 hours). The algorithm penalizes distance for short-shelf-life food ($C_4$), and recipients must inspect and record food condition upon handover in the audit trail. |
| **"How is the algorithm protected against bias or favoritism?"** | Shannon Entropy calculates criterion weights purely based on matrix variance ($E_j = -k \sum p_{ij} \ln p_{ij}$), and criterion $C_5$ applies an aid history penalty so that the same institution cannot monopolize donations continuously. |
| **"What tech stack ensures real-time responsiveness?"** | FastAPI backend with asynchronous SQLModel queries and PostgreSQL, paired with React 19 and Server-Sent Events (SSE) for low-latency live updates without heavy WebSocket overhead. |
| **"How do you plan to scale this beyond Yogyakarta?"** | The system is containerized, uses standard GIS coordinates (Leaflet / OpenStreetMap), and is architected to support multi-region clustering and localized food safety regulations across Indonesia. |
