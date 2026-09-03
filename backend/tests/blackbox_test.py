#!/usr/bin/env python3
"""Blackbox / End-to-End API testing for NutriShare Python backend.

Tests real user flows against a running server instance.
No internal imports — pure HTTP-based testing.
"""
import json
import sys
import time
import urllib.error
import urllib.request

BASE = "http://127.0.0.1:3000"
PASS = 0
FAIL = 0


def log(msg: str, ok: bool = True):
    global PASS, FAIL
    if ok:
        PASS += 1
        print(f"  ✅ {msg}")
    else:
        FAIL += 1
        print(f"  ❌ {msg}")


def request(
    method: str,
    path: str,
    data: dict | None = None,
    cookies: str | None = None,
    headers: dict | None = None,
) -> tuple[int, dict, str]:
    """Make HTTP request and return (status, body_json, set_cookie)."""
    url = f"{BASE}{path}"
    body = json.dumps(data).encode() if data else None
    req_headers = {
        "Content-Type": "application/json",
        **({} if not headers else headers),
    }
    if cookies:
        req_headers["Cookie"] = cookies

    req = urllib.request.Request(
        url,
        data=body,
        method=method,
        headers=req_headers,
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            status = resp.status
            body_data = json.loads(resp.read().decode())
            set_cookie = resp.headers.get("Set-Cookie", "")
            return status, body_data, set_cookie
    except urllib.error.HTTPError as e:
        status = e.code
        body_data = json.loads(e.read().decode()) if e.fp else {}
        set_cookie = e.headers.get("Set-Cookie", "") if hasattr(e, "headers") else ""
        return status, body_data, set_cookie
    except Exception as e:
        return 0, {"message": str(e)}, ""


def extract_cookie(set_cookie: str) -> str:
    """Extract Cookie header value from Set-Cookie."""
    if not set_cookie:
        return ""
    parts = set_cookie.split(";")[0]
    return parts


# ============================================================
# TEST SUITE
# ============================================================
print("\n" + "=" * 60)
print("  NUTRISHARE BLACKBOX TESTING")
print("  Target:", BASE)
print("=" * 60)

# --- Health ---
print("\n📡 HEALTH CHECK")
status, data, _ = request("GET", "/health")
log(f"GET /health → {status}", status == 200)
if status == 200:
    log(f'  status: {data.get("status")}', data.get("status") == "ok")

# --- Public Endpoints ---
print("\n🌍 PUBLIC ENDPOINTS")

status, data, _ = request("GET", "/api/dashboard/stats")
log(f"GET /api/dashboard/stats → {status}", status == 200)
if status == 200:
    log(f"  donors={data.get('donors')} recipients={data.get('recipients')}", isinstance(data.get("donors"), int))
    log(f"  active={data.get('active_donations')} completed={data.get('completed_donations')}", isinstance(data.get("completed_donations"), int))

status, data, _ = request("GET", "/api/dashboard/trends")
log(f"GET /api/dashboard/trends → {status}", status == 200)
if status == 200:
    log(f"  weekly ({len(data.get('weekly', []))} days)", len(data.get("weekly", [])) == 7)
    log(f"  foodTypes ({len(data.get('foodTypes', []))} types)", isinstance(data.get("foodTypes"), list))
    log(f"  totalPortions={data.get('totalPortions')}", isinstance(data.get("totalPortions"), (int, float)))

status, data, _ = request("GET", "/api/public/top-donors")
log(f"GET /api/public/top-donors → {status}", status == 200)
if status == 200 and isinstance(data, list) and len(data) > 0:
    donor = data[0]
    log(f"  top donor: {donor.get('business_name')} ({donor.get('total_donations')} donasi)", True)
    log(f"  rating: {donor.get('rating')}", isinstance(donor.get("rating"), str))

status, data, _ = request("GET", "/api/map/data")
log(f"GET /api/map/data → {status}", status == 200)
if status == 200:
    log(f"  donors: {len(data.get('donors', []))}, recipients: {len(data.get('recipients', []))}, active: {len(data.get('activeDonations', []))}", True)

status, data, _ = request("GET", "/api/donors/6/badges")
log(f"GET /api/donors/6/badges → {status}", status == 200)
if status == 200:
    log(f"  badges: {len(data)}", isinstance(data, list))
    if data:
        log(f"  first: {data[0].get('name')} {data[0].get('icon')}", "name" in data[0] and "icon" in data[0])

# --- Auth & Login Flow ---
print("\n🔐 AUTH FLOW")

# Login with wrong credentials
status, data, _ = request("POST", "/api/auth/login", {"email": "wrong@test.com", "password": "wrong"})
log(f"POST /api/auth/login (wrong) → {status}", status == 401)
if status == 401:
    log(f'  message: {data.get("message")}', "message" in data)

# Login with existing admin
ADMIN_EMAIL = "admin@test.com"
ADMIN_PASS = "admin123"
status, data, cookies = request("POST", "/api/auth/login", {"email": ADMIN_EMAIL, "password": ADMIN_PASS})
log(f"POST /api/auth/login (admin) → {status}", status == 200)
admin_cookie = extract_cookie(cookies)
if status == 200:
    log(f"  role: {data.get('user', {}).get('role')}", data.get("user", {}).get("role") == "admin")
    log(f"  cookie received: {len(admin_cookie) > 0}", bool(admin_cookie))

# Login as recipient
RECIPIENT_ID = 7
status, data, cookies = request("POST", "/api/auth/login", {"email": "panti@test.com", "password": "test123"})
if status != 200:
    # Try creating one
    print("  ⚠️ Recipient login failed, checking register flow instead...")
    status, data, _ = request("POST", "/api/auth/register/recipient", {
        "institution_name": "Panti Test Blackbox",
        "email": f"panti_bb_{int(time.time())}@test.com",
        "password": "test123",
        "institution_type": "panti_asuhan",
        "address": "Jl. Test 123",
        "latitude": "-6.2",
        "longitude": "106.8",
        "phone": "08123456789",
        "resident_count": "20",
        "age_range": "5-12",
        "health_condition": "Sehat",
        "daily_protein_need": "1500",
        "daily_calorie_need": "50000",
        "daily_iron_need": "300",
        "daily_vitamin_c_need": "2000",
    })
    log(f"POST /api/auth/register/recipient → {status}", status == 200)
    RECIPIENT_ID = None  # not verified yet

# Login as donor
DONOR_EMAIL = "donor@test.com"
DONOR_PASS = "donor123"
status, data, cookies = request("POST", "/api/auth/login", {"email": DONOR_EMAIL, "password": DONOR_PASS})
log(f"POST /api/auth/login (donor) → {status}", status in (200, 401))
donor_cookie = ""
if status == 200:
    donor_cookie = extract_cookie(cookies)
    log(f"  donor login OK, cookie: {bool(donor_cookie)}", bool(donor_cookie))
else:
    print("  ⚠️ Donor login failed, trying to register...")
    # Try registering
    DONOR_EMAIL = f"donor_bb_{int(time.time())}@test.com"
    status, data, _ = request("POST", "/api/auth/register/donor", {
        "business_name": "Donor Blackbox",
        "email": DONOR_EMAIL,
        "password": "test123",
        "business_type": "kafe",
        "address": "Jl. Test 456",
        "latitude": "-6.2",
        "longitude": "106.8",
        "phone": "08123456788",
    })
    log(f"POST /api/auth/register/donor → {status}", status == 200)

# GET /api/auth/me with cookie
status, data, _ = request("GET", "/api/auth/me", cookies=admin_cookie)
log(f"GET /api/auth/me (with cookie) → {status}", status == 200)
if status == 200:
    log(f'  user: {data.get("user", {}).get("name")} ({data.get("user", {}).get("role")})', True)

# GET /api/auth/me without cookie
status, data, _ = request("GET", "/api/auth/me")
log(f"GET /api/auth/me (no cookie) → {status}", status == 401)
if status == 401:
    log(f'  message: {data.get("message")}', data.get("message") == "Belum login")

# Forgot password
status, data, _ = request("POST", "/api/auth/forgot-password", {"email": ADMIN_EMAIL})
log(f"POST /api/auth/forgot-password → {status}", status == 200)
if status == 200:
    log(f'  message: {data.get("message")}', "message" in data)

# Forgot password not found
status, data, _ = request("POST", "/api/auth/forgot-password", {"email": "ghost@nowhere.com"})
log(f"POST /api/auth/forgot-password (not found) → {status}", status == 404)

# Logout
status, data, _ = request("POST", "/api/auth/logout")
log(f"POST /api/auth/logout → {status}", status == 200)

# --- Donation Flow ---
print("\n🍽️ DONATION FLOW")

# List all donations
status, data, _ = request("GET", "/api/donations")
log(f"GET /api/donations → {status}", status == 200)
if status == 200:
    log(f"  total: {len(data)} donations", isinstance(data, list))

# Get specific donation (use ID from list)
if isinstance(data, list) and data:
    don_id = data[0]["id"]
    status2, data2, _ = request("GET", f"/api/donations/{don_id}")
    log(f"GET /api/donations/{don_id} → {status2}", status2 == 200)
    if status2 == 200:
        log(f'  food: {data2.get("food_name")}', "food_name" in data2)
        log(f'  donor: {data2.get("donor_name")}', "donor_name" in data2)
        log(f'  status: {data2.get("status")}', "status" in data2)

# Get donation not found
status, data, _ = request("GET", "/api/donations/99999")
log(f"GET /api/donations/99999 → {status}", status == 404)
if status == 404:
    log(f'  error: {data.get("message")}', "message" in data)

# Active donations
status, data, _ = request("GET", "/api/donations/active")
log(f"GET /api/donations/active → {status}", status == 200)
if status == 200:
    log(f"  active: {len(data)}", isinstance(data, list))

# Create donation (need auth)
status, data, _ = request("GET", "/api/donations/transit?user_id=6&role=donor")
log(f"GET /api/donations/transit → {status}", status == 401)

# --- Recipient Flow ---
print("\n🏥 RECIPIENT FLOW")

# AKG without user_id
status, data, _ = request("GET", "/api/recipient/akg")
log(f"GET /api/recipient/akg (no user_id) → {status}", status == 400)

# AKG with valid user_id
status, data, _ = request("GET", "/api/recipient/akg?user_id=7")
log(f"GET /api/recipient/akg?user_id=7 → {status}", status == 200)
if status == 200:
    log(f"  date: {data.get('date')}", "date" in data)
    log(f"  overall_percentage: {data.get('overall_percentage')}%", isinstance(data.get("overall_percentage"), (int, float)))
    log(f"  donations_today: {len(data.get('donations_today', []))}", isinstance(data.get("donations_today"), list))
    needs = data.get("daily_needs", {})
    log(f"  needs: protein={needs.get('protein')} cal={needs.get('calories')} fe={needs.get('iron')} vitc={needs.get('vitamin_c')}", all(k in needs for k in ["protein", "calories"]))

# Emergency endpoint
status, data, _ = request("POST", "/api/recipient/emergency", {"user_id": 7})
log(f"POST /api/recipient/emergency → {status}", status in (200, 400))
if status == 200:
    log(f'  emergency: {data.get("emergency")}', "emergency" in data)

# --- Reviews ---
print("\n⭐ REVIEWS")

status, data, _ = request("GET", "/api/donors/6/reviews")
log(f"GET /api/donors/6/reviews → {status}", status == 200)
if status == 200:
    log(f"  reviews: {len(data)}", isinstance(data, list))

status, data, _ = request("GET", "/api/donors/99999/reviews")
log(f"GET /api/donors/99999/reviews → {status}", status == 200)
if status == 200:
    log(f"  empty: {len(data)}", len(data) == 0)

# --- TOPSIS ---
print("\n📊 TOPSIS")

status, data, _ = request("GET", "/api/topsis/2")
log(f"GET /api/topsis/2 → {status}", status == 200)
if status == 200:
    log(f"  results: {len(data.get('results', []))}", isinstance(data.get("results"), list))

status, data, _ = request("GET", "/api/topsis/99999")
log(f"GET /api/topsis/99999 → {status}", status == 200)
if status == 200:
    log(f"  empty: {len(data.get('results', []))}", len(data.get("results")) == 0)

# --- Notifications ---
print("\n🔔 NOTIFICATIONS")

status, data, _ = request("GET", "/api/notifications?user_id=5")
log(f"GET /api/notifications?user_id=5 → {status}", status == 200)
if status == 200:
    log(f"  count: {len(data)}", isinstance(data, list))

status, data, _ = request("GET", "/api/notifications")
log(f"GET /api/notifications (no user_id) → {status}", status == 200)
if status == 200:
    log(f"  empty: {len(data)}", len(data) == 0)

# --- Admin Auth Guard ---
print("\n🛡️ ADMIN AUTH GUARDS")

protected_routes = [
    ("GET", "/api/admin/users"),
    ("POST", "/api/admin/topsis/run"),
    ("GET", "/api/admin/claims"),
]
for method, path in protected_routes:
    status, data, _ = request(method, path)
    ok = status == 401
    log(f"{method} {path} → {status}", ok)
    if ok and "message" in data:
        log(f'  message: {data.get("message")}', True)

# --- Admin with Auth ---
print("\n👑 ADMIN OPERATIONS")

if admin_cookie:
    # List users
    status, data, _ = request("GET", "/api/admin/users", cookies=admin_cookie)
    log(f"GET /api/admin/users → {status}", status == 200)
    if status == 200:
        log(f"  donors: {len(data.get('donors', []))}, recipients: {len(data.get('recipients', []))}", True)

    # List claims
    status, data, _ = request("GET", "/api/admin/claims", cookies=admin_cookie)
    log(f"GET /api/admin/claims → {status}", status == 200)
    if status == 200:
        log(f"  claims: {len(data)}", isinstance(data, list))

    # Search (min length)
    status, data, _ = request("GET", "/api/admin/search?q=a", cookies=admin_cookie)
    log(f"GET /api/admin/search?q=a → {status}", status == 200)
    if status == 200:
        log("  empty search (q too short)", data.get("donors") == [] and data.get("recipients") == [])

# --- Edge Cases ---
print("\n⚡ EDGE CASES")

# Non-existent endpoint
status, data, _ = request("GET", "/api/this-does-not-exist")
log(f"GET /api/this-does-not-exist → {status}", status == 404)
if status == 404:
    log(f'  error format: {data.get("message")}', "message" in data)

# Register with duplicate email
status, data, _ = request("POST", "/api/auth/register/donor", {
    "business_name": "Test",
    "email": ADMIN_EMAIL,
    "password": "test123",
    "business_type": "kafe",
    "address": "Test",
    "latitude": "-6.2",
    "longitude": "106.8",
    "phone": "08123",
})
log(f"POST register duplicate → {status}", status == 409)
if status == 409:
    log(f'  message: {data.get("message")}', data.get("message") == "Email sudah terdaftar")

# Invalid login (missing fields)
status, data, _ = request("POST", "/api/auth/login", {})
log(f"POST /api/auth/login (empty body) → {status}", status == 422)

# Invalid donation id
status, data, _ = request("POST", "/api/donations/99999/claim", {"recipient_id": 7})
log(f"POST /api/donations/99999/claim (no auth) → {status}", status == 401)

# Error format verification
status, data, _ = request("GET", "/api/donations/99999")
if status == 404:
    log(f'  error format: {{\\"message\\": \\"{data.get("message")}\\"}}', isinstance(data.get("message"), str))

# --- Auth Token Verification ---
print("\n🎟️ AUTH TOKEN FLOW")

# Simulate login flow end-to-end
status, data, cookies = request("POST", "/api/auth/login", {"email": ADMIN_EMAIL, "password": ADMIN_PASS})
cookie = extract_cookie(cookies)
log(f"Login + cookie: {bool(cookie)}", bool(cookie))

if cookie:
    # Use cookie for auth/me
    status, data, _ = request("GET", "/api/auth/me", cookies=cookie)
    log(f"auth/me with cookie → {status}", status == 200)
    if status == 200:
        log(f"  authenticated as: {data.get('user', {}).get('name')}", True)

    # Use cookie for admin endpoints
    status, data, _ = request("GET", "/api/admin/users", cookies=cookie)
    log(f"admin/users with cookie → {status}", status == 200)

# --- Logout + Expired ---
print("\n🚪 LOGOUT")

status, data, _ = request("POST", "/api/auth/logout")
log(f"Logout → {status}", status == 200)

status, data, _ = request("GET", "/api/auth/me")
log(f"auth/me after logout → {status}", status == 401)

# ============================================================
# SUMMARY
# ============================================================
print("\n" + "=" * 60)
print("  RESULTS")
print("=" * 60)
total = PASS + FAIL
print(f"  ✅ PASS: {PASS}/{total}")
print(f"  ❌ FAIL: {FAIL}/{total}")
print(f"  📊 Rate: {PASS/total*100:.1f}%")
print("=" * 60)

sys.exit(0 if FAIL == 0 else 1)
