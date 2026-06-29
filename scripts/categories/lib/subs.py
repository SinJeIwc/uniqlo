"""L3 subcategory parsing — visits L2 category pages, extracts #lineupLinkWrapper."""
import time

def parse_subcategories(page, gender: str, parent_slug: str) -> list[dict]:
    url = f"https://www.uniqlo.com/jp/ja/{gender}/{parent_slug}"
    page.goto(url, timeout=30000, wait_until="domcontentloaded")
    time.sleep(2)

    return page.evaluate("""() => {
        const wrapper = document.querySelector('#lineupLinkWrapper');
        if (!wrapper) return [];
        const results = [];
        const seen = new Set();
        for (const a of wrapper.querySelectorAll('a')) {
            const href = a.getAttribute('href') || '';
            if (!href.startsWith('/jp/ja/')) continue;
            const text = (a.textContent || '').replace(/\\s+/g, ' ').trim();
            if (!text) continue;
            const slug = href.split('/').filter(Boolean).pop() || '';
            if (seen.has(slug)) continue;
            seen.add(slug);

            let image = null;
            for (const img of a.querySelectorAll('img')) {
                const src = img.getAttribute('data-src') || img.getAttribute('src') || '';
                if (src && src.includes('uniqlo')) {
                    image = src.startsWith('//') ? 'https:' + src : src;
                    break;
                }
            }
            results.push({text, href, slug, image});
        }
        return results;
    }""")
