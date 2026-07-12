#!/usr/bin/env python3
"""PLP parser — extracts products from a terminal category page.

Parses hero (dual-viewport) + subcategories via scroll + BannerWithProducts.

Usage:
    cd scripts
    uv run python categories/parse_plp.py --gender women --slug tops/t-shirts
    uv run python categories/parse_plp.py --gender women --slug tops/t-shirts --pretty
"""
import argparse
import json
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from playwright.sync_api import sync_playwright

HERO_JS = """() => {
    const mb = document.querySelector('[_type="MediaBanner"][class*="media-banner__plp-primary"]');
    if (!mb) return null;
    let image = null, video = null, videoPoster = null;
    const img = mb.querySelector('img.image__img');
    if (img) image = img.getAttribute('largeimageurl') || img.getAttribute('src') || '';
    if (!image) {
        const link = mb.querySelector('link[rel="preload"][as="image"]');
        if (link) image = link.getAttribute('href') || '';
    }
    const vid = mb.querySelector('video');
    if (vid) {
        video = vid.getAttribute('data-src') || '';
        videoPoster = vid.getAttribute('poster') || '';
    }
    const ps = Array.from(mb.querySelectorAll('p[data-testid="ITOTypography"]'));
    return {
        image, video, videoPoster,
        title: ps[0]?.textContent?.trim() || '',
        description: ps[1]?.textContent?.trim() || ''
    };
}"""

PRODUCTS_JS = """() => {
    const subcategories = [];
    const banners = document.querySelectorAll('[_type="BannerWithProducts"]');
    for (const b of banners) {
        const name = b.querySelector('h2')?.textContent?.trim() || '';
        const products = [];
        const seen = new Set();
        for (const a of b.querySelectorAll('a[href*="/products/"]')) {
            let href = a.getAttribute('href') || '';
            if (href.startsWith('https://www.uniqlo.com'))
                href = href.replace('https://www.uniqlo.com', '');
            const match = href.match(/\\/products\\/(E\\d+-\\d+)/);
            if (!match) continue;
            const pid = match[1];
            if (seen.has(pid)) continue;
            seen.add(pid);
            products.push({productId: pid, href});
        }
        if (name || products.length > 0)
            subcategories.push({name, productCount: products.length, products});
    }
    return subcategories;
}"""


def parse_plp(gender: str, slug: str) -> dict:
    url = f"https://www.uniqlo.com/jp/ja/{gender}/{slug}"
    print(f"    url: {url}", file=sys.stderr)

    # --- Hero: desktop + mobile ---
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1440, "height": 900})
        page.goto(url, timeout=30000, wait_until="domcontentloaded")
        time.sleep(2)

        if page.evaluate("() => !!document.querySelector('#lineupLinkWrapper')"):
            browser.close()
            return {"error": "lineup_page", "message": "Has #lineupLinkWrapper — not a terminal page"}

        hero_desktop = page.evaluate(HERO_JS)
        browser.close()

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 375, "height": 812})
        page.goto(url, timeout=30000, wait_until="domcontentloaded")
        time.sleep(2)
        hero_mobile = page.evaluate(HERO_JS)
        browser.close()

    hero = None
    if hero_desktop:
        has_video = bool(hero_desktop.get("video"))
        hero = {
            "image": hero_desktop.get("image") if not has_video else None,
            "imageMobile": hero_mobile.get("image") if hero_mobile and not hero_mobile.get("video") else None,
            "video": hero_desktop.get("video") or None,
            "videoMobile": hero_mobile.get("video") if hero_mobile else None,
            "poster": hero_desktop.get("videoPoster") if has_video else None,
            "posterMobile": hero_mobile.get("videoPoster") if hero_mobile and hero_mobile.get("video") else None,
            "title": hero_desktop.get("title"),
            "description": hero_desktop.get("description"),
        }

    # --- Products via scroll ---
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1440, "height": 900})
        page.goto(url, timeout=30000, wait_until="domcontentloaded")
        time.sleep(2)

        # Scroll
        prev_count = 0
        for _ in range(20):
            page.evaluate("window.scrollBy(0, window.innerHeight)")
            time.sleep(0.6)
            count = page.evaluate("() => document.querySelectorAll('a[href*=\"/products/E\"]').length")
            if count > 0 and count == prev_count:
                break
            prev_count = count
        page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
        time.sleep(2)

        print(f"    current url: {page.url}", file=sys.stderr)
        subcategories = page.evaluate(PRODUCTS_JS)
        browser.close()

    return {"hero": hero, "subcategories": subcategories}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--gender", required=True, choices=["women", "men", "kids", "baby"])
    parser.add_argument("--slug", required=True)
    parser.add_argument("--pretty", action="store_true")
    parser.add_argument("--output")
    args = parser.parse_args()

    print(f"  {args.gender}/{args.slug}:", file=sys.stderr)
    result = parse_plp(args.gender, args.slug)
    result["gender"] = args.gender
    result["slug"] = args.slug
    result["href"] = f"/{args.gender}/{args.slug}"

    if "error" in result:
        print(f"    {result['message']}", file=sys.stderr)
    else:
        total = sum(s.get("productCount", 0) for s in result.get("subcategories", []))
        print(f"    hero{' ✓' if result.get('hero') else ' ✗'}, {len(result.get('subcategories',[]))} subs, {total} products", file=sys.stderr)
        for s in result.get("subcategories", []):
            print(f"      {s['name']}: {s['productCount']} products", file=sys.stderr)

    json_str = json.dumps(result, ensure_ascii=False, indent=2 if args.pretty else None)
    if args.output:
        Path(args.output).write_text(json_str, encoding="utf-8")
        print(f"  → {args.output}", file=sys.stderr)
    else:
        print(json_str)


if __name__ == "__main__":
    main()
