"""SQLite save — schema managed by `pnpm drizzle-kit push`."""
import json
import sqlite3

_EMPTY_ARR = "[]"
_EMPTY_OBJ = "{}"


def upsert_categories(db_path: str, cats: list[dict]):
    conn = sqlite3.connect(db_path)
    conn.execute("PRAGMA journal_mode = WAL")
    conn.execute("BEGIN")
    for i, cat in enumerate(cats):
        conn.execute(
            """INSERT OR REPLACE INTO categories
               (id, name, slug, href, gender, parent_id, "order", image, kind, nav, nav_order, visible)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (cat["id"], cat["name"], cat["slug"], cat.get("href", ""),
             cat["gender"], cat.get("parent_id"), i,
             cat.get("image"), cat.get("kind", "category"),
             cat.get("nav", 0), cat.get("nav_order", 0), cat.get("visible", 1)))
    conn.commit()
    rows = conn.execute("SELECT gender, count(*) FROM categories GROUP BY gender").fetchall()
    print(f"  categories: {dict(rows)}")
    conn.close()


def upsert_products(db_path: str, products: list[dict]):
    if not products:
        return
    conn = sqlite3.connect(db_path)
    conn.execute("PRAGMA journal_mode = WAL")
    conn.execute("BEGIN")

    rows = []
    for p in products:
        rows.append((
            p["product_id"], p["name"], p.get("description"), p.get("brand", "UNIQLO"),
            p.get("section"), p.get("category"), p.get("subcategory"),
            p.get("price"), p.get("rating"), p.get("review_count"),
            p["gender"], p.get("category_id"), p.get("material"),
            json.dumps(p.get("colors") or [], ensure_ascii=False),
            json.dumps(p.get("color_chips") or [], ensure_ascii=False),
            json.dumps(p.get("sizes") or [], ensure_ascii=False),
            json.dumps(p.get("variants") or [], ensure_ascii=False),
            json.dumps(p.get("gallery") or [], ensure_ascii=False),
            p.get("ai_review"),
            json.dumps(p.get("product_description") or [], ensure_ascii=False),
            p.get("in_stock", 1),
        ))

    conn.executemany(
        """INSERT OR REPLACE INTO products
           (product_id, name, description, brand,
            section, category, subcategory, price, rating, review_count,
            gender, category_id, material,
            colors, color_chips, sizes, variants, gallery,
            ai_review, product_description, in_stock)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
        rows,
    )
    conn.commit()
    print(f"  products: {len(rows)}")
    conn.close()
