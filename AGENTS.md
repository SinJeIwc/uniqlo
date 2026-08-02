# AGENTS.md — UNIQLO Kyrgyzstan E-Commerce

UNIQLO e-commerce site for Kyrgyzstan with automated product/category scraping from uniqlo.com/jp.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16.2, React 19.2, Tailwind CSS 4, shadcn/ui (base-ui) |
| State | Zustand 5 |
| Database | SQLite via better-sqlite3 + Drizzle ORM |
| Auth | iron-session, bcryptjs |
| Parsers | Python 3.11+, Playwright, uv |
| Package manager | pnpm (frontend), uv (scripts) |

Database file: `frontend/data/uniqlo.db` (gitignored — contains admin passwords).

## Project Structure

```
uniqlo/
├── frontend/                  # Next.js application
│   ├── src/
│   │   ├── app/              # App Router pages & API routes
│   │   ├── components/       # React components (ui/, layout/, product/, cart/, auth/, admin/, home/, navigation/, shared/)
│   │   ├── db/               # Database schema & connection
│   │   │   ├── schema.ts     # Source of truth for all tables
│   │   │   └── index.ts      # Connection singleton (WAL mode)
│   │   ├── lib/              # Utilities (session.ts, telegram.ts, utils.ts, api/, stores/)
│   │   ├── store/            # Zustand slices (sidebar.ts)
│   │   ├── hooks/            # Shared hooks (use-mobile.ts)
│   │   ├── constants/        # Shared constants
│   │   └── data/             # Static data (categories/, home/)
│   ├── data/uniqlo.db        # SQLite database (gitignored)
│   └── drizzle/              # Drizzle migrations
├── scripts/                   # Python parsers
│   ├── categories/           # Category & product parsers
│   │   ├── parse.py          # Main CLI entrypoint
│   │   └── lib/              # Parser modules
│   │       ├── crawl.py      # Category tree traversal (L0→L1→L2→L3)
│   │       ├── products.py   # Parallel product scraping (4 tabs, resume support)
│   │       ├── db.py         # SQLite operations (upsert categories/products)
│   │       ├── flyout.py     # Navigation menu parsing
│   │       ├── subs.py       # Subcategory extraction (#lineupLinkWrapper)
│   │       └── product_js.py # Shared JS for product page data extraction
│   └── homepage/             # Homepage campaign parser (legacy)
└── docs/                     # General documentation
```

## Database Schema

Defined in `frontend/src/db/schema.ts` — the single source of truth. Three tables:

### categories

| Column | Type | Notes |
|--------|------|-------|
| id | integer PK | |
| name | text NOT NULL | Display name |
| slug | text NOT NULL | URL slug |
| href | text | Full URL path |
| gender | text NOT NULL | `women`, `men`, `kids`, `baby` |
| parent_id | integer | Self-referencing FK for hierarchy |
| order | integer | Sort order |
| image | text | Image URL |
| kind | text | `gender`, `feature`, `category`, `filter` |
| nav | integer | Show in navigation (0/1) |
| nav_order | integer | Navigation sort order |
| visible | integer | Show on site (0/1) |

### products

| Column | Type | Notes |
|--------|------|-------|
| id | integer PK auto | |
| product_id | text UNIQUE | UNIQLO product code (e.g. E482148-000) |
| name | text NOT NULL | |
| description | text | |
| brand | text | Default `UNIQLO` |
| section | text | |
| category | text | Category name |
| subcategory | text | Subcategory name |
| price | integer | In yen |
| rating | text | |
| review_count | integer | |
| gender | text NOT NULL | |
| category_id | integer FK → categories.id | |
| material | text | |
| colors | text (JSON) | `["color1","color2"]` |
| color_chips | text (JSON) | Hex color swatches |
| sizes | text (JSON) | Available sizes |
| variants | text (JSON) | Color/size variants |
| gallery | text (JSON) | Product image URLs |
| ai_review | text | AI-generated review summary |
| product_description | text (JSON) | Structured description blocks |
| in_stock | integer | 0/1 flag |

JSON arrays are stored as text columns; parse with `JSON.parse()` or equivalent.

### users

| Column | Type | Notes |
|--------|------|-------|
| id | integer PK auto | |
| name | text NOT NULL | |
| email | text | |
| avatar | text | Avatar URL |
| provider | text NOT NULL | Auth provider name |
| provider_id | text NOT NULL | Provider's user ID |
| role | text | `user` or `admin` |
| password_hash | text | bcrypt hash |
| created_at | text NOT NULL | ISO timestamp |

### Type Safety

```typescript
import type { categories, products, users } from "@/db/schema"

type Category = typeof categories.$inferSelect    // query result rows
type NewCategory = typeof categories.$inferInsert // rows to insert
type Product = typeof products.$inferSelect
type NewProduct = typeof products.$inferInsert
type User = typeof users.$inferSelect
type NewUser = typeof users.$inferInsert
```

Never write manual interfaces for DB types — use Drizzle's inferred types.

## Frontend Setup

```bash
cd frontend
pnpm install
pnpm drizzle-kit push    # create/update DB tables from schema.ts
```

### Development Commands

```bash
pnpm dev                  # start dev server on :3000
pnpm lint                 # biome check
pnpm lint:fix             # biome check --write
pnpm format               # biome format --write
pnpm setup-admin          # create admin user (interactive)
pnpm drizzle-kit studio   # visual DB browser
```

### Database Workflow

**Schema is source of truth** (`frontend/src/db/schema.ts`):

- DB changed externally (SQL, admin panel, parser) → `pnpm drizzle-kit introspect` regenerates `schema.ts`
- schema.ts changed → `pnpm drizzle-kit push` applies to DB directly (no migration needed)
- Want a migration instead → `pnpm drizzle-kit generate`

DB location: `frontend/data/uniqlo.db`. Connection uses WAL mode for better concurrency (`frontend/src/db/index.ts`).

## Parser Commands

All commands run from `scripts/` directory. First-time setup:

```bash
cd scripts
uv sync
```

### Categories Only (2-5 min)

```bash
uv run python categories/parse.py categories              # all genders
uv run python categories/parse.py categories --gender women
```

### Products Only

Reads categories from DB, scrapes all their products:

```bash
uv run python categories/parse.py products                # all products
uv run python categories/parse.py products --max 50       # testing limit
```

### Everything

```bash
uv run python categories/parse.py all                     # categories + products
uv run python categories/parse.py all --gender men --max 100
```

### Single Product (Debug)

```bash
uv run python categories/parse.py product --url https://www.uniqlo.com/jp/ja/products/E424873-000/00 --pretty
```

Outputs JSON to stdout.

### Flags Summary

| Command | Flag | Default | Description |
|---------|------|---------|-------------|
| `categories` | `--gender` | `all` | `women`, `men`, `kids`, `baby` |
| `products` | `--max` | `0` (all) | Limit product count for testing |
| `all` | `--gender` | `all` | Gender filter for categories |
| `all` | `--max` | `0` (all) | Limit product count |
| `product` | `--url` | required | Full product page URL |
| `product` | `--pretty` | false | Pretty-print JSON |

## Parser Architecture

### Category Hierarchy

| Level | Source | `kind` value | Example |
|-------|--------|-------------|---------|
| L0 | hardcoded | `gender` | women |
| L1 | Flyout nav | `gender`/`feature` | Tシャツ・スウェット |
| L2 | #lineupLinkWrapper | `category` | Tシャツ・カットソー |
| L3 | BannerWithProducts | `filter` | クルーネックT |

Products are scraped only from **terminal** pages (L3 or L2 pages without `#lineupLinkWrapper`). Each product gets the `category_id` of the page where it was found.

### Scraping Flow

1. **Flyout navigation** → extract L1 categories from nav menu
2. **LineupLinkWrapper** → extract L2 subcategories
3. **BannerWithProducts** → extract L3 filters
4. **Product pages** → parallel scraping (4 concurrent browser tabs) with resume support

### Data Extraction

- **Product metadata**: JSON-LD `<script>` tags on product pages
- **Color chips**: Visual swatches extracted from the page
- **AI reviews**: ITOCard content after `レビュー要約` (review summary) section
- **Product specs**: Details and materials from `<aside>` elements
- **Gallery/images**: Extracted as JSON arrays, stored as text

### Key Modules (`scripts/categories/lib/`)

| Module | Purpose |
|--------|---------|
| `crawl.py` | Category tree traversal (L0→L3) |
| `products.py` | Parallel product scraping with resume support |
| `db.py` | Upsert categories/products into SQLite |
| `flyout.py` | Navigation menu DOM parsing |
| `subs.py` | Subcategory extraction from lineup pages |
| `product_js.py` | Shared JS for product page data extraction |

## Key Conventions

### Parser Conventions (from `scripts/AGENTS.md`)

- One folder = one domain area (`categories/`, `homepage/`)
- Parser = 1+ Python files (decompose when complex)
- `*.md` files next to parser document CLI usage and data format
- Run from `scripts/` root: `uv run python categories/parse.py`
- All paths relative to `__file__`

### Frontend Conventions (from `frontend/AGENTS.md`)

- App Router with Server Components by default
- shadcn/ui components in `src/components/ui/` (base-ui foundation, not Radix)
- Semantic design tokens only from `src/app/globals.css` — never raw Tailwind colors
- Zustand stores in `src/store/`
- iron-session for auth (see `src/lib/session.ts`)

## Common Tasks

### Add a New Parser

1. Create `scripts/<domain>/` folder
2. Add `parse.py` with CLI (argparse subcommands)
3. Add `<domain>.md` documenting usage
4. Update `frontend/src/db/schema.ts` if new fields needed
5. Run `pnpm drizzle-kit push` from `frontend/` to apply schema

### Update the Database Schema

1. Edit `frontend/src/db/schema.ts`
2. Run `pnpm drizzle-kit push` from `frontend/`
3. Update parser `lib/db.py` functions for new fields

### Full Data Refresh

```bash
cd scripts
uv run python categories/parse.py all    # scrape everything fresh
```

### Check Database Contents

```bash
cd frontend
pnpm drizzle-kit studio                  # visual DB browser
# or
sqlite3 data/uniqlo.db "SELECT COUNT(*) FROM products"
sqlite3 data/uniqlo.db "SELECT COUNT(*) FROM categories"
```

### Development Tips

**Parsers:**
- Playwright runs headless by default
- Products are skipped if already in DB (resume support — safe to re-run)
- `--max N` is essential for testing iteration speed
- `--gender` filter narrows category scope, speeding up the whole pipeline
- DB path is resolved relative to `parse.py` → `../../frontend/data/uniqlo.db`

**Frontend:**
- Always use Drizzle inferred types — never write manual DB interfaces
- Database uses WAL mode for concurrent read/write safety
- Admin routes are protected by role check
- Product images, colors, sizes, galleries are JSON arrays stored as text columns

**Docs:**
- Keep `AGENTS.md` updated with new parser commands and DB schema changes
- all docs are in `docs/` folder, organized by topic
