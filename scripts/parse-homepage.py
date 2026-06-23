#!/usr/bin/env python3
"""
UNIQLO Homepage Parser
Парсит главную страницу и /men, /kids, /baby — извлекает все кампании
(hero-блоки, карточки с фото/видео, тексты, цены, бейджи).

Usage:
  python3 scripts/parse-homepage.py                    # US version (default)
  python3 scripts/parse-homepage.py --region jp        # Japan version
  python3 scripts/parse-homepage.py --all              # All 4 gender pages + homepage

Output: data/homepage-campaigns.json
"""

import json, time, os, sys, argparse
from playwright.sync_api import sync_playwright
from dataclasses import dataclass, field, asdict
from typing import Optional

BASE_URLS = {
    "us": "https://www.uniqlo.com/us/en",
    "jp": "https://www.uniqlo.com/jp/ja",
}

GENDER_PAGES = ["", "/men", "/kids", "/baby"]


@dataclass
class Campaign:
    type: str  # "hero" | "card" | "video"
    image: Optional[str] = None
    video: Optional[str] = None
    badge: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    price: Optional[str] = None
    originalPrice: Optional[str] = None
    saleText: Optional[str] = None
    link: Optional[str] = None
    alt: Optional[str] = None
    fullWidth: bool = False


def parse_homepage(page, url: str, gender: str = "") -> list[Campaign]:
    """Parse a Uniqlo gender page and extract all campaign blocks."""
    full_url = f"{url}{gender}"
    print(f"  Loading {full_url} ...")
    page.goto(full_url, timeout=30000, wait_until="domcontentloaded")
    # Wait for React SPA to render — look for campaign links with images
    page.wait_for_selector('a img', timeout=15000)
    time.sleep(3)

    # Scroll down multiple times to trigger lazy loading
    for i in range(6):
        page.evaluate("window.scrollBy(0, window.innerHeight)")
        time.sleep(1)

    # Scroll back to top
    page.evaluate("window.scrollTo(0, 0)")
    time.sleep(0.5)

    # Extract campaign data from the DOM
    campaigns = page.evaluate("""() => {
        const results = [];
        const main = document.querySelector('main') || document.body;

        // Find all top-level links that contain images (campaign blocks)
        const links = main.querySelectorAll(':scope > a, main a[href]');

        // Instead, find blocks by looking at the actual structure:
        // Campaign blocks are large links containing img + text overlay
        const allLinks = document.querySelectorAll('a');
        const seen = new Set();

        for (const link of allLinks) {
            const img = link.querySelector('img');
            const video = link.querySelector('video');

            if (!img && !video) continue;

            const src = img ? (img.src || img.getAttribute('data-src') || '') : '';
            const vidSrc = video ? (video.src || video.querySelector('source')?.src || '') : '';

            // Skip small icons and tracking pixels
            if (img && (img.width < 200 || img.height < 200)) continue;

            // Avoid duplicates
            const key = src || vidSrc;
            if (key && seen.has(key)) continue;
            if (key) seen.add(key);

            // Extract text content
            const text = link.textContent || '';
            const paragraphs = Array.from(link.querySelectorAll('p, h2, h3, span')).map(e => e.textContent.trim()).filter(Boolean);

            // Try to find price patterns
            const priceMatch = text.match(/[$¥][\\d,.]+/g) || [];
            const prices = priceMatch.map(p => p.trim());

            // Detect badge
            const badge = link.querySelector('[class*="badge"], [class*="Badge"], span[class*="new"], span[class*="sale"]')?.textContent?.trim();

            results.push({
                type: video ? 'video' : 'card',
                image: src || null,
                video: vidSrc || null,
                badge: badge || null,
                title: paragraphs[0] || null,
                description: paragraphs[1] || null,
                price: prices[0] || null,
                originalPrice: prices[1] || null,
                saleText: paragraphs.find(p => p.includes('Offer') || p.includes('until') || p.includes('Online') || p.includes('App')) || null,
                link: link.getAttribute('href') || null,
                alt: img ? img.alt : (video ? 'Video' : ''),
                fullWidth: img ? img.width > 1000 : false,
            });
        }

        return results;
    }""")

    result = []
    for c in campaigns:
        result.append(Campaign(
            type=c.get("type", "card"),
            image=c.get("image"),
            video=c.get("video"),
            badge=c.get("badge"),
            title=c.get("title"),
            description=c.get("description"),
            price=c.get("price"),
            originalPrice=c.get("originalPrice"),
            saleText=c.get("saleText"),
            link=c.get("link"),
            alt=c.get("alt"),
            fullWidth=c.get("fullWidth", False),
        ))

    return result


def main():
    parser = argparse.ArgumentParser(description="Parse UNIQLO homepage campaigns")
    parser.add_argument("--region", default="us", choices=["us", "jp"], help="Region to parse")
    parser.add_argument("--all", action="store_true", help="Parse all gender pages")
    parser.add_argument("--output", default=None, help="Output JSON file path")
    args = parser.parse_args()

    base = BASE_URLS[args.region]
    print(f"UNIQLO Parser — region: {args.region}, base: {base}")

    pages_to_parse = GENDER_PAGES if args.all else [""]

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
            viewport={"width": 1440, "height": 900},
        )
        page = context.new_page()

        all_data = {}
        for gender_path in pages_to_parse:
            gender_label = gender_path.replace("/", "") or "home"
            print(f"\n=== Parsing: {gender_label} ===")
            try:
                campaigns = parse_homepage(page, base, gender_path)
                all_data[gender_label] = [asdict(c) for c in campaigns]
                print(f"  Found {len(campaigns)} campaign blocks")
                for c in campaigns:
                    print(f"    [{c.type}] {c.title[:60] if c.title else '(no title)'}")
                    if c.price:
                        print(f"           {c.price}" + (f" / {c.originalPrice}" if c.originalPrice else ""))
                    if c.badge:
                        print(f"           badge: {c.badge}")
            except Exception as e:
                print(f"  ERROR: {e}")
                all_data[gender_label] = {"error": str(e)}

        browser.close()

    # Determine output path
    out_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "frontend", "src", "data")
    os.makedirs(out_dir, exist_ok=True)
    out_path = args.output or os.path.join(out_dir, "homepage-campaigns.json")

    with open(out_path, "w") as f:
        json.dump(all_data, f, ensure_ascii=False, indent=2)

    print(f"\nSaved to: {out_path}")
    print(f"Total pages: {len(all_data)}")


if __name__ == "__main__":
    main()
