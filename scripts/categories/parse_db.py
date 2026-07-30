#!/usr/bin/env python3
"""
Category + product parser — flyout → lineup → PLP → products → SQLite.

Full run:
    uv run python categories/parse_db.py

Single category:
    uv run python categories/parse_db.py --gender women --slug special-collaboration/uniqlo-u
"""
import argparse, json, sys, time
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
from playwright.sync_api import sync_playwright
from lib.flyout import parse_flyout, GENDERS
from lib.subs import parse_subcategories
from lib.db import upsert_categories, upsert_products
from lib.product_js import PRODUCT_PAGE_JS

DB_PATH = Path(__file__).resolve().parent.parent.parent / "frontend" / "data" / "uniqlo.db"


def kind_from_href(href: str) -> str:
    return href.strip("/").split("/")[0]


def href_depth(href: str) -> int:
    parts = href.strip("/").split("/")
    for i, p in enumerate(parts):
        if p in GENDERS: return len(parts) - i - 1
    return 99


def process_terminal(page, cat, all_cats, all_product_hrefs):
    """Parse terminal page via scroll + BannerWithProducts blocks."""
    # Scroll to each subcategory heading
    h2_count = page.evaluate("() => document.querySelectorAll('[_type=\"BannerWithProducts\"] h2').length")

    for i in range(h2_count):
        page.evaluate(f"""() => {{
            const h2 = document.querySelectorAll('[_type="BannerWithProducts"] h2')[{i}];
            if (h2) h2.scrollIntoView({{block: 'center'}});
        }}""")
        time.sleep(1.5)

    # Scroll to bottom to trigger any remaining lazy loads
    prev = 0
    for _ in range(10):
        page.evaluate("window.scrollBy(0, window.innerHeight)")
        time.sleep(0.8)
        cur = page.evaluate("() => document.querySelectorAll('a[href*=\"/products/E\"]').length")
        if cur == prev: break
        prev = cur

    # Extract subcategories + products
    subs = page.evaluate("""() => {
        const subcategories = [];
        const seen = new Set();
        for (const b of document.querySelectorAll('[_type="BannerWithProducts"]')) {
            const name = b.querySelector('h2')?.textContent?.trim() || '';
            const products = [];
            for (const a of b.querySelectorAll('a[href*="/products/"]')) {
                let href = a.getAttribute('href') || '';
                if (href.startsWith('https://www.uniqlo.com')) href = href.replace('https://www.uniqlo.com', '');
                const match = href.match(/\\/products\\/(E\\d+-\\d+\\/\\d+)/);
                if (!match || seen.has(match[1])) continue;
                seen.add(match[1]);
                products.push({productId: match[1], href});
            }
            if (name || products.length) subcategories.push({name, productCount: products.length, products});
        }
        return subcategories;
    }""")

    for sub in subs:
        l4_slug = sub["name"]
        l4_id = max((c["id"] for c in all_cats), default=0) + 1
        all_cats.append({
            "id": l4_id, "name": l4_slug, "slug": l4_slug,
            "href": f"{cat['href']}#{l4_slug}", "gender": cat["gender"],
            "parent_id": cat["id"], "kind": "filter", "nav": 0,
        })
        for prod in sub.get("products", []):
            all_product_hrefs.append((prod["productId"], prod["href"], l4_id, cat["gender"]))

    print(f"  {cat['gender']}/{cat['slug']}: {len(subs)} filters, {sum(s['productCount'] for s in subs)} items", file=sys.stderr)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--gender", choices=["women", "men", "kids", "baby"])
    ap.add_argument("--slug")
    args = ap.parse_args()
    single_mode = bool(args.gender and args.slug)

    all_cats, all_product_hrefs, cat_id = [], [], 0
    all_products, to_process = [], []

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)

        if single_mode:
            print(f"▸ Single: {args.gender}/{args.slug}", file=sys.stderr)
            page = browser.new_page(viewport={"width": 1440, "height": 900})
            url = f"https://www.uniqlo.com/jp/ja/{args.gender}/{args.slug}"
            page.goto(url, timeout=30000, wait_until="domcontentloaded")
            time.sleep(2)

            cat_id += 1
            cat = {"id": cat_id, "name": args.slug, "slug": args.slug,
                   "href": f"/{args.gender}/{args.slug}", "gender": args.gender,
                   "parent_id": None, "kind": args.gender, "nav": 1, "nav_order": 0}
            all_cats.append(cat)

            if page.evaluate("() => !!document.querySelector('#lineupLinkWrapper')"):
                subs = parse_subcategories(page, args.gender, args.slug)
                print(f"  lineup: {len(subs)} children", file=sys.stderr)
                for sub in subs:
                    cat_id += 1
                    clean = sub["href"].removeprefix("/jp/ja")
                    child = {"id": cat_id, "name": sub["text"], "slug": sub["slug"],
                             "href": clean, "gender": args.gender, "parent_id": cat["id"],
                             "image": sub["image"], "kind": kind_from_href(clean), "nav": 0}
                    all_cats.append(child)
                    to_process.append(child)
            else:
                to_process.append(cat)

            for l3 in list(to_process):
                l3_url = f"https://www.uniqlo.com/jp/ja/{l3['gender']}/{l3['slug']}"
                page.goto(l3_url, timeout=30000, wait_until="domcontentloaded")
                time.sleep(2)
                if page.evaluate("() => !!document.querySelector('#lineupLinkWrapper')"):
                    subs = parse_subcategories(page, l3["gender"], l3["slug"])
                    print(f"  {l3['gender']}/{l3['slug']}: {len(subs)} children", file=sys.stderr)
                    for sub in subs:
                        cat_id += 1
                        clean = sub["href"].removeprefix("/jp/ja")
                        all_cats.append({"id": cat_id, "name": sub["text"], "slug": sub["slug"],
                                         "href": clean, "gender": l3["gender"], "parent_id": l3["id"],
                                         "image": sub["image"], "kind": kind_from_href(clean), "nav": 0})
                else:
                    process_terminal(page, l3, all_cats, all_product_hrefs)

            browser.close()

        else:
            print("▸ Phase 1: Flyout", file=sys.stderr)
            page = browser.new_page(viewport={"width": 1440, "height": 900})
            flyout_data = parse_flyout(page)
            page.close()
            for gender in GENDERS:
                for i, item in enumerate(flyout_data.get(gender, [])):
                    cat_id += 1
                    kind = kind_from_href(item["href"])
                    cat = {"id": cat_id, "name": item["text"], "slug": item["slug"],
                           "href": item["href"], "gender": gender, "parent_id": None,
                           "image": item["image"], "kind": kind, "nav": 1, "nav_order": i}
                    all_cats.append(cat)
                    if kind in GENDERS and href_depth(item["href"]) == 1:
                        to_process.append(cat)
            print(f"  nav: {len(all_cats)}, to process: {len(to_process)}", file=sys.stderr)

            print("▸ Phase 2: Categories", file=sys.stderr)
            page = browser.new_page(viewport={"width": 1440, "height": 900})
            for cat in list(to_process):
                url = f"https://www.uniqlo.com/jp/ja/{cat['gender']}/{cat['slug']}"
                page.goto(url, timeout=30000, wait_until="domcontentloaded")
                time.sleep(2)
                if page.evaluate("() => !!document.querySelector('#lineupLinkWrapper')"):
                    subs = parse_subcategories(page, cat["gender"], cat["slug"])
                    print(f"  {cat['gender']}/{cat['slug']}: {len(subs)} children", file=sys.stderr)
                    for sub in subs:
                        if href_depth(sub["href"]) != 2: continue
                        cat_id += 1
                        clean = sub["href"].removeprefix("/jp/ja")
                        child = {"id": cat_id, "name": sub["text"], "slug": sub["slug"],
                                 "href": clean, "gender": cat["gender"], "parent_id": cat["id"],
                                 "image": sub["image"], "kind": kind_from_href(clean), "nav": 0}
                        all_cats.append(child)
                        to_process.append(child)
                else:
                    process_terminal(page, cat, all_cats, all_product_hrefs)
            page.close()
            browser.close()

    print(f"  categories: {len(all_cats)}, product pages: {len(all_product_hrefs)}", file=sys.stderr)

    if all_product_hrefs:
        print("▸ Phase 3: Products", file=sys.stderr)
        all_products, seen_pids = [], set()
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page(viewport={"width": 1440, "height": 900})
            for i, (variant_id, href, cat_id, p_gender) in enumerate(all_product_hrefs):
                page.goto(f"https://www.uniqlo.com{href}", timeout=30000, wait_until="domcontentloaded")
                time.sleep(2)
                data = page.evaluate(PRODUCT_PAGE_JS)
                pid = data.get("productId")
                if not pid or pid in seen_pids: continue
                seen_pids.add(pid)
                all_products.append({
                    "product_id": pid, "name": data.get("name", ""),
                    "description": data.get("description"), "brand": data.get("brand", "UNIQLO"),
                    "section": data.get("section"), "category": data.get("category"),
                    "subcategory": data.get("subcategory"),
                    "price": data.get("price"), "rating": data.get("rating"),
                    "review_count": data.get("reviewCount"), "gender": data.get("gender", p_gender),
                    "category_id": cat_id, "material": data.get("material"),
                    "colors": data.get("colors", []), "color_chips": data.get("colorChips", []),
                    "sizes": data.get("sizes", []), "variants": data.get("variants", []),
                    "gallery": data.get("gallery", []),
                    "ai_review": data.get("aiReview"),
                    "product_description": data.get("productDescription", []),
                    "in_stock": data.get("inStock", 1),
                })
                if (i + 1) % 20 == 0:
                    print(f"  {i + 1}/{len(all_product_hrefs)} ({len(all_products)} unique)", file=sys.stderr)
            browser.close()
        print(f"  unique products: {len(all_products)}", file=sys.stderr)

    print(f"\n▸ Saving to {DB_PATH}", file=sys.stderr)
    upsert_categories(str(DB_PATH), all_cats)
    if all_products:
        upsert_products(str(DB_PATH), all_products)
    print("Done.", file=sys.stderr)


if __name__ == "__main__":
    main()
