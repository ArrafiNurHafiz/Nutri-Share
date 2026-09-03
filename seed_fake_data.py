#!/usr/bin/env python3
"""Seed fake data with real-looking Indonesian business/institution names.

Men-generate data donor (hotel/restoran/kafe) dan recipient (panti/lembaga sosial)
lengkap dengan donasi, klaim, review, notifikasi, dan aktivitas.
"""
from __future__ import annotations

import asyncio
import random
import ssl
from datetime import UTC, datetime, timedelta
from urllib.parse import parse_qs, urlencode, urlparse, urlunparse

from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine

NEON_URL = (
    "postgresql+asyncpg://neondb_owner:npg_mzwlgL9VSGW3@"
    "ep-super-dawn-axusxadt.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require"
)

random.seed(42)

# ============================================================
# DATA DONOR - Hotel, Restoran, Cafe, Katering asli Indonesia
# ============================================================
DONOR_DATA = [
    # (user_id, user_name, business_name, business_type, address, phone, lat, lng)
    (23, "Hotel Merapi Merbabu", "Hotel Merapi Merbabu", "hotel",
     "Jl. Merapi No. 1, Sleman, Yogyakarta", "0274-8881111", -7.600, 110.400),
    (39, "Restoran Padang Sederhana", "Restoran Padang Sederhana", "restoran",
     "Jl. Diponegoro No. 50, Yogyakarta", "0274-555222", -7.782, 110.367),
    (40, "Ayam Goreng Suharti", "Ayam Goreng Suharti", "restoran",
     "Jl. Laksda Adisucipto No. 80, Sleman", "0274-442233", -7.780, 110.410),
    (41, "Kafe Nanamia", "Kafe Nanamia", "kafe",
     "Jl. Tirtodipuran No. 20, Yogyakarta", "0274-371234", -7.810, 110.361),
    (42, "Hotel Santika Premier", "Hotel Santika Premier Yogyakarta", "hotel",
     "Jl. Jend. Sudirman No. 19, Yogyakarta", "0274-563333", -7.790, 110.365),
    (43, "Warung Kopi Klotok", "Warung Kopi Klotok", "kafe",
     "Jl. Kaliurang Km 8, Sleman", "0274-897654", -7.695, 110.420),
    (44, "Restoran Bebek Bengil", "Bebek Bengil Ubud Yogyakarta", "restoran",
     "Jl. Parangtritis Km 5, Bantul", "0274-398765", -7.820, 110.350),
    (45, "Katering Sri Rejeki", "Sri Rejeki Catering", "katering",
     "Jl. Imogiri Timur No. 100, Bantul", "0274-654321", -7.840, 110.380),
    (58, "Hotel Grand Inna Malioboro", "Grand Inna Malioboro", "hotel",
     "Jl. Malioboro No. 60, Yogyakarta", "0274-512345", -7.793, 110.365),
    (59, "Restoran Nasi Goreng Jawa", "Nasi Goreng Jawa Mbah Marto", "restoran",
     "Jl. Prawirotaman No. 15, Yogyakarta", "0274-777888", -7.808, 110.358),
]

# ============================================================
# DATA RECIPIENT - Panti Asuhan, Rumah Singgah, Lembaga Sosial
# ============================================================
RECIPIENT_DATA = [
    (3, "Panti Asuhan Kasih Ibu", "Panti Asuhan Kasih Ibu", "panti_asuhan",
     "Jl. Malioboro No. 10, Yogyakarta", "0274-111222", -7.795, 110.366, 60, "Anak 3-17 tahun", "Sehat", 45, 1800, 8, 40),
    (24, "Panti Asuhan Al-Furqon", "Panti Asuhan Al-Furqon", "panti_asuhan",
     "Jl. Bantul No. 25, Bantul", "0274-333444", -7.850, 110.330, 45, "Anak 2-18 tahun", "Sehat", 40, 1700, 7, 35),
    (46, "Rumah Singgah Mawar", "Rumah Singgah Mawar", "rumah_singgah",
     "Jl. Sosial No. 11, Sleman", "0274-555666", -7.720, 110.410, 35, "Anak jalanan 5-15 tahun", "Rata-rata", 35, 1600, 7, 30),
    (47, "Lembaga Sosial Tunas Bangsa", "Lembaga Sosial Tunas Bangsa", "lembaga_sosial",
     "Jl. Sosial No. 12, Yogyakarta", "0274-777888", -7.800, 110.370, 80, "Umum 1-60 tahun", "Bervariasi", 50, 2000, 10, 50),
    (48, "Panti Asuhan Aisyiyah", "Panti Asuhan Aisyiyah", "panti_asuhan",
     "Jl. Sosial No. 13, Bantul", "0274-999000", -7.830, 110.345, 55, "Anak 4-17 tahun", "Sehat", 42, 1750, 8, 38),
    (49, "Rumah Singgah Pelangi", "Rumah Singgah Pelangi", "rumah_singgah",
     "Jl. Sosial No. 14, Sleman", "0274-111333", -7.700, 110.425, 30, "Remaja 12-18 tahun", "Sehat", 40, 1800, 8, 35),
    (50, "Panti Asuhan Bunda Teresa", "Panti Asuhan Bunda Teresa", "panti_asuhan",
     "Jl. Sosial No. 15, Yogyakarta", "0274-222444", -7.785, 110.360, 70, "Anak 1-16 tahun", "Rata-rata", 48, 1900, 9, 45),
    (51, "Lembaga Sosial Harapan Kita", "Lembaga Sosial Harapan Kita", "lembaga_sosial",
     "Jl. Sosial No. 16, Bantul", "0274-333555", -7.860, 110.340, 90, "Umum + lansia", "Bervariasi, lansia", 55, 2100, 12, 55),
    (52, "Panti Asuhan Nurul Iman", "Panti Asuhan Nurul Iman", "panti_asuhan",
     "Jl. Sosial No. 17, Sleman", "0274-444666", -7.710, 110.405, 50, "Anak 3-15 tahun", "Sehat", 40, 1700, 7, 32),
    (53, "Rumah Singgah Bahagia", "Rumah Singgah Bahagia", "rumah_singgah",
     "Jl. Sosial No. 18, Yogyakarta", "0274-555777", -7.800, 110.355, 40, "Anak jalanan 5-17 tahun", "Rata-rata", 38, 1650, 7, 33),
    (54, "Panti Asuhan Mutiara Hati", "Panti Asuhan Mutiara Hati", "panti_asuhan",
     "Jl. Sosial No. 19, Bantul", "0274-666888", -7.870, 110.335, 65, "Anak 2-17 tahun", "Sehat", 44, 1850, 8, 40),
    (55, "Lembaga Sosial Peduli Sesama", "Lembaga Sosial Peduli Sesama", "lembaga_sosial",
     "Jl. Sosial No. 20, Yogyakarta", "0274-777999", -7.790, 110.370, 100, "Dhuafa + lansia", "Kronis ringan", 60, 2200, 13, 58),
    (56, "Panti Asuhan Al-Ikhlas", "Panti Asuhan Al-Ikhlas", "panti_asuhan",
     "Jl. Sosial No. 21, Sleman", "0274-888000", -7.690, 110.415, 35, "Anak 4-16 tahun", "Sehat", 38, 1650, 7, 30),
    (57, "Rumah Singgah Ceria", "Rumah Singgah Ceria", "rumah_singgah",
     "Jl. Sosial No. 22, Bantul", "0274-999222", -7.840, 110.350, 25, "Anak jalanan 6-14 tahun", "Sehat", 35, 1600, 6, 28),
    (60, "Panti Asuhan Harapan Baru", "Panti Asuhan Harapan Baru", "panti_asuhan",
     "Jl. Panti No. 2, Yogyakarta", "0274-123456", -7.805, 110.363, 50, "Anak 3-17 tahun", "Sehat", 42, 1800, 8, 38),
]

# ============================================================
# MAKANAN - Data makanan realistis
# ============================================================
FOOD_ITEMS = [
    ("Nasi Kotak Ayam Gongso", "makanan_berat", 50, 12, 350, 2, 5),
    ("Nasi Kotak Ayam Bakar", "makanan_berat", 60, 15, 380, 3, 8),
    ("Nasi Kuning Lengkap", "makanan_berat", 40, 10, 320, 2, 4),
    ("Nasi Liwet Komplit", "makanan_berat", 35, 14, 360, 3, 6),
    ("Ayam Goreng Tepung 50pcs", "lauk_protein", 50, 25, 300, 3, 0),
    ("Ikan Lele Goreng 50pcs", "lauk_protein", 50, 20, 280, 5, 0),
    ("Telur Bakar Bumbu Bali 100pcs", "lauk_protein", 100, 12, 150, 4, 0),
    ("Tahu & Tempe Bacem 100pcs", "lauk_protein", 100, 8, 120, 6, 0),
    ("Sayur Sop & Sayur Asem", "sayur", 80, 3, 60, 1, 15),
    ("Tumis Kangkung & Capcay", "sayur", 60, 2, 45, 1, 20),
    ("Gado-Gado Lengkap", "sayur", 40, 5, 180, 2, 12),
    ("Urap Sayuran", "sayur", 50, 3, 80, 2, 10),
    ("Pisang Goreng 100pcs", "snack", 100, 2, 120, 1, 0),
    ("Risol & Pastel 100pcs", "snack", 100, 3, 90, 1, 0),
    ("Kue Lapis & Klepon 100pcs", "snack", 100, 2, 80, 1, 0),
    ("Lemper & Lemet 80pcs", "snack", 80, 3, 100, 0, 0),
    ("Es Buah Segar 50 cup", "minuman", 50, 0, 60, 0, 15),
    ("Teh Kotak 100 cup", "minuman", 100, 0, 30, 0, 0),
    ("Susu Kotak UHT 100 cup", "minuman", 100, 7, 150, 0, 25),
    ("Jus Jeruk Segar 60 cup", "minuman", 60, 1, 80, 0, 30),
    ("Nasi Tumpeng Mini", "makanan_berat", 30, 18, 400, 4, 8),
    ("Sop Daging Sapi", "makanan_berat", 40, 20, 350, 5, 10),
    ("Bubur Ayam 50 porsi", "makanan_berat", 50, 10, 280, 2, 0),
    ("Sate Ayam 200 tusuk", "lauk_protein", 200, 15, 200, 3, 0),
]

# Recipient IDs for donations
RECIPIENT_IDS = [d[0] for d in RECIPIENT_DATA]

def make_engine():
    parsed = urlparse(NEON_URL)
    params = parse_qs(parsed.query)
    params.pop("sslmode", None)
    remaining = urlencode(params, doseq=True) if params else ""
    clean = urlunparse(parsed._replace(query=remaining))
    ctx = ssl.create_default_context()
    ctx.check_hostname = True
    ctx.verify_mode = ssl.CERT_REQUIRED
    return create_async_engine(clean, echo=False, connect_args={"statement_cache_size": 0, "ssl": ctx})


async def update_donors(conn):
    print("\n📋 Updating Donors...")
    for (uid, name, biz_name, biz_type, addr, phone, lat, lng) in DONOR_DATA:
        await conn.execute(text("""
            UPDATE users SET name = :name WHERE id = :id
        """), {"name": name, "id": uid})
        await conn.execute(text("""
            UPDATE donor_profiles SET
                business_name = :biz_name,
                business_type = :biz_type,
                address = :address,
                latitude = :lat,
                longitude = :lng,
                phone = :phone
            WHERE user_id = :uid
        """), {"uid": uid, "biz_name": biz_name, "biz_type": biz_type,
               "address": addr, "lat": lat, "lng": lng, "phone": phone})
        print(f"  ✅ {name} ({biz_type})")


async def update_recipients(conn):
    print("\n📋 Updating Recipients...")
    for (uid, name, inst_name, inst_type, addr, phone, lat, lng,
         resident, age_range, health, protein, cal, iron, vit_c) in RECIPIENT_DATA:
        await conn.execute(text("""
            UPDATE users SET name = :name WHERE id = :id
        """), {"name": name, "id": uid})
        await conn.execute(text("""
            UPDATE recipient_profiles SET
                institution_name = :inst_name,
                institution_type = :inst_type,
                address = :address,
                latitude = :lat,
                longitude = :lng,
                phone = :phone,
                resident_count = :resident,
                age_range = :arange,
                health_condition = :health,
                daily_protein_need = :protein,
                daily_calorie_need = :cal,
                daily_iron_need = :iron,
                daily_vitamin_c_need = :vit_c
            WHERE user_id = :uid
        """), {
            "uid": uid, "inst_name": inst_name, "inst_type": inst_type,
            "address": addr, "lat": lat, "lng": lng, "phone": phone,
            "resident": resident, "arange": age_range, "health": health,
            "protein": protein, "cal": cal, "iron": iron, "vit_c": vit_c,
        })
        print(f"  ✅ {name} ({inst_type})")


async def create_donations(conn):
    print("\n📦 Creating Donations...")

    # Clear existing data (donations first, then dependents)
    for table in ["reviews", "claims", "topsis_results", "notifications"]:
        await conn.execute(text(f'DELETE FROM "{table}"'))
    await conn.execute(text('DELETE FROM "donations"'))

    donation_ids = []
    now = datetime.now(UTC)
    donor_ids = [d[0] for d in DONOR_DATA]
    food_batches = list(FOOD_ITEMS)

    # Active donations (currently available)
    print("  Active donations:")
    active_count = 0
    for i in range(12):
        food = food_batches[i % len(food_batches)]
        donor_id = donor_ids[i % len(donor_ids)]
        created = (now - timedelta(hours=random.randint(1, 48))).isoformat()
        valid_until = (now + timedelta(hours=random.randint(4, 24))).isoformat()

        r = await conn.execute(text("""
            INSERT INTO donations
                (donor_id, food_name, food_type, portion_count,
                 protein_per_portion, calorie_per_portion,
                 iron_mg, vitamin_c_mg, photo_url,
                 valid_until, pickup_latitude, pickup_longitude,
                 notes, status, created_at)
            VALUES
                (:donor_id, :food_name, :food_type, :portion,
                 :protein, :calorie, :iron, :vit_c, '',
                 :valid_until, :lat, :lng,
                 :notes, 'active', :created)
            RETURNING id
        """), {
            "donor_id": donor_id,
            "food_name": food[0], "food_type": food[1],
            "portion": food[2], "protein": food[3],
            "calorie": food[4], "iron": food[5], "vit_c": food[6],
            "valid_until": valid_until,
            "lat": DONOR_DATA[donor_ids.index(donor_id)][6] + random.uniform(-0.01, 0.01),
            "lng": DONOR_DATA[donor_ids.index(donor_id)][7] + random.uniform(-0.01, 0.01),
            "notes": f"Hasil masakan hari ini, segar dan higienis. Siap diambil.",
            "created": created,
        })
        did = r.scalar_one()
        donation_ids.append(did)
        active_count += 1
    print(f"    Created {active_count} active donations")

    # Completed donations (with claims, reviews)
    print("  Completed donations:")
    completed_count = 0
    for i in range(8):
        food = food_batches[(i + 12) % len(food_batches)]
        donor_id = donor_ids[i % len(donor_ids)]
        created = (now - timedelta(days=random.randint(3, 14))).isoformat()
        valid_until = (now - timedelta(days=random.randint(1, 3))).isoformat()
        completed_at = (now - timedelta(days=random.randint(0, 2))).isoformat()
        claimed_at = (now - timedelta(days=random.randint(2, 4))).isoformat()

        r = await conn.execute(text("""
            INSERT INTO donations
                (donor_id, food_name, food_type, portion_count,
                 protein_per_portion, calorie_per_portion,
                 iron_mg, vitamin_c_mg, photo_url,
                 valid_until, pickup_latitude, pickup_longitude,
                 notes, status, claimed_by, claimed_at, completed_at, created_at)
            VALUES
                (:donor_id, :food_name, :food_type, :portion,
                 :protein, :calorie, :iron, :vit_c, '',
                 :valid_until, :lat, :lng,
                 :notes, 'completed', :claimed_by, :claimed_at, :completed_at, :created)
            RETURNING id
        """), {
            "donor_id": donor_id,
            "food_name": food[0], "food_type": food[1],
            "portion": food[2], "protein": food[3],
            "calorie": food[4], "iron": food[5], "vit_c": food[6],
            "valid_until": valid_until,
            "lat": DONOR_DATA[donor_ids.index(donor_id)][6] + random.uniform(-0.01, 0.01),
            "lng": DONOR_DATA[donor_ids.index(donor_id)][7] + random.uniform(-0.01, 0.01),
            "notes": "Terima kasih sudah mengambil. Mohon dikonsumsi segera.",
            "claimed_by": RECIPIENT_IDS[i % len(RECIPIENT_IDS)],
            "claimed_at": claimed_at,
            "completed_at": completed_at,
            "created": created,
        })
        did = r.scalar_one()
        donation_ids.append(did)
        completed_count += 1
    print(f"    Created {completed_count} completed donations")

    # Expired donations (past validity)
    print("  Expired donations:")
    expired_count = 0
    for i in range(4):
        food = food_batches[(i + 20) % len(food_batches)]
        donor_id = donor_ids[i % len(donor_ids)]
        created = (now - timedelta(days=random.randint(5, 10))).isoformat()
        valid_until = (now - timedelta(hours=random.randint(1, 48))).isoformat()

        r = await conn.execute(text("""
            INSERT INTO donations
                (donor_id, food_name, food_type, portion_count,
                 protein_per_portion, calorie_per_portion,
                 iron_mg, vitamin_c_mg, photo_url,
                 valid_until, pickup_latitude, pickup_longitude,
                 notes, status, created_at)
            VALUES
                (:donor_id, :food_name, :food_type, :portion,
                 :protein, :calorie, :iron, :vit_c, '',
                 :valid_until, :lat, :lng,
                 :notes, 'expired', :created)
            RETURNING id
        """), {
            "donor_id": donor_id,
            "food_name": food[0], "food_type": food[1],
            "portion": food[2], "protein": food[3],
            "calorie": food[4], "iron": food[5], "vit_c": food[6],
            "valid_until": valid_until,
            "lat": DONOR_DATA[donor_ids.index(donor_id)][6] + random.uniform(-0.01, 0.01),
            "lng": DONOR_DATA[donor_ids.index(donor_id)][7] + random.uniform(-0.01, 0.01),
            "notes": "Maaf sudah tidak tersedia.",
            "created": created,
        })
        did = r.scalar_one()
        donation_ids.append(did)
        expired_count += 1
    print(f"    Created {expired_count} expired donations")

    return donation_ids


async def create_claims(conn, donation_ids):
    """Create claims for completed & some active donations."""
    print("\n📝 Creating Claims...")

    # Get completed donation IDs
    r = await conn.execute(text("SELECT id, donor_id, claimed_by FROM donations WHERE status = 'completed'"))
    completed = r.fetchall()

    count = 0
    for row in completed:
        did, donor_id, recipient_id = row
        created = (datetime.now(UTC) - timedelta(days=random.randint(2, 5))).isoformat()
        reviewed_at = (datetime.now(UTC) - timedelta(days=random.randint(0, 2))).isoformat()

        await conn.execute(text("""
            INSERT INTO claims (donation_id, recipient_id, topsis_rank_at_claim,
                                status, admin_note, created_at, reviewed_at, reviewed_by)
            VALUES (:did, :rid, :rank, 'approved', :note, :created, :reviewed, 5)
        """), {
            "did": did, "rid": recipient_id,
            "rank": random.randint(1, 5),
            "note": "Penyaluran disetujui. Silakan ambil donasi.",
            "created": created, "reviewed": reviewed_at,
        })
        count += 1
    print(f"    Created {count} claims for completed donations")

    # Some claims for active donations (pending approval)
    r = await conn.execute(text("SELECT id, donor_id FROM donations WHERE status = 'active' LIMIT 5"))
    active = r.fetchall()
    for row in active:
        did, donor_id = row
        recipient_id = random.choice(RECIPIENT_IDS)
        created = (datetime.now(UTC) - timedelta(hours=random.randint(1, 12))).isoformat()
        await conn.execute(text("""
            INSERT INTO claims (donation_id, recipient_id, topsis_rank_at_claim,
                                status, created_at)
            VALUES (:did, :rid, :rank, 'pending', :created)
        """), {
            "did": did, "rid": recipient_id,
            "rank": random.randint(1, 5),
            "created": created,
        })
        count += 1
    print(f"    Created additional claims (including pending)")


async def create_topsis_results(conn):
    """Create TOPSIS results for completed donations."""
    print("\n📊 Creating TOPSIS Results...")
    r = await conn.execute(text("SELECT id, donor_id FROM donations WHERE status = 'completed'"))
    completed = r.fetchall()

    count = 0
    now = datetime.now(UTC)
    for row in completed:
        did, donor_id = row
        # Pick 2-3 random recipients per donation
        selected = random.sample(RECIPIENT_IDS, min(3, len(RECIPIENT_IDS)))
        for rank_pos, rid in enumerate(selected, 1):
            c1 = round(random.uniform(0.5, 1.0), 4)
            c2 = round(random.uniform(0.5, 1.0), 4)
            c3 = round(random.uniform(0.5, 1.0), 4)
            c4 = round(random.uniform(0.5, 1.0), 4)
            c5 = round(random.uniform(0.5, 1.0), 4)
            dplus = round(random.uniform(0.1, 0.5), 4)
            dminus = round(random.uniform(0.1, 0.5), 4)
            ci = round(dminus / (dplus + dminus), 4)

            await conn.execute(text("""
                INSERT INTO topsis_results
                    (donation_id, recipient_id, rank_position,
                     raw_c1, raw_c2, raw_c3, raw_c4, raw_c5,
                     weight_c1, weight_c2, weight_c3, weight_c4, weight_c5,
                     d_plus, d_minus, ci_score, calculated_at)
                VALUES
                    (:did, :rid, :rank,
                     :c1, :c2, :c3, :c4, :c5,
                     0.3, 0.2, 0.2, 0.15, 0.15,
                     :dp, :dm, :ci, :calc)
            """), {
                "did": did, "rid": rid, "rank": rank_pos,
                "c1": c1, "c2": c2, "c3": c3, "c4": c4, "c5": c5,
                "dp": dplus, "dm": dminus, "ci": ci,
                "calc": now.isoformat(),
            })
            count += 1
    print(f"    Created {count} TOPSIS results")


async def create_reviews(conn):
    """Create reviews from completed donations."""
    print("\n⭐ Creating Reviews...")
    r = await conn.execute(text("""
        SELECT d.id as donation_id, d.donor_id, c.recipient_id
        FROM donations d
        JOIN claims c ON c.donation_id = d.id
        WHERE d.status = 'completed'
        LIMIT 8
    """))
    completed = r.fetchall()

    review_comments = [
        "Makanan enak dan layak. Terima kasih!",
        "Porsinya cukup untuk anak-anak. Sangat membantu.",
        "Makanan fresh dan higienis. Semoga berkah.",
        "Terima kasih donasinya, sangat bermanfaat.",
        "Anak-anak senang sekali. Kualitas makanan baik.",
        "Pengiriman tepat waktu. Recommended!",
        "Gizi terpenuhi. Terima kasih donatur.",
        "Makanan variatif dan bergizi. Sangat puas.",
    ]

    count = 0
    now = datetime.now(UTC)
    for i, row in enumerate(completed):
        did, donor_id, recipient_id = row
        await conn.execute(text("""
            INSERT INTO reviews (donation_id, donor_id, recipient_id, rating, comment, created_at)
            VALUES (:did, :donor_id, :recipient_id, :rating, :comment, :created)
        """), {
            "did": did, "donor_id": donor_id, "recipient_id": recipient_id,
            "rating": random.randint(4, 5),
            "comment": review_comments[i % len(review_comments)],
            "created": (now - timedelta(days=random.randint(0, 2))).isoformat(),
        })
        count += 1
    print(f"    Created {count} reviews")


async def create_notifications(conn):
    """Create notifications for users."""
    print("\n🔔 Creating Notifications...")
    now = datetime.now(UTC)
    notif_types = ["donation_available", "claim_approved", "verification", "system"]

    donor_msgs = [
        ("Donasi Tersalurkan", "Donasi Anda telah diterima oleh penerima manfaat."),
        ("Donasi Baru", "Donasi baru Anda berhasil dipublikasikan."),
        ("Pengingat", "Donasi Anda akan kedaluwarsa dalam 2 jam. Perpanjang jika perlu."),
    ]
    recipient_msgs = [
        ("Donasi Tersedia", "Donasi baru tersedia! Segera ajukan klaim."),
        ("Klaim Disetujui", "Selamat! Klaim Anda telah disetujui. Silakan ambil donasi."),
        ("Pengingat", "Ada donasi yang mendekati kedaluwarsa di sekitar Anda."),
    ]

    count = 0
    # Notifications for donors
    for donor_id in [d[0] for d in DONOR_DATA]:
        msg = random.choice(donor_msgs)
        await conn.execute(text("""
            INSERT INTO notifications (user_id, title, message, type, is_read, created_at)
            VALUES (:uid, :title, :msg, :type, :read, :created)
        """), {
            "uid": donor_id, "title": msg[0], "msg": msg[1],
            "type": random.choice(notif_types),
            "read": random.choice([0, 0, 0, 1]),
            "created": (now - timedelta(hours=random.randint(1, 48))).isoformat(),
        })
        count += 1

    # Notifications for recipients
    for rid in RECIPIENT_IDS:
        msg = random.choice(recipient_msgs)
        await conn.execute(text("""
            INSERT INTO notifications (user_id, title, message, type, is_read, created_at)
            VALUES (:uid, :title, :msg, :type, :read, :created)
        """), {
            "uid": rid, "title": msg[0], "msg": msg[1],
            "type": random.choice(notif_types),
            "read": random.choice([0, 0, 0, 1]),
            "created": (now - timedelta(hours=random.randint(1, 48))).isoformat(),
        })
        count += 1

    print(f"    Created {count} notifications")


async def create_activity_logs(conn):
    """Create activity logs."""
    print("\n📜 Creating Activity Logs...")
    now = datetime.now(UTC)

    actions = [
        ("login", "User login"),
        ("create_donation", "Donasi baru dibuat"),
        ("claim_donation", "Klaim donasi diajukan"),
        ("approve_claim", "Klaim disetujui admin"),
        ("register", "Registrasi pengguna baru"),
        ("complete_donation", "Donasi selesai"),
        ("update_profile", "Profil diperbarui"),
        ("review_donation", "Ulasan diberikan"),
    ]

    all_user_ids = [d[0] for d in DONOR_DATA] + RECIPIENT_IDS + [1, 2, 5, 8]
    count = 0
    for _ in range(25):
        uid = random.choice(all_user_ids)
        action = random.choice(actions)
        await conn.execute(text("""
            INSERT INTO activity_logs (user_id, action, details, created_at)
            VALUES (:uid, :action, :details, :created)
        """), {
            "uid": uid,
            "action": action[0],
            "details": action[1],
            "created": (now - timedelta(hours=random.randint(1, 168))).isoformat(),
        })
        count += 1
    print(f"    Created {count} activity logs")


async def reset_all_sequences(conn):
    """Reset sequence IDs."""
    tables = ["donations", "topsis_results", "notifications", "claims", "reviews", "activity_logs"]
    for table in tables:
        try:
            await conn.execute(text(
                f"SELECT setval('{table}_id_seq', "
                f"COALESCE((SELECT MAX(id) FROM \"{table}\"), 1))"
            ))
        except Exception:
            pass
    print("  ✅ Sequences reset")


async def main():
    print("=" * 60)
    print("🌱 SEEDING FAKE DATA - NutriShare")
    print(f"Started: {datetime.now(UTC).isoformat()}")
    print("=" * 60)

    engine = make_engine()
    async with engine.begin() as conn:
        await update_donors(conn)
        await update_recipients(conn)
        donation_ids = await create_donations(conn)
        await create_claims(conn, donation_ids)
        await create_topsis_results(conn)
        await create_reviews(conn)
        await create_notifications(conn)
        await create_activity_logs(conn)
        await reset_all_sequences(conn)

    await engine.dispose()

    print("\n" + "=" * 60)
    print("✅ SEEDING COMPLETE!")
    print(f"Finished: {datetime.now(UTC).isoformat()}")
    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(main())
