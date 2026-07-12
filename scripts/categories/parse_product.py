#!/usr/bin/env python3
"""Product page parser — name, price, sizes, colors, gallery, AI review, details.

Usage:
    cd scripts
    uv run python categories/parse_product.py --url https://www.uniqlo.com/jp/ja/products/E482148-000/00
    uv run python categories/parse_product.py --url ... --pretty
"""
import argparse
import json
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from playwright.sync_api import sync_playwright

PRODUCT_JS = """() => {
    const result = {};
    const BASE = 'https://www.uniqlo.com/jp/ja';

    function cleanHref(href) {
        if (href.startsWith('https://www.uniqlo.com'))
            href = href.replace('https://www.uniqlo.com', '');
        if (href.startsWith('/jp/ja'))
            href = href.replace('/jp/ja', '');
        return href;
    }

    // Parse text with inline links into segments: [{content, href?}]
    function parseRichText(el) {
        const segments = [];
        for (const node of el.childNodes) {
            if (node.nodeType === 3) {
                // Text node
                const t = node.textContent;
                if (t) segments.push({content: t});
            } else if (node.tagName === 'A') {
                segments.push({
                    content: node.textContent || '',
                    href: cleanHref(node.getAttribute('href') || ''),
                });
            } else if (node.tagName === 'BR') {
                // skip, just separator
            } else {
                // Other elements — recurse
                const t = node.textContent?.trim();
                if (t) segments.push({content: t});
            }
        }
        return segments;
    }

    // Product ID
    const idMatch = document.body.textContent.match(/商品番号[:：]\\s*(\\d+)/);
    result.productId = idMatch ? idMatch[1] : null;

    // h1 — name
    const h1 = document.querySelector('main h1, h1');
    result.name = h1?.textContent?.trim() || '';

    // Price
    const priceEl = document.querySelector('main [class*="fr-ec-price"] p, main [class*="price"]');
    result.price = priceEl?.textContent?.trim() || '';

    // Rating
    const ratingEl = document.querySelector('main [class*="rating"], [class*="rating"]');
    result.rating = ratingEl?.textContent?.trim() || null;

    // Colors
    const colors = [];
    for (const img of document.querySelectorAll('main ul > li button img, main ul > li img')) {
        const alt = img.getAttribute('alt')?.trim();
        const src = img.getAttribute('src') || img.getAttribute('data-src') || '';
        if (alt && src) colors.push({name: alt, image: src.startsWith('//') ? 'https:' + src : src});
    }
    result.colors = colors;

    // Sizes
    const sizes = [];
    for (const chip of document.querySelectorAll('[class*="size-chip-wrapper"]')) {
        const text = chip.textContent.trim();
        if (text) sizes.push(text);
    }
    result.sizes = sizes;

    // Gallery — from media-gallery area or aside/complementary images
    const gallery = [];
    const galleryGrid = document.querySelector('[class*="media-gallery--grid"]');
    const container = galleryGrid || document.querySelector('aside, complementary');
    if (container) {
        for (const img of container.querySelectorAll('img')) {
            const src = img.getAttribute('data-src') || img.getAttribute('src') || '';
            if (src && src.includes('uniqlo') && !src.includes('chip') && !src.includes('feature')) {
                gallery.push({type: 'image', url: src.startsWith('//') ? 'https:' + src : src});
            }
        }
        for (const vid of container.querySelectorAll('video')) {
            const src = vid.getAttribute('data-src') || vid.getAttribute('src') || '';
            const poster = vid.getAttribute('poster') || '';
            if (src) gallery.push({type: 'video', url: src, poster});
        }
    }
    result.gallery = gallery;

    // AI review — h4 "レビュー要約" → next [data-testid="ITOCard"]
    let aiReview = null;
    const reviewH4 = Array.from(document.querySelectorAll('h4')).find(h => h.textContent.includes('レビュー要約'));
    if (reviewH4) {
        const card = reviewH4.closest('[class*="gutter-container"]')?.querySelector('[data-testid="ITOCard"]');
        if (card) aiReview = card.textContent.trim();
    }
    result.aiReview = aiReview;

    // Product description — sections: details, specs, materials
    const aside = document.querySelector('aside, complementary');
    const productDescription = [];
    if (aside) {
        const ul = aside.querySelector('ul');
        if (ul) {
            const items = ul.querySelectorAll(':scope > li');
            const sectionNames = ['details', 'specs', 'materials'];

            for (let i = 0; i < Math.min(items.length, 3); i++) {
                const li = items[i];
                const section = {section: sectionNames[i] || 'section_' + i};

                if (i === 0) {
                    // Details — top-level pairs, exclude nested image-plus-text__*
                    const pairs = [];
                    for (const pair of li.querySelectorAll('[data-testid="ITOContentAlignment"]')) {
                        if (pair.className.includes('image-plus-text__')) continue;
                        if (!pair.className.includes('image-plus-text')) continue;

                        const img = pair.querySelector('img');
                        const p = pair.querySelector('p[data-testid="ITOTypography"]');
                        const src = img?.getAttribute('data-src') || img?.getAttribute('src') || '';

                        pairs.push({
                            image: src.startsWith('//') ? 'https:' + src : src || null,
                            text: p ? parseRichText(p) : [],
                        });
                    }
                    if (pairs.length > 0) section.pairs = pairs;
                } else {
                    // Specs & materials — plain text
                    const ps = Array.from(li.querySelectorAll('p'))
                        .map(p => p.textContent.trim())
                        .filter(t => t.length > 0);
                    section.text = ps.join('\\n');
                }

                productDescription.push(section);
            }
        }
    }
    result.productDescription = productDescription;

    return result;
}"""


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--url", required=True, help="Product page URL")
    parser.add_argument("--pretty", action="store_true")
    parser.add_argument("--output")
    args = parser.parse_args()

    print(f"  {args.url}", file=sys.stderr)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1440, "height": 900})
        page.goto(args.url, timeout=30000, wait_until="domcontentloaded")
        time.sleep(2)

        result = page.evaluate(PRODUCT_JS)
        browser.close()

    result["url"] = args.url

    print(f"    name: {result.get('name', '?')}", file=sys.stderr)
    print(f"    price: {result.get('price', '?')}", file=sys.stderr)
    print(f"    colors: {len(result.get('colors', []))}", file=sys.stderr)
    print(f"    sizes: {len(result.get('sizes', []))}", file=sys.stderr)
    print(f"    gallery: {len(result.get('gallery', []))}", file=sys.stderr)
    print(f"    aiReview: {'✓' if result.get('aiReview') else '✗'}", file=sys.stderr)
    pd = result.get('productDescription', [])
    for s in pd:
        if s.get('pairs'):
            print(f"    {s['section']}: {len(s['pairs'])} pairs", file=sys.stderr)
        else:
            print(f"    {s['section']}: text", file=sys.stderr)

    json_str = json.dumps(result, ensure_ascii=False, indent=2 if args.pretty else None)
    if args.output:
        Path(args.output).write_text(json_str, encoding="utf-8")
        print(f"  → {args.output}", file=sys.stderr)
    else:
        print(json_str)


if __name__ == "__main__":
    main()
