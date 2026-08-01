"""Flyout menu — extracts all category links and groups them by gender."""
GENDERS = ["women", "men", "kids", "baby"]


def parse_flyout(page) -> dict[str, list[dict]]:
    """Open homepage, find a[data-category='navi'] links, group by gender segment in href."""
    page.goto("https://www.uniqlo.com/jp/ja/", timeout=30000, wait_until="domcontentloaded")
    page.wait_for_selector("nav", timeout=10000)

    return page.evaluate("""() => {
        const result = { women: [], men: [], kids: [], baby: [] };
        const seen = new Set();

        for (const a of document.querySelectorAll('a[data-category="navi"]')) {
            let href = a.getAttribute('href') || '';
            if (href.startsWith('https://www.uniqlo.com'))
                href = href.replace('https://www.uniqlo.com', '');
            if (!href.startsWith('/jp/ja/')) continue;
            if (href.includes('/products/')) continue;

            // Normalize: strip /jp/ja/ prefix
            const clean = href.replace(/^\\/jp\\/ja\\//, '');
            if (seen.has(clean)) continue;
            seen.add(clean);

            // Extract gender from first path segment
            const parts = clean.split('/');
            const gender = parts[0];
            if (!result[gender]) continue;

            const slug = parts.filter(Boolean).pop() || '';

            let text = '';
            const typo = a.querySelector('[data-testid="ITOTypography"]');
            if (typo) text = (typo.textContent || '').replace(/\\s+/g, ' ').trim();
            if (!text) {
                for (const img of a.querySelectorAll('img')) {
                    const alt = (img.getAttribute('alt') || '').trim();
                    if (alt) { text = alt; break; }
                }
            }
            if (!text) continue;

            let image = null;
            for (const img of a.querySelectorAll('img')) {
                const src = img.getAttribute('data-src') || img.getAttribute('src') || '';
                if (src && src.includes('uniqlo')) {
                    image = src.startsWith('//') ? 'https:' + src : src;
                    break;
                }
            }

            result[gender].push({text, href: '/' + clean, slug, image});
        }
        return result;
    }""")
