#!/usr/bin/env python3
"""
Unified category parser.
Sources: md files → uniqlo.com JSON (slugs) → trans CLI (ru) → Playwright (images).
Output: categories (tree) + nav_categories (Level-2).
"""

import re, json, subprocess, sys, sqlite3, time
from pathlib import Path
from urllib.request import urlopen, Request
from playwright.sync_api import sync_playwright

URL = "https://www.uniqlo.com/jp/ja/"
DB_PATH = Path(__file__).resolve().parent.parent.parent / "frontend" / "data" / "uniqlo.db"
MD_DIR = Path(__file__).resolve().parent

FEATURE_LINKS = [
    ("2026夏コレクション", "special-feature/lifewear-collection"),
    ("UT", "special-feature/ut"),
    ("期間限定価格商品", "feature/limited-offers"),
    ("値下げ商品", "feature/sale"),
    ("オンライン特別商品", "feature/online-exclusive"),
    ("今週の新作", "feature/new"),
    ("ランキング", "spl/ranking"),
]


def translate(text: str) -> str:
    try:
        r = subprocess.run(
            ["trans", "-b", "-e", "bing", "-s", "ja", "-t", "ru", text],
            capture_output=True, text=True, timeout=15,
        )
        t = r.stdout.strip()
        if t and t != text and "ERROR" not in t:
            return t
    except Exception:
        pass
    return text


def read_md_files():
    """women.md, men.md, kids.md, baby.md → {gender: [unique names]}."""
    mapping = {"women": "women.md", "men": "men.md", "kids": "kids.md", "baby": "baby.md"}
    result = {}
    for gender, fn in mapping.items():
        path = MD_DIR / fn
        if not path.exists():
            continue
        names = []
        seen = set()
        for line in path.read_text("utf-8").strip().split("\n"):
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            if line not in seen:
                seen.add(line)
                names.append(line)
        result[gender] = names
    return result


def fetch_json():
    print(f"▸ Загрузка {URL} ...", end=" ", flush=True)
    t0 = time.time()
    req = Request(URL, headers={"User-Agent": "Mozilla/5.0"})
    html = urlopen(req, timeout=15).read().decode("utf-8")
    print(f"({len(html)//1024} КБ, {time.time()-t0:.1f}с)")
    for m in re.finditer(r'"categories"\s*:\s*\[', html):
        start = m.end() - 1
        depth = i = 0
        i = start
        while i < len(html):
            if html[i] == "[": depth += 1
            elif html[i] == "]":
                depth -= 1
                if depth == 0:
                    data = json.loads(html[start : i + 1])
                    if isinstance(data, list) and len(data) > 100:
                        return data
                    break
            i += 1
    return []

def get_burger_images():
    """Extract images from burger menu on each gender page → {slug: image_url}."""
    print("▸ Извлечение иконок ...")
    slug_to_image: dict[str, str] = {}
    gender_urls = {
        "women": "https://www.uniqlo.com/jp/ja/",
        "men": "https://www.uniqlo.com/jp/ja/men",
        "kids": "https://www.uniqlo.com/jp/ja/kids",
        "baby": "https://www.uniqlo.com/jp/ja/baby",
    }
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        for gender, url in gender_urls.items():
            page = browser.new_page(viewport={"width": 1440, "height": 900})
            page.goto(url, timeout=30000, wait_until="domcontentloaded")
            time.sleep(3)
            # Open burger menu
            page.evaluate("() => document.querySelectorAll('header button')[1]?.click()")
            time.sleep(2)
            pairs = page.evaluate("""() => {
                const f = document.querySelector('[class*="flyout-content" i]');
                if (!f) return [];
                const r = [];
                for (const a of f.querySelectorAll('a')) {
                    const slug = (a.getAttribute('href')||'').split('/').filter(Boolean).pop()||'';
                    for (const img of a.querySelectorAll('img')) {
                        const s = img.getAttribute('src') || img.getAttribute('data-src') || '';
                        if (s && s.includes('uniqlo') && (img.naturalWidth||img.width)>=30)
                            r.push({slug, src: s.startsWith('//')?'https:'+s:s});
                    }
                }
                return r;
            }""")
            added = 0
            for p in pairs:
                if p["slug"] not in slug_to_image:
                    slug_to_image[p["slug"]] = p["src"]
                    added += 1
            # Close burger menu
            page.evaluate("() => document.querySelectorAll('header button')[1]?.click()")
            time.sleep(0.5)
            page.close()
            print(f"  {gender}: +{added} иконок (всего {len(slug_to_image)})")
        browser.close()

    # Also get feature link images from the category flyout (すべてのカテゴリを見る)
    print("  фиче-ссылки ...", end=" ", flush=True)
    t0 = time.time()
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1440, "height": 900})
        page.goto("https://www.uniqlo.com/jp/ja/", timeout=30000, wait_until="domcontentloaded")
        time.sleep(3)
        page.locator("text=すべてのカテゴリを見る").first.click()
        time.sleep(2)
        pairs = page.evaluate("""() => {
            const f = document.querySelector('[class*="flyout-wrapper" i]');
            if (!f) return [];
            const r = [];
            const genders = ['women','men','kids','baby'];
            for (const a of f.querySelectorAll('a')) {
                const href = a.getAttribute('href') || '';
                const parts = href.split('/').filter(Boolean);
                // For URLs ending in a gender, take second-to-last segment
                let slug = parts.pop() || '';
                if (genders.includes(slug) && parts.length) slug = parts.pop() || '';
                for (const img of a.querySelectorAll('img')) {
                    const s = img.getAttribute('src') || img.getAttribute('data-src') || '';
                    if (s && s.includes('uniqlo') && (img.naturalWidth||img.width)>=30)
                        r.push({slug, src: s.startsWith('//')?'https:'+s:s});
                }
            }
            return r;
        }""")
        browser.close()
    added = 0
    for p in pairs:
        if p["slug"] not in slug_to_image:
            slug_to_image[p["slug"]] = p["src"]
            added += 1
    print(f"+{added} (всего {len(slug_to_image)}, {time.time()-t0:.0f}с)")
    return slug_to_image


def main():
    db_path = str(DB_PATH)
    if "--db" in sys.argv:
        db_path = sys.argv[sys.argv.index("--db") + 1]
    no_translate = "--no-translate" in sys.argv

    # 1. MD files
    print("▸ Чтение md-файлов ...", end=" ", flush=True)
    md_data = read_md_files()
    print("OK")

    # 2. JSON
    json_data = fetch_json()
    if not json_data:
        print("ERROR: нет категорий")
        sys.exit(1)

    # Build indexes from JSON:
    #   leaf_by_name[(gender, name)] → {id, key, parent_id, parent_key, parent_name}
    #   parent_by_name[(gender, name)] → {id, key}  (parents are in leaf.parents[1])
    leaf_by_name = {}
    parent_by_name = {}
    for c in json_data:
        parents = c.get("parents", [])
        gender = parents[0]["key"] if parents else "women"
        name = c["name"]
        leaf_by_name[(gender, name)] = {
            "id": c["id"], "key": c["key"],
            "parent_id": parents[1]["id"] if len(parents) >= 2 else None,
            "parent_key": parents[1]["key"] if len(parents) >= 2 else None,
            "parent_name": parents[1]["name"] if len(parents) >= 2 else None,
        }
        # Register parents from parents[1]
        if len(parents) >= 2:
            p = parents[1]
            key = (gender, p["name"])
            if key not in parent_by_name:
                parent_by_name[key] = {"id": p["id"], "key": p["key"]}

    # 3. Match
    print("▸ Матчинг ...")
    matched = {}  # gender → [(name, slug, cid, parent_id, parent_slug, is_parent)]
    for gender, names in md_data.items():
        matched[gender] = []
        for name in names:
            # Try leaf first
            leaf = leaf_by_name.get((gender, name))
            if leaf:
                matched[gender].append((name, leaf["key"], leaf["id"], leaf["parent_id"], leaf["parent_key"], leaf["parent_name"], False))
            else:
                # Try parent
                parent = parent_by_name.get((gender, name))
                if parent:
                    matched[gender].append((name, parent["key"], parent["id"], None, None, None, True))
                else:
                    print(f"  ⚠ {gender}/{name} — не найден")

    # 4. Images
    slug_to_image = get_burger_images()

    # 5. DB
    conn = sqlite3.connect(db_path)
    conn.execute("PRAGMA journal_mode = WAL")
    conn.execute("DROP TABLE IF EXISTS categories")
    conn.execute("DROP TABLE IF EXISTS nav_categories")
    conn.execute("""CREATE TABLE categories (
        id INTEGER PRIMARY KEY, name TEXT NOT NULL, slug TEXT NOT NULL,
        gender TEXT NOT NULL, parent_id INTEGER, "order" INTEGER DEFAULT 0,
        image TEXT, visible INTEGER DEFAULT 1
    )""")
    conn.execute("""CREATE TABLE nav_categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL, slug TEXT NOT NULL,
        href TEXT, image TEXT, gender TEXT NOT NULL,
        "order" INTEGER DEFAULT 0
    )""")

    order_map = {"women": 0, "men": 1, "kids": 2, "baby": 3}
    inserted_parents = set()
    nav_items = {g: [] for g in md_data}

    for gender in ["women", "men", "kids", "baby"]:
        if gender not in matched:
            continue

        for name, slug, cid, parent_id, parent_slug, parent_name, is_parent in matched[gender]:
            if is_parent:
                # Parent group — insert directly, no parent_id
                if cid not in inserted_parents:
                    inserted_parents.add(cid)
                    conn.execute(
                        "INSERT OR REPLACE INTO categories (id, name, slug, gender, parent_id, \"order\", image) VALUES (?, ?, ?, ?, NULL, ?, ?)",
                        (cid, name, slug, gender, order_map.get(gender, 0), slug_to_image.get(slug)),
                    )
                href = f"/jp/ja/{gender}/{slug}"
                nav_items[gender].append((name, slug, href, slug_to_image.get(slug)))
            else:
                # Child — insert with parent
                if parent_id and parent_id not in inserted_parents:
                    inserted_parents.add(parent_id)
                    conn.execute(
                        "INSERT OR REPLACE INTO categories (id, name, slug, gender, parent_id, \"order\", image) VALUES (?, ?, ?, ?, NULL, ?, ?)",
                        (parent_id, parent_name or slug, parent_slug or slug, gender, order_map.get(gender, 0), slug_to_image.get(parent_slug or slug)),
                    )
                conn.execute(
                    "INSERT OR REPLACE INTO categories (id, name, slug, gender, parent_id, \"order\", image) VALUES (?, ?, ?, ?, ?, ?, ?)",
                    (cid, name, slug, gender, parent_id, order_map.get(gender, 0), slug_to_image.get(slug)),
                )
                href = f"/jp/ja/{gender}/{parent_slug}/{slug}" if parent_slug else f"/jp/ja/{gender}/{slug}"
                nav_items[gender].append((name, slug, href, slug_to_image.get(slug)))

        # Feature links
        for feat_name, feat_path in FEATURE_LINKS:
            feat_slug = feat_path.split("/")[-1]
            nav_items[gender].append((feat_name, feat_slug, f"/jp/ja/{feat_path}/{gender}", None))

    # 6. Translate
    if not no_translate:
        rows = conn.execute("SELECT id, name FROM categories").fetchall()
        print(f"▸ Перевод {len(rows)} названий ...")
        t0 = time.time()
        tc = 0
        for i, (cid, name) in enumerate(rows):
            tr = translate(name)
            if tr != name:
                conn.execute("UPDATE categories SET name = ? WHERE id = ?", (tr, cid))
                tc += 1
            pct = (i + 1) / len(rows) * 100
            eta = (time.time() - t0) / (i + 1) * (len(rows) - i - 1) if i else 0
            bar = "█" * int(20 * (i + 1) / len(rows)) + "░" * (20 - int(20 * (i + 1) / len(rows)))
            print(f"\r  [{bar}] {i+1}/{len(rows)} ({pct:.0f}%) | {tc} | {eta:.0f}с", end="", flush=True)
        conn.commit()
        print(f"\n  Готово за {time.time()-t0:.0f}с, переведено {tc}")

    # Save nav
    for g in ["women", "men", "kids", "baby"]:
        for i, (name, slug, href, img) in enumerate(nav_items[g]):
            conn.execute(
                "INSERT INTO nav_categories (name, slug, href, image, gender, \"order\") VALUES (?, ?, ?, ?, ?, ?)",
                (name, slug, href, img, g, i),
            )

    conn.commit()

    # Stats
    print(f"\nСохранено: {db_path}")
    for t in ["categories", "nav_categories"]:
        rows = conn.execute(f"SELECT gender, count(*) FROM {t} GROUP BY gender").fetchall()
        print(f"  {t}: {dict(rows)}")
    conn.close()


if __name__ == "__main__":
    main()
