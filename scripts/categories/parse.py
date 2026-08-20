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
import argparse, sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

DB_PATH = Path(__file__).resolve().parent.parent.parent / "frontend" / "data" / "uniqlo.db"


def cmd_categories(args):
    from playwright.sync_api import sync_playwright
    from lib.crawl import crawl_categories
    from lib.db import upsert_categories

    gender = args.gender if args.gender != "all" else None
    print(f"Parse categories {f'(only {args.gender})' if gender else '(all genders)'}")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1440, "height": 900})
        cats = crawl_categories(page, gender)
        page.close()
        browser.close()

    upsert_categories(str(DB_PATH), cats)


def cmd_products(args):
    from playwright.sync_api import sync_playwright
    from lib.products import parse_products

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        count = parse_products(browser, str(DB_PATH), max_products=args.max)
        browser.close()

    print(f"Done. {count} products parsed.")


def cmd_all(args):
    from playwright.sync_api import sync_playwright
    from lib.crawl import crawl_categories
    from lib.products import parse_products
    from lib.db import upsert_categories

    gender = args.gender if args.gender != "all" else None
    print(f"Full run {f'(only {args.gender})' if gender else '(all genders)'}")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)

        # Phase 1: Categories
        page = browser.new_page(viewport={"width": 1440, "height": 900})
        cats = crawl_categories(page, gender)
        page.close()

        upsert_categories(str(DB_PATH), cats)

        # Phase 2: Products
        count = parse_products(browser, str(DB_PATH), max_products=args.max)
        browser.close()

    # Phase 3: Translate (if requested)
    if args.translate:
        print("\n" + "="*70)
        print("TRANSLATION PHASE")
        print("="*70)
        from translate import translate_categories, translate_products
        cat_count = translate_categories(str(DB_PATH), dry_run=False, limit=0)
        prod_count = translate_products(str(DB_PATH), dry_run=False, limit=0)
        print(f"  Translated: {cat_count} categories, {prod_count} products")

    print(f"\nDone. {len(cats)} categories, {count} products.")


def cmd_product(args):
    from playwright.sync_api import sync_playwright
    from lib.product_js import PRODUCT_PAGE_JS
    import json

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1440, "height": 900})
        page.goto(args.url, timeout=30000, wait_until="domcontentloaded")
        page.wait_for_selector("script[type='application/ld+json']", state="attached", timeout=10000)

        data = page.evaluate(PRODUCT_PAGE_JS)
        browser.close()

    data["url"] = args.url
    print(json.dumps(data, ensure_ascii=False, indent=2 if args.pretty else None))


def cmd_count(args):
    from playwright.sync_api import sync_playwright
    from lib.count_products import count_products
    import json

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        result = count_products(browser, str(DB_PATH))
        browser.close()

    if not result:
        return

    print("\n" + "="*60)
    print("PRODUCT COUNT SUMMARY")
    print("="*60)
    print(f"Categories scanned:  {result['categories_scanned']}")
    print(f"Products found:      {result['total_found']}")
    print(f"Products in DB:      {result['total_in_db']}")
    print(f"Missing from DB:     {result['missing']}")
    print(f"\nBy gender:")
    for gender, count in result['by_gender'].items():
        print(f"  {gender:10} {count:4} products")
    
    if result.get('missing_ids'):
        print(f"\nFirst missing IDs: {', '.join(result['missing_ids'][:10])}")


def cmd_translate(args):
    """Translate categories and products JA→RU (thin wrapper around translate.py)."""
    from translate import translate_categories, translate_products
    
    cat_count = translate_categories(str(DB_PATH), args.dry_run, args.limit)
    prod_count = translate_products(str(DB_PATH), args.dry_run, args.limit)
    
    if not args.dry_run:
        print(f"\nTranslated: {cat_count} categories, {prod_count} products.")


def main():
    ap = argparse.ArgumentParser(description="UNIQLO Parser")
    sub = ap.add_subparsers(dest="command")

    # categories
    p_cats = sub.add_parser("categories", help="Parse category tree")
    p_cats.add_argument("--gender", default="all", choices=["all", "women", "men", "kids", "baby"])

    # products
    p_prods = sub.add_parser("products", help="Parse products from DB categories")
    p_prods.add_argument("--max", type=int, default=0, help="Max products (0 = all)")

    # all
    p_all = sub.add_parser("all", help="Parse categories + products")
    p_all.add_argument("--gender", default="all", choices=["all", "women", "men", "kids", "baby"])
    p_all.add_argument("--max", type=int, default=0, help="Max products (0 = all)")
    p_all.add_argument("--translate", action="store_true", help="Run JA→RU translation after parsing")

    # product (single)
    p_prod = sub.add_parser("product", help="Parse single product page")
    p_prod.add_argument("--url", required=True, help="Product URL")
    p_prod.add_argument("--pretty", action="store_true", help="Pretty JSON output")

    # count
    p_count = sub.add_parser("count", help="Count products per category")

    # translate
    p_translate = sub.add_parser("translate", help="Translate categories/products JA→RU")
    p_translate.add_argument("--dry-run", action="store_true", help="Preview without writing")
    p_translate.add_argument("--limit", type=int, default=0, help="Limit rows (for testing)")

    args = ap.parse_args()

    if args.command == "categories":
        cmd_categories(args)
    elif args.command == "products":
        cmd_products(args)
    elif args.command == "all":
        cmd_all(args)
    elif args.command == "product":
        cmd_product(args)
    elif args.command == "count":
        cmd_count(args)
    elif args.command == "translate":
        cmd_translate(args)
    else:
        ap.print_help()


if __name__ == "__main__":
    main()
