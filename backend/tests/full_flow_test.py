#!/usr/bin/env python3
"""Complete end-to-end user flow test.

Tests ALL features without bash escaping issues.
"""
import json
import sys
import urllib.error
import urllib.request

BASE = "http://127.0.0.1:3000"
PASS = 0
FAIL = 0

def req(method, path, data=None, cookies=None):
    url = f"{BASE}{path}"
    body = json.dumps(data).encode() if data else None
    headers = {"Content-Type": "application/json"}
    if cookies:
        headers["Cookie"] = cookies
    r = urllib.request.Request(url, data=body, method=method, headers=headers)
    try:
        with urllib.request.urlopen(r, timeout=10) as resp:
            return resp.status, json.loads(resp.read()), resp.headers.get("Set-Cookie", "")
    except urllib.error.HTTPError as e:
        try:
            return e.code, json.loads(e.read()), e.headers.get("Set-Cookie", "")
        except:
            return e.code, {}, ""
    except Exception as e:
        return 0, {"error": str(e)}, ""

def extract_cookie(set_cookie):
    return set_cookie.split(";")[0] if set_cookie else ""

def check(label, ok):
    global PASS, FAIL
    if ok: PASS += 1
    else: FAIL += 1
    print(f"  {'✅' if ok else '❌'} {label}")

# === FLOW 1: REGISTER DONOR ===
print("\n1️⃣  REGISTER DONOR")
s, d, _ = req("POST", "/api/auth/register/donor", {
    "business_name": "Warung Sehat", "email": "warung@demo.com",
    "password": "test123", "business_type": "restoran",
    "address": "Jl. Sehat 1", "latitude": "-6.2", "longitude": "106.8", "phone": "081111"
})
check("Register donor", s == 200 and "message" in d)

# === FLOW 2: REGISTER RECIPIENT ===
print("\n2️⃣  REGISTER RECIPIENT")
s, d, _ = req("POST", "/api/auth/register/recipient", {
    "institution_name": "Panti Harapan", "email": "panti@demo.org",
    "password": "test123", "institution_type": "panti_asuhan",
    "address": "Jl. Harapan 1", "latitude": "-6.3", "longitude": "106.7",
    "phone": "082222", "resident_count": "30", "age_range": "5-12",
    "health_condition": "Sehat", "daily_protein_need": "1500",
    "daily_calorie_need": "45000", "daily_iron_need": "250",
    "daily_vitamin_c_need": "1800"
})
check("Register recipient", s == 200 and "message" in d)

# === FLOW 3: ADMIN LOGIN + VERIFY ALL ===
print("\n3️⃣  ADMIN VERIFY USERS")
s, d, ck = req("POST", "/api/auth/login", {"email": "admin@test.com", "password": "admin123"})
admin_cookie = extract_cookie(ck)
check("Admin login", s == 200 and admin_cookie != "")

s, d, _ = req("GET", "/api/admin/users", cookies=admin_cookie)
check("Admin list users", s == 200)
for role in ["donors", "recipients"]:
    for u in d.get(role, []):
        if u.get("status") == "pending":
            uid = u["id"]
            s2, _, _ = req("POST", f"/api/admin/users/{uid}/verify", {"urgency_score": "3"}, cookies=admin_cookie)
            check(f"Verify {u.get('business_name') or u.get('institution_name', '')} (id={uid})", s2 == 200)

# === FLOW 4: DONOR LOGIN + CREATE DONATION ===
print("\n4️⃣  DONOR CREATE DONATION")
s, d, ck = req("POST", "/api/auth/login", {"email": "warung@demo.com", "password": "test123"})
donor_cookie = extract_cookie(ck)
check("Donor login", s == 200 and donor_cookie != "")

s, d, _ = req("POST", "/api/donations", {
    "food_name": "Nasi Kotak Sehat", "food_type": "makanan_berat",
    "portion_count": "20", "protein_per_portion": "8", "calorie_per_portion": "400",
    "hours_valid": "24", "pickup_latitude": -6.2, "pickup_longitude": 106.8
}, cookies=donor_cookie)
check("Create donation", s == 200 and "message" in d)

# === FLOW 5: LIST DONATIONS ===
print("\n5️⃣  LIST & VIEW DONATIONS")
s, d, _ = req("GET", "/api/donations")
check("List donations", s == 200 and isinstance(d, list))
if d:
    don_id = d[0]["id"]
    s2, d2, _ = req("GET", f"/api/donations/{don_id}")
    check(f"View donation #{don_id}", s2 == 200 and "food_name" in d2)

# Active
s, d, _ = req("GET", "/api/donations/active?recipient_id=10")
check("Active donations", s == 200 and isinstance(d, list))

# === FLOW 6: RECIPIENT LOGIN + CLAIM ===
print("\n6️⃣  RECIPIENT CLAIM DONATION")
s, d, ck = req("POST", "/api/auth/login", {"email": "panti@demo.org", "password": "test123"})
recip_cookie = extract_cookie(ck)
check("Recipient login", s == 200 and recip_cookie != "")

s, active_dons, _ = req("GET", "/api/donations/active", cookies=recip_cookie)
if active_dons and len(active_dons) > 0:
    don_id = active_dons[-1]["id"]
    s2, _, _ = req("POST", f"/api/donations/{don_id}/claim", cookies=recip_cookie)
    check(f"Claim donation #{don_id}", s2 == 200)

# === FLOW 7: ADMIN APPROVE CLAIM ===
print("\n7️⃣  ADMIN APPROVE CLAIM")
s, claims, _ = req("GET", "/api/admin/claims", cookies=admin_cookie)
check("List claims", s == 200 and isinstance(claims, list))
if claims:
    for c in claims:
        if c.get("status") == "pending":
            s2, _, _ = req("POST", f"/api/admin/claims/{c['id']}/approve", cookies=admin_cookie)
            check(f"Approve claim #{c['id']}", s2 == 200)

# === FLOW 8: DONOR CONFIRM ARRIVED + COMPLETE ===
print("\n8️⃣  DONOR COMPLETE DONATION")
s, transits, _ = req("GET", "/api/donations/transit", cookies=donor_cookie)
check("List transit donations", s == 200)
if transits and len(transits) > 0:
    tid = transits[0]["id"]
    s2, _, _ = req("POST", f"/api/donations/{tid}/arrived", cookies=donor_cookie)
    check(f"Confirm arrived #{tid}", s2 == 200)
    s3, _, _ = req("POST", f"/api/donations/{tid}/complete", cookies=donor_cookie)
    check(f"Complete donation #{tid}", s3 == 200)

# === FLOW 9: REVIEW ===
print("\n9️⃣  RECIPIENT REVIEW")
s, d, _ = req("GET", "/api/donors/6/reviews")
check("Donor reviews", s == 200)

# === FLOW 10: ADMIN SEARCH ===
print("\n🔟  ADMIN SEARCH")
s, d, _ = req("GET", "/api/admin/search?q=warung", cookies=admin_cookie)
check("Search 'warung'", s == 200)

# === FLOW 11: FORGOT/RESET PASSWORD ===
print("\n1️⃣1️⃣  FORGOT/RESET PASSWORD")
s, d, _ = req("POST", "/api/auth/forgot-password", {"email": "warung@demo.com"})
check("Forgot password", s == 200)
reset_token = d.get("resetToken", "")
if reset_token:
    s2, d2, _ = req("POST", "/api/auth/reset-password", {"token": reset_token, "password": "newpass123"})
    check("Reset password", s2 == 200)
    s3, d3, _ = req("POST", "/api/auth/login", {"email": "warung@demo.com", "password": "newpass123"})
    check("Login with new password", s3 == 200)

# === FLOW 12: DASHBOARD ===
print("\n1️⃣2️⃣  DASHBOARD & STATS")
s, d, _ = req("GET", "/api/dashboard/stats")
check("Dashboard stats", s == 200 and all(k in d for k in ["donors", "recipients", "active_donations"]))

s, d, _ = req("GET", "/api/dashboard/trends")
check("Dashboard trends", s == 200 and "weekly" in d)

# === FLOW 13: DELETE USER (ADMIN) ===
print("\n1️⃣3️⃣  ADMIN DELETE USER")
# Find test users to clean up
s, users, _ = req("GET", "/api/admin/users", cookies=admin_cookie)
for u in users.get("donors", []) + users.get("recipients", []):
    if "blackbox" in u.get("email", "") or "bb_" in u.get("email", ""):
        s2, _, _ = req("DELETE", f"/api/admin/users/{u['id']}", cookies=admin_cookie)
        check(f"Cleanup {u['email']}", s2 == 200)

# === SUMMARY ===
print(f"\n{'='*50}")
total = PASS + FAIL
print(f"  TOTAL: {PASS}/{total} PASS, {FAIL} FAIL ({PASS/total*100:.1f}%)")
print(f"{'='*50}")
sys.exit(0 if FAIL == 0 else 1)
