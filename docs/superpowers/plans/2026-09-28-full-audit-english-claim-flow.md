# Full System Audit, English Localization, Instant Claim Flow & Verification Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform Nutri-Share into a full English platform, remove the admin confirmation requirement for recipient donation claims (instant claim flow), resolve all functional bugs, and verify complete end-to-end functionality via automated tests and live browser execution.

**Architecture:** 
1. **Backend Claim Refactoring:** Modify `backend/routers/donations.py` to make donation claims instant (auto-approved, sets donation status to `claimed`, notifies donor directly, prevents competing claims). Update admin router and tests accordingly.
2. **System-wide English Translation:** Translate all UI components, pages, forms, toasts, modals, tooltips, validation messages, backend HTTPExceptions, notification templates, and activity log entries to natural English.
3. **Comprehensive End-to-End Testing & Bug Fixes:** Run backend pytest suite, update/fix test assertions for instant claims and English strings, execute Playwright browser tests covering all CRUD operations, navigation, auth, role workflows, and live interactions.

**Tech Stack:** React 19, TypeScript, Vite, Tailwind CSS v4, FastAPI, SQLModel, Playwright, Pytest.

**Spec:** User request dated 2026-09-28.

## Global Constraints
- Target platform: Nutri-Share (Vercel + Supabase / FastAPI + React SPA).
- Language: 100% English across all user-facing interfaces, form inputs, toasts, notification messages, error responses, and audit logs.
- Claim Flow: No admin manual approval step when a recipient claims an active donation. Claim is direct and instant.
- Quality: Zero regression, all unit and end-to-end tests must pass cleanly.

---

### Task 1: Instant Claim Flow (Remove Admin Confirmation for Claims)

**Files:**
- Modify: `backend/routers/donations.py:470-610`
- Modify: `backend/routers/admin.py:150-250`
- Modify: `frontend/src/pages/RecipientDashboard.tsx`
- Modify: `frontend/src/pages/AdminDashboard.tsx`
- Modify: `frontend/src/components/recipient/DonationList.tsx`
- Modify: `frontend/src/components/recipient/ClaimLifecycle.tsx`
- Modify: `frontend/src/components/donor/DonationList.tsx`
- Modify: `backend/tests/test_donations_api.py`
- Modify: `backend/tests/test_concurrency_idempotency.py`

**Interfaces:**
- Consumes: Recipient claiming donation `POST /api/donations/{id}/claim`.
- Produces: Instant `Claim` with `status="approved"` and `Donation` with `status="claimed"`, `claimed_by=recipient.id`, instant notifications to donor & recipient.

- [ ] **Step 1: Update backend donation claim logic in `backend/routers/donations.py`**
  - When verified recipient claims donation:
    - Set `claim.status = "approved"` (or `"claimed"`), `claim.reviewed_at = now()`.
    - Set `donation.status = "claimed"`, `donation.claimed_by = current_user.id`, `donation.claimed_at = now()`.
    - Send instant notification to donor: "Your donation has been claimed by [Recipient Name]. Please prepare for handover/pickup."
    - Send notification to recipient: "Claim confirmed! Please check pickup instructions and coordinate handover."
    - Reject any other pending claims on this donation.
    - Publish `CLAIM_APPROVED` / `CLAIM_CREATED` real-time events.
    - Return message: "Donation claimed successfully!"

- [ ] **Step 2: Update backend admin claims endpoint in `backend/routers/admin.py`**
  - Maintain `/api/admin/claims` to list all claim histories.
  - Ensure approve/reject endpoints handle already-approved claims gracefully without error.

- [ ] **Step 3: Update frontend recipient UI & claim lifecycle components**
  - Update `RecipientDashboard.tsx`, `DonationList.tsx`, and `ClaimLifecycle.tsx` to handle instant approved claims.
  - Remove "Waiting for admin approval" state from active flow; show "Claimed / Ready for Pickup" immediately.

- [ ] **Step 4: Update backend tests for instant claim flow**
  - Update `test_donations_api.py` and `test_concurrency_idempotency.py` to reflect instant claim approval.
  - Run pytest to verify all tests pass.

---

### Task 2: Backend English Localization (HTTP Exceptions, Notifications, Logs)

**Files:**
- Modify: `backend/routers/auth.py`
- Modify: `backend/routers/donations.py`
- Modify: `backend/routers/admin.py`
- Modify: `backend/routers/recipient.py`
- Modify: `backend/routers/public.py`
- Modify: `backend/routers/analytics.py`
- Modify: `backend/routers/reviews.py`
- Modify: `backend/routers/notifications.py`
- Modify: `backend/routers/activity.py`
- Modify: `backend/services/gamification.py`
- Modify: `backend/services/topsis.py`

- [ ] **Step 1: Translate all backend router response messages and error strings to English**
  - Auth: Invalid credentials, Account pending verification, Registration success, Password reset sent, Invalid or expired token.
  - Donations: Donation created successfully, Donation updated, Donation deleted, Safe shelf-life expired, Donation no longer available, Claim submitted successfully.
  - Recipient: Profile updated, Delivery confirmed, Review submitted.
  - Admin: User approved, User suspended, User activated, User deleted.
  - Gamification & Notifications: Badge earned titles, level up messages, notification alerts in English.

- [ ] **Step 2: Run pytest to ensure backend tests pass with English messages**
  - Run: `.venv/bin/pytest backend/tests/`
  - Verify all 152+ tests pass.

---

### Task 3: Frontend Public & Auth Pages English Localization

**Files:**
- Modify: `frontend/src/pages/Home.tsx`
- Modify: `frontend/src/components/Navbar.tsx`
- Modify: `frontend/src/components/Footer.tsx`
- Modify: `frontend/src/components/sections/HeroSection.tsx`
- Modify: `frontend/src/components/sections/ThreePillars.tsx`
- Modify: `frontend/src/components/sections/ProcessSection.tsx`
- Modify: `frontend/src/components/sections/SurplusShowcase.tsx`
- Modify: `frontend/src/components/sections/RecognitionSection.tsx`
- Modify: `frontend/src/components/sections/Testimonials.tsx`
- Modify: `frontend/src/components/sections/CTASection.tsx`
- Modify: `frontend/src/components/sections/MarqueeBanner.tsx`
- Modify: `frontend/src/components/sections/EcoVisuals.tsx`
- Modify: `frontend/src/pages/Auth.tsx`
- Modify: `frontend/src/pages/RegisterDonor.tsx`
- Modify: `frontend/src/pages/RegisterRecipient.tsx`
- Modify: `frontend/src/pages/ForgotPassword.tsx`
- Modify: `frontend/src/pages/ResetPassword.tsx`
- Modify: `frontend/src/pages/Support.tsx`
- Modify: `frontend/src/pages/BrowseMap.tsx`
- Modify: `frontend/src/pages/NotFound.tsx`

- [ ] **Step 1: Translate landing page and shared components into clean, professional English**
- [ ] **Step 2: Translate authentication and onboarding registration flows (Donor & Recipient) into English**
- [ ] **Step 3: Translate Support, BrowseMap, ForgotPassword, ResetPassword, NotFound pages into English**

---

### Task 4: Frontend Dashboards & Modals English Localization

**Files:**
- Modify: `frontend/src/pages/DonorDashboard.tsx`
- Modify: `frontend/src/components/donor/*` (DonationForm, DonationList, DonorHeader, DonorSidebar, DonorStats, DonorTOPSISModal, FoodCatalog, ImpactBadges, QuickCatalog, ReviewList)
- Modify: `frontend/src/pages/RecipientDashboard.tsx`
- Modify: `frontend/src/components/recipient/*` (DonationList, RecipientHeader, RecipientSidebar, RecipientStats, NutritionTracker, HistorySection, MapView, NotificationDropdown, TOPSISModal, TOPSISPanel, TransitSection, ClaimLifecycle)
- Modify: `frontend/src/pages/AdminDashboard.tsx`
- Modify: `frontend/src/components/LiveTrackingModal.tsx`
- Modify: `frontend/src/components/LocationPicker.tsx`
- Modify: `frontend/src/components/ProfileModal.tsx`
- Modify: `frontend/src/components/ReviewModal.tsx`
- Modify: `frontend/src/components/ConfirmDialog.tsx`
- Modify: `frontend/src/components/EmptyState.tsx`
- Modify: `frontend/src/components/InstallPrompt.tsx`
- Modify: `frontend/src/lib/validation.tsx`

- [ ] **Step 1: Translate Donor Dashboard & components**
- [ ] **Step 2: Translate Recipient Dashboard & components**
- [ ] **Step 3: Translate Admin Dashboard & components**
- [ ] **Step 4: Translate all shared modals, dialogs, map popups, and validation messages**
- [ ] **Step 5: Run `npm run lint` and `npm run build` to ensure zero compilation or type errors**

---

### Task 5: Comprehensive E2E Playwright Testing & Verification

**Files:**
- Modify / Create: `tests/vercel_e2e.spec.ts`
- Modify / Create: `tests/full_system_e2e.spec.ts`
- Update all spec files in `tests/` to use English selectors & assertions

- [ ] **Step 1: Update existing Playwright test suites for English copy and instant claim flow**
- [ ] **Step 2: Add comprehensive E2E test scenarios for small detail functions:**
  - Donation creation, quick catalog prefill, custom nutrient calculation.
  - Donation edit, delete, cancellation.
  - Recipient search, category filters, TOPSIS priority calculation, instant claim.
  - Status transitions: Active -> Claimed -> In Transit -> Arrived -> Completed -> Review & Rating submission.
  - Recipient AKG nutrition goal updates & daily fulfillment tracking.
  - Admin user verification (Approve/Reject), User suspension/activation, Claim audit logs, Analytics exports.
  - Profile update, password reset, support contact submission.
- [ ] **Step 3: Run Playwright tests and live browser execution using Playwright subagent**
- [ ] **Step 4: Verify zero errors, clean logs, and complete functionality**
