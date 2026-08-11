from playwright.sync_api import sync_playwright
import time

# Real parent category from DB
url = "https://www.uniqlo.com/jp/ja/women/tops"

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    
    try:
        page.goto(url, timeout=30000, wait_until="domcontentloaded")
        time.sleep(2)
        
        has_lineup = page.evaluate("() => !!document.querySelector('#lineupLinkWrapper')")
        
        # Direct product links
        product_count = page.evaluate("""() => 
            document.querySelectorAll('a[href*="/products/E"]').length
        """)
        
        # LineupWrapper links
        lineup_data = page.evaluate("""() => {
            const wrapper = document.querySelector('#lineupLinkWrapper');
            if (!wrapper) return { found: false };
            
            const links = Array.from(wrapper.querySelectorAll('a[href]'));
            return {
                found: true,
                total: links.length,
                samples: links.slice(0, 8).map(a => ({
                    href: a.getAttribute('href'),
                    text: a.textContent.trim().substring(0, 40),
                    is_product: a.getAttribute('href').includes('/products/')
                }))
            };
        }""")
        
        print(f"URL: {url}")
        print(f"Has #lineupLinkWrapper: {has_lineup}")
        print(f"Direct product links: {product_count}")
        print(f"\nLineupWrapper data:")
        if lineup_data['found']:
            print(f"  Total links: {lineup_data['total']}")
            print(f"\n  Samples:")
            for item in lineup_data['samples']:
                is_prod = '✓ PRODUCT' if item['is_product'] else '→ CATEGORY'
                print(f"    {is_prod:12} {item['text']:40} {item['href']}")
        else:
            print("  Not found")
            
    except Exception as e:
        print(f"Error: {e}")
    
    browser.close()
