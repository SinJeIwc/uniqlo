#!/usr/bin/env python3
"""Product page parser — JSON-LD primary, DOM for aiReview + productDescription + chip images.

Usage:
    uv run python categories/parse_product.py --url https://www.uniqlo.com/jp/ja/products/E424873-000/00 --pretty
"""
import argparse, json, sys, time
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
from playwright.sync_api import sync_playwright
from lib.product_js import PRODUCT_PAGE_JS


def extract_product(page) -> dict:
    return page.evaluate(PRODUCT_PAGE_JS)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--url", required=True)
    parser.add_argument("--pretty", action="store_true")
    parser.add_argument("--output")
    args = parser.parse_args()

    print(f"  {args.url}", file=sys.stderr)
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1440, "height": 900})
        page.goto(args.url, timeout=30000, wait_until="domcontentloaded")
        time.sleep(2)
        result = extract_product(page)
        browser.close()

    result["url"] = args.url
    v = result.get("variants", [])
    print(f"    {result.get('name')} | ¥{result.get('price')} | {result.get('rating')}★ ({result.get('reviewCount')})", file=sys.stderr)
    print(f"    section={result.get('section')} category={result.get('category')} subcategory={result.get('subcategory')}", file=sys.stderr)
    print(f"    colors={len(result.get('colors',[]))} sizes={len(result.get('sizes',[]))} variants={len(v)} inStock={result.get('inStock')}", file=sys.stderr)

    json_str = json.dumps(result, ensure_ascii=False, indent=2 if args.pretty else None)
    if args.output:
        Path(args.output).write_text(json_str, encoding="utf-8")
    else:
        print(json_str)


if __name__ == "__main__":
    main()
