#!/usr/bin/env python3
"""Seed historical demo data: 1 Mei 2026 sampai sekarang.

Melengkapi seed_fake_data.py dengan riwayat aktivitas realistis agar web
terlihat aktif saat demo:

  • ±130 donasi tersebar merata dari 1 Mei 2026 s/d hari ini
  • Mayoritas 'completed' (dengan klaim + review + TOPSIS)
  • Sebagian 'active' (dalam 48 jam terakhir, masih bisa diklaim)
  • Sebagian 'expired' (validitas habis tanpa klaim)
  • Notifikasi & activity logs yang konsisten dengan timeline
  • Update donor_profiles.total_donations untuk leaderboard
"""
from __future__ import annotations

import asyncio
import random
from datetime import UTC, datetime, timedelta

from sqlalchemy import text

from seed_fake_data import (
    DONOR_DATA,
    FOOD_ITEMS,
    RECIPIENT_DATA,
    RECIPIENT_IDS,
    make_engine,
)

random.seed(2026)

START = datetime(2026, 5, 1, tzinfo=UTC)

DONOR_IDS = [d[0] for d in DONOR_DATA]
DONOR_LATLNG = {d[0]: (d[6], d[7]) for d in DONOR_DATA}

# Bobot agar beberapa donor dominan (realistis: hotel/katering besar lebih sering)
DONOR_WEIGHTS = [3, 2, 2, 2, 3, 1, 2, 3, 3, 2]

# Pool besar komentar agar setiap review unik & realistis.
# Beberapa komponen pembuka/penutup dikombinasikan secara acak di create_reviews.
REVIEW_OPENERS = [
    "Makanan {food} yang kami terima sangat layak konsumsi.",
    "Alhamdulillah, {food} dari donatur datang dalam kondisi baik.",
    "Kami sangat bersyukur menerima {food} hari ini.",
    "Porsi {food} yang diberikan cukup banyak dan berkualitas.",
    "Terima kasih, {food} yang dikirim masih segar dan hangat.",
    "Anak-anak sangat menikmati {food} yang dibagikan sore ini.",
    "Kualitas {food} yang diterima benar-benar melebihi ekspektasi.",
    "Semua anak lahap memakan {food} yang datang hari ini.",
    "Penerima manfaat senang sekali dengan {food} yang dikirim.",
    "Hari ini kami mendapat {food} dengan porsi yang sangat memadai.",
]

REVIEW_BODY = [
    "Porsinya pas untuk seluruh penghuni, tidak ada yang kurang.",
    "Rasa dan kebersihannya sangat terjaga, aman untuk anak-anak.",
    "Kemasannya rapi sehingga mudah didistribusikan ke warga.",
    "Nilai gizinya jelas tertera, membantu kami mengatur menu harian.",
    "Distribusinya tepat waktu, makanan masih hangat saat tiba.",
    "Proses klaimnya mudah dan cepat, tidak berbelit-belit.",
    "Menu yang diberikan variatif, anak-anak tidak bosan.",
    "Porsi proteinnya mencukupi kebutuhan gizi harian warga.",
    "Sangat membantu kami di tengah keterbatasan dana dapur.",
    "Cocok untuk seluruh usia, dari anak-anak sampai lansia.",
    "Jumlahnya melimpah, sebagian bisa kami simpan untuk esok.",
    "Hygienis dan bergizi, sesuai dengan yang dijanjikan.",
]

REVIEW_CLOSERS = [
    "Terima kasih banyak kepada donatur dan tim NutriShare.",
    "Semoga donatur senantiasa diberi kelancaran rezeki.",
    "Kami doakan yang terbaik untuk para donatur.",
    "Semoga berkah dan bermanfaat bagi banyak orang.",
    "Teruslah berbagi, sangat berarti bagi kami.",
    "Terima kasih atas kepeduliannya kepada sesama.",
    "Kami sangat terbantu, semoga amal jariahnya diterima.",
    "Semoga semakin banyak yang tergerak berbagi lewat NutriShare.",
]

NOTIF_DONOR = [
    ("Donasi Tersalurkan", "Donasi Anda telah diterima oleh penerima manfaat."),
    ("Donasi Baru", "Donasi baru Anda berhasil dipublikasikan."),
    ("Ulasan Baru", "Penerima manfaat memberikan ulasan bintang 5 untuk donasi Anda."),
    ("Pengingat", "Donasi Anda akan kedaluwarsa dalam 2 jam. Perpanjang jika perlu."),
]

NOTIF_RECIPIENT = [
    ("Donasi Tersedia", "Donasi baru tersedia! Segera ajukan klaim."),
    ("Klaim Disetujui", "Selamat! Klaim Anda telah disetujui. Silakan ambil donasi."),
    ("Donasi Selesai", "Donasi telah sampai. Terima kasih telah berpartisipasi!"),
]

ACTIVITY_ACTIONS = [
    ("login", "User login"),
    ("create_donation", "Donasi baru dibuat"),
    ("claim_donation", "Klaim donasi diajukan"),
    ("approve_claim", "Klaim disetujui admin"),
    ("complete_donation", "Donasi selesai"),
    ("review_donation", "Ulasan diberikan"),
    ("update_profile", "Profil diperbarui"),
    ("register", "Registrasi pengguna baru"),
]


def pick_donor() -> int:
    return random.choices(DONOR_IDS, weights=DONOR_WEIGHTS, k=1)[0]


def iso(dt: datetime) -> str:
    return dt.isoformat()


async def wipe_transactional(conn):
    """Bersihkan data donasi & dependen (sama seperti seed_fake_data)."""
    for table in ["reviews", "claims", "topsis_results", "notifications", "activity_logs"]:
        await conn.execute(text(f'DELETE FROM "{table}"'))
    await conn.execute(text('DELETE FROM "donations"'))
    print("  🧹 Transactional data cleared")


async def create_historical_donations(conn):
    """Generate ±130 donasi dari 1 Mei 2026 s/d sekarang + donasi segar (active)."""
    print("\n📦 Creating historical donations (Mei–Jul 2026)...")
    now = datetime.now(UTC)
    total_span = now - START
    total_donations = 130

    created_list: list[tuple[datetime, int]] = []
    for i in range(total_donations):
        # Distribusi merata + jitter agar terlihat organik
        base = START + total_span * (i / total_donations)
        jitter = timedelta(hours=random.uniform(-18, 18))
        created_at = max(START, base + jitter)
        created_at = min(created_at, now)
        created_list.append((created_at, pick_donor()))

    created_list.sort(key=lambda x: x[0])

    completed_ids = []
    active_count = 0
    expired_count = 0
    completed_count = 0

    for idx, (created_at, donor_id) in enumerate(created_list):
        food = FOOD_ITEMS[idx % len(FOOD_ITEMS)]
        lat, lng = DONOR_LATLNG[donor_id]
        hours_ago = (now - created_at).total_seconds() / 3600

        # Tentukan status berdasarkan umur donasi
        if hours_ago <= 48 and random.random() < 0.65:
            status = "active"
        elif hours_ago > 48 and hours_ago < 168 and random.random() < 0.25:
            status = "expired"
        else:
            status = "completed"

        # ——— Donasi segar tambahan agar demo terlihat aktif ———
        # Sisipkan donasi baru di akhir timeline untuk memastikan ~10 active.
        if idx >= total_donations - 10:
            created_at = now - timedelta(hours=random.uniform(1, 36))
            status = "active"
            donor_id = pick_donor()
            lat, lng = DONOR_LATLNG[donor_id]

        valid_until = created_at + timedelta(hours=random.uniform(4, 24))

        if status == "active":
            valid_until = now + timedelta(hours=random.uniform(4, 24))
            claimed_by = claimed_at = completed_at = None
        elif status == "expired":
            valid_until = now - timedelta(hours=random.uniform(1, 24))
            claimed_by = claimed_at = completed_at = None
        else:
            # completed: klaim sebelum kedaluwarsa, selesai setelah klaim
            max_claim = min(valid_until, created_at + timedelta(hours=random.uniform(4, 22)))
            claimed_at = created_at + timedelta(hours=random.uniform(1, 12))
            claimed_at = min(claimed_at, max_claim)
            completed_at = claimed_at + timedelta(hours=random.uniform(1, 12))
            completed_at = min(completed_at, now)
            claimed_by = random.choice(RECIPIENT_IDS)

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
                 :notes, :status, :claimed_by, :claimed_at, :completed_at, :created)
            RETURNING id
        """), {
            "donor_id": donor_id,
            "food_name": food[0], "food_type": food[1],
            "portion": food[2], "protein": food[3],
            "calorie": food[4], "iron": food[5], "vit_c": food[6],
            "valid_until": iso(valid_until),
            "lat": lat + random.uniform(-0.01, 0.01),
            "lng": lng + random.uniform(-0.01, 0.01),
            "notes": (
                "Hasil masakan hari ini, segar dan higienis. Siap diambil."
                if status == "active"
                else "Terima kasih sudah mengambil. Mohon dikonsumsi segera."
                if status == "completed"
                else "Maaf sudah tidak tersedia."
            ),
            "status": status,
            "claimed_by": claimed_by,
            "claimed_at": iso(claimed_at) if claimed_at else None,
            "completed_at": iso(completed_at) if completed_at else None,
            "created": iso(created_at),
        })
        did = r.scalar_one()

        if status == "completed":
            completed_ids.append((did, donor_id, claimed_by, claimed_at, completed_at))
            completed_count += 1
        elif status == "active":
            active_count += 1
        else:
            expired_count += 1

    print(f"    Created: {completed_count} completed, {active_count} active, {expired_count} expired")
    return completed_ids


async def create_claims_and_topsis(conn, completed):
    """Klaim + TOPSIS untuk donasi completed (waktu sesuai timeline)."""
    print("\n📝 Creating claims & TOPSIS for completed donations...")
    claims_count = 0
    topsis_count = 0
    for did, donor_id, recipient_id, claimed_at, completed_at in completed:
        reviewed_at = completed_at + timedelta(hours=random.uniform(0, 4))

        await conn.execute(text("""
            INSERT INTO claims (donation_id, recipient_id, topsis_rank_at_claim,
                                status, admin_note, created_at, reviewed_at, reviewed_by)
            VALUES (:did, :rid, :rank, 'approved', :note, :created, :reviewed, 5)
        """), {
            "did": did, "rid": recipient_id,
            "rank": random.randint(1, 5),
            "note": "Penyaluran disetujui. Silakan ambil donasi.",
            "created": iso(claimed_at), "reviewed": iso(reviewed_at),
        })
        claims_count += 1

        # 2-3 baris TOPSIS per donasi
        selected = random.sample(RECIPIENT_IDS, min(3, len(RECIPIENT_IDS)))
        for rank_pos, rid in enumerate(selected, 1):
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
                "c1": round(random.uniform(0.5, 1.0), 4),
                "c2": round(random.uniform(0.5, 1.0), 4),
                "c3": round(random.uniform(0.5, 1.0), 4),
                "c4": round(random.uniform(0.5, 1.0), 4),
                "c5": round(random.uniform(0.5, 1.0), 4),
                "dp": dplus, "dm": dminus, "ci": ci,
                "calc": iso(completed_at),
            })
            topsis_count += 1

    print(f"    Created {claims_count} claims, {topsis_count} TOPSIS rows")


async def create_reviews(conn, completed):
    """Review untuk ~70% donasi completed (setelah selesai)."""
    print("\n⭐ Creating reviews...")
    count = 0
    used_comments: set[str] = set()

    # Ambil nama makanan per donasi agar komentar kontekstual
    r = await conn.execute(text("SELECT id, food_name FROM donations WHERE status = 'completed'"))
    food_map = {row.id: row.food_name for row in r.fetchall()}

    for did, donor_id, recipient_id, claimed_at, completed_at in completed:
        if random.random() > 0.72:
            continue
        review_at = completed_at + timedelta(hours=random.uniform(2, 36))

        # Kombinasikan opener + body + closer → komentar unik, hindari duplikat
        for _ in range(8):  # coba beberapa kali agar dapat kombinasi belum terpakai
            food = food_map.get(did, "makanan")
            comment = (
                random.choice(REVIEW_OPENERS).format(food=food)
                + " "
                + random.choice(REVIEW_BODY)
                + " "
                + random.choice(REVIEW_CLOSERS)
            )
            if comment not in used_comments:
                break
        used_comments.add(comment)

        await conn.execute(text("""
            INSERT INTO reviews (donation_id, donor_id, recipient_id, rating, comment, created_at)
            VALUES (:did, :donor_id, :recipient_id, :rating, :comment, :created)
        """), {
            "did": did, "donor_id": donor_id, "recipient_id": recipient_id,
            "rating": random.choices([4, 5], weights=[2, 8], k=1)[0],
            "comment": comment,
            "created": iso(review_at),
        })
        count += 1
    print(f"    Created {count} reviews (all unique)")


async def update_donor_totals(conn):
    """Sinkronkan total_donations per donor dengan jumlah donasi yang dibuat."""
    print("\n📊 Updating donor totals...")
    r = await conn.execute(text(
        "SELECT donor_id, COUNT(*) FROM donations GROUP BY donor_id"
    ))
    rows = r.fetchall()
    for donor_id, cnt in rows:
        await conn.execute(text(
            "UPDATE donor_profiles SET total_donations = :cnt WHERE user_id = :uid"
        ), {"cnt": cnt, "uid": donor_id})
    print(f"    Updated totals for {len(rows)} donors")


async def create_notifications(conn, completed):
    """Notifikasi donor & penerima tersebar di timeline."""
    print("\n🔔 Creating notifications...")
    now = datetime.now(UTC)
    count = 0

    # Notifikasi donor: sebar untuk beberapa donasi completed
    for did, donor_id, recipient_id, claimed_at, completed_at in completed:
        if random.random() > 0.35:
            continue
        notif_at = completed_at + timedelta(hours=random.uniform(1, 24))
        if notif_at > now:
            notif_at = now - timedelta(hours=random.uniform(0, 6))
        msg = random.choice(NOTIF_DONOR)
        await conn.execute(text("""
            INSERT INTO notifications (user_id, title, message, type, is_read, created_at)
            VALUES (:uid, :title, :msg, :type, :read, :created)
        """), {
            "uid": donor_id, "title": msg[0], "msg": msg[1],
            "type": random.choice(["donation_available", "claim_approved", "system"]),
            "read": random.choice([0, 0, 0, 1]),
            "created": iso(notif_at),
        })
        count += 1

    # Notifikasi penerima: klaim disetujui / donasi selesai
    for did, donor_id, recipient_id, claimed_at, completed_at in completed:
        if random.random() > 0.4:
            continue
        notif_at = completed_at + timedelta(hours=random.uniform(1, 12))
        if notif_at > now:
            notif_at = now - timedelta(hours=random.uniform(0, 6))
        msg = random.choice(NOTIF_RECIPIENT)
        await conn.execute(text("""
            INSERT INTO notifications (user_id, title, message, type, is_read, created_at)
            VALUES (:uid, :title, :msg, :type, :read, :created)
        """), {
            "uid": recipient_id, "title": msg[0], "msg": msg[1],
            "type": random.choice(["donation_available", "claim_approved", "system"]),
            "read": random.choice([0, 0, 0, 1]),
            "created": iso(notif_at),
        })
        count += 1

    print(f"    Created {count} notifications")


async def create_activity_logs(conn):
    """Activity logs tersebar dari Mei s/d sekarang."""
    print("\n📜 Creating activity logs...")
    now = datetime.now(UTC)
    total_span = now - START
    all_user_ids = DONOR_IDS + RECIPIENT_IDS + [1, 2, 5, 8]
    count = 0
    for i in range(60):
        created_at = START + total_span * (i / 60) + timedelta(hours=random.uniform(-6, 6))
        created_at = max(START, min(created_at, now))
        uid = random.choice(all_user_ids)
        action = random.choice(ACTIVITY_ACTIONS)
        await conn.execute(text("""
            INSERT INTO activity_logs (user_id, action, details, created_at)
            VALUES (:uid, :action, :details, :created)
        """), {
            "uid": uid, "action": action[0], "details": action[1],
            "created": iso(created_at),
        })
        count += 1
    print(f"    Created {count} activity logs")


async def reset_sequences(conn):
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
    print("🌱 SEEDING DEMO ACTIVITY — 1 Mei 2026 s/d sekarang")
    print(f"Started: {datetime.now(UTC).isoformat()}")
    print("=" * 60)

    engine = make_engine()
    async with engine.begin() as conn:
        await wipe_transactional(conn)
        completed = await create_historical_donations(conn)
        await create_claims_and_topsis(conn, completed)
        await create_reviews(conn, completed)
        await update_donor_totals(conn)
        await create_notifications(conn, completed)
        await create_activity_logs(conn)
        await reset_sequences(conn)

    await engine.dispose()

    print("\n" + "=" * 60)
    print("✅ SEEDING COMPLETE!")
    print(f"Finished: {datetime.now(UTC).isoformat()}")
    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(main())
