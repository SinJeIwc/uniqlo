# Backend Architecture

## Overview
UNIQLO e-commerce backend uses:
- **Database**: SQLite (better-sqlite3) with Drizzle ORM
- **Framework**: Next.js 16 App Router
- **Pattern**: Repository + Service layer (partial)

## Database Schema

### Tables
1. **categories** - Product categories with hierarchy
   - Russian translations (name_ru, subtitle_ru)
   - Navigation flags (nav, home_nav)
   - Images (image_nav for navbar, image_pc/sp for banners)
   
2. **products** - Product catalog
   - Russian translations (name_ru, description_ru, section_ru, category_ru, subcategory_ru)
   - Soft delete (active flag)
   - JSON fields for variants, gallery, etc.

3. **users** - Authentication

### Key Fields
- `nav=1` - Category appears in main navigation (flyout menu)
- `home_nav=1` - Category appears on gender home page (curated subset, ~14-18 per gender)
- `kind` - Category type: 'category' | 'feature' | 'brand'
- `active` - Product soft delete flag (1=active, 0=deleted)

## Data Layer Architecture

### Current State (Mixed)
```
┌─────────────────────────────────────────────────────────┐
│ Route Handlers (app/api/*)                              │
│  ├─ Direct DB access (admin routes)                     │
│  ├─ Service layer (categories)                          │
│  └─ Mixed patterns                                      │
└─────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│ Server Components (app/*/page.tsx)                      │
│  ├─ Direct DB access                                    │
│  ├─ lib/api helpers (categories)                        │
│  └─ Service calls (categoriesService)                   │
└─────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│ Data Access                                             │
│  ├─ src/db (schema, index)                             │
│  ├─ src/lib/api/* (helper functions)                   │
│  └─ src/services/* (categoriesService)                 │
└─────────────────────────────────────────────────────────┘
```

### Patterns in Use

#### 1. Direct DB Access (Simple Queries)
```ts
// app/admin/products/page.tsx
import { db } from "@/db"
import { products } from "@/db/schema"

const rows = db.select().from(products).all()
```
**Use when:** Simple read, no business logic, single table

#### 2. lib/api Helpers (Shared Queries)
```ts
// src/lib/api/categories.ts
export async function getHomeNavCategories(gender: string): Promise<CategoryNavItem[]> {
  const rows = db.select(/*...*/).from(categories)
    .where(and(eq(categories.gender, gender), eq(categories.homeNav, 1)))
    .all()
  
  return rows.map(row => ({
    text: row.nameRu || row.name,
    // ... transform to component shape
  }))
}
```
**Use when:** Reusable query, data transformation, type mapping

#### 3. Service Layer (Complex Logic)
```ts
// src/services/categories.service.ts
class CategoriesService {
  async getNavCategories(): Promise<NavItem[]> {
    // Business logic, caching, etc.
  }
}

export const categoriesService = new CategoriesService()
```
**Use when:** Complex business logic, cross-cutting concerns, testability needs

## Migration Status

### Completed Migrations
- ✅ **Home pages** (/, /men, /kids, /baby) - Use `getHomeNavCategories()` from DB
- ✅ **Category pages** - Use categoriesService
- ✅ **Admin categories** - Direct DB with Drizzle queries

### Still Using JSON Files
- ⚠️ Home campaign data (`src/data/home/*.json`)
- ⚠️ Some static content

### Stale Files (Can Delete)
- `src/data/categories/*-nav.json` - Replaced by DB queries with home_nav=1

## Type System

### Shared Types
```ts
// src/db/types.ts
export type Category = InferSelectModel<typeof categories>
export type Product = InferSelectModel<typeof products>
export type CategoryInsert = InferInsertModel<typeof categories>
```

### Component-Specific Types
```ts
// src/components/home/types.ts
export type CategoryNavItem = {
  text: string    // Display name
  href: string    // Full path
  slug: string    // Category slug
  image: string   // Image URL (required)
}
```

**Pattern:** API helpers map DB types → component types

## Parsing & Data Pipeline

### Category Parser
```
scripts/categories/
  ├─ parse.py          # Main orchestrator
  ├─ lib/
  │   ├─ crawl.py      # Multi-level crawl (L1/L2/L3/terminal)
  │   ├─ flyout.py     # Full nav extraction (SEED for crawl)
  │   ├─ home_nav.py   # Home category list (#homeCategoryList)
  │   └─ products.py   # Product detail extraction
  └─ translate.py      # JP → RU translation (deep-translator)
```

**Critical:**
- `flyout.py` - SEED for entire crawl (currently broken selector, but DB has data)
- `home_nav.py` - Separate function for home page categories (marks home_nav=1)
- Translation preserved on re-parse (only cleared if source text changed)

### Product Parser
- Soft delete: active=0 for stale products (only on full parse, not --max)
- Resume support: skip already-parsed product_id
- Gallery fallback: JSON-LD → DOM selector

## Best Practices

### When to Use Each Pattern

| Pattern | Use Case | Example |
|---------|----------|---------|
| Direct DB | Simple admin CRUD, single table | Admin products list |
| lib/api helper | Reusable query + transform | Home nav categories |
| Service layer | Complex logic, multiple tables | Category tree with counts |

### Type Safety
1. Infer DB types from Drizzle schema
2. Create component-specific types
3. Map in API layer, not components

### Data Freshness
- ✅ Server Components read DB directly (always fresh)
- ❌ Avoid JSON files for dynamic data
- ✅ Use `force-dynamic` for API routes that need real-time data

## Future Improvements

### Recommended
1. **Consistent Repository Pattern**
   - Move all DB access to repositories
   - Services call repositories only
   - Routes/pages call services

2. **Caching Strategy**
   - Redis/KV for hot data
   - ISR for static-ish content
   - Tag-based revalidation

3. **Fix Flyout Parser**
   - Find new selector for full nav
   - Or use existing DB data
   - Separate home_nav from full crawl

### Not Urgent
- JSON campaign data migration (works fine)
- Complete service layer (overkill for this scale)

## Current Issues

### Known Problems
1. **Flyout parser broken** - `data-category="navi"` returns 0
   - Impact: Can't re-seed full category crawl
   - Workaround: DB has 207 categories already
   - Fix: Find new selector or use visible nav links

2. **Missing categories in home list**
   - UT, flower, gender root pages not in DB
   - Parsed as links, not categories
   - Not critical (features work)

3. **TypeScript warnings**
   - telegram/route.ts has pre-existing errors
   - Not blocking

## Reference

- Database: `frontend/data/uniqlo.db` (gitignored)
- Schema: `frontend/src/db/schema.ts`
- Types: `frontend/src/db/types.ts`
- Services: `frontend/src/services/`
- API helpers: `frontend/src/lib/api/`
- Parsers: `scripts/categories/`

---

Last updated: 2025-01-20
