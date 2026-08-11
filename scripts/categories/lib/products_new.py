"""
Clean replacement for parse_products() with lineup subcategory expansion.
Copy this into products.py replacing the old parse_products function (lines 18-150).
"""

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

    # Step 1a: Expand terminal categories with lineup sub-categories
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
            
            if subcats:
                # This is a parent category - add its sub-categories instead
                for subcat_href in subcats:
                    subcat_slug = subcat_href.split('/')[-1]
                    expanded_cats.append((cat_id, gender, subcat_slug, subcat_href))
            else:
                # Leaf category - keep it
                expanded_cats.append((cat_id, gender, slug, href))
                
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

            # Scroll to load all products (lazy-loaded) - increased to 40 for large catalogs
            prev = 0
            for _ in range(40):
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
    parsed = _parse_parallel(browser, [p[1] for p in product_hrefs], max_products)

    # Enrich with category ID and gender from collection step
    for i, (pid, _, cat_id, gender) in enumerate(product_hrefs[:len(parsed)]):
        parsed[i]["category_id"] = cat_id
        parsed[i]["gender"] = gender

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
