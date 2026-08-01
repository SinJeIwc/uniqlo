"""Category crawling — flyout → lineup → terminal.

Builds 3-level hierarchy:
  L1 (section) — from flyout nav: /women/tops, /women/bottoms, ...
  L2 (category) — from #lineupLinkWrapper children: /women/tops/t-shirts, ...
  Terminal pages (no #lineupLinkWrapper) are where products live.
"""
from playwright.sync_api import Page

from lib.flyout import parse_flyout, GENDERS
from lib.subs import parse_subcategories

PAGE_TIMEOUT = 30000


def safe_goto(page, url: str, label: str = "") -> bool:
    try:
        page.goto(url, timeout=PAGE_TIMEOUT, wait_until="domcontentloaded")
        page.wait_for_selector("body", timeout=10000)
        return True
    except Exception as e:
        print(f"  ✗ {label or url}: {e}")
        return False


def crawl_categories(page: Page, gender_filter: str | None = None) -> list[dict]:
    """Crawl all categories: flyout → lineup → terminal.
    Returns flat list of category dicts with parent_id links.
    Terminal pages are leaf nodes — products are scraped from them.
    """
    print("▸ Flyout", flush=True)
    flyout_data = parse_flyout(page)

    all_cats: list[dict] = []
    to_crawl: list[dict] = []   # sections to visit for L2 children
    cat_id = 0

    genders = [gender_filter] if gender_filter else GENDERS

    # Level 1: sections from flyout nav
    for gender in genders:
        for i, item in enumerate(flyout_data.get(gender, [])):
            cat_id += 1
            # Determine kind: "section" for structural category groups,
            # "feature" for cross-cutting collections (airism, uv-protection, etc.)
            slug = item["slug"]
            href_parts = item["href"].lstrip("/").split("/")
            depth = len(href_parts)
            is_feature = (
                depth > 2  # subcategory promoted to flyout level
                or slug in {
                    "airism", "heattech", "uv-protection", "sport-utility-wear",
                    "linen", "lounge-and-underwear-collection", "flower",
                    "special-collaboration", "maternity",
                }
            )

            cat = {
                "id": cat_id,
                "name": item["text"],
                "slug": slug,
                "href": item["href"],
                "gender": gender,
                "parent_id": None,
                "image": item["image"],
                "image_nav": item["image"],
                "kind": "feature" if is_feature else "section",
                "nav": 1,
                "nav_order": i,
            }
            all_cats.append(cat)
            to_crawl.append(cat)

    print(f"  L1: {len(all_cats)} sections ({len(to_crawl)} to crawl)", flush=True)

    # Level 2: visit each section, extract children from #lineupLinkWrapper
    for i, cat in enumerate(to_crawl):
        url = f"https://www.uniqlo.com/jp/ja{cat['href']}"
        if not safe_goto(page, url, cat['href']):
            continue

        cat_id = _process_node(page, cat, all_cats, cat_id)

        if (i + 1) % 10 == 0:
            print(f"  {i+1}/{len(to_crawl)} sections crawled ({len(all_cats)} total)", flush=True)

    print(f"  total: {len(all_cats)} categories", flush=True)
    return all_cats


def _process_node(page: Page, parent: dict, all_cats: list[dict], cat_id: int) -> int:
    """Visit a category page. If #lineupLinkWrapper → extract L2 children + product_count.
    Otherwise it's terminal → extract MediaBanner hero media.
    """
    if page.evaluate("() => !!document.querySelector('#lineupLinkWrapper')"):
        # Lineup page: extract L2 children
        subs = parse_subcategories(page, parent["gender"], parent["slug"])
        for sub in subs:
            cat_id += 1
            clean = sub["href"].removeprefix("/jp/ja")
            all_cats.append({
                "id": cat_id,
                "name": sub["text"],
                "slug": sub["slug"],
                "href": clean,
                "gender": parent["gender"],
                "parent_id": parent["id"],
                "image": sub["image"],
                "image_nav": sub["image"],
                "kind": "category",
                "nav": 0,
                "nav_order": 0,
            })

        # Extract total product count from lineup page (e.g. "308 件")
        count = page.evaluate("""() => {
            const m = document.body.textContent.match(/(\\d+)\\s*件/);
            return m ? parseInt(m[1], 10) : null;
        }""")
        if count is not None:
            parent["product_count"] = count

    else:
        # Terminal page: extract MediaBanner hero media
        media = page.evaluate("""() => {
            const banner = document.querySelector('[_type="MediaBanner"]');
            if (!banner) return null;
            const img = banner.querySelector('img');
            const video = banner.querySelector('video');
            const ps = banner.querySelectorAll('p[data-testid="ITOTypography"]');
            return {
                image_sp: img?.getAttribute('smallmediumimageurl') || null,
                image_pc: img?.getAttribute('largeimageurl') || null,
                video_url: video?.getAttribute('data-src') || video?.getAttribute('src') || null,
                video_poster: video?.getAttribute('poster') || null,
                subtitle: ps[1]?.textContent?.trim() || null,
            };
        }""")
        if media:
            parent["image_sp"] = media["image_sp"]
            parent["image_pc"] = media["image_pc"]
            parent["video_url"] = media["video_url"]
            parent["video_poster"] = media["video_poster"]
            parent["subtitle"] = media["subtitle"]

    return cat_id
