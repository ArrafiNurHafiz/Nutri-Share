#!/usr/bin/env python3
"""Migrate all data from Supabase PostgreSQL to Neon PostgreSQL.

Usage: .venv/bin/python migrate_data.py
"""
from __future__ import annotations

import asyncio
import ssl
from datetime import UTC, datetime
from urllib.parse import parse_qs, urlencode, urlparse, urlunparse

from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine

SUPABASE_URL = "postgresql+asyncpg://postgres.uqhvhoulgldyyfwvyyyl:Arr%40finurhafiz123@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres"
NEON_URL = (
    "postgresql+asyncpg://neondb_owner:npg_mzwlgL9VSGW3@"
    "ep-super-dawn-axusxadt.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require"
)

TABLE_ORDER = [
    "users",
    "donor_profiles",
    "recipient_profiles",
    "donations",
    "topsis_results",
    "notifications",
    "claims",
    "reviews",
    "activity_logs",
]


def make_neon_engine():
    parsed = urlparse(NEON_URL)
    params = parse_qs(parsed.query)
    params.pop("sslmode", None)
    remaining = urlencode(params, doseq=True) if params else ""
    clean = urlunparse(parsed._replace(query=remaining))
    ctx = ssl.create_default_context()
    ctx.check_hostname = True
    ctx.verify_mode = ssl.CERT_REQUIRED
    return create_async_engine(
        clean, echo=False, connect_args={"statement_cache_size": 0, "ssl": ctx}
    )


async def migrate():
    print("=" * 60)
    print("Migrasi Data: Supabase → Neon")
    print(f"Started: {datetime.now(UTC).isoformat()}")
    print("=" * 60)

    src = create_async_engine(
        SUPABASE_URL, echo=False, connect_args={"statement_cache_size": 0}
    )
    dst = make_neon_engine()

    total_rows = 0
    async with src.connect() as src_conn:
        for table in TABLE_ORDER:
            # Read from Supabase
            result = await src_conn.execute(text(f'SELECT * FROM "{table}"'))
            rows = result.fetchall()
            col_names = list(result.keys())

            if not rows:
                print(f"  ⚠️  {table}: 0 rows")
                continue

            cols = ", ".join(f'"{c}"' for c in col_names)
            placeholders = ", ".join(f":{c}" for c in col_names)

            inserted = 0
            errors = 0

            # Each batch in its own transaction
            for i, row in enumerate(rows):
                params = dict(zip(col_names, row))
                clean = {}
                for k, v in params.items():
                    if isinstance(v, memoryview):
                        v = bytes(v).decode("utf-8", errors="replace")
                    clean[k] = v

                async with dst.begin() as conn:
                    try:
                        await conn.execute(
                            text(
                                f'INSERT INTO "{table}" ({cols}) VALUES ({placeholders})'
                            ),
                            clean,
                        )
                        inserted += 1
                    except Exception as e:
                        errors += 1
                        if errors <= 5:
                            print(
                                f"  ❌  {table} id={clean.get('id','?')}: {e}"
                            )

                if (i + 1) % 20 == 0 or i == len(rows) - 1:
                    print(
                        f"  🔄  {table}: {i+1}/{len(rows)} (inserted={inserted}, errors={errors})",
                        end="\r",
                    )

            total_rows += inserted
            print(f"")
            print(f"  ✅ {table}: {inserted}/{len(rows)} rows (errors={errors})")

    # Reset sequences
    async with dst.begin() as conn:
        for table in TABLE_ORDER:
            try:
                await conn.execute(
                    text(
                        f"SELECT setval('{table}_id_seq', "
                        f"COALESCE((SELECT MAX(id) FROM \"{table}\"), 1))"
                    )
                )
            except Exception as e:
                print(f"  ⚠️  Sequence {table}: {e}")

    print("=" * 60)
    print(f"✅ Migrasi selesai! Total {total_rows} rows dipindahkan.")
    print(f"   Finished: {datetime.now(UTC).isoformat()}")

    await src.dispose()
    await dst.dispose()


if __name__ == "__main__":
    asyncio.run(migrate())
