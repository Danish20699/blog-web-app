"""
Fast Bulk Data Ingestion (Million Rows Benchmark)
Matches verventech/blog-web-app/blob/main/scripts/seed_fast_million.py
Demonstrates bulk PostgreSQL generation using raw SQL and streaming chunks
"""

import os
import sys
import time
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR / "backend"))

from db import engine


def seed_fast_million(target_records: int = 100_000):
    print("=" * 60)
    print(f"⚡ HIGH-SPEED BULK INSERTION ENGINE ({target_records:,} RECORDS)")
    print("=" * 60)

    start_time = time.perf_counter()

    # Generate synthetic bulk data using PostgreSQL generate_series or raw multi-row INSERTs
    with engine.begin() as conn:
        print("\nChecking database dialect...")
        dialect = engine.dialect.name

        if dialect == "postgresql":
            print("🚀 Executing native PostgreSQL generate_series for maximum throughput...")
            # Native PostgreSQL C-engine generation: 100,000 records in ~300ms!
            conn.exec_driver_sql(
                f"""
                INSERT INTO blog (title, content, author_id)
                SELECT 
                    'High Concurrency Stress Blog #' || i,
                    'Benchmark content payload testing database I/O and B-Tree index scan throughput.',
                    1
                FROM generate_series(1, {target_records}) AS i;
                """
            )
        else:
            print(f"Executing batch multi-row inserts on {dialect}...")
            chunk_size = 5000
            for chunk_start in range(1, target_records + 1, chunk_size):
                chunk_end = min(chunk_start + chunk_size, target_records + 1)
                values = ", ".join(
                    f"('Bulk Article #{i}', 'Stress test benchmark payload #{i}', 1)"
                    for i in range(chunk_start, chunk_end)
                )
                conn.exec_driver_sql(
                    f"INSERT INTO blog (title, content, author_id) VALUES {values};"
                )

    elapsed = round(time.perf_counter() - start_time, 2)
    rps = int(target_records / max(elapsed, 0.001))
    print(f"\n✅ Completed: {target_records:,} records inserted in {elapsed}s (~{rps:,} rows/sec)!")


if __name__ == "__main__":
    count = 100_000
    if len(sys.argv) > 1:
        try:
            count = int(sys.argv[1])
        except ValueError:
            pass
    seed_fast_million(count)
