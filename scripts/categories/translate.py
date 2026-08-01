#!/usr/bin/env python3
"""Translate categories and products from Japanese to Russian.

Uses deep-translator (Google Translate, free, no API key).
Resume-safe: skips already-translated rows.

Usage:
    uv run python categories/translate.py              # translate all
    uv run python categories/translate.py --dry-run    # preview what would be translated
    uv run python categories/translate.py --limit 10   # test: only 10 rows
"""
import argparse
import sqlite3
import time
from pathlib import Path

from deep_translator import GoogleTranslator

DB_PATH = Path(__file__).resolve().parent.parent.parent / "frontend" / "data" / "uniqlo.db"

# Rate limiting: Google Translate free tier is ~100 requests per minute max.
# We use conservative delays to avoid throttling.
REQUEST_DELAY = 1.5  # seconds between requests
BATCH_SIZE = 20      # pause after each batch
BATCH_PAUSE = 5      # seconds pause between batches

translator = GoogleTranslator(source="ja", target="ru")


def translate(text: str) -> str | None:
    """Translate a single text. Returns None on failure."""
    if not text or not text.strip():
        return None
    try:
        result = translator.translate(text.strip())
        return result if result else None
    except Exception as e:
        print(f"    ✗ translate error: {e}", flush=True)
        return None


def translate_categories(db_path: str, dry_run: bool, limit: int) -> int:
    """Translate category names and subtitles."""
    conn = sqlite3.connect(db_path)
    conn.execute("PRAGMA journal_mode = WAL")

    # Find untranslated categories
    query = "SELECT id, name, subtitle FROM categories WHERE name_ru IS NULL"
    if limit > 0:
        query += f" LIMIT {limit}"
    rows = conn.execute(query).fetchall()

    if not rows:
        print("  All categories already translated.", flush=True)
        conn.close()
        return 0

    print(f"  Translating {len(rows)} categories...", flush=True)
    translated = 0

    for i, (cat_id, name, subtitle) in enumerate(rows):
        if dry_run:
            print(f"    [{cat_id}] {name}", flush=True)
            continue

        name_ru = translate(name)
        time.sleep(REQUEST_DELAY)

        subtitle_ru = None
        if subtitle:
            subtitle_ru = translate(subtitle)
            time.sleep(REQUEST_DELAY)

        if name_ru:
            conn.execute(
                "UPDATE categories SET name_ru = ?, subtitle_ru = ? WHERE id = ?",
                (name_ru, subtitle_ru, cat_id),
            )
            conn.commit()
            translated += 1
            print(f"    [{cat_id}] {name} → {name_ru}", flush=True)

        if (i + 1) % BATCH_SIZE == 0:
            print(f"    {i+1}/{len(rows)} — pausing {BATCH_PAUSE}s...", flush=True)
            time.sleep(BATCH_PAUSE)

    conn.close()
    return translated


def translate_products(db_path: str, dry_run: bool, limit: int) -> int:
    """Translate product names, descriptions, section/category/subcategory."""
    conn = sqlite3.connect(db_path)
    conn.execute("PRAGMA journal_mode = WAL")

    query = "SELECT id, name, description, section, category, subcategory FROM products WHERE name_ru IS NULL"
    if limit > 0:
        query += f" LIMIT {limit}"
    rows = conn.execute(query).fetchall()

    if not rows:
        print("  All products already translated.", flush=True)
        conn.close()
        return 0

    print(f"  Translating {len(rows)} products...", flush=True)
    translated = 0

    for i, (prod_id, name, desc, section, cat, subcat) in enumerate(rows):
        if dry_run:
            print(f"    [{prod_id}] {name}", flush=True)
            continue

        name_ru = translate(name)
        time.sleep(REQUEST_DELAY)

        desc_ru = translate(desc) if desc else None
        if desc:
            time.sleep(REQUEST_DELAY)

        section_ru = translate(section) if section else None
        if section:
            time.sleep(REQUEST_DELAY)

        cat_ru = translate(cat) if cat else None
        if cat:
            time.sleep(REQUEST_DELAY)

        subcat_ru = translate(subcat) if subcat else None
        if subcat:
            time.sleep(REQUEST_DELAY)

        if name_ru:
            conn.execute(
                """UPDATE products SET name_ru = ?, description_ru = ?,
                   section_ru = ?, category_ru = ?, subcategory_ru = ?
                   WHERE id = ?""",
                (name_ru, desc_ru, section_ru, cat_ru, subcat_ru, prod_id),
            )
            conn.commit()
            translated += 1
            print(f"    [{prod_id}] {name} → {name_ru}", flush=True)

        if (i + 1) % BATCH_SIZE == 0:
            print(f"    {i+1}/{len(rows)} — pausing {BATCH_PAUSE}s...", flush=True)
            time.sleep(BATCH_PAUSE)

    conn.close()
    return translated


if __name__ == "__main__":

    ap = argparse.ArgumentParser(description="Translate categories/products JP → RU")
    ap.add_argument("--dry-run", action="store_true", help="Preview without translating")
    ap.add_argument("--limit", type=int, default=0, help="Max rows to translate")
    ap.add_argument("--categories-only", action="store_true")
    ap.add_argument("--products-only", action="store_true")
    args = ap.parse_args()

    do_cats = not args.products_only
    do_prods = not args.categories_only

    print(f"Translate JP → RU {'(DRY RUN)' if args.dry_run else ''}", flush=True)
    print(f"  delay={REQUEST_DELAY}s, batch={BATCH_SIZE}, pause={BATCH_PAUSE}s", flush=True)

    if do_cats:
        print("▸ Categories", flush=True)
        n = translate_categories(str(DB_PATH), args.dry_run, args.limit)
        print(f"  translated: {n}", flush=True)

    if do_prods:
        print("▸ Products", flush=True)
        n = translate_products(str(DB_PATH), args.dry_run, args.limit)
        print(f"  translated: {n}", flush=True)

    print("Done.", flush=True)
