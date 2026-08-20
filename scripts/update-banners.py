#!/usr/bin/env python3
"""Update banner fields for existing categories in DB.

Reads categories from DB, visits terminal pages, extracts MediaBanner,
updates only banner-related fields (image_pc, image_sp, video_url, video_poster, subtitle).
"""
import sqlite3
from pathlib import Path
from playwright.sync_api import sync_playwright

# DB path (same as parse.py)
DB_PATH = Path(__file__).parent.parent / "frontend" / "data" / "uniqlo.db"
BASE_URL = "https://www.uniqlo.com/jp/ja"

# MediaBanner extraction JS (same as crawl.py)
EXTRACT_BANNER = """() => {
    const banner = document.querySelector('[_type="MediaBanner"]');
    if (!banner) return null;
    
    const picture = banner.querySelector('picture');
    const video = banner.querySelector('video');
    const img = picture?.querySelector('img') || banner.querySelector('img');
    const sources = Array.from(picture?.querySelectorAll('source') || []);
    
    const spSource = sources.find(s => 
        s.getAttribute('media')?.includes('max-width')
    );
    
    const ps = banner.querySelectorAll('p[data-testid="ITOTypography"]');
    
    return {
        image_sp: spSource?.getAttribute('srcSet') || 
                  img?.getAttribute('smallmediumimageurl') || 
                  null,
        image_pc: img?.getAttribute('src') || 
                  img?.getAttribute('largeimageurl') || 
                  video?.getAttribute('poster') ||
                  null,
        video_url: video?.getAttribute('data-src') || 
                  video?.getAttribute('src') || 
                  null,
        video_poster: video?.getAttribute('poster') || null,
        subtitle: ps[1]?.textContent?.trim() || null,
    };
}"""

def get_terminal_categories(gender=None):
    """Get categories that are likely terminal (have product_count or no children)."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    
    query = """
        SELECT id, name, slug, href, gender, kind, parent_id
        FROM categories 
        WHERE 1=1
    """
    params = []
    
    if gender:
        query += " AND gender = ?"
        params.append(gender)
    
    # Focus on categories that likely have product pages
    query += " AND (product_count > 0 OR kind IN ('feature', 'category'))"
    query += " ORDER BY id"
    
    rows = conn.execute(query, params).fetchall()
    conn.close()
    
    return [dict(row) for row in rows]

def update_banner(cat_id, media):
    """Update banner fields for a category."""
    conn = sqlite3.connect(DB_PATH)
    conn.execute("""
        UPDATE categories 
        SET image_sp = ?, image_pc = ?, video_url = ?, video_poster = ?, subtitle = ?
        WHERE id = ?
    """, (media['image_sp'], media['image_pc'], media['video_url'], 
          media['video_poster'], media['subtitle'], cat_id))
    conn.commit()
    conn.close()

def main():
    print("="*70)
    print("BANNER UPDATE SCRIPT")
    print("="*70)
    print(f"Database: {DB_PATH}")
    print(f"Base URL: {BASE_URL}")
    
    # Get categories
    categories = get_terminal_categories(gender='women')
    print(f"\nFound {len(categories)} women categories to check")
    
    updated = 0
    skipped = 0
    errors = 0
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        
        for i, cat in enumerate(categories, 1):
            url = BASE_URL + cat['href']
            print(f"\n[{i}/{len(categories)}] {cat['name']} ({cat['slug']})")
            print(f"  URL: {url}")
            
            try:
                # Load page
                page.goto(url, timeout=30000, wait_until='domcontentloaded')
                page.wait_for_selector('body', timeout=10000)
                
                # Extract banner
                media = page.evaluate(EXTRACT_BANNER)
                
                if media:
                    has_data = any([
                        media['image_pc'], media['image_sp'], 
                        media['video_url'], media['subtitle']
                    ])
                    
                    if has_data:
                        print(f"  ✓ Banner found:")
                        print(f"    image_pc: {'✓' if media['image_pc'] else '✗'}")
                        print(f"    image_sp: {'✓' if media['image_sp'] else '✗'}")
                        print(f"    video:    {'✓' if media['video_url'] else '✗'}")
                        print(f"    subtitle: {media['subtitle'][:40] if media['subtitle'] else '✗'}...")
                        
                        # Update DB
                        update_banner(cat['id'], media)
                        updated += 1
                    else:
                        print(f"  - Banner found but empty")
                        skipped += 1
                else:
                    print(f"  - No MediaBanner on page")
                    skipped += 1
                    
            except Exception as e:
                print(f"  ✗ Error: {e}")
                errors += 1
        
        browser.close()
    
    print("\n" + "="*70)
    print("SUMMARY")
    print("="*70)
    print(f"  Total:   {len(categories)}")
    print(f"  Updated: {updated}")
    print(f"  Skipped: {skipped}")
    print(f"  Errors:  {errors}")
    print("="*70)

if __name__ == '__main__':
    main()
