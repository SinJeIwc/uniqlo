#!/usr/bin/env python3
"""
Category DB parser — flyout → L2 pages → L3 subcategories → SQLite.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright

from lib.flyout import parse_flyout
from lib.subs import parse_subcategories
from lib.db import save as db_save

DB_PATH = Path(__file__).resolve().parent.parent.parent / "frontend" / "data" / "uniqlo.db"


def href_depth(href: str) -> int:
    """Count segments after gender: /women/tops → 1, /women/tops/tshirts → 2"""
    parts = href.strip("/").split("/")
    genders = {"women", "men", "kids", "baby"}
    for i, p in enumerate(parts):
        if p in genders:
            return len(parts) - i - 1
    return 99


def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1440, "height": 900})

        print("▸ Parsing flyout ...")
        data = parse_flyout(page)

        all_cats = []
        cat_id = 0
        for gender, items in data.items():
            for item in items:
                depth = href_depth(item["href"])
                if depth != 1:
                    continue  # only visit L2 pages

                cat_id += 1
                parent = {
                    "id": cat_id, "name": item["text"], "slug": item["slug"],
                    "gender": gender, "parentId": None,
                    "image": item["image"], "nav": 1,
                }
                all_cats.append(parent)

                subs = parse_subcategories(page, gender, item["slug"])
                for sub in subs:
                    sub_depth = href_depth(sub["href"])
                    if sub_depth != 2:
                        continue  # only L3, skip deeper
                    cat_id += 1
                    all_cats.append({
                        "id": cat_id, "name": sub["text"], "slug": sub["slug"],
                        "gender": gender, "parentId": parent["id"],
                        "image": sub["image"], "nav": 0,
                    })
                print(f"  {gender}/{item['slug']}: {len(subs)} subs")

        browser.close()

    db_save(str(DB_PATH), all_cats)


if __name__ == "__main__":
    main()
