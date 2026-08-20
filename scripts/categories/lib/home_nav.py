"""Parse home page category lists - separate from full navigation crawl."""

def parse_home_categories(page, gender: str) -> list[dict]:
    """
    Extract categories from #homeCategoryList on gender home pages.
    
    This is a SUBSET (18 curated categories) for the home page display.
    NOT the full crawl source - see flyout.py for that.
    
    Returns: [{'text': str, 'href': str, 'slug': str, 'image': str|None}, ...]
    """
    urls = {
        'women': 'https://www.uniqlo.com/jp/ja',
        'men': 'https://www.uniqlo.com/jp/ja/men',
        'kids': 'https://www.uniqlo.com/jp/ja/kids',
        'baby': 'https://www.uniqlo.com/jp/ja/baby',
    }
    
    url = urls.get(gender)
    if not url:
        return []
    
    page.goto(url, timeout=30000, wait_until="domcontentloaded")
    
    try:
        page.wait_for_selector('#homeCategoryList', timeout=10000)
    except:
        # No home category list on this page
        return []
    
    cats = page.evaluate('''() => {
        const list = document.querySelector('#homeCategoryList');
        if (!list) return [];
        
        const links = Array.from(list.querySelectorAll('a'));
        const seen = new Set();
        const result = [];
        
        for (const a of links) {
            let href = a.getAttribute('href') || '';
            if (href.startsWith('https://www.uniqlo.com'))
                href = href.replace('https://www.uniqlo.com', '');
            if (!href.startsWith('/jp/ja/')) continue;
            
            const clean = href.replace(/^\\/jp\\/ja\\//, '');
            if (seen.has(clean)) continue;
            seen.add(clean);
            
            const text = a.textContent?.trim() || '';
            if (!text) continue;
            
            const parts = clean.split('/').filter(Boolean);
            const slug = parts[parts.length - 1] || clean;
            
            let image = null;
            const img = a.querySelector('img');
            if (img) {
                const src = img.getAttribute('data-src') || img.getAttribute('src') || '';
                if (src && src.includes('uniqlo')) {
                    image = src.startsWith('//') ? 'https:' + src : src;
                }
            }
            
            result.push({text, href: '/' + clean, slug, image});
        }
        return result;
    }''')
    
    return cats
