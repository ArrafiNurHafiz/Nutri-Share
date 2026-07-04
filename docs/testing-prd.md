# PRD Testing — NutriShare

## 1. Test Strategy

### 1.1 Pyramid

```
       /\
      /E2E\         3 skenario (full lifecycle)
     /────\
    / API  \       70+ test (tiap endpoint + edge case)
   /────────\
  /  Unit    \     15 test (TOPSIS math)
 /────────────\
/  Static Type  \   tsc --noEmit (CI gate)
/────────────────\
```

### 1.2 Tools

| Level | Tool | Alasan |
|-------|------|--------|
| Unit | `vitest` | Ringan, cepat, compatible dengan ESM |
| API | `vitest` + `supertest` | Test Express langsung tanpa server process |
| DB | `better-sqlite3` `:memory:` | Tiap file test pake DB sendiri, state bersih |
| E2E | `playwright` | Browser automation, udah terinstall |
| Coverage | `vitest --coverage` (via `@vitest/coverage-v8`) |
| CI | `github actions` | Otomatis tiap push |

### 1.3 Struktur File

```
server/__tests__/
  helpers.ts          — seed helper, token factory
  topsis.test.ts      — TOPSIS unit tests
  auth.test.ts        — Auth endpoints
  admin.test.ts       — Admin endpoints
  donations.test.ts   — Donation CRUD + claim + arrived + complete
  recipient.test.ts   — Recipient endpoints (akg, history, emergency)
  reviews.test.ts     — Review endpoints
  notifications.test.ts — Notification endpoints
  public.test.ts      — Public endpoints (stats, map, top-donors)
  profile.test.ts     — Profile update endpoint
  security.test.ts    — Auth middleware, role check, rate limit
  edge-cases.test.ts  — NaN, missing params, concurrent

tests/
  e2e.spec.ts         — E2E user journey

vitest.config.ts
```

### 1.4 Test Data Factory

```typescript
// server/__tests__/helpers.ts — Fungsi yang diekspor:

// Buat user + langsung return JWT token
createAdmin(overrides?)       → { token, user }
createDonor(overrides?)       → { token, user, profile }
createRecipient(overrides?)   → { token, user, profile }

// Buat data bisnis (via raw SQL, bypass Express)
createDonation(donorId, overrides?)        → donation
createClaim(donationId, recipientId)       → void
createReview(donationId, donorId, recipientId) → void
verifyUser(adminToken, userId, urgency?)   → void
approveClaim(adminToken, claimId)          → void
completeDonation(donorToken, donationId)   → void

// Setup
createApp() → Express (DB :memory: + routes mounted)
resetDb()   → void (DELETE FROM semua tabel)
```

### 1.5 Database per Test

```
beforeAll  → app = createApp()  → init SQLite :memory: + CREATE TABLE
beforeEach → resetDb()          → DELETE FROM semua tabel
afterAll   → close db
```

Cara: `server/db.ts` di-refactor supaya bisa pake path kustom:

```typescript
// server/db.ts
let db: Database;
export function initDb(path?: string) {
  db = new Database(path || "./data/nutrishare.db");
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  init();
  return db;
}
// Default call
initDb();
```

Test panggil `initDb(":memory:")`.

---

## 2. Unit Tests — TOPSIS

### 2.1 Test Cases

| # | Test | Seed | Assert |
|---|------|------|--------|
| UT-1 | 0 verified recipients | 1 donor, 1 donation active, 0 recipient | return early, 0 rows in topsis_results |
| UT-2 | 1 verified recipient | 1 donor, 1 donation, 1 recipient verified | rank=1, ci_score=1, d_plus=0, d_minus=1 |
| UT-3 | 5 recipients normal | 5 recipients, varied C2(2-5), C4(1-5km), C5(1-30hari) | ranking CI descending, CI ∈ [0,1], sum weights ≈ 1 |
| UT-4 | No negative weights | 5 recipients any data | Semua weight ≥ 0 |
| UT-5 | Emergency active dominates | 1 emergency:active (C2=5000), 4 normal (C2≤5) | Emergency rank #1 |
| UT-6 | All recipients identical | 5 recipients, semua data sama | Semua CI = 0.5, weights = 1/5 |
| UT-7 | C1 varies per recipient | Recipients beda daily_protein_need | C1 berbeda antar recipient |
| UT-8 | Expired donation | Donation status = 'expired' | return early |
| UT-9 | C5 = 30 for never-received | 2 recipients: 1 punya last_received, 1 null | Null recipient C5=30 |
| UT-10 | AKG zero need safety | Recipient daily_protein_need=0 | Tidak NaN, CI normal |

### 2.2 Known-Output Verification

Satu kasus dihitung manual, assert exact:

```typescript
// Donasi: protein=22g, portion=50 → totalProtein=1100g
// Recipient A: daily_protein_need=1000g → C1 = min(100, 1100/1000*100) = 100
// Recipient B: daily_protein_need=2000g → C1 = min(100, 1100/2000*100) = 55
// Assert ranking, CI, weights dengan delta 1e-10
```

---

## 3. API Integration Tests

### 3.1 Auth Endpoints

| # | Test | Method | Body | Expect |
|---|------|--------|------|--------|
| A-1 | Register admin valid | POST /api/auth/register/admin | `{name,email,password,admin_key}` | 200, role=admin, status=verified |
| A-2 | Register admin wrong key | POST /api/auth/register/admin | `{...admin_key:"wrong"}` | 403 |
| A-3 | Register admin duplicate email | A-1 lalu panggil lagi | body sama | 409 |
| A-4 | Register admin missing field | POST /api/auth/register/admin | `{}` | 400 |
| A-5 | Register admin weak password | POST /api/auth/register/admin | `{password:"12345"}` | 400 |
| A-6 | Login valid | POST /api/auth/login | email+password dari A-1 | 200, Set-Cookie, role=admin |
| A-7 | Login wrong password | POST /api/auth/login | email benar, password salah | 401 |
| A-8 | Login unverified user | Register donor, login before verify | email+password donor | 403 |
| A-9 | Login empty body | POST /api/auth/login | `{}` | 400 |
| A-10 | Auth me with valid cookie | GET /api/auth/me | cookie dari A-6 | 200, user.email sesuai |
| A-11 | Auth me without cookie | GET /api/auth/me | no cookie | 401 |
| A-12 | Auth me with tampered cookie | GET /api/auth/me | cookie = "invalid.jwt.token" | 401 |
| A-13 | Logout | POST /api/auth/logout | cookie valid | 200, cookie cleared |
| A-14 | Register donor valid | POST /api/auth/register/donor | body valid | 200, status=pending |
| A-15 | Register recipient valid | POST /api/auth/register/recipient | body valid | 200, status=pending |
| A-16 | Register donor missing field | POST /api/auth/register/donor | `{business_name:"X"}` | 400 |
| A-17 | Register recipient invalid enum | POST /api/auth/register/recipient | `{institution_type:"INVALID"}` | 400 |
| A-18 | Register duplicate email | A-14/A-15 lalu panggil lagi | body sama | 409 |
| A-19 | Token expired | jwt.sign expiresIn:"0s" | cookie expired | 401 |

### 3.2 Admin Endpoints

| # | Test | Method | Expect |
|---|------|--------|--------|
| AD-1 | List users tanpa auth | GET /api/admin/users | 401 |
| AD-2 | List users as donor | GET /api/admin/users (cookie donor) | 403 |
| AD-3 | List users as admin | GET /api/admin/users (cookie admin) | 200, donors[] + recipients[] |
| AD-4 | Verify recipient valid | POST /api/admin/users/:id/verify `{urgency_score:"4"}` | 200, status=verified |
| AD-5 | Verify user tidak ada | POST /api/admin/users/999/verify | 404 |
| AD-6 | Verify tanpa score | POST /api/admin/users/:id/verify `{}` | 200, score unchanged |
| AD-7 | Verify score non-numerik | POST /api/admin/users/:id/verify `{urgency_score:"abc"}` | 200 (parseInt NaN → DB tetap 1) — **BUG** |
| AD-8 | List claims empty | GET /api/admin/claims | 200, `[]` |
| AD-9 | Approve claim valid | POST /api/admin/claims/:id/approve | 200, claim approved, donation claimed |
| AD-10 | Approve claim tidak ada | POST /api/admin/claims/999/approve | 404 |
| AD-11 | Approve claim tanpa auth | POST /api/admin/claims/:id/approve | 401 |
| AD-12 | Approve claim as donor | POST /api/admin/claims/:id/approve (cookie donor) | 403 |
| AD-13 | Run TOPSIS | POST /api/admin/topsis/run | 200 |
| AD-14 | Emergency toggle cycle | POST /api/admin/users/:id/emergency | 200, none→pending→active→none |
| AD-15 | Emergency user tidak ada | POST /api/admin/users/999/emergency | 404 |

### 3.3 Donation Endpoints

| # | Test | Expect |
|---|------|--------|
| D-1 | Create donation tanpa auth | 401 |
| D-2 | Create donation as donor | 200, TOPSIS triggered |
| D-3 | Create donation as recipient | 403 |
| D-4 | Create donation missing field | 400 |
| D-5 | hours_valid non-numeric → NaN in valid_until | **BUG DETECTED** |
| D-6 | List donations | 200, array |
| D-7 | List with donor_id filter | 200, filtered |
| D-8 | List page 2 | 200, offset benar |
| D-9 | List invalid page param | 200, fallback page=1 |
| D-10 | Get single donation valid | 200, donor_name ada |
| D-11 | Get single donation invalid id | 404 |
| D-12 | Claim tanpa auth | **BUG: should 401, now 200** |
| D-13 | Claim valid | 200 |
| D-14 | Claim invalid body | 400 |
| D-15 | Claim duplicate (recipient lain claim same donation) | **BUG: no duplicate protection** |
| D-16 | Claim donation tidak ada | **BUG: should 404, now 200** |
| D-17 | Claim donation expired | **BUG: should reject, now 200** |
| D-18 | Arrived tanpa auth | **BUG: should 401, now 200** |
| D-19 | Arrived valid (after approve) | 200, arrived_at terisi |
| D-20 | Complete tanpa auth | **BUG: should 401, now 200** |
| D-21 | Complete valid (after arrive) | 200, status=completed, total_donations+1 |
| D-22 | Complete donation tidak ada | **BUG: false success** |
| D-23 | Complete donation already completed | **BUG: false success** |
| D-24 | Complete donation status bukan claimed | **BUG: false success** |
| D-25 | Transit as recipient | 200 |
| D-26 | Transit as donor | 200 |
| D-27 | Active with topsis rank | 200, sorted by rank |
| D-28 | Donation history | 200, enriched |
| D-29 | Donation history no data | 200, `[]` |

### 3.4 Profile Update

| # | Test | Expect |
|---|------|--------|
| P-1 | Update tanpa auth | 401 |
| P-2 | Update donor | 200 |
| P-3 | Update recipient | 200 |
| P-4 | Update password → login dengan pass baru | 200 |
| P-5 | Update email duplicate | 500 (SQL UNIQUE — harus 409) |
| P-6 | Update latitude = 0 | **BUG: `if(d.latitude)` falsy — tidak terupdate** |
| P-7 | Update resident_count = 0 | **BUG: sama** |
| P-8 | Update user lain | **BUG: no ownership check — seharusnya 403** |
| P-9 | Update dengan field panjang 10KB | 200 atau 413 |
| P-10 | Update user tidak ada | 404 |

### 3.5 Review Endpoints

| # | Test | Expect |
|---|------|--------|
| R-1 | Create review tanpa auth | **BUG: should 401, now 200** |
| R-2 | Create review valid | 200, notification created |
| R-3 | Rating out of range (6) | 400 |
| R-4 | Rating negatif | 400 |
| R-5 | Invalid field type | 400 |
| R-6 | Get reviews by donor | 200, enriched |
| R-7 | Get reviews donor tidak ada | 200, `[]` |

### 3.6 Recipient Endpoints

| # | Test | Expect |
|---|------|--------|
| RP-1 | AKG valid | 200, daily_needs + today_intake |
| RP-2 | AKG user tidak ada | 404 |
| RP-3 | AKG tanpa user_id | 404 |
| RP-4 | AKG dengan completed donation | today_intake sesuai |
| RP-5 | AKG division by zero (need=0) | **BUG: 100% palsu** |
| RP-6 | Emergency toggle none→pending | 200 |
| RP-7 | Emergency toggle pending→none | 200 |
| RP-8 | Emergency toggle saat active | 400 (harus lewat admin) |
| RP-9 | Emergency user tidak ada | 404 |
| RP-10 | Emergency invalid body | 400 |

### 3.7 Notification Endpoints

| # | Test | Expect |
|---|------|--------|
| N-1 | List notifications | 200, array |
| N-2 | List setelah ada notif | notif muncul |
| N-3 | Mark read valid | 200, is_read=true |
| N-4 | Mark read notif tidak ada | 200 |
| N-5 | Mark read notif orang lain | **BUG: no ownership check** |

### 3.8 Public Endpoints

| # | Test | Expect |
|---|------|--------|
| PUB-1 | Top donors empty | 200, `[]` |
| PUB-2 | Top donors with data | 200, max 3, sorted |
| PUB-3 | Dashboard stats empty | 200, semua 0 |
| PUB-4 | Dashboard stats with data | 200, angka sesuai |
| PUB-5 | Map data | 200, 3 lists |
| PUB-6 | Map filter verified only | pending user tidak muncul |
| PUB-7 | Health check | 200, uptime>0 |

### 3.9 Upload Endpoint

| # | Test | Expect |
|---|------|--------|
| U-1 | Upload tanpa auth | 401 |
| U-2 | Upload JPEG | 200, url /uploads/... |
| U-3 | Upload PNG | 200 |
| U-4 | Upload EXE (wrong MIME) | 400 |
| U-5 | Upload tanpa file | 400 |
| U-6 | Upload >5MB | 400 |
| U-7 | Filename sanitasi (`../../../etc/passwd`) | 200, path aman |

---

## 4. E2E Tests

### 4.1 Full Lifecycle

```
Scenario 1: Admin registers → logs in → sees empty dashboard
  1. POST /api/auth/register/admin
  2. Open /login → fill email + password → submit
  3. Assert redirect to /admin
  4. Assert stats all 0, empty states visible

Scenario 2: Donor registers → admin verifies → donor creates donation
  1. Open /register/donor → fill form → submit
  2. As admin, open /admin → verify donor
  3. Logout → login as donor
  4. Create donation → assert active donation visible

Scenario 3: Recipient registers → verify → claim → approve → complete → review
  1. Open /register/recipient → fill form → submit
  2. As admin, verify recipient
  3. Login as recipient
  4. Assert donation visible, sorted by rank
  5. Claim donation → assert pending
  6. Login as admin → approve claim
  7. Login as donor → arrive → complete
  8. Login as recipient → review → assert rating visible
```

### 4.2 Auth Guard

```
Scenario: Protected routes redirect to login
  1. Open /admin → assert redirect to /login
  2. Open /donor → assert redirect to /login
  3. Open /recipient → assert redirect to /login
  4. Login → access dashboard → assert rendered
  5. Logout → access dashboard → assert redirect
```

### 4.3 Responsive

```
Scenario: Mobile viewport (375×812)
  1. Set viewport iPhone X
  2. Open /login → assert form full width
  3. Open /admin → assert cards stack
```

---

## 5. Security Tests

| # | Test | Expect |
|---|------|--------|
| S-1 | Login 6× dalam 1 menit | Attempt #6 → 429 |
| S-2 | General API 101× dalam 15 menit | #101 → 429 |
| S-3 | Upload 11× dalam 1 menit | #11 → 429 |
| S-4 | Helmet headers | `X-Content-Type-Options: nosniff` |
| S-5 | Rate limit headers | `RateLimit-Remaining` |
| S-6 | CORS header | `Access-Control-Allow-Origin` |
| S-7 | Admin endpoint as donor | 403 |
| S-8 | Admin endpoint no auth | 401 |
| S-9 | Token expired | 401 |

---

## 6. Edge Case Tests

| # | Test | Input | Assert |
|---|------|-------|--------|
| E-1 | parseInt("abc") di path | `GET /api/donations/abc` | 404 |
| E-2 | parseInt("abc") di query | `GET /api/notifications?user_id=abc` | 200, `[]` |
| E-3 | parseFloat("abc") di body | `POST /api/donations` body `{portion_count:"abc"}` | **BUG: Zod lulus → NaN di DB** |
| E-4 | Malformed JSON | body `{bad json` | 400 |
| E-5 | XSS di string field | `food_name:"<script>alert(1)</script>"` | 200, stored as-is |
| E-6 | SQL injection via param | `donor_id=1 OR 1=1` | 200 (parameterized query safe) |
| E-7 | Body >1MB (JSON limit) | body 2MB | 413 |
| E-8 | Concurrent duplicate claim | 2 recipients claim same donation | **BUG: no duplicate protection** |
| E-9 | Concurrent approve | admin approve claim 2× bersamaan | claim approved 1×, consistent |
| E-10 | Concurrent register same email | 2 users register same email | 1 sukses, 1 gagal |

---

## 7. Tests yang Akan Catch Bug yang Ada

| Bug | Severity | Test |
|-----|----------|------|
| Claim/arrived/complete tanpa auth | **KRITIS** | D-12, D-18, D-20 |
| Profile update bisa edit user lain | **KRITIS** | P-8 |
| False success di complete (200 walau gak ngapa-ngapain) | **HIGH** | D-22, D-23, D-24 |
| NaN propagation via parseFloat/parseInt | **HIGH** | D-5, E-3 |
| hours_valid="abc" → valid_until="Invalid Date" | **HIGH** | D-5 |
| Logo_url tersimpan ke document_url | **HIGH** | manual check |
| Tidak ada transaksi → orphan user / approve inkonsisten | **HIGH** | E-9, E-10 |
| Truthy check skip nilai 0 (latitude, resident_count) | **MEDIUM** | P-6, P-7 |
| Division by zero di AKG → 100% palsu | **MEDIUM** | RP-5 |
| Tidak ada duplicate claim protection | **MEDIUM** | D-15, E-8 |
| has_reviewed tidak spesifik recipient | **LOW** | manual |
| Notifikasi bisa dibaca user lain | **LOW** | N-5 |
| Hardcoded fallback secret | **LOW** | S-11 |

---

## 8. Setup

```bash
# Install test dependencies
npm install -D vitest supertest @types/supertest @vitest/coverage-v8

# Init Playwright config
npx playwright init --config

# Update package.json scripts
"test": "vitest run",
"test:watch": "vitest",
"test:e2e": "playwright test",
"test:coverage": "vitest run --coverage"
```

### vitest.config.ts

```typescript
import { defineConfig } from "vitest/config";
export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["server/__tests__/**/*.test.ts"],
    coverage: {
      provider: "v8",
      include: ["server/**/*.ts", "!server/__tests__/**"],
      thresholds: { lines: 80, branches: 70, functions: 80, statements: 80 },
    },
  },
});
```

### package.json tambahan

```json
"test": "vitest run",
"test:watch": "vitest",
"test:e2e": "playwright test",
"test:coverage": "vitest run --coverage"
```

---

## 9. Prioritas

| Fase | Tests | Jumlah | Waktu |
|------|-------|--------|-------|
| **P1** | topsis, auth, admin | ~40 | ~3 jam |
| **P2** | donations, profile, recipient | ~30 | ~2 jam |
| **P3** | reviews, notifications, public, upload | ~20 | ~1.5 jam |
| **P4** | edge-cases, security | ~15 | ~1.5 jam |
| **P5** | E2E (playwright) | ~3 skenario | ~1 jam |
| **—** | helpers.ts, vitest.config, CI | — | ~1 jam |
| **Total** | | **~110** | **~10 jam** |
