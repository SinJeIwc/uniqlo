"""Count available products without parsing them.

Uses EXACT same collection logic as products.py to ensure accurate comparison.
"""
import sqlite3
import time
from playwright.sync_api import Browser

PAGE_TIMEOUT = 30000


def count_products(browser: Browser, db_path: str) -> dict:
    """Count products available on UNIQLO without parsing them.
    
    Returns:
        {
            "total_found": int,        # unique products found on site
            "total_in_db": int,        # products already in DB
            "missing": int,            # found but not in DB
            "categories_scanned": int, # terminal categories checked
            "by_gender": {...}         # breakdown by gender
        }
    """
    conn = sqlite3.connect(db_path)
    conn.execute("PRAGMA journal_mode = WAL")

    # Terminal categories with proper hrefs
    terminal_cats = conn.execute(
        """SELECT c.id, c.gender, c.slug, c.href
           FROM categories c
           WHERE c.id NOT IN (
               SELECT DISTINCT parent_id FROM categories WHERE parent_id IS NOT NULL
           )
           ORDER BY c.gender, c.slug"""
    ).fetchall()

    if not terminal_cats:
        print("  No terminal categories found in DB. Run 'categories' first.")
        conn.close()
        return {}

    # Already-parsed product IDs (EXACT format: E424873-000)
    existing = {r[0] for r in conn.execute("SELECT product_id FROM products").fetchall()}

    print(f"▸ Scanning {len(terminal_cats)} category pages for product links...")
    print(f"  (DB has {len(existing)} products already)\n", flush=True)

    product_ids: set[str] = set()
    by_gender: dict[str, int] = {}
    
    page = browser.new_page(viewport={"width": 1440, "height": 900})
    page.set_default_timeout(PAGE_TIMEOUT)

    for i, (cat_id, gender, slug, href) in enumerate(terminal_cats):
        # Use href from DB for correct nested paths (/men/tops/t-shirts, not /men/t-shirts)
        url = f"https://www.uniqlo.com/jp/ja{href}"
        
        try:
            page.goto(url, timeout=PAGE_TIMEOUT, wait_until="domcontentloaded")
            page.wait_for_selector("body", timeout=10000)

            # Skip lineup pages (same check as products.py line 60-61)
            if page.evaluate("() => !!document.querySelector('#lineupLinkWrapper')"):
                continue

            # EXACT SCROLL LOGIC from products.py lines 63-75
            # Scroll to load all lazy-loaded products
            prev = 0
            for _ in range(6):
                page.evaluate("window.scrollBy(0, window.innerHeight)")
                time.sleep(0.3)
                try:
                    cur = page.evaluate(
                        "() => document.querySelectorAll('a[href*=\"/products/E\"]').length")
                except Exception:
                    break  # page navigated away
                if cur == prev:
                    break
                prev = cur

            # EXACT EXTRACTION LOGIC from products.py lines 78-91
            # Collect all unique product links from this terminal page
            new_links = page.evaluate("""() => {
                const links = [];
                const seen = new Set();
                for (const a of document.querySelectorAll('a[href*="/products/"]')) {
                    let href = a.getAttribute('href') || '';
                    if (href.startsWith('https://www.uniqlo.com'))
                        href = href.replace('https://www.uniqlo.com', '');
                    const match = href.match(/\\/products\\/(E\\d+-\\d+)\\/\\d+/);
                    if (!match || seen.has(match[1])) continue;
                    seen.add(match[1]);
                    links.push({productId: match[1], href});
                }
                return links;
            }""")

            # Count products from this category
            cat_products = set()
            for prod in new_links:
                pid = prod["productId"]  # Format: E424873-000 (with dash)
                product_ids.add(pid)
                cat_products.add(pid)

            # Count by gender
            by_gender[gender] = by_gender.get(gender, 0) + len(cat_products)

            print(f"  [{i+1}/{len(terminal_cats)}] {gender:6} {slug:30} → {len(cat_products):3} products", flush=True)

        except Exception as e:
            print(f"  [{i+1}/{len(terminal_cats)}] {gender:6} {slug:30} → ERROR: {str(e)[:50]}", flush=True)

    page.close()
    conn.close()

    missing = product_ids - existing
    
    return {
        "total_found": len(product_ids),
        "total_in_db": len(existing),
        "missing": len(missing),
        "categories_scanned": len(terminal_cats),
        "by_gender": by_gender,
        "missing_ids": sorted(missing)[:20]  # first 20 for debugging
    }
