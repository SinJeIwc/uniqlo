"""Shared JS for product page extraction — used by parse_product.py and parse_db.py."""

PRODUCT_PAGE_JS = """() => {
    const result = {};
    const BASE = 'https://www.uniqlo.com';
    const ldScript = document.querySelector('script[type="application/ld+json"]');
    if (!ldScript) return result;
    const ld = JSON.parse(ldScript.textContent);
    const graph = ld['@graph'] || [ld];

    // --- Breadcrumbs -> gender, section, category, subcategory ---
    const bc = graph.find(item => item['@type'] === 'BreadcrumbList');
    if (bc && bc.itemListElement) {
        const items = bc.itemListElement;
        result.gender = items[0]?.name || '';
        result.section = items[1]?.name || '';
        result.category = items[2]?.name || '';
        result.subcategory = items[3]?.name || '';
    }

    const pg = graph.find(item => item['@type'] === 'ProductGroup');
    if (!pg) return result;
    result.productId = pg.productGroupID || null;
    result.name = pg.name || '';
    result.description = pg.description || '';
    result.brand = (pg.brand || {}).name || 'UNIQLO';
    if (pg.aggregateRating) {
        result.rating = String(pg.aggregateRating.ratingValue);
        result.reviewCount = pg.aggregateRating.reviewCount;
    }
    result.material = pg.material || null;
    result.gallery = (pg.image || []).map(url => ({type: 'image', url}));

    // --- Variants ---
    const variants = pg.hasVariant || [];
    const colorSet = new Map(), sizeSet = new Set();
    let price = null, hasStock = false;
    result.variants = variants.map(v => {
        const inStock = (v.offers?.availability || '').toLowerCase().includes('instock');
        if (inStock) hasStock = true;
        if (!price && v.offers?.price) price = parseInt(v.offers.price, 10);
        if (v.color) colorSet.set(v.color, (v.image || [])[0] || '');
        if (v.size) sizeSet.add(v.size);
        return {sku: v.sku || '', color: v.color || '', size: v.size || '',
                image: (v.image || [])[0] || '',
                price: v.offers?.price ? parseInt(v.offers.price, 10) : null,
                currency: v.offers?.priceCurrency || 'JPY', inStock};
    });
    result.price = price;
    result.colors = Array.from(colorSet.entries()).map(([n, i]) => ({name: n, image: i}));
    result.sizes = Array.from(sizeSet);
    result.inStock = hasStock ? 1 : 0;

    // DOM extras
    const chips = [];
    for (const img of document.querySelectorAll('main ul > li button img, main ul > li img')) {
        const a = img.getAttribute('alt')?.trim();
        const s = (img.getAttribute('src') || img.getAttribute('data-src') || '').replace(/^\\/\\//, 'https://');
        if (a && s && s.includes('uniqlo')) chips.push({name: a, image: s});
    }
    if (chips.length) result.colorChips = chips;
    const rh4 = Array.from(document.querySelectorAll('h4')).find(h => h.textContent.includes('レビュー要約'));
    if (rh4) {
        const c = rh4.closest('[class*="gutter-container"]')?.querySelector('[data-testid="ITOCard"]');
        if (c) result.aiReview = c.textContent.trim();
    }
    function parseRichText(el) {
        const segs = [];
        for (const n of el.childNodes) {
            if (n.nodeType === 3) { if (n.textContent) segs.push({content: n.textContent}); }
            else if (n.tagName === 'A') {
                let h = n.getAttribute('href') || '';
                if (h.startsWith(BASE)) h = h.replace(BASE, '');
                if (h.startsWith('/jp/ja')) h = h.replace('/jp/ja', '');
                segs.push({content: n.textContent || '', href: h});
            } else if (n.tagName !== 'BR') { const t = n.textContent?.trim(); if (t) segs.push({content: t}); }
        }
        return segs;
    }
    const aside = document.querySelector('aside, complementary');
    const pd = [];
    if (aside) {
        const ul = aside.querySelector('ul');
        if (ul) {
            const items = ul.querySelectorAll(':scope > li');
            for (let i = 0; i < Math.min(items.length, 3); i++) {
                const sec = {section: ['details','specs','materials'][i] || 'section_'+i};
                if (i === 0)
                    sec.pairs = Array.from(items[i].querySelectorAll('[data-testid="ITOContentAlignment"]'))
                        .filter(el => !el.className.includes('image-plus-text__') && el.className.includes('image-plus-text'))
                        .map(pair => {
                            const img = pair.querySelector('img');
                            const src = (img?.getAttribute('data-src') || img?.getAttribute('src') || '').replace(/^\\/\\//, 'https://');
                            const p = pair.querySelector('p[data-testid="ITOTypography"]');
                            return {image: src || null, text: p ? parseRichText(p) : []};
                        });
                else
                    sec.text = Array.from(items[i].querySelectorAll('p')).map(p=>p.textContent.trim()).filter(Boolean).join('\\n');
                pd.push(sec);
            }
        }
    }
    result.productDescription = pd;
    return result;
}"""
