"""Product page parser — parallel, with resume support.

Visits terminal category pages (no #lineupLinkWrapper children),
collects product links, then parses each product page in parallel batches.
"""
import json
import sqlite3
import time

from playwright.sync_api import Browser

from lib.product_js import PRODUCT_PAGE_JS

PAGE_TIMEOUT = 30000
PARALLEL_TABS = 4



def parse_products(browser: Browser, db_path: str, max_products: int = 0) -> int:
    """Parse products from all terminal category pages.
    
    Now includes expansion of lineup pages: when a terminal category has
    #lineupLinkWrapper, we follow those sub-category links to find more products.
    
    Returns number of products parsed.
    """
    conn = sqlite3.connect(db_path)
    conn.execute("PRAGMA journal_mode = WAL")

    # Terminal categories: leaf nodes (no children) — these are where products live
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
        return 0

    # Already-parsed product IDs (resume support)
    existing = {r[0] for r in conn.execute("SELECT product_id FROM products").fetchall()}
    if existing:
        print(f"  resume: {len(existing)} products already parsed", flush=True)

    # Step 1a: Expand terminal categories with lineup sub-categories (skip if --max for test speed)
    if max_products > 0:
        # Fast path: skip expansion for quick --max tests
        expanded_cats = list(terminal_cats)
        print(f"  Skipping lineup expansion for --max test, scanning {len(expanded_cats)} terminal pages", flush=True)
    else:
        # Full run: expand lineup pages to find sub-categories + keep parent products
        print(f"▸ Expanding {len(terminal_cats)} categories with lineup sub-categories...", flush=True)
        page_temp = browser.new_page(viewport={"width": 1440, "height": 900})
        expanded_cats = []
        
        for cat_id, gender, slug, href in terminal_cats:
            url = f"https://www.uniqlo.com/jp/ja{href}"
            try:
                page_temp.goto(url, timeout=PAGE_TIMEOUT, wait_until="domcontentloaded")
                page_temp.wait_for_selector("body", timeout=5000)
                
                # Check for lineup sub-categories
                subcats = page_temp.evaluate("""() => {
                    const wrapper = document.querySelector('#lineupLinkWrapper');
                    if (!wrapper) return [];
                    return Array.from(wrapper.querySelectorAll('a[href]'))
                        .map(a => a.getAttribute('href'))
                        .filter(h => h && h.startsWith('/jp/ja/') && !h.includes('/products/'));
                }""")
                
                # ALWAYS keep parent (may have direct products like /women/tops with 36 items)
                expanded_cats.append((cat_id, gender, slug, href))
                
                # PLUS add sub-categories if found
                if subcats:
                    for subcat_href in subcats:
                        subcat_slug = subcat_href.split('/')[-1]
                        # Remove /jp/ja prefix to match DB convention (Step 1b adds it back)
                        subcat_href_clean = subcat_href.removeprefix("/jp/ja")
                        expanded_cats.append((cat_id, gender, subcat_slug, subcat_href_clean))
                        
            except Exception:
                # On error, keep original
                expanded_cats.append((cat_id, gender, slug, href))
        
        page_temp.close()
        
        added_count = len(expanded_cats) - len(terminal_cats)
        if added_count > 0:
            print(f"  Expanded to {len(expanded_cats)} pages (+{added_count} sub-categories)", flush=True)
        else:
            print(f"  No lineup sub-categories found, scanning {len(expanded_cats)} terminal pages", flush=True)

    # Step 1b: collect product hrefs from each expanded page
    print(f"▸ Collecting product links from {len(expanded_cats)} pages...", flush=True)
    product_hrefs: list[tuple[str, str, int, str]] = []  # (productId, href, catId, gender)
    seen_pids: set[str] = set()

    page = browser.new_page(viewport={"width": 1440, "height": 900})

    for i, (cat_id, gender, slug, href) in enumerate(expanded_cats):
        # Use href from DB for correct nested paths
        url = f"https://www.uniqlo.com/jp/ja{href}"
        try:
            page.goto(url, timeout=PAGE_TIMEOUT, wait_until="domcontentloaded")
            page.wait_for_selector("body", timeout=10000)
            
            # DEBUG: What does parser actually receive?
            if i == 0:  # Only first page to avoid spam
                html = page.content()
                title = page.title()
                print(f"\n🔍 DEBUG first page ({gender}/{slug}):", flush=True)
                print(f"  Title: {title}", flush=True)
                print(f"  HTML size: {len(html)} bytes", flush=True)
                print(f"  HTML preview (first 1000 chars):", flush=True)
                print(f"  {html[:1000]}", flush=True)
                print(f"  Contains '/products/E': {'/products/E' in html}", flush=True)
                print("", flush=True)

            # Scroll to load ALL products via infinite scroll
            # Enhanced for large catalogs (500+ items) with verification
            
            # Check for pagination/button before scroll
            has_pagination = page.evaluate("""() => {
                const hasButton = [...document.querySelectorAll('button, a')]
                    .some(el => el.textContent?.includes('もっと見る'));
                const hasPagination = !!document.querySelector('[class*="paginat"], nav[aria-label*="page"]');
                return {hasButton, hasPagination};
            }""")
            
            # Extract advertised count if available
            advertised_count = None
            try:
                advertised_count = page.evaluate(r"""() => {
                    // Look for "商品数 123" or "123 items" or similar
                    const text = document.body.textContent;
                    const patterns = [
                        /商品数[:\s]*(\d+)/,
                        /(\d+)\s*items?/i,
                        /(\d+)\s*products?/i,
                        /全\s*(\d+)\s*件/
                    ];
                    for (const pattern of patterns) {
                        const match = text.match(pattern);
                        if (match) return parseInt(match[1]);
                    }
                    return null;
                }""")
            except:
                pass
            
            prev = 0
            no_change_count = 0
            for scroll_iter in range(80):  # Up to 80 iterations for large catalogs
                page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
                time.sleep(1.5)  # Longer wait for network + render (was 1.0)
                
                try:
                    cur = page.evaluate(
                        "() => document.querySelectorAll('a[href*=\"/products/E\"]').length")
                except Exception:
                    break  # page navigated away
                
                # Log progress every 5 iterations
                if scroll_iter % 5 == 0 and scroll_iter > 0:
                    delta = cur - prev if scroll_iter > 0 else cur
                    print(f"    Scroll {scroll_iter}: {cur} products (+{delta})", flush=True)
                
                if cur == prev:
                    no_change_count += 1
                    # Wait 5 iterations to confirm end (was 3, increased for slow networks)
                    if no_change_count >= 5:
                        print(f"    Scroll complete at iteration {scroll_iter}: {cur} products", flush=True)
                        break
                else:
                    no_change_count = 0
                    prev = cur
            # Collect all unique product links from this page
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
            # Verify collected count vs advertised count
            if advertised_count and len(new_links) < advertised_count * 0.95:
                missing = advertised_count - len(new_links)
                print(f"  ⚠️  WARNING: {gender}/{slug} collected {len(new_links)}/{advertised_count} products (missing {missing})", flush=True)
            elif advertised_count:
                print(f"  ✓ {gender}/{slug}: collected {len(new_links)}/{advertised_count} products", flush=True)
            
            for prod in new_links:
                pid = prod["productId"]
                if pid not in existing and pid not in seen_pids:
                    seen_pids.add(pid)
                    product_hrefs.append((pid, prod["href"], cat_id, gender))
                    if max_products > 0 and len(product_hrefs) >= max_products:
                        break

            if max_products > 0 and len(product_hrefs) >= max_products:
                break

        except Exception as e:
            print(f"  ✗ {gender}/{slug}: {e}", flush=True)
            continue

        if (i + 1) % 20 == 0:
            print(f"  {i+1}/{len(expanded_cats)} pages, {len(product_hrefs)} new products",
                  flush=True)

    page.close()
    print(f"  new products to parse: {len(product_hrefs)}", flush=True)

    if not product_hrefs:
        conn.close()
        return 0

    # Step 2: parse product detail pages in parallel
    print(f"▸ Parsing {len(product_hrefs)} product pages ({PARALLEL_TABS} tabs)...", flush=True)
    parsed = _parse_parallel(browser, product_hrefs, max_products)


    if parsed:
        _save_products(db_path, parsed)

        # Deactivate stale products ONLY on full parse (not --max, not resume)
        # Resume mode skips existing products, so deactivation would be incorrect
        if max_products == 0 and not existing:
            cat_ids = set(p.get("category_id") for p in parsed if p.get("category_id"))
            parsed_pids = [p["product_id"] for p in parsed]
            if cat_ids and parsed_pids:
                cat_ph = ",".join("?" for _ in cat_ids)
                pid_ph = ",".join("?" for _ in parsed_pids)
                conn.execute(
                    f"""UPDATE products SET active = 0
                        WHERE active = 1
                        AND category_id IN ({cat_ph})
                        AND product_id NOT IN ({pid_ph})""",
                    list(cat_ids) + parsed_pids,
                )
                conn.commit()

    conn.close()
    return len(parsed)
def _parse_parallel(browser: Browser, hrefs: list, max_products: int) -> list[dict]:
    """Load product pages in parallel batches and extract data."""
    pages = [browser.new_page(viewport={"width": 1440, "height": 900})
             for _ in range(PARALLEL_TABS)]
    results: list[dict] = []
    seen: set[str] = set()
    queue = list(hrefs)
    errors: list[str] = []

    while queue and (max_products == 0 or len(results) < max_products):
        batch_size = min(PARALLEL_TABS, len(queue))
        if max_products > 0:
            batch_size = min(batch_size, max_products - len(results))
        batch = [queue.pop(0) for _ in range(batch_size)]
        failed: set[int] = set()

        # Start all parallel loads
        for j, (pid, href, cat_id, gender) in enumerate(batch):
            try:
                pages[j].goto(f"https://www.uniqlo.com{href}",
                              timeout=PAGE_TIMEOUT, wait_until="domcontentloaded")
            except Exception as e:
                errors.append(f"  goto {href}: {e}")
                failed.add(j)

        # Extract data
        for j, (pid, href, cat_id, gender) in enumerate(batch):
            if j in failed:
                continue
            try:
                pages[j].wait_for_selector(
                    "script[type='application/ld+json']", state="attached", timeout=10000)
                data = pages[j].evaluate(PRODUCT_PAGE_JS)
                product_id = data.get("productId")
                if product_id and product_id not in seen:
                    seen.add(product_id)
                    results.append({
                        "product_id": product_id,
                        "name": data.get("name", ""),
                        "description": data.get("description"),
                        "brand": data.get("brand", "UNIQLO"),
                        "section": data.get("section"),
                        "category": data.get("category"),
                        "subcategory": data.get("subcategory"),
                        "price": data.get("price"),
                        "rating": data.get("rating"),
                        "review_count": data.get("reviewCount"),
                        "gender": data.get("gender", gender),
                        "category_id": cat_id,
                        "material": data.get("material"),
                        "colors": data.get("colors", []),
                        "color_chips": data.get("colorChips", []),
                        "sizes": data.get("sizes", []),
                        "variants": data.get("variants", []),
                        "gallery": data.get("gallery", []),
                        "ai_review": data.get("aiReview"),
                        "product_description": data.get("productDescription", []),
                        "in_stock": data.get("inStock", 1),
                    })
            except Exception as e:
                errors.append(f"  extract {href}: {e}")

        if len(results) % 50 == 0:
            print(f"  {len(results)} products ({len(queue)} remaining)", flush=True)

    for p in pages:
        p.close()

    if errors:
        print(f"  {len(errors)} errors:", flush=True)
        for e in errors[:5]:
            print(f"    {e}", flush=True)

    return results


def _save_products(db_path: str, products: list[dict]):
    """Upsert products, preserving existing translations.

    If source text (name, section, etc.) hasn't changed → keep old _ru fields.
    If source text changed → clear _ru (needs re-translation).
    Sets active=1 for all upserted products.
    """
    conn = sqlite3.connect(db_path)
    conn.execute("PRAGMA journal_mode = WAL")

    # Load existing translations for products being updated
    pids = [p["product_id"] for p in products]
    placeholders = ",".join("?" for _ in pids)
    existing = {}
    if pids:
        rows = conn.execute(
            f"""SELECT product_id, name, section, category, subcategory, description,
                       name_ru, section_ru, category_ru, subcategory_ru, description_ru
                FROM products WHERE product_id IN ({placeholders})""",
            pids,
        ).fetchall()
        for r in rows:
            existing[r[0]] = {
                "name": r[1], "section": r[2], "category": r[3],
                "subcategory": r[4], "description": r[5],
                "name_ru": r[6], "section_ru": r[7], "category_ru": r[8],
                "subcategory_ru": r[9], "description_ru": r[10],
            }

    rows = []
    for p in products:
        pid = p["product_id"]
        prev = existing.get(pid, {})

        # Preserve translation if source text unchanged
        name_ru = prev.get("name_ru") if prev.get("name") == p.get("name") else None
        section_ru = prev.get("section_ru") if prev.get("section") == p.get("section") else None
        category_ru = prev.get("category_ru") if prev.get("category") == p.get("category") else None
        subcategory_ru = prev.get("subcategory_ru") if prev.get("subcategory") == p.get("subcategory") else None
        description_ru = prev.get("description_ru") if prev.get("description") == p.get("description") else None

        rows.append((
            pid, p["name"], p.get("description"), p.get("brand", "UNIQLO"),
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
            name_ru, description_ru, section_ru, category_ru, subcategory_ru,
        ))

    conn.executemany(
        """INSERT INTO products
           (product_id, name, description, brand,
            section, category, subcategory, price, rating, review_count,
            gender, category_id, material,
            colors, color_chips, sizes, variants, gallery,
            ai_review, product_description, in_stock,
            name_ru, description_ru, section_ru, category_ru, subcategory_ru)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON CONFLICT(product_id) DO UPDATE SET
            name=excluded.name, description=excluded.description, brand=excluded.brand,
            section=excluded.section, category=excluded.category, subcategory=excluded.subcategory,
            price=excluded.price, rating=excluded.rating, review_count=excluded.review_count,
            gender=excluded.gender, category_id=excluded.category_id, material=excluded.material,
            colors=excluded.colors, color_chips=excluded.color_chips,
            sizes=excluded.sizes, variants=excluded.variants, gallery=excluded.gallery,
            ai_review=excluded.ai_review, product_description=excluded.product_description,
            in_stock=excluded.in_stock,
            name_ru=excluded.name_ru, description_ru=excluded.description_ru,
            section_ru=excluded.section_ru, category_ru=excluded.category_ru,
            subcategory_ru=excluded.subcategory_ru,
            active=1""",
        rows,
    )
    conn.commit()
    print(f"  saved {len(rows)} products", flush=True)
    conn.close()
