#!/usr/bin/env python3
"""
UNIQLO Homepage Parser
Парсит страницы uniqlo.com по категориям (women/men/kids/baby),
извлекает кампании с фото/видео, переводит на русский.

Usage:
  uv run python -m home.parse                           # JP, all categories, translate ON
  uv run python -m home.parse --region us               # US region
  uv run python -m home.parse --categories women,men     # Only women + men
  uv run python -m home.parse --no-translate             # Skip translation

Output: frontend/src/data/home/women.json, men.json, kids.json, baby.json
"""

import json, os, sys, argparse
from dataclasses import asdict
from playwright.sync_api import sync_playwright
from .extract import extract, classify_gender, should_skip
from .translate import translate as tr

REGIONS = {
    "jp": "https://www.uniqlo.com/jp/ja",
    "us": "https://www.uniqlo.com/us/en",
    "uk": "https://www.uniqlo.com/uk/en",
    "fr": "https://www.uniqlo.com/fr/fr",
    "de": "https://www.uniqlo.com/de/de",
    "kr": "https://www.uniqlo.com/kr/ko",
    "sg": "https://www.uniqlo.com/sg/en",
    "my": "https://www.uniqlo.com/my/en",
    "th": "https://www.uniqlo.com/th/th",
    "ph": "https://www.uniqlo.com/ph/en",
    "id": "https://www.uniqlo.com/id/en",
    "au": "https://www.uniqlo.com/au/en",
    "ca": "https://www.uniqlo.com/ca/en",
}

ALL_CATEGORIES = ["women", "men", "kids", "baby"]
CATEGORY_PATHS = {"women": "", "men": "/men", "kids": "/kids", "baby": "/baby"}

_PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
_OUT_DIR = os.path.join(_PROJECT_ROOT, "frontend", "src", "data", "home")


def main():
    parser = argparse.ArgumentParser(
        description="Parse UNIQLO homepage campaigns",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="Examples:\n"
               "  uv run python -m home.parse\n"
               "  uv run python -m home.parse --region us --no-translate\n"
               "  uv run python -m home.parse --categories men,kids",
    )
    parser.add_argument("--region", default="jp", choices=list(REGIONS.keys()))
    parser.add_argument("--categories", default=None,
                        help="Comma-separated: women,men,kids,baby (default: all)")
    parser.add_argument("--no-translate", action="store_true")
    args = parser.parse_args()

    base_url = REGIONS[args.region]
    if args.categories:
        requested = [c.strip() for c in args.categories.split(",")]
        invalid = [c for c in requested if c not in ALL_CATEGORIES]
        if invalid:
            print(f"ERROR: Unknown categories: {invalid}")
            print(f"Valid: {', '.join(ALL_CATEGORIES)}")
            sys.exit(1)
    else:
        requested = ALL_CATEGORIES

    do_translate = not args.no_translate
    print(f"UNIQLO Parser — region: {args.region} ({base_url})")
    print(f"Categories: {', '.join(requested)}")
    print(f"Translate: {'ON' if do_translate else 'OFF'}\n")

    all_data: dict[str, list[dict]] = {}

    with sync_playwright() as p:
        for cat in requested:
            path = CATEGORY_PATHS[cat]
            url = f"{base_url}{path}"
            print(f"=== Parsing: {cat} ===")

            # --- Desktop viewport (1440px) ---
            browser = p.chromium.launch(headless=True)
            page = browser.new_page(viewport={"width": 1440, "height": 900})
            try:
                desktop_campaigns = extract(page, url)
                desktop_data = [asdict(c) for c in desktop_campaigns
                                if not should_skip(c.link or "")
                                and classify_gender(c.link or "") == cat]
            finally:
                browser.close()

            # --- Mobile viewport (375px) ---
            browser = p.chromium.launch(headless=True)
            page = browser.new_page(viewport={"width": 375, "height": 812})
            try:
                mobile_campaigns = extract(page, url)
                mobile_data = [asdict(c) for c in mobile_campaigns
                               if not should_skip(c.link or "")
                               and classify_gender(c.link or "") == cat]
            finally:
                browser.close()

            # Merge: match by link, copy mobile image/video to desktop
            mobile_by_link = {c["link"]: c for c in mobile_data if c.get("link")}
            for item in desktop_data:
                link = item.get("link")
                if link and link in mobile_by_link:
                    m = mobile_by_link[link]
                    if m.get("image") and m["image"] != item.get("image"):
                        item["imageMobile"] = m["image"]
                    if m.get("video") and m["video"] != item.get("video"):
                        item["videoMobile"] = m["video"]

            data = desktop_data
            skipped = len(desktop_campaigns) - len(data)
            if skipped:
                print(f"  Filtered out {skipped} blocks (other genders / banners)")

            if do_translate:
                print(f"  Translating {len(data)} items...")
                for item in data:
                    for field in ["title", "description", "saleText", "badge"]:
                        if item.get(field):
                            item[field] = tr(item[field])

            all_data[cat] = data
            print(f"  Found {len(data)} blocks (filtered from {len(desktop_campaigns)} total)")
            for c in desktop_campaigns:
                if should_skip(c.link or "") or classify_gender(c.link or "") != cat:
                    continue
                badge_str = f" [{c.badge}]" if c.badge else ""
                title_str = c.title[:60] if c.title else "(no title)"
                print(f"    {title_str}{badge_str}")
                if c.price:
                    print(f"           {c.price}")

    # Save
    os.makedirs(_OUT_DIR, exist_ok=True)
    for gender in requested:
        path = os.path.join(_OUT_DIR, f"{gender}.json")
        with open(path, "w") as f:
            json.dump(all_data.get(gender, []), f, ensure_ascii=False, indent=2)
        print(f"  {gender}: {len(all_data.get(gender, []))} blocks → {path}")

    total = sum(len(all_data.get(g, [])) for g in requested)
    print(f"\nTotal: {total} blocks")


if __name__ == "__main__":
    main()
