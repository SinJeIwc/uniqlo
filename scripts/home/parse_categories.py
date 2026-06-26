#!/usr/bin/env python3
"""Parse UNIQLO category tree from JP homepage HTML, translate, save to SQLite."""

import re, json, subprocess, sys, sqlite3, time
from pathlib import Path
from urllib.request import urlopen, Request

URL = "https://www.uniqlo.com/jp/ja/"
DB_PATH = Path(__file__).resolve().parent.parent.parent / "frontend" / "data" / "uniqlo.db"
ORDER = {"women": 0, "men": 1, "kids": 2, "baby": 3}


def translate(text: str) -> str:
    """Translate Japanese → Russian via translate-shell (Bing engine)."""
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
    print(f"▸ Загрузка {URL} ...", end=" ", flush=True)
    t0 = time.time()
    req = Request(URL, headers={"User-Agent": "Mozilla/5.0"})
    html = urlopen(req, timeout=15).read().decode("utf-8")
    print(f"({len(html)//1024} КБ, {time.time()-t0:.1f}с)")

    for m in re.finditer(r'"categories"\s*:\s*\[', html):
        start = m.end() - 1
        depth = i = 0
        i = start
        while i < len(html):
            if html[i] == "[": depth += 1
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

    no_translate = "--no-translate" in sys.argv
    conn = sqlite3.connect(db_path)
    conn.execute("PRAGMA journal_mode = WAL")
    conn.execute("DROP TABLE IF EXISTS categories")
    conn.execute("""CREATE TABLE categories (
        id INTEGER PRIMARY KEY, name TEXT NOT NULL, slug TEXT NOT NULL,
        gender TEXT NOT NULL, parent_id INTEGER, "order" INTEGER DEFAULT 0,
        image TEXT, visible INTEGER DEFAULT 1
    )""")

    # Insert all categories
    total = len(categories)
    print(f"▸ Вставка {total} категорий ...", end=" ", flush=True)
    t0 = time.time()
    parent_ids = set()

    for c in categories:
        parents = c.get("parents", [])
        gender = parents[0]["key"] if parents else "women"

        if len(parents) >= 2:
            pid, pname, pkey = parents[1]["id"], parents[1]["name"], parents[1]["key"]
            if pid not in parent_ids:
                parent_ids.add(pid)
                conn.execute(
                    "INSERT OR IGNORE INTO categories (id, name, slug, gender, parent_id, \"order\", image) VALUES (?, ?, ?, ?, NULL, ?, NULL)",
                    (pid, pname, pkey, gender, ORDER.get(gender, 0)),
                )

        name, key, cid = c["name"], c["key"], c["id"]
        p_id = parents[1]["id"] if len(parents) >= 2 else None
        conn.execute(
            "INSERT OR IGNORE INTO categories (id, name, slug, gender, parent_id, \"order\", image) VALUES (?, ?, ?, ?, ?, ?, NULL)",
            (cid, name, key, gender, p_id, ORDER.get(gender, 0)),
        )

    conn.commit()
    count = conn.execute("SELECT count(*) FROM categories").fetchone()[0]
    print(f"OK ({count} строк, {time.time()-t0:.1f}с)")

    # Translate
    if not no_translate:
        rows = conn.execute("SELECT id, name FROM categories ORDER BY id").fetchall()
        total_rows = len(rows)
        translated_count = 0
        t_start = time.time()
        print(f"▸ Перевод {total_rows} названий (trans -b -e bing) ...")

        for i, (cid, name) in enumerate(rows):
            pct = (i + 1) / total_rows * 100
            elapsed = time.time() - t_start
            eta = elapsed / (i + 1) * (total_rows - i - 1) if i > 0 else 0

            translated = translate(name)
            if translated != name:
                conn.execute("UPDATE categories SET name = ? WHERE id = ?", (translated, cid))
                translated_count += 1
                status = "✓"
            else:
                status = "—"

            # Progress bar 20 chars
            bar_len = 20
            filled = int(bar_len * (i + 1) / total_rows)
            bar = "█" * filled + "░" * (bar_len - filled)

            print(f"\r  [{bar}] {i+1}/{total_rows} ({pct:.0f}%) | переведено: {translated_count} | {eta:.0f}с ост.   ", end="", flush=True)

        conn.commit()
        print(f"\n  Готово за {time.time()-t_start:.0f}с. Переведено: {translated_count}/{total_rows}")

    # Stats
    stats = conn.execute("SELECT gender, count(*) FROM categories GROUP BY gender ORDER BY gender").fetchall()
    print(f"\nСохранено: {db_path}")
    for gender, cnt in stats:
        print(f"  {gender}: {cnt}")
    conn.close()


if __name__ == "__main__":
    main()
