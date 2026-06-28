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

def get_grid_images(md_names_by_gender: dict[str, set[str]]):
    """Extract category images from the category grid on each gender page.
    Returns {(gender, name, slug): image_url}."""
    print("▸ Извлечение иконок из грида ...")
    images: dict[tuple, str] = {}
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
            time.sleep(4)
            # Extract category items from the page grid (links with images, href contains /gender/)
            items = page.evaluate(f"""(g => {{
                const results = [];
                const seen = new Set();
                for (const a of document.querySelectorAll('a')) {{
                    const imgs = a.querySelectorAll('img');
                    const href = a.getAttribute('href') || '';
                    const text = (a.textContent || '').replace(/\\s+/g, ' ').trim();
                    if (!imgs.length || !href.includes('/' + g + '/') || text.length > 50 || text.length < 2) continue;
                    const slug = href.split('/').filter(Boolean).pop() || '';
                    const key = text + '|' + slug;
                    if (seen.has(key)) continue;
                    seen.add(key);
                    let image = null;
                    for (const img of imgs) {{
                        const src = img.getAttribute('src') || img.getAttribute('data-src') || '';
                        if (src && src.includes('uniqlo')) {{
                            image = src.startsWith('//') ? 'https:' + src : src;
                            break;
                        }}
                    }}
                    results.push({{name: text, slug, image}});
                }}
                return results;
            }})("{gender}")""")
            added = 0
            for item in items:
                key = (gender, item["name"], item["slug"])
                if key not in images and item["image"]:
                    images[key] = item["image"]
                    added += 1
            page.close()
            print(f"  {gender}: +{added} иконок (всего {len(images)})")
        browser.close()
    return images


def get_feature_images():
    """Get images for feature links from the category flyout."""
    print("▸ Иконки фиче-ссылок ...", end=" ", flush=True)
    t0 = time.time()
    feature_slugs = {p.split("/")[-1] for _, p in FEATURE_LINKS}
    slug_to_image: dict[str, str] = {}
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
                let slug = parts.pop() || '';
                if (genders.includes(slug) && parts.length) slug = parts.pop() || '';
                for (const img of a.querySelectorAll('img')) {
                    const s = img.getAttribute('src') || img.getAttribute('data-src') || '';
                    if (s && s.includes('uniqlo') && (img.naturalWidth||img.width) >= 30)
                        r.push({slug, src: s.startsWith('//') ? 'https:' + s : s});
                }
            }
            return r;
        }""")
        browser.close()
    for p in pairs:
        if p["slug"] in feature_slugs and p["slug"] not in slug_to_image:
            slug_to_image[p["slug"]] = p["src"]
    print(f"{len(slug_to_image)}/{len(feature_slugs)}, {time.time()-t0:.0f}с")
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
    #   leaf_by_name[(gender, name)] → [{id, key, parent_id, parent_key, parent_name}, ...]
    #   parent_by_name[(gender, name)] → {id, key}  (parents are in leaf.parents[1])
    leaf_by_name: dict[tuple, list[dict]] = {}
    parent_by_name: dict[tuple, dict] = {}
    for c in json_data:
        parents = c.get("parents", [])
        gender = parents[0]["key"] if parents else "women"
        name = c["name"]
        entry = {
            "id": c["id"], "key": c["key"],
            "parent_id": parents[1]["id"] if len(parents) >= 2 else None,
            "parent_key": parents[1]["key"] if len(parents) >= 2 else None,
            "parent_name": parents[1]["name"] if len(parents) >= 2 else None,
        }
        key = (gender, name)
        if key not in leaf_by_name:
            leaf_by_name[key] = []
        leaf_by_name[key].append(entry)
        # Register parents from parents[1]
        if len(parents) >= 2:
            p = parents[1]
            pk = (gender, p["name"])
            if pk not in parent_by_name:
                parent_by_name[pk] = {"id": p["id"], "key": p["key"]}

    # 3. Match — collect md names per gender to enable parent-preference
    md_names_by_gender = {g: set(names) for g, names in md_data.items()}
    print("▸ Матчинг ...")
    matched: dict[str, list] = {}  # gender → [(name, slug, cid, parent_id, parent_slug, parent_name, is_parent)]
    for gender, names in md_data.items():
        matched[gender] = []
        for name in names:
            # Prefer parent match over leaf when both exist
            parent = parent_by_name.get((gender, name))
            if parent:
                matched[gender].append((name, parent["key"], parent["id"], None, None, None, True))
            else:
                candidates = leaf_by_name.get((gender, name), [])
                if candidates:
                    best = next((c for c in reversed(candidates) if c["parent_name"] in md_names_by_gender.get(gender, set())), candidates[-1])
                    matched[gender].append((name, best["key"], best["id"], best["parent_id"], best["parent_key"], best["parent_name"], False))
                else:
                    # Try reversing name parts (レギンス・パンツ ↔ パンツ・レギンス)
                    parts = name.split("・")
                    reversed_name = "・".join(reversed(parts)) if len(parts) > 1 else name
                    if reversed_name != name:
                        parent2 = parent_by_name.get((gender, reversed_name))
                        if parent2:
                            matched[gender].append((name, parent2["key"], parent2["id"], None, None, None, True))
                            continue
                        candidates2 = leaf_by_name.get((gender, reversed_name), [])
                        if candidates2:
                            best = next((c for c in reversed(candidates2) if c["parent_name"] in md_names_by_gender.get(gender, set())), candidates2[-1])
                            matched[gender].append((name, best["key"], best["id"], best["parent_id"], best["parent_key"], best["parent_name"], False))
                            continue
                    print(f"  ⚠ {gender}/{name} — не найден")

    # 4. Images
    images = get_grid_images(md_names_by_gender)
    feature_images = get_feature_images()

    # Helper to get image for a category
    def get_img(gender: str, name: str, slug: str) -> str | None:
        img = images.get((gender, name, slug))
        if img: return img
        # Try matching by slug (for names that differ between grid and JSON)
        for (g, n, s), url in images.items():
            if g == gender and s == slug:
                return url
        img = feature_images.get(slug)
        if img: return img
        return None

    # 5. DB
    conn = sqlite3.connect(db_path)
    conn.execute("PRAGMA journal_mode = WAL")
    conn.execute("DROP TABLE IF EXISTS categories")
    conn.execute("""CREATE TABLE categories (
        id INTEGER PRIMARY KEY, name TEXT NOT NULL, slug TEXT NOT NULL,
        gender TEXT NOT NULL, parent_id INTEGER, "order" INTEGER DEFAULT 0,
        image TEXT, visible INTEGER DEFAULT 1
    )""")
