"""Flyout menu — exact DOM path, no clicks, always in DOM."""
import time

GENDERS = ["women", "men", "kids", "baby"]

def parse_flyout(page) -> dict[str, list[dict]]:
    page.goto("https://www.uniqlo.com/jp/ja/", timeout=30000, wait_until="domcontentloaded")
    time.sleep(4)

    result = {}
    for idx, gender in enumerate(GENDERS):
        panel_idx = idx + 1  # XPath 1-indexed

        items = page.evaluate(f"""(panelIdx => {{
            const xpath = '/html/body/div[1]/div/div/div[2]/div[2]/div[3]/nav/div/div[2]/div[' + panelIdx + ']/div[2]/div/div';
            const container = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
            if (!container) return [];

            const links = container.querySelectorAll('a[data-category="navi"]');
            const results = [];
            const seen = new Set();
            for (const a of links) {{
                let href = a.getAttribute('href') || '';
                if (!href.startsWith('/jp/ja/')) continue;
                href = href.replace('/jp/ja', '');
                if (seen.has(href)) continue;
                seen.add(href);

                const slug = href.split('/').filter(Boolean).pop() || '';

                let text = '';
                for (const img of a.querySelectorAll('img')) {{
                    const alt = (img.getAttribute('alt') || '').trim();
                    if (alt) {{ text = alt; break; }}
                }}
                if (!text) {{
                    const typo = a.querySelector('[data-testid="ITOTypography"]');
                    if (typo) text = (typo.textContent || '').replace(/\\\\s+/g, ' ').trim();
                }}

                let image = null;
                for (const img of a.querySelectorAll('img')) {{
                    const src = img.getAttribute('data-src') || img.getAttribute('src') || '';
                    if (src && src.includes('uniqlo')) {{
                        image = src.startsWith('//') ? 'https:' + src : src;
                        break;
                    }}
                }}

                results.push({{text, href, slug, image}});
            }}
            return results;
        }})({panel_idx})""")

        result[gender] = items

    return result
