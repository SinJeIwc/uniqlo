#!/usr/bin/env python3
"""
Category parser — DOM tree approach.
Saves per-gender JSON to frontend/src/data/categories/
"""
import json
from pathlib import Path
from playwright.sync_api import sync_playwright

from lib.flyout import parse_flyout

NAV_DIR = Path(__file__).resolve().parent.parent.parent / "frontend" / "src" / "data" / "categories"


def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1440, "height": 900})

        print("▸ Parsing flyout DOM ...")
        data = parse_flyout(page)
        browser.close()

    total = sum(len(v) for v in data.values())
    print(f"  Total: {total} categories")

    NAV_DIR.mkdir(parents=True, exist_ok=True)
    for gender, items in data.items():
        path = NAV_DIR / f"{gender}-nav.json"
        path.write_text(json.dumps(items, ensure_ascii=False, indent=2), "utf-8")
        print(f"  {gender}: {len(items)} → {path}")


if __name__ == "__main__":
    main()
