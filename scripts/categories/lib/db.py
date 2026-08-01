"""SQLite save — schema managed by `pnpm drizzle-kit push`."""
import json
import sqlite3

_EMPTY_ARR = "[]"
_EMPTY_OBJ = "{}"


def upsert_categories(db_path: str, cats: list[dict]):
    conn = sqlite3.connect(db_path)
    conn.execute("PRAGMA journal_mode = WAL")
    conn.execute("BEGIN")
    conn.execute("DELETE FROM categories")
    for i, cat in enumerate(cats):
        conn.execute(
            """INSERT OR REPLACE INTO categories
               (id, name, slug, href, gender, parent_id, "order", image, image_nav, kind, nav, nav_order, visible,
                image_sp, image_pc, video_url, video_poster, subtitle, product_count)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (cat["id"], cat["name"], cat["slug"], cat.get("href", ""),
             cat["gender"], cat.get("parent_id"), i,
             cat.get("image"), cat.get("image_nav"), cat.get("kind", "category"),
             cat.get("nav", 0), cat.get("nav_order", 0), cat.get("visible", 1),
             cat.get("image_sp"), cat.get("image_pc"),
             cat.get("video_url"), cat.get("video_poster"),
             cat.get("subtitle"), cat.get("product_count")))
    conn.commit()
    rows = conn.execute("SELECT gender, count(*) FROM categories GROUP BY gender").fetchall()
    print(f"  categories: {dict(rows)}")
    conn.close()


