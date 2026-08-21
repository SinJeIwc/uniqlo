#!/usr/bin/env python3
"""
UNIQLO Parser CLI

Usage:
    uv run python categories/parse.py categories              # parse all categories
    uv run python categories/parse.py categories --gender women
    uv run python categories/parse.py products                # parse products from categories in DB
    uv run python categories/parse.py products --max 50       # limit for testing
    uv run python categories/parse.py all                     # categories + products
    uv run python categories/parse.py all --gender men --translate
    uv run python categories/parse.py translate               # translate JA→RU
    uv run python categories/parse.py translate --dry-run --limit 10
    uv run python categories/parse.py product --url https://... # single product
    uv run python categories/parse.py count                   # count products
"""
import argparse
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

DB_PATH = Path(__file__).resolve().parent.parent.parent / "frontend" / "data" / "uniqlo.db"

# Stealth browser args to avoid bot detection
STEALTH_ARGS = [
    '--disable-blink-features=AutomationControlled',
    '--disable-dev-shm-usage',
    '--no-sandbox',
]


def cmd_categories(args):
    from playwright.sync_api import sync_playwright
    from lib.crawl import crawl_categories
    from lib.db import upsert_categories

    gender = args.gender if args.gender != "all" else None
    print(f"Parse categories {f'(only {args.gender})' if gender else '(all genders)'}")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, args=STEALTH_ARGS)
        page = browser.new_page(viewport={"width": 1440, "height": 900})
        cats = crawl_categories(page, gender)
        page.close()
        browser.close()

    upsert_categories(str(DB_PATH), cats)


def cmd_products(args):
    from playwright.sync_api import sync_playwright
    from lib.products import parse_products

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, args=STEALTH_ARGS)
        count = parse_products(browser, str(DB_PATH), max_products=args.max)
        browser.close()

    print(f"Done. {count} products parsed.")


def cmd_all(args):
    from playwright.sync_api import sync_playwright
    from lib.crawl import crawl_categories
    from lib.db import upsert_categories
    from lib.products import parse_products

    gender = args.gender if args.gender != "all" else None
    print(f"Full run {f'(only {args.gender})' if gender else '(all genders)'}")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, args=STEALTH_ARGS)

        # Phase 1: Categories
        page = browser.new_page(viewport={"width": 1440, "height": 900})
        cats = crawl_categories(page, gender)
        page.close()
        upsert_categories(str(DB_PATH), cats)

        # Phase 2: Products
        count = parse_products(browser, str(DB_PATH), max_products=args.max)

        browser.close()

    print(f"Done. {len(cats)} categories, {count} products.")

    # Phase 3: Translation (optional)
    if args.translate:
        cmd_translate(args)


def cmd_product(args):
    from playwright.sync_api import sync_playwright
    from lib.product_js import PRODUCT_PAGE_JS

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, args=STEALTH_ARGS)
        page = browser.new_page(viewport={"width": 1440, "height": 900})
        page.goto(args.url, timeout=30000, wait_until="domcontentloaded")
        page.wait_for_selector("body", timeout=10000)
        data = page.evaluate(PRODUCT_PAGE_JS)
        page.close()
        browser.close()

    if args.pretty:
        import json
        print(json.dumps(data, ensure_ascii=False, indent=2))
    else:
        print(data)


def cmd_count(args):
    import sqlite3
    conn = sqlite3.connect(str(DB_PATH))
    rows = conn.execute("""
        SELECT c.gender, c.slug, COUNT(p.id) as product_count
        FROM categories c
        LEFT JOIN products p ON p.category_id = c.id
        WHERE c.id NOT IN (SELECT DISTINCT parent_id FROM categories WHERE parent_id IS NOT NULL)
        GROUP BY c.id
        ORDER BY c.gender, c.slug
    """).fetchall()
    conn.close()
    for gender, slug, count in rows:
        print(f"{gender:6s} / {slug:30s}: {count:4d} products")


def cmd_translate(args):
    from lib.translate import translate_all
    translate_all(str(DB_PATH), dry_run=args.dry_run, limit=args.limit)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="UNIQLO Parser")
    subparsers = parser.add_subparsers(dest="command", required=True)

    # categories
    p_cat = subparsers.add_parser("categories", help="Parse category tree")
    p_cat.add_argument("--gender", default="all", choices=["all", "women", "men", "kids", "baby"])

    # products
    p_prod = subparsers.add_parser("products", help="Parse products from DB categories")
    p_prod.add_argument("--max", type=int, default=0, help="Max products (0=all)")

    # all
    p_all = subparsers.add_parser("all", help="Parse categories + products")
    p_all.add_argument("--gender", default="all", choices=["all", "women", "men", "kids", "baby"])
    p_all.add_argument("--max", type=int, default=0, help="Max products (0=all)")
    p_all.add_argument("--translate", action="store_true", help="Translate after parsing")

    # product (single)
    p_one = subparsers.add_parser("product", help="Parse single product page")
    p_one.add_argument("--url", required=True)
    p_one.add_argument("--pretty", action="store_true", help="Pretty JSON")

    # count
    subparsers.add_parser("count", help="Count products per category")

    # translate
    p_trans = subparsers.add_parser("translate", help="Translate categories/products JA→RU")
    p_trans.add_argument("--dry-run", action="store_true")
    p_trans.add_argument("--limit", type=int, default=0)

    args = parser.parse_args()

    {
        "categories": cmd_categories,
        "products": cmd_products,
        "all": cmd_all,
        "product": cmd_product,
        "count": cmd_count,
        "translate": cmd_translate,
    }[args.command](args)
