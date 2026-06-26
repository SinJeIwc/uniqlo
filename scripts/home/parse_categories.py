#!/usr/bin/env python3
"""Parse UNIQLO category tree from JP homepage HTML, translate, save to SQLite."""

import re
import json
import subprocess
import sys
import sqlite3
from pathlib import Path
from urllib.request import urlopen, Request

URL = "https://www.uniqlo.com/jp/ja/"
DB_PATH = Path(__file__).resolve().parent.parent.parent / "frontend" / "data" / "uniqlo.db"

ORDER = {"women": 0, "men": 1, "kids": 2, "baby": 3}


def translate(text: str) -> str:
    """Translate Japanese → Russian via translate-shell."""
    try:
        r = subprocess.run(
            ["trans", "-b", "-e", "bing", "-s", "ja", "-t", "ru", text],
            capture_output=True, text=True, timeout=15,
        )
        t = r.stdout.strip()
        if t and t != text and "ERROR" not in t:
            return t
    except Exception:
        pass
    return text


def fetch_categories() -> list[dict]:
    """Download JP homepage and extract categories JSON."""
    print(f"Fetching {URL} ...")
    req = Request(URL, headers={"User-Agent": "Mozilla/5.0"})
    html = urlopen(req, timeout=15).read().decode("utf-8")

    # Find the big categories array
    for m in re.finditer(r'"categories"\s*:\s*\[', html):
        start = m.end() - 1
        depth = 0
        i = start
        while i < len(html):
            if html[i] == "[":
                depth += 1
            elif html[i] == "]":
                depth -= 1
                if depth == 0:
                    data = json.loads(html[start : i + 1])
                    if isinstance(data, list) and len(data) > 100:
                        return data
                    break
            i += 1
    return []


def main():
    db_path = str(DB_PATH)
    if "--db" in sys.argv:
        db_path = sys.argv[sys.argv.index("--db") + 1]

    categories = fetch_categories()
    if not categories:
        print("ERROR: no categories found")
        sys.exit(1)

    print(f"Found {len(categories)} categories")

    no_translate = "--no-translate" in sys.argv
    conn = sqlite3.connect(db_path)
    conn.execute("PRAGMA journal_mode = WAL")
    conn.execute("DROP TABLE IF EXISTS categories")
    conn.execute("""
        CREATE TABLE categories (
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL,
            slug TEXT NOT NULL,
            gender TEXT NOT NULL,
            parent_id INTEGER,
            "order" INTEGER DEFAULT 0,
            image TEXT
        )
    """)

    # First pass: insert all categories (parents + children)
    for c in categories:
        parents = c.get("parents", [])
        gender = parents[0]["key"] if parents else "women"

        # For parent categories (level 1), create a synthetic record
        if len(parents) >= 2:
            parent_key = parents[1]["key"]
            parent_name = parents[1]["name"]
            parent_id = parents[1]["id"]
            conn.execute(
                "INSERT OR IGNORE INTO categories (id, name, slug, gender, parent_id, \"order\", image) VALUES (?, ?, ?, ?, NULL, ?, NULL)",
                (parent_id, parent_name, parent_key, gender, ORDER.get(gender, 0)),
            )

        # Child category
        name = c["name"]
        key = c["key"]
        cid = c["id"]
        parent_id = parents[1]["id"] if len(parents) >= 2 else None
        conn.execute(
            "INSERT OR IGNORE INTO categories (id, name, slug, gender, parent_id, \"order\", image) VALUES (?, ?, ?, ?, ?, ?, NULL)",
            (cid, name, key, gender, parent_id, ORDER.get(gender, 0)),
        )

    conn.commit()

    # Translate names
    if not no_translate:
        rows = conn.execute("SELECT id, name FROM categories").fetchall()
        print(f"Translating {len(rows)} category names ...")
        for cid, name in rows:
            translated = translate(name)
            if translated != name:
                conn.execute("UPDATE categories SET name = ? WHERE id = ?", (translated, cid))
                print(f"  {name[:30]:35s} → {translated[:50]}")
        conn.commit()

    # Stats
    stats = conn.execute(
        "SELECT gender, count(*) FROM categories GROUP BY gender ORDER BY gender"
    ).fetchall()
    print(f"\nSaved to: {db_path}")
    for gender, count in stats:
        print(f"  {gender}: {count}")
    conn.close()


if __name__ == "__main__":
    main()
