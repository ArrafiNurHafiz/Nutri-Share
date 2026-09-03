# PRD NUTRI-SHARE — Testing & Deployment

---

## 13.1 Testing Strategy

### 13.1.1 Unit Tests (Pytest) — 20 tests

| File                   | Tests | Coverage                                                   |
| ---------------------- | ----- | ---------------------------------------------------------- |
| `test_auth.py`         | 7     | bcrypt hash/verify, JWT sign/decode/expired/invalid        |
| `test_gamification.py` | 8     | Badge thresholds (0,1,5,10,20) + structure                 |
| `test_topsis.py`       | 5     | Haversine distance (same, known, equator, antipodal, pole) |

### 13.1.2 Integration / Contract Tests (Pytest + httpx) — 34 tests

| Test Class        | Tests | Coverage                              |
| ----------------- | ----- | ------------------------------------- |
| TestHealth        | 1     | Health endpoint                       |
| TestDashboard     | 2     | Stats + trends                        |
| TestPublic        | 4     | Top donors, map, badges               |
| TestAuth          | 9     | Login, me, register, forgot, logout   |
| TestDonations     | 6     | List, detail, active, create (unauth) |
| TestRecipient     | 2     | AKG + emergency                       |
| TestReviews       | 2     | List reviews                          |
| TestNotifications | 2     | List notif                            |
| TestAdmin         | 4     | Guard (unauthorized)                  |
| TestTopsis        | 2     | Get results                           |
| Test404           | 1     | Unknown route                         |
| TestErrorFormat   | 1     | Error response format                 |

### 13.1.3 Blackbox E2E (Python urllib) — 89 tests

| Section       | Tests  | What it tests                       |
| ------------- | ------ | ----------------------------------- |
| Health        | 2      | Live server check                   |
| Public        | 11     | Stats, trends, donors, map, badges  |
| Auth          | 13     | Login, register, me, forgot, logout |
| Donations     | 8      | List, get, active, transit          |
| Recipient     | 5      | AKG, emergency                      |
| Reviews       | 3      | List reviews                        |
| TOPSIS        | 3      | Results                             |
| Notifications | 3      | List, empty                         |
| Admin Guards  | 6      | 401 unauthorized                    |
| Admin Ops     | 6      | Users, claims, search               |
| Edge Cases    | 9      | 404, 409, 422, invalid IDs          |
| Auth Token    | 6      | Login → cookie → me → logout        |
| **Total**     | **89** | **100% flow coverage**              |

### 13.1.4 Cara Menjalankan

```bash
# Unit + Integration
.venv/bin/pytest backend/tests/ -v

# Per file
.venv/bin/pytest backend/tests/test_auth.py -v

# Blackbox (perlu server running)
.venv/bin/uvicorn backend.main:app --port 3000 &
.venv/bin/python backend/tests/blackbox_test.py
```

### 13.1.5 Total Coverage

| Tipe              | Jumlah  | Status           |
| ----------------- | ------- | ---------------- |
| Unit Tests        | 20      | ✅ 100%          |
| Integration Tests | 34      | ✅ 100%          |
| Blackbox E2E      | 89      | ✅ 100%          |
| **Total**         | **143** | **✅ 100% Pass** |

## 13.2 Deployment

### Development

```bash
# Terminal 1 — Backend
.venv/bin/uvicorn backend.main:app --reload --port 3000

# Terminal 2 — Frontend
cd frontend && npm run dev
```

Akses: http://localhost:5173

### Production

```bash
# 1. Build frontend
cd frontend && npm run build

# 2. Set environment
export ENVIRONMENT=production
export JWT_SECRET="your-strong-secret-min-32-chars"
export ADMIN_SECRET_KEY="your-admin-key"

# 3. Start
.venv/bin/uvicorn backend.main:app --host 0.0.0.0 --port 3000
```

### Environment Variables

| Variable           | Required  | Default              | Description                        |
| ------------------ | --------- | -------------------- | ---------------------------------- |
| `ENVIRONMENT`      | ✅        | `development`        | `production` untuk mode production |
| `JWT_SECRET`       | ✅ (prod) | `dev-secret-...`     | Secret key JWT (≥32 chars)         |
| `ADMIN_SECRET_KEY` | ✅ (prod) | `admin-secret-...`   | Key registrasi admin               |
| `DB_PATH`          | ❌        | `data/nutrishare.db` | Path database                      |
| `PORT`             | ❌        | `3000`               | Port server                        |
| `LOG_LEVEL`        | ❌        | `debug`              | Log level                          |
| `ALLOWED_ORIGINS`  | ❌        | localhost            | CORS origins                       |

### Production Validation

```python
# Server akan FAIL startup jika:
ENVIRONMENT=production AND JWT_SECRET masih default
ENVIRONMENT=production AND ADMIN_SECRET_KEY masih default
```
