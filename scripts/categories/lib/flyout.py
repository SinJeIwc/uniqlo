"""Flyout menu — finds nav, then extracts 4 gender panels."""
GENDERS = ["women", "men", "kids", "baby"]


def parse_flyout(page) -> dict[str, list[dict]]:
    page.goto("https://www.uniqlo.com/jp/ja/", timeout=30000, wait_until="domcontentloaded")
    page.wait_for_selector("nav", timeout=10000)

    return page.evaluate("""() => {
        const naviLink = document.querySelector('a[data-category="navi"]');
        if (!naviLink) return {};
        const nav = naviLink.closest('nav');
        if (!nav) return {};

        // Find panels: each panel is a div that has links with data-category="navi"
        const panelCandidates = nav.querySelectorAll('div');
        const panels = [];
        for (const div of panelCandidates) {
            if (div.querySelector('a[data-category="navi"]') && !div.querySelector('div a[data-category="navi"]')) {
                panels.push(div);
            }
        }
        if (panels.length < 4) return {};

        const result = {};
        const genders = ['women','men','kids','baby'];
        for (let i = 0; i < 4; i++) {
            const items = [];
            const seen = new Set();
            for (const a of panels[i].querySelectorAll('a[data-category="navi"]')) {
                let href = a.getAttribute('href') || '';
                if (href.startsWith('https://www.uniqlo.com'))
                    href = href.replace('https://www.uniqlo.com', '');
                if (!href.startsWith('/jp/ja/')) continue;
                if (href.includes('/products/')) continue;
                href = href.replace(/^\\/jp\\/ja/, '');
                if (seen.has(href)) continue;
                seen.add(href);

                const slug = href.split('/').filter(Boolean).pop() || '';

                let text = '';
                const typo = a.querySelector('[data-testid="ITOTypography"]');
                if (typo) text = (typo.textContent || '').replace(/\\s+/g, ' ').trim();
                if (!text) {
                    for (const img of a.querySelectorAll('img')) {
                        const alt = (img.getAttribute('alt') || '').trim();
                        if (alt) { text = alt; break; }
                    }
                }

                let image = null;
                for (const img of a.querySelectorAll('img')) {
                    const src = img.getAttribute('data-src') || img.getAttribute('src') || '';
                    if (src && src.includes('uniqlo')) {
                        image = src.startsWith('//') ? 'https:' + src : src;
                        break;
                    }
                }
                items.push({text, href, slug, image});
            }
            result[genders[i]] = items;
        }
        return result;
    }""")
