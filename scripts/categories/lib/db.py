"""SQLite save with hierarchy."""
import sqlite3

CREATE_SQL = """CREATE TABLE categories (
    id INTEGER PRIMARY KEY, name TEXT NOT NULL, slug TEXT NOT NULL,
    gender TEXT NOT NULL, parent_id INTEGER, "order" INTEGER DEFAULT 0,
    image TEXT, visible INTEGER DEFAULT 1, nav INTEGER DEFAULT 0
)"""

def save(db_path: str, all_cats: list[dict]):
    conn = sqlite3.connect(db_path)
    conn.execute("PRAGMA journal_mode = WAL")
    conn.execute("DROP TABLE IF EXISTS categories")
    conn.execute(CREATE_SQL)

    for i, cat in enumerate(all_cats):
        conn.execute(
            'INSERT INTO categories (id, name, slug, gender, parent_id, "order", image, nav) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            (cat["id"], cat["name"], cat["slug"], cat["gender"], cat["parentId"], i, cat["image"], cat["nav"]),
        )

    conn.commit()
    print(f"\nSaved: {db_path}")
    rows = conn.execute("SELECT gender, count(*) FROM categories GROUP BY gender").fetchall()
    print(f"  categories: {dict(rows)}")
    conn.close()
