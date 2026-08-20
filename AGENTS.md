# UNIQLO Kyrgyzstan E-commerce Project

## Code Style & Comments

### Comment Policy

**Default: No comments.** Write self-documenting code instead.

**When to add comments:**
- ✅ Complex business logic that isn't obvious from code
- ✅ Non-obvious workarounds or hacks (with "why")
- ✅ API/public function documentation (JSDoc/TSDoc)
- ✅ Regex patterns, mathematical formulas
- ✅ Security-critical sections
- ✅ Performance-critical optimizations (with benchmarks)

**Never comment:**
- ❌ What the code does (function names should be clear)
- ❌ Obvious operations (`// Get user` above `getUser()`)
- ❌ Every variable or parameter
- ❌ Reformatting or restating code in English
- ❌ TODOs without issue numbers (create issue, link it)

**Examples:**

```typescript
// ❌ BAD - obvious comments
// Get all products
const products = await db.select().from(products).all()

// Check if user is admin
if (user.role === "admin") {
  // ...
}

// ✅ GOOD - self-documenting code
const products = await getAllActiveProducts()

if (isAdmin(user)) {
  // ...
}

// ✅ GOOD - complex logic explained
// SQLite tie order isn't stable across queries for non-unique sort keys.
// Adding id as tiebreaker prevents duplicates/gaps on scroll boundaries.
.orderBy(asc(products.name), asc(products.id))

// ✅ GOOD - public API documentation
/**
 * Find products with filtering, pagination, and sorting.
 * @throws {ValidationError} if options are invalid
 */
async findMany(options: FindProductsOptions): Promise<ProductsResponse>
```

### Price Formatting

**Always use `formatPrice()` helper — never `toLocaleString()` (causes hydration mismatch).**

```typescript
// ✅ ALWAYS use formatPrice helper
import { formatPrice } from "@/lib/utils"
<p>¥{formatPrice(price)}</p>

// ❌ NEVER use toLocaleString (hydration mismatch)
<p>¥{price.toLocaleString()}</p> // Server: "1,500", Client: "1 500" → ERROR
```

## Backend Architecture

**Follow layered architecture from `docs/BACKEND_ARCHITECTURE.md`:**

```
API Route (Presentation)
  ↓ try/catch + handleApiError
Service (Business Logic)
  ↓ Zod validation
Repository (Data Access)
  ↓ Drizzle ORM
Database (SQLite)
```

**Rules:**
- ✅ API routes MUST be thin (HTTP only)
- ✅ Business logic MUST be in services
- ✅ DB queries MUST be in repositories
- ✅ Validation MUST use Zod schemas
- ✅ Errors MUST use custom error classes + `handleApiError`
- ❌ NO inline DB access in API routes
- ❌ NO business logic in repositories

**Example:**

```typescript
// ✅ CORRECT - layered
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const result = await productsService.list(Object.fromEntries(searchParams))
    return NextResponse.json(result)
  } catch (error) {
    return handleApiError(error)
  }
}

// ❌ WRONG - inline DB access
export async function GET(request: Request) {
  const rows = db.select().from(products).all()
  return NextResponse.json(rows)
}
```

## TypeScript

- ✅ Use Drizzle type inference (NO manual interfaces for DB types)
- ✅ Strict mode enabled
- ✅ Prefer `type` over `interface` (unless extending)
- ✅ Use const assertions for readonly data
- ✅ Explicit return types for public functions

## Database

- ✅ Stable pagination: always `ORDER BY name, id` (or unique column + id)
- ✅ Use Drizzle ORM (NO raw SQL unless necessary)
- ✅ Soft delete with `active` flag (NO hard deletes for products/categories)
- ✅ Gender stored as UPPERCASE in DB

## Russian Translations

- ✅ Use `nameRu || name` pattern for display
- ✅ Preserve translations on re-parse (parser checks if source changed)
- ✅ All `_ru` columns separate from originals

## Parsing

- ✅ Resume support (skip already-parsed)
- ✅ Gender-scoped delete in `db.py` (NO full table wipe)
- ⚠️ **TODO: Stable category IDs** (currently sequential, causes product orphaning on re-crawl)
- ✅ Products linked via `categoryId` (NOT text fields)

## Frontend

- ✅ shadcn/ui design tokens (NO raw Tailwind colors)
- ✅ Server Components by default
- ✅ Client Components only when needed (`"use client"`)
- ✅ Biome for formatting/linting

## Critical Patterns

### Pagination Stability

```typescript
// ✅ ALWAYS add stable tiebreaker
.orderBy(asc(products.name), asc(products.id))

// ❌ NEVER sort by non-unique field alone
.orderBy(asc(products.name)) // Causes duplicates/gaps!
```

### Error Handling

```typescript
// ✅ Use custom errors
throw new NotFoundError("Product not found")
throw new ValidationError("Invalid email")

// ❌ Don't throw generic errors
throw new Error("Not found") // Lost context
```

### Gender Casing

```typescript
// ✅ Transform to uppercase for DB
conditions.push(eq(products.gender, gender.toUpperCase()))

// ❌ Direct comparison fails
conditions.push(eq(products.gender, gender)) // "women" != "WOMEN"
```

## When in Doubt

1. Check existing patterns in the codebase
2. Read `docs/BACKEND_ARCHITECTURE.md`
3. Follow TypeScript errors (strict mode catches issues)
4. Keep it simple (YAGNI)
