# PRD NUTRI-SHARE — Auth & Keamanan

---

## 7.1 Skema Autentikasi

### 7.1.1 JWT Token

**Algoritma:** HS256 (HMAC-SHA256)

**Payload:**

```json
{
  "id": 8,
  "email": "admin@test.com",
  "role": "admin",
  "name": "Admin Test",
  "status": "verified",
  "exp": 1783926909
}
```

**Signing Key:** `JWT_SECRET` dari environment variable

**Expiry:** 7 hari (604.800 detik)

### 7.1.2 Cookie Config

| Parameter | Value                |
| --------- | -------------------- |
| Name      | `nutrishare_token`   |
| HttpOnly  | ✅ true              |
| Secure    | ✅ (production only) |
| SameSite  | Lax                  |
| MaxAge    | 604800 (7 hari)      |
| Path      | `/`                  |

### 7.1.3 Flow Login

```
Client                      Server
  │                           │
  ├─ POST /api/auth/login ──► │
  │   {email, password}       │
  │                           ├── SELECT user WHERE email = ?
  │                           ├── bcrypt.verify(password, hash)
  │                           ├── Cek status (verified?)
  │                           ├── JWT.sign({id, email, role, name, status})
  │                           ├── Set-Cookie: nutrishare_token=<JWT>
  │◄── {user, profile} ──────┤
```

## 7.2 Otorisasi

### 7.2.1 Role Hierarchy

```
Admin ─── dapat mengakses semua
Donor ─── hanya fitur donor
Recipient ─── hanya fitur penerima
Public ─── hanya endpoint publik
```

### 7.2.2 Role Access Matrix

| Endpoint Group             | Public | JWT | Donor | Recipient | Admin |
| -------------------------- | ------ | --- | ----- | --------- | ----- |
| GET /health                | ✅     | -   | -     | -         | -     |
| POST /auth/register/*      | ✅     | -   | -     | -         | -     |
| GET /auth/me               | -      | ✅  | ✅    | ✅        | ✅    |
| POST /auth/login           | ✅     | -   | -     | -         | -     |
| GET /dashboard/*           | ✅     | -   | -     | -         | -     |
| GET /public/*              | ✅     | -   | -     | -         | -     |
| GET /donations             | ✅     | -   | -     | -         | -     |
| POST /donations            | -      | -   | ✅    | -         | -     |
| POST /donations/*/claim    | -      | -   | -     | ✅        | -     |
| POST /donations/*/arrived  | -      | -   | -     | ✅        | -     |
| POST /donations/*/complete | -      | -   | ✅    | -         | -     |
| GET /donations/history     | -      | -   | -     | ✅        | -     |
| POST /reviews              | -      | ✅  | ✅    | ✅        | -     |
| ALL /admin/*               | -      | -   | -     | -         | ✅    |

### 7.2.3 Middleware Implementation

**get_current_user():**

```python
async def get_current_user(request, response):
    token = request.cookies.get("nutrishare_token")
    if not token: raise HTTPException(401, "Belum login")
    payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
    # ... query user dari DB ...
    return user
```

**require_role("admin"):**

```python
def require_role(*roles):
    async def checker(current_user = Depends(get_current_user)):
        if current_user.role not in roles:
            raise HTTPException(403, "Tidak punya akses")
        return current_user
    return checker
```

## 7.3 Validasi Input

### 7.3.1 Backend (Pydantic v2)

| Schema                   | Field               | Validasi                                              |
| ------------------------ | ------------------- | ----------------------------------------------------- |
| LoginRequest             | email               | min_length=1                                          |
|                          | password            | min_length=1                                          |
| RegisterDonorRequest     | password            | min_length=6                                          |
|                          | business_type       | regex: `^(hotel\|restoran\|kafe\|katering\|lainnya)$` |
|                          | latitude            | min_length=1                                          |
| RegisterRecipientRequest | 17 fields           | sama + numeric pattern                                |
| CreateDonationRequest    | food_type           | regex enum                                            |
|                          | portion_count       | regex: `^\d+$`                                        |
|                          | protein_per_portion | regex: `^\d+(\.\d+)?$`                                |
| ReviewRequest            | rating              | ge=1, le=5                                            |

### 7.3.2 Frontend (lib/validation.tsx)

| Function         | Validasi                                       |
| ---------------- | ---------------------------------------------- |
| validateEmail    | `!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)`    |
| validatePassword | `password.length < 6`                          |
| validateRequired | `!value.trim()`                                |
| validateNumber   | `isNaN(Number(value)) \|\| Number(value) <= 0` |

### 7.3.3 Error Format

**Backend validation error** → 422:

```json
{ "message": "Field required" }
```

**Frontend display:**

```tsx
{
  errors.field && <p className="text-red-500 text-xs mt-1">{errors.field}</p>;
}
```

## 7.4 Security Headers

| Header                    | Value                             | Diterapkan di                     |
| ------------------------- | --------------------------------- | --------------------------------- |
| X-Content-Type-Options    | `nosniff`                         | middleware `add_security_headers` |
| X-Frame-Options           | `DENY`                            | middleware `add_security_headers` |
| Referrer-Policy           | `strict-origin-when-cross-origin` | middleware `add_security_headers` |
| Strict-Transport-Security | `max-age=31536000`                | middleware, production only       |

## 7.5 Proteksi Keamanan

| Celah                 | Status     | Penanganan                           |
| --------------------- | ---------- | ------------------------------------ |
| SQL Injection         | ✅ Aman    | Parameter binding via SQLModel       |
| XSS (Reflected)       | ✅ Aman    | React auto-escape                    |
| XSS (Stored)          | ✅ Aman    | Tidak ada HTML input                 |
| CSRF                  | ✅ Aman    | httpOnly cookie + SameSite Lax       |
| Hardcoded Secrets     | ⚠️ Default | Dev default, strict production check |
| Path Traversal        | ✅ Aman    | Upload sanitasi filename             |
| CORS                  | ✅ Aman    | Origin validation di production      |
| Sensitive Data        | ✅ Aman    | Password tidak pernah di response    |
| Authentication Bypass | ✅ Aman    | JWT verify tiap request              |
