"""L3/L4 subcategory parsing — extracts #lineupLinkWrapper links."""
import time


def parse_subcategories(page, gender: str, parent_slug: str) -> list[dict]:
    """Caller must already be on the page."""
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
