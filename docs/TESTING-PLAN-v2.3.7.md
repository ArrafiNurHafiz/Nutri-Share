# NutriShare v2.3.7 Testing Plan

> **Target**: Testing menyeluruh frontend & backend
> **Created**: 2026-07-26
> **Status**: Ready to Execute

---

## Executive Summary

Rencana testing ini mencakup **4 level testing** untuk memastikan NutriShare v2.3.7 berfungsi dengan baik dari frontend hingga backend. Target: **80%+ test coverage** dan zero critical bugs.

---

## Current Test Status

### Backend Tests (Existing)

| File                   | Coverage                | Status     |
| ---------------------- | ----------------------- | ---------- |
| `test_auth.py`         | Password hashing, JWT   | ✅ Good    |
| `test_gamification.py` | Badge calculation       | ✅ Good    |
| `test_topsis.py`       | Haversine distance only | ⚠️ Partial |
| `test_api_compat.py`   | API compatibility       | ⚠️ Partial |
| `full_flow_test.py`    | Full flow               | ⚠️ Manual  |
| `blackbox_test.py`     | Blackbox                | ⚠️ Manual  |

### Frontend Tests (Existing)

| File            | Coverage                 | Status  |
| --------------- | ------------------------ | ------- |
| `pages.spec.ts` | Landing page, auth pages | ✅ Good |

### Coverage Gaps

- ❌ No unit tests for routers (donations, recipient, reviews, notifications)
- ❌ No integration tests for API endpoints
- ❌ No unit tests for cache service
- ❌ No unit tests for analytics endpoints
- ❌ No E2E tests for donor/recipient dashboards
- ❌ No E2E tests for admin dashboard

---

## Testing Strategy

### Level 1: Unit Tests (Backend)

**Target**: 80% coverage for all services and utilities

#### 1.1 Auth Module (`test_auth.py`) - ENHANCE

| Test Case                | Description               | Priority  |
| ------------------------ | ------------------------- | --------- |
| `test_hash_and_verify`   | Password hashing works    | ✅ Exists |
| `test_expired_token`     | Expired JWT rejected      | ✅ Exists |
| `test_invalid_signature` | Wrong secret rejected     | ✅ Exists |
| `test_required_role`     | Role-based access control | 🔴 Add    |
| `test_optional_auth`     | Optional auth dependency  | 🔴 Add    |

#### 1.2 Cache Service (`test_cache.py`) - NEW

| Test Case                 | Description                | Priority |
| ------------------------- | -------------------------- | -------- |
| `test_set_and_get`        | Basic cache operations     | 🔴 Add   |
| `test_ttl_expiration`     | Cache expires after TTL    | 🔴 Add   |
| `test_invalidate`         | Manual invalidation        | 🔴 Add   |
| `test_invalidate_pattern` | Pattern-based invalidation | 🔴 Add   |
| `test_cleanup`            | Expired entries removed    | 🔴 Add   |

#### 1.3 TOPSIS Service (`test_topsis.py`) - ENHANCE

| Test Case                  | Description              | Priority  |
| -------------------------- | ------------------------ | --------- |
| `test_haversine`           | Distance calculation     | ✅ Exists |
| `test_single_recipient`    | Single recipient ranking | 🔴 Add    |
| `test_multiple_recipients` | Multi-recipients ranking | 🔴 Add    |
| `test_zero_protein_need`   | Edge case: zero need     | 🔴 Add    |
| `test_emergency_boost`     | Emergency priority boost | 🔴 Add    |

#### 1.4 Notifications Service (`test_notifications.py`) - NEW

| Test Case                     | Description           | Priority |
| ----------------------------- | --------------------- | -------- |
| `test_notify_user`            | Basic notification    | 🔴 Add   |
| `test_donation_available`     | Donation notification | 🔴 Add   |
| `test_claim_approved`         | Claim notification    | 🔴 Add   |
| `test_emergency_notification` | Emergency alert       | 🔴 Add   |

#### 1.5 Analytics Service (`test_analytics.py`) - NEW

| Test Case                  | Description        | Priority |
| -------------------------- | ------------------ | -------- |
| `test_impact_metrics`      | Impact calculation | 🔴 Add   |
| `test_trends`              | Trends aggregation | 🔴 Add   |
| `test_donor_analytics`     | Donor stats        | 🔴 Add   |
| `test_recipient_analytics` | Recipient stats    | 🔴 Add   |

---

### Level 2: Integration Tests (Backend API)

**Target**: All API endpoints tested with database

#### 2.1 Auth API (`test_auth_api.py`)

| Endpoint                            | Test Case            | Priority |
| ----------------------------------- | -------------------- | -------- |
| `POST /api/auth/register/donor`     | Register donor       | 🔴 Add   |
| `POST /api/auth/register/recipient` | Register recipient   | 🔴 Add   |
| `POST /api/auth/login`              | Login success/fail   | 🔴 Add   |
| `POST /api/auth/logout`             | Logout clears cookie | 🔴 Add   |
| `GET /api/auth/me`                  | Get current user     | 🔴 Add   |

#### 2.2 Donations API (`test_donations_api.py`)

| Endpoint                            | Test Case              | Priority |
| ----------------------------------- | ---------------------- | -------- |
| `POST /api/donations`               | Create donation        | 🔴 Add   |
| `GET /api/donations`                | List donations         | 🔴 Add   |
| `GET /api/donations/active`         | List active donations  | 🔴 Add   |
| `GET /api/donations/transit`        | List transit donations | 🔴 Add   |
| `POST /api/donations/{id}/claim`    | Claim donation         | 🔴 Add   |
| `POST /api/donations/{id}/arrived`  | Confirm arrived        | 🔴 Add   |
| `POST /api/donations/{id}/complete` | Complete donation      | 🔴 Add   |

#### 2.3 Recipient API (`test_recipient_api.py`)

| Endpoint                        | Test Case               | Priority |
| ------------------------------- | ----------------------- | -------- |
| `GET /api/recipient/akg`        | Get AKG (auth required) | 🔴 Add   |
| `POST /api/recipient/emergency` | Toggle emergency        | 🔴 Add   |

#### 2.4 Reviews API (`test_reviews_api.py`)

| Endpoint                       | Test Case                 | Priority |
| ------------------------------ | ------------------------- | -------- |
| `POST /api/reviews`            | Create review (validated) | 🔴 Add   |
| `GET /api/donors/{id}/reviews` | Get donor reviews         | 🔴 Add   |

#### 2.5 Notifications API (`test_notifications_api.py`)

| Endpoint                            | Test Case                 | Priority |
| ----------------------------------- | ------------------------- | -------- |
| `GET /api/notifications`            | List notifications (auth) | 🔴 Add   |
| `POST /api/notifications/{id}/read` | Mark as read              | 🔴 Add   |

#### 2.6 Analytics API (`test_analytics_api.py`)

| Endpoint                            | Test Case           | Priority |
| ----------------------------------- | ------------------- | -------- |
| `GET /api/analytics/impact`         | Impact metrics      | 🔴 Add   |
| `GET /api/analytics/trends`         | Donation trends     | 🔴 Add   |
| `GET /api/analytics/donor/{id}`     | Donor analytics     | 🔴 Add   |
| `GET /api/analytics/recipient/{id}` | Recipient analytics | 🔴 Add   |

#### 2.7 Health API (`test_health_api.py`)

| Endpoint               | Test Case       | Priority |
| ---------------------- | --------------- | -------- |
| `GET /health`          | Basic health    | 🔴 Add   |
| `GET /health/detailed` | Detailed health | 🔴 Add   |
| `GET /health/ready`    | Readiness probe | 🔴 Add   |

---

### Level 3: E2E Tests (Playwright)

**Target**: All critical user flows

#### 3.1 Authentication Flow (`auth.spec.ts`)

| Test Case             | Description                  | Priority |
| --------------------- | ---------------------------- | -------- |
| Register as donor     | Complete registration flow   | 🔴 Add   |
| Register as recipient | Complete registration flow   | 🔴 Add   |
| Login donor           | Login redirects to dashboard | 🔴 Add   |
| Login recipient       | Login redirects to dashboard | 🔴 Add   |
| Login admin           | Login redirects to admin     | 🔴 Add   |
| Logout                | Clears session               | 🔴 Add   |
| Forgot password       | Reset flow                   | 🔴 Add   |

#### 3.2 Donor Flow (`donor.spec.ts`)

| Test Case         | Description      | Priority |
| ----------------- | ---------------- | -------- |
| View dashboard    | Dashboard loads  | 🔴 Add   |
| Create donation   | Form submission  | 🔴 Add   |
| View donations    | List donations   | 🔴 Add   |
| Complete donation | Mark as complete | 🔴 Add   |
| View analytics    | Analytics page   | 🔴 Add   |
| View profile      | Profile modal    | 🔴 Add   |

#### 3.3 Recipient Flow (`recipient.spec.ts`)

| Test Case             | Description        | Priority |
| --------------------- | ------------------ | -------- |
| View dashboard        | Dashboard loads    | 🔴 Add   |
| View active donations | List available     | 🔴 Add   |
| Claim donation        | Claim flow         | 🔴 Add   |
| View transit          | Track donation     | 🔴 Add   |
| View history          | Donation history   | 🔴 Add   |
| View AKG              | Nutrition tracking | 🔴 Add   |
| Toggle emergency      | Emergency request  | 🔴 Add   |

#### 3.4 Admin Flow (`admin.spec.ts`)

| Test Case      | Description       | Priority |
| -------------- | ----------------- | -------- |
| View dashboard | Admin dashboard   | 🔴 Add   |
| Verify users   | User verification | 🔴 Add   |
| Approve claims | Claim approval    | 🔴 Add   |
| View analytics | Admin analytics   | 🔴 Add   |
| Delete users   | User deletion     | 🔴 Add   |

#### 3.5 PWA Flow (`pwa.spec.ts`)

| Test Case      | Description          | Priority |
| -------------- | -------------------- | -------- |
| Install prompt | Shows install button | 🔴 Add   |
| Offline mode   | Basic offline        | 🔴 Add   |
| Service worker | SW registered        | 🔴 Add   |

---

### Level 4: Performance & Security Tests

**Target**: No performance regression, no security vulnerabilities

#### 4.1 Performance Tests (`performance.spec.ts`)

| Test Case         | Description     | Priority |
| ----------------- | --------------- | -------- |
| Landing page load | < 3s load time  | 🔴 Add   |
| API response time | < 200ms p95     | 🔴 Add   |
| Bundle size       | < 300KB gzipped | 🔴 Add   |

#### 4.2 Security Tests (`security.spec.ts`)

| Test Case         | Description                | Priority |
| ----------------- | -------------------------- | -------- |
| CSRF protection   | State-changing requests    | 🔴 Add   |
| Rate limiting     | 429 on excess              | 🔴 Add   |
| Auth required     | 401 on protected endpoints | 🔴 Add   |
| Role-based access | 403 on unauthorized        | 🔴 Add   |

---

## Test Data Setup

### Fixtures (`tests/fixtures/`)

```
tests/fixtures/
├── users.json          # Test users (donor, recipient, admin)
├── donations.json      # Test donations
├── profiles.json       # Donor/recipient profiles
└── seed.py             # Database seeder
```

### Test Users

| Role      | Email              | Password | Status   |
| --------- | ------------------ | -------- | -------- |
| Donor     | donor@test.com     | test123  | verified |
| Recipient | recipient@test.com | test123  | verified |
| Admin     | admin@test.com     | test123  | verified |
| Pending   | pending@test.com   | test123  | pending  |

---

## Implementation Order

### Phase 1: Backend Unit Tests (Day 1)

1. `test_cache.py` - Cache service
2. `test_topsis.py` - Enhance TOPSIS tests
3. `test_notifications.py` - Notification service
4. `test_analytics.py` - Analytics calculations

### Phase 2: Backend Integration Tests (Day 2)

1. `conftest.py` - Fix test database setup
2. `test_auth_api.py` - Auth endpoints
3. `test_donations_api.py` - Donation endpoints
4. `test_recipient_api.py` - Recipient endpoints

### Phase 3: Backend Integration Tests (Day 3)

1. `test_reviews_api.py` - Review endpoints
2. `test_notifications_api.py` - Notification endpoints
3. `test_analytics_api.py` - Analytics endpoints
4. `test_health_api.py` - Health endpoints

### Phase 4: E2E Tests (Day 4-5)

1. `auth.spec.ts` - Authentication flows
2. `donor.spec.ts` - Donor flows
3. `recipient.spec.ts` - Recipient flows
4. `admin.spec.ts` - Admin flows

### Phase 5: PWA & Performance (Day 6)

1. `pwa.spec.ts` - PWA functionality
2. `performance.spec.ts` - Performance tests
3. `security.spec.ts` - Security tests

---

## Test Commands

### Backend Tests

```bash
# Run all backend tests
.venv/bin/pytest backend/tests/ -v

# Run with coverage
.venv/bin/pytest backend/tests/ -v --cov=backend --cov-report=html

# Run specific test file
.venv/bin/pytest backend/tests/test_cache.py -v

# Run specific test class
.venv/bin/pytest backend/tests/test_auth.py::TestPasswordHashing -v
```

### E2E Tests

```bash
# Run all E2E tests
npm test

# Run specific test file
npx playwright test tests/auth.spec.ts

# Run with UI
npx playwright test --ui

# Run in headed mode
npx playwright test --headed
```

### Coverage Report

```bash
# Generate coverage report
.venv/bin/pytest backend/tests/ --cov=backend --cov-report=html

# Open coverage report
open htmlcov/index.html
```

---

## Success Criteria

| Metric                            | Target | Current |
| --------------------------------- | ------ | ------- |
| Backend unit test coverage        | > 80%  | ~40%    |
| Backend integration test coverage | > 80%  | ~20%    |
| E2E critical flows                | 100%   | ~30%    |
| All tests passing                 | 100%   | ~70%    |
| No critical bugs                  | 0      | Unknown |

---

## Test Environment

### Backend Test Config

- Database: SQLite in-memory (`:memory:`)
- Isolation: Each test gets fresh database
- Fixtures: `conftest.py` provides test session

### E2E Test Config

- Browser: Chromium, Firefox, WebKit
- Base URL: `http://localhost:5173`
- Backend: `http://localhost:3000`
- Timeouts: 30s for navigation, 10s for actions

---

_Plan created by Architect Agent on 2026-07-26_
