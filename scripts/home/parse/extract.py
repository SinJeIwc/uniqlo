"""UNIQLO homepage DOM extraction via Playwright."""
import time
from dataclasses import dataclass
from typing import Optional
from playwright.sync_api import Page


@dataclass
class Campaign:
    image: Optional[str] = None
    video: Optional[str] = None
    badge: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    price: Optional[str] = None
    saleText: Optional[str] = None
    link: Optional[str] = None


# URL patterns to classify blocks by gender
# Checked in order: baby/kids/men first, women as fallback
_GENDER_PATTERNS = [
    ("baby",  ["/baby/", "/baby", "/newborn/"]),
    ("kids",  ["/kids/", "/kids", "/kids-baby-monthlynews"]),
    ("men",   ["/men/", "/men"]),
    ("women", ["/women/", "/women"]),
]

# Skip these non-campaign blocks (top banners, promos above header)
_SKIP_PATTERNS = [
    "/livestation/",
]


def classify_gender(link: str) -> str:
    """Classify block by its href. Default: 'women'."""
    if not link:
        return "women"
    lower = link.lower()
    for gender, patterns in _GENDER_PATTERNS:
        for pat in patterns:
            if pat in lower:
                return gender
    return "women"


def should_skip(link: str) -> bool:
    """Check if this block should be skipped (top banners, promos)."""
    if not link:
        return False
    lower = link.lower()
    return any(pat in lower for pat in _SKIP_PATTERNS)


def extract(page: Page, url: str) -> list[Campaign]:
    """Navigate to URL, extract all campaign blocks, return Campaign list."""
    print(f"  Loading {url} ...")
    page.goto(url, timeout=30000, wait_until="domcontentloaded")
    page.wait_for_selector("a img, a video", timeout=15000)
    time.sleep(3)

    # Check we didn't navigate away
    current_url = page.evaluate("() => window.location.href")
    if current_url.rstrip("/") != url.rstrip("/"):
        print(f"  WARNING: URL is {current_url}, expected {url}")

    # Scroll gradually to trigger ALL lazy loading
    # Uniqlo lazy-loads images only when scrolled near viewport
    prev_count = 0
    for i in range(12):
        page.evaluate("window.scrollBy(0, window.innerHeight * 0.7)")
        time.sleep(1.0)
        # Check if new images appeared
        current = page.evaluate("() => document.querySelectorAll('a img').length")
        if current != prev_count and i > 2:
            print(f"    scroll {i+1}: {current} images found (was {prev_count})")
        prev_count = current

    # Scroll back to top to ensure all data-src are populated
    page.evaluate("window.scrollTo(0, 0)")
    time.sleep(0.5)
    # One more full scroll to bottom and back to catch anything missed
    page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
    time.sleep(2)
    page.evaluate("window.scrollTo(0, 0)")
    time.sleep(0.5)

    campaigns_raw = page.evaluate("""() => {
        const normUrl = (url) => {
            if (!url) return null;
            url = url.trim();
            if (url.startsWith('//')) url = 'https:' + url;
            if (url.includes(':///')) url = url.replace(/^.*?:\\/\\//, 'https://');
            return url || null;
        };
        const results = [];
        const seen = new Set();
        for (const link of document.querySelectorAll('a')) {
            const imgs = link.querySelectorAll('img');
            const video = link.querySelector('video');
            if (imgs.length === 0 && !video) continue;
            let mainImg = null;
            let badgeImg = null;
            for (const img of imgs) {
                const w = img.naturalWidth || img.width || 0;
                const h = img.naturalHeight || img.height || 0;
                if (w >= 200 && h >= 200) { mainImg = img; }
                else if (w > 0 && h > 0 && w < 200 && h < 100) { badgeImg = img; }
            }
            let imageUrl = null;
            if (mainImg) imageUrl = normUrl(mainImg.getAttribute('data-src') || mainImg.src);
            if (!imageUrl && video) {
                const p = video.getAttribute('poster') || video.getAttribute('data-poster');
                if (p) imageUrl = normUrl(p);
            }
            let videoUrl = null;
            if (video) {
                videoUrl = normUrl(video.getAttribute('data-src') || video.getAttribute('src') ||
                    (video.querySelector('source') || {}).getAttribute?.('src'));
            }
            const key = imageUrl || videoUrl;
            if (!key || seen.has(key)) continue;
            seen.add(key);
            let badge = null;
            if (badgeImg) badge = (badgeImg.alt || '').trim() || null;
            const ps = Array.from(link.querySelectorAll('p'))
                .map(p => p.textContent.replace(/\\s+/g, ' ').trim())
                .filter(t => t.length > 0);
            const textPs = ps.filter(t => !/^[¥$]/.test(t));
            const pricePs = ps.filter(t => /^[¥$]/.test(t));
            results.push({
                image: imageUrl, video: videoUrl, badge,
                title: textPs[0] || null, description: textPs[1] || null,
                price: pricePs[0] || null,
                link: link.getAttribute('href') || null
            });
        }
        return results;
    }""")

    return [Campaign(
        image=c.get("image"), video=c.get("video"), badge=c.get("badge"),
        title=c.get("title"), description=c.get("description"),
        price=c.get("price"), link=c.get("link"),
    ) for c in campaigns_raw]
