#!/usr/bin/env python3
"""
Build Level-2 nav categories.
Sources: categories table (correct gender) + burger menu (images).
Expected: women=36, men=33, kids=29, baby=15.

Structure:
  A. Parent groups (parent_id IS NULL in categories)
  B. Promoted children (appear at Level-2 in nav even though they're depth-3 in URL)
  C. Special collaboration children (major 5 brands)
  D. Feature links (same for all genders, href prefix differs)
  E. LifeWear Collection
"""

import sys, sqlite3, time
from pathlib import Path
from playwright.sync_api import sync_playwright

DB_PATH = Path(__file__).resolve().parent.parent.parent / "frontend" / "data" / "uniqlo.db"
GENDERS = ["women", "men", "kids", "baby"]

# B: Children promoted to Level-2 (appear alongside parent groups in nav menu)
PROMOTED_CHILDREN = {
    "women": ["bratop", "shorts"],
    "men":   ["polo-shirts", "shorts"],
    "kids":  ["shorts"],
    "baby":  [],
}

# C: Special collab children — major 5 brands only
SC_BRANDS = [
    "uniqlo-f-risso", "uniqlo-and-cecilie-bahnsen",
    "uniqlo-c", "uniqlo-u", "uniqlo-and-jw-anderson",
]

# D: Feature links — same path for all genders, /{gender} suffix
FEATURE_LINKS = [
    ("限定価格商品",   "feature/limited-offers"),
    ("値下げ商品",     "feature/sale"),
    ("まとめ買い",     "feature/multi-buy"),
    ("一部店舗商品",   "feature/select-stores"),
    ("オンライン特別商品", "feature/online-exclusive"),
    ("再販要望商品",   "special-feature/cp/revival"),
    ("今週の新作",     "feature/new"),
    ("近日販売予定",   "feature/coming-soon"),
    ("ランキング",     "spl/ranking"),
    ("カスタムオーダー", "special-feature/uniqlo-custom-order"),
    ("UT",             "special-feature/ut"),
]

# E: LifeWear
LIFEWEAR = "lifewear-collection"


def main():
    db_path = str(DB_PATH)
    if "--db" in sys.argv:
        db_path = sys.argv[sys.argv.index("--db") + 1]

    # ---- Step 1: Images from burger menu ----
    print("Extracting burger menu images ...")
    slug_to_image = {}
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1440, "height": 900})
        page.goto("https://www.uniqlo.com/jp/ja/", timeout=30000, wait_until="domcontentloaded")
        time.sleep(3)
        page.evaluate("() => document.querySelectorAll('header button')[1]?.click()")
        time.sleep(2)
        pairs = page.evaluate("""() => {
            const flyout = document.querySelector('[class*="flyout-content" i]');
            if (!flyout) return [];
            const results = [];
            for (const link of flyout.querySelectorAll('a')) {
                const href = link.getAttribute('href') || '';
                const slug = href.replace(/\\?.*$/, '').split('/').filter(Boolean).pop() || '';
                for (const img of link.querySelectorAll('img')) {
                    const src = img.getAttribute('src') || img.getAttribute('data-src') || '';
                    if (src && src.includes('uniqlo') && (img.naturalWidth || img.width) >= 30) {
                        results.push({slug, src: src.startsWith('//') ? 'https:' + src : src});
                    }
                }
            }
            return results;
        }""")
        browser.close()

    for p in pairs:
        slug_to_image.setdefault(p["slug"], p["src"])  # keep first image per slug
    print(f"  {len(slug_to_image)} slug→image mappings")

    # ---- Step 2: Build per-gender ----
    conn = sqlite3.connect(db_path)
    conn.execute("DROP TABLE IF EXISTS nav_categories")
    conn.execute("""CREATE TABLE nav_categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL, slug TEXT NOT NULL,
        href TEXT, image TEXT, gender TEXT NOT NULL,
        "order" INTEGER DEFAULT 0
    )""")

    for gender in GENDERS:
        items = []
        seen = set()

        def add(name, slug, href):
            if slug not in seen:
                seen.add(slug)
                items.append((name, slug, href))

        # A: Parent groups
        rows = conn.execute(
            "SELECT name, slug FROM categories WHERE gender=? AND parent_id IS NULL ORDER BY \"order\"",
            (gender,),
        ).fetchall()
        for name, slug in rows:
            add(name, slug, f"/jp/ja/{gender}/{slug}")

        # B: Promoted children
        for child_slug in PROMOTED_CHILDREN.get(gender, []):
            row = conn.execute(
                "SELECT name, slug FROM categories WHERE gender=? AND slug=?",
                (gender, child_slug),
            ).fetchone()
            if row:
                add(row[0], row[1], f"/jp/ja/{gender}/tops/{child_slug}" if child_slug != "shorts" else f"/jp/ja/{gender}/bottoms/{child_slug}")

        # C: Special collab children
        sc_row = conn.execute(
            "SELECT id FROM categories WHERE gender=? AND slug='special-collaboration'",
            (gender,),
        ).fetchone()
        if sc_row:
            rows = conn.execute(
                "SELECT name, slug FROM categories WHERE parent_id=?", (sc_row[0],),
            ).fetchall()
            for name, slug in rows:
                if slug in SC_BRANDS:
                    add(name, slug, f"/jp/ja/{gender}/special-collaboration/{slug}")

        # D: Feature links — some don't apply to kids/baby
        feature_links = list(FEATURE_LINKS)
        if gender == "kids":
            feature_links = feature_links[:-2]   # remove UT and custom-order
        elif gender == "baby":
            feature_links = feature_links[:6]    # only first 6: limited-offers..online-exclusive

        for name, path in feature_links:
            add(name, path.split("/")[-1], f"/jp/ja/{path}/{gender}")

        # E: LifeWear Collection (not for baby)
        if gender != "baby":
            add("ライフウェアコレクション", LIFEWEAR, f"/jp/ja/special-feature/{LIFEWEAR}/{gender}")

        # Save
        for i, (name, slug, href) in enumerate(items):
            img = slug_to_image.get(slug)
            conn.execute(
                "INSERT INTO nav_categories (name, slug, href, image, gender, \"order\") VALUES (?, ?, ?, ?, ?, ?)",
                (name, slug, href, img, gender, i),
            )
        print(f"  {gender}: {len(items)} items")

    conn.commit()
    conn.close()
    print(f"\nSaved to: {db_path}")


if __name__ == "__main__":
    main()
