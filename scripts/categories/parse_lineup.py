#!/usr/bin/env python3
"""Lineup parser — extracts L3 subcategories from an L2 category page.

Usage:
    cd scripts
    uv run python categories/parse_lineup.py --gender women --slug special-collaboration
    uv run python categories/parse_lineup.py --gender men --slug tops --pretty
    uv run python categories/parse_lineup.py --gender women --slug tops --output tops-l3.json
"""
import argparse
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from playwright.sync_api import sync_playwright
from lib.subs import parse_subcategories


def kind_from_href(href: str) -> str:
    # subs.py returns href with /jp/ja/ prefix, strip it
    h = href.removeprefix("/jp/ja")
    return h.strip("/").split("/")[0]


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--gender", required=True, choices=["women", "men", "kids", "baby"])
    parser.add_argument("--slug", required=True)
    parser.add_argument("--pretty", action="store_true")
    parser.add_argument("--output")
    args = parser.parse_args()

    parent_href = f"/{args.gender}/{args.slug}"

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1440, "height": 900})
        raw = parse_subcategories(page, args.gender, args.slug)
        browser.close()

    result = []
    for item in raw:
        clean_href = item["href"].removeprefix("/jp/ja")
        result.append({
            "text": item["text"],
            "href": clean_href,
            "slug": item["slug"],
            "image": item["image"],
            "gender": args.gender,
            "parent_slug": args.slug,
            "parent_href": parent_href,
            "kind": kind_from_href(item["href"]),
        })

    print(f"  {args.gender}/{args.slug}: {len(result)} children", file=sys.stderr)

    json_str = json.dumps(result, ensure_ascii=False, indent=2 if args.pretty else None)

    if args.output:
        Path(args.output).write_text(json_str, encoding="utf-8")
        print(f"  → {args.output}", file=sys.stderr)
    else:
        print(json_str)


if __name__ == "__main__":
    main()
