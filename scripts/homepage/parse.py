#!/usr/bin/env python3
"""
UNIQLO Homepage Parser
Парсит uniqlo.com, извлекает кампании с фото/видео, переводит на русский.

Usage:
  uv run python homepage/parse_homepage.py
  uv run python homepage/parse_homepage.py --region us
  uv run python homepage/parse_homepage.py --categories women,men
  uv run python homepage/parse_homepage.py --no-translate

Output: frontend/src/data/home/{gender}.json
"""

import json, os, sys, time, argparse, subprocess
from dataclasses import dataclass, asdict
from typing import Optional
from playwright.sync_api import sync_playwright, Page


# ── Translation (was translate.py) ──────────────────────────────

_JA_RANGES = [
    (0x3040, 0x30FF),   # Hiragana + Katakana
    (0x4E00, 0x9FFF),   # CJK Unified
    (0x3000, 0x303F),   # CJK Punctuation
    (0xFF00, 0xFFEF),   # Halfwidth/Fullwidth forms
]


def has_japanese(text: str) -> bool:
    if not text:
        return False
    return any(any(lo <= ord(c) <= hi for lo, hi in _JA_RANGES) for c in text)


def translate(text: str, src: str = "ja", dest: str = "ru") -> str:
    if not text or not has_japanese(text):
        return text
    try:
        r = subprocess.run(
            ["trans", "-b", "-e", "bing", "-s", src, "-t", dest, text],
            capture_output=True, text=True, timeout=15,
        )
        t = r.stdout.strip()
        if t and t != text and "ERROR" not in t:
            return t
    except Exception:
        pass
    return text


# ── Extraction (was extract.py) ─────────────────────────────────

@dataclass
class Campaign:
    image: Optional[str] = None
    video: Optional[str] = None
    badge: Optional[str] = None
    badgeImage: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    price: Optional[str] = None
    saleText: Optional[str] = None
    note: Optional[str] = None
    link: Optional[str] = None


_GENDER_PATTERNS = [
    ("baby",  ["/baby/", "/baby", "/newborn/"]),
    ("kids",  ["/kids/", "/kids", "/kids-baby-monthlynews"]),
    ("men",   ["/men/", "/men"]),
    ("women", ["/women/", "/women"]),
]

_SKIP_PATTERNS = ["/livestation/"]

def classify_gender(link: str, fallback: str = "women") -> str:
    """Classify block by its href. Default: fallback gender."""
    if not link:
        return fallback
    lower = link.lower()
    for gender, patterns in _GENDER_PATTERNS:
        for pat in patterns:
            if pat in lower:
                return gender
    return fallback


def should_skip(link: str) -> bool:
    if not link:
        return False
    lower = link.lower()
    return any(pat in lower for pat in _SKIP_PATTERNS)


def extract(page: Page, url: str) -> list[Campaign]:
    print(f"  Loading {url} ...")
    page.goto(url, timeout=30000, wait_until="domcontentloaded")
    page.wait_for_selector("a img, a video", timeout=15000)
    time.sleep(3)

    current_url = page.evaluate("() => window.location.href")
    if current_url.rstrip("/") != url.rstrip("/"):
        print(f"  WARNING: URL is {current_url}, expected {url}")

    prev_count = 0
    for i in range(12):
        page.evaluate("window.scrollBy(0, window.innerHeight * 0.7)")
        time.sleep(1.0)
        current = page.evaluate("() => document.querySelectorAll('a img').length")
        if current != prev_count and i > 2:
            print(f"    scroll {i+1}: {current} images found (was {prev_count})")
        prev_count = current

    page.evaluate("window.scrollTo(0, 0)")
    time.sleep(0.5)
    page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
    time.sleep(2)
    page.evaluate("window.scrollTo(0, 0)")
    time.sleep(0.5)

    campaigns_raw = page.evaluate("""() => {
        const normUrl = (url) => {
            if (!url) return null;
            url = url.trim();
            if (url.startsWith('//')) url = 'https:' + url;
            if (url.includes(':///')) url = url.replace(/^.*?:\\/\\//, 'https://');
            return url || null;
        };
        const results = [];
        const seen = new Set();
        for (const link of document.querySelectorAll('a')) {
            const href = link.getAttribute('href') || '';
            if (href.includes('/products/')) continue;  // skip product cards
            const imgs = link.querySelectorAll('img');
            const video = link.querySelector('video');
            if (imgs.length === 0 && !video) continue;
            let mainImg = null;
            let badgeImg = null;
            for (const img of imgs) {
                const w = img.naturalWidth || img.width || 0;
                const h = img.naturalHeight || img.height || 0;
                if (w >= 200 && h >= 200) { mainImg = img; }
                else if (w > 0 && h > 0 && w < 200 && h < 100) { badgeImg = img; }
            }
            let imageUrl = null;
            if (mainImg) imageUrl = normUrl(mainImg.getAttribute('data-src') || mainImg.src);
            if (!imageUrl && video) {
                const p = video.getAttribute('poster') || video.getAttribute('data-poster');
                if (p) imageUrl = normUrl(p);
            }
            let videoUrl = null;
            if (video) {
                videoUrl = normUrl(video.getAttribute('data-src') || video.getAttribute('src') ||
                    (video.querySelector('source') || {}).getAttribute?.('src'));
            }
            const key = imageUrl || videoUrl;
            if (!key || seen.has(key)) continue;
            seen.add(key);
            let badge = null, badgeImage = null;
            if (badgeImg) {
                badge = (badgeImg.alt || '').trim() || null;
                badgeImage = normUrl(badgeImg.getAttribute('data-src') || badgeImg.src);
            }
            const ps = Array.from(link.querySelectorAll('p'))
                .map(p => p.textContent.replace(/\\s+/g, ' ').trim())
                .filter(t => t.length > 0);
            const textPs = ps.filter(t => !/^[¥$]/.test(t));
            const pricePs = ps.filter(t => /^[¥$]/.test(t));
            let saleText = null, note = null;
            for (const t of textPs) {
                if (/[0-9]+月|[0-9]+日|期限|期間|まで|限定|OFFER|SALE/i.test(t)) saleText = t;
                else if (t.startsWith('※') || t.startsWith('*') || t.startsWith('＊')) note = t;
            }
            results.push({
                image: imageUrl, video: videoUrl, badge, badgeImage,
                title: textPs[0] || null, description: textPs[1] || null,
                price: pricePs[0] || null, saleText, note,
                link: link.getAttribute('href') || null
            });
        }
        return results;
    }""")

    return [Campaign(
        image=c.get("image"), video=c.get("video"), badge=c.get("badge"),
        badgeImage=c.get("badgeImage"), title=c.get("title"),
        description=c.get("description"), price=c.get("price"),
        saleText=c.get("saleText"), note=c.get("note"), link=c.get("link"),
    ) for c in campaigns_raw]


# ── Main (was __main__.py) ──────────────────────────────────────

REGIONS = {
    "jp": "https://www.uniqlo.com/jp/ja",
    "us": "https://www.uniqlo.com/us/en",
    "uk": "https://www.uniqlo.com/uk/en",
    "fr": "https://www.uniqlo.com/fr/fr",
    "de": "https://www.uniqlo.com/de/de",
    "kr": "https://www.uniqlo.com/kr/ko",
    "sg": "https://www.uniqlo.com/sg/en",
    "my": "https://www.uniqlo.com/my/en",
    "th": "https://www.uniqlo.com/th/th",
    "ph": "https://www.uniqlo.com/ph/en",
    "id": "https://www.uniqlo.com/id/en",
    "au": "https://www.uniqlo.com/au/en",
    "ca": "https://www.uniqlo.com/ca/en",
}

ALL_CATEGORIES = ["women", "men", "kids", "baby"]
CATEGORY_PATHS = {"women": "", "men": "/men", "kids": "/kids", "baby": "/baby"}
_PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
_OUT_DIR = os.path.join(_PROJECT_ROOT, "frontend", "src", "data", "home")


def main():
    parser = argparse.ArgumentParser(description="Parse UNIQLO homepage campaigns")
    parser.add_argument("--region", default="jp", choices=list(REGIONS.keys()))
    parser.add_argument("--categories", default=None,
                        help="Comma-separated: women,men,kids,baby (default: all)")
    parser.add_argument("--no-translate", action="store_true")
    args = parser.parse_args()

    base_url = REGIONS[args.region]
    if args.categories:
        requested = [c.strip() for c in args.categories.split(",")]
        invalid = [c for c in requested if c not in ALL_CATEGORIES]
        if invalid:
            print(f"ERROR: Unknown categories: {invalid}")
            print(f"Valid: {', '.join(ALL_CATEGORIES)}")
            sys.exit(1)
    else:
        requested = ALL_CATEGORIES

    do_translate = not args.no_translate
    print(f"UNIQLO Parser — region: {args.region} ({base_url})")
    print(f"Categories: {', '.join(requested)}")
    print(f"Translate: {'ON' if do_translate else 'OFF'}\n")

    all_data: dict[str, list[dict]] = {}

    with sync_playwright() as p:
        for cat in requested:
            path = CATEGORY_PATHS[cat]
            url = f"{base_url}{path}"
            print(f"=== Parsing: {cat} ===")

            browser = p.chromium.launch(headless=True)
            page = browser.new_page(viewport={"width": 1440, "height": 900})
            try:
                desktop_campaigns = extract(page, url)
                desktop_data = [asdict(c) for c in desktop_campaigns
                                if not should_skip(c.link or "") and classify_gender(c.link or "", cat) == cat]
            finally:
                browser.close()

            browser = p.chromium.launch(headless=True)
            page = browser.new_page(viewport={"width": 375, "height": 812})
            try:
                mobile_campaigns = extract(page, url)
                mobile_data = [asdict(c) for c in mobile_campaigns
                               if not should_skip(c.link or "") and classify_gender(c.link or "", cat) == cat]
            finally:
                browser.close()

            mobile_by_link = {c["link"]: c for c in mobile_data if c.get("link")}
            for item in desktop_data:
                link = item.get("link")
                if link and link in mobile_by_link:
                    m = mobile_by_link[link]
                    if m.get("image") and m["image"] != item.get("image"):
                        item["imageMobile"] = m["image"]
                    if m.get("video") and m["video"] != item.get("video"):
                        item["videoMobile"] = m["video"]

            data = desktop_data
            if do_translate:
                print(f"  Translating {len(data)} items...")
                for item in data:
                    for field in ["title", "description", "saleText", "badge"]:
                        if item.get(field):
                            item[field] = translate(item[field])

            all_data[cat] = data
            total_before = len(desktop_campaigns)
            filtered = total_before - len(data)
            print(f"  {len(data)} blocks (was {total_before}, filtered {filtered})")
            if filtered:
                for c in desktop_campaigns:
                    link = c.link or ""
                    if should_skip(link) or classify_gender(link, cat) != cat:
                        print(f"    SKIP: link={link[:80]} gender={classify_gender(link, cat)} skip={should_skip(link)}")

    os.makedirs(_OUT_DIR, exist_ok=True)
    for gender in requested:
        path = os.path.join(_OUT_DIR, f"{gender}.json")
        with open(path, "w") as f:
            json.dump(all_data.get(gender, []), f, ensure_ascii=False, indent=2)
        print(f"  {gender}: {len(all_data.get(gender, []))} blocks → {path}")

    print(f"\nTotal: {sum(len(all_data.get(g, [])) for g in requested)} blocks")


if __name__ == "__main__":
    main()
