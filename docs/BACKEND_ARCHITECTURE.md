# Backend Architecture

## Overview

Layered architecture for type-safe, maintainable Next.js backend following separation of concerns:

```
┌─────────────────────────────────────┐
│  Presentation Layer                 │  API Routes + React Components
│  - HTTP concerns only               │  (request/response, status codes)
│  - Thin route handlers              │
└──────────────┬──────────────────────┘
               ↓
┌─────────────────────────────────────┐
│  Service Layer                      │  Business Logic
│  - Input validation (Zod)           │  - Authorization checks
│  - Business rules                   │  - Data composition
│  - Error handling                   │
└──────────────┬──────────────────────┘
               ↓
┌─────────────────────────────────────┐
│  Repository Layer                   │  Data Access
│  - Drizzle ORM queries              │  - Type-safe DB operations
│  - Filtering, sorting, pagination   │  - Reusable query patterns
└──────────────┬──────────────────────┘
               ↓
┌─────────────────────────────────────┐
│  Data Layer                         │  SQLite + Drizzle ORM
│  - Schema definitions               │  - Type inference
└─────────────────────────────────────┘
```

## Directory Structure

```
frontend/src/
├── app/api/                    # Next.js API Route Handlers
│   ├── auth/                   # Authentication endpoints
│   │   ├── login/route.ts      # Email/password login
│   │   ├── telegram/route.ts   # Telegram OAuth
│   │   ├── logout/route.ts     # Session destroy
│   │   └── me/route.ts         # Current user
│   ├── admin/                  # Admin-only endpoints
│   │   ├── products/route.ts   # Product management
│   │   └── categories/route.ts # Category management
│   ├── products/route.ts       # Public product listing
│   └── categories/route.ts     # Public category tree
│
├── services/                   # Business Logic Layer
│   ├── auth.service.ts         # Authentication & session management
│   └── index.ts                # Barrel export
│
├── repositories/               # Data Access Layer
│   ├── users.repository.ts     # User CRUD operations
│   └── index.ts                # Barrel export
│
├── lib/
│   ├── errors/                 # Error handling
│   │   └── api-error.ts        # Custom error classes + unified handler
│   ├── middleware/             # Reusable middleware
│   │   └── auth.ts             # requireAdmin, requireAuth, getCurrentUser
│   ├── session.ts              # iron-session configuration
│   └── telegram.ts             # Telegram widget verification
│
└── db/
    ├── schema.ts               # Drizzle table definitions
    ├── types.ts                # TypeScript types (inferred from schema)
    └── index.ts                # Database instance + exports
```

## Core Patterns

### 1. API Route (Presentation Layer)

**Responsibilities:**
- Parse HTTP request (query params, body)
- Call appropriate service method
- Return HTTP response with correct status codes

**Pattern:**
```typescript
// src/app/api/admin/products/route.ts
import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/middleware/auth"
import { handleApiError } from "@/lib/errors/api-error"
import { productsService } from "@/services/products.service"

export async function GET(request: Request) {
  try {
    await requireAdmin()  // Authorization check
    
    const { searchParams } = new URL(request.url)
    const result = await productsService.list(Object.fromEntries(searchParams))
    
    return NextResponse.json(result)
  } catch (error) {
    return handleApiError(error)  // Unified error handling
  }
}
```

### 2. Service (Business Logic Layer)

**Responsibilities:**
- Input validation (Zod schemas)
- Business rule enforcement
- Authorization checks
- Orchestrate repository calls
- Error throwing with domain-specific errors

**Pattern:**
```typescript
// src/services/products.service.ts
import { z } from "zod"
import { productsRepository } from "@/repositories/products.repository"
import { NotFoundError, ValidationError } from "@/lib/errors/api-error"

const listProductsSchema = z.object({
  q: z.string().optional(),
  gender: z.enum(["women", "men", "kids", "baby"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

export class ProductsService {
  async list(params: unknown) {
    // Validation
    const validated = listProductsSchema.safeParse(params)
    if (!validated.success) {
      throw new ValidationError(validated.error.issues[0]?.message ?? "Invalid input")
    }

    // Delegate to repository
    return productsRepository.findMany(validated.data)
  }

  async getById(id: number) {
    const product = await productsRepository.findById(id)
    if (!product) throw new NotFoundError("Product not found")
    return product
  }
}

export const productsService = new ProductsService()
```

### 3. Repository (Data Access Layer)

**Responsibilities:**
- Drizzle ORM queries
- Filtering, sorting, pagination
- Type-safe data operations
- Return domain types (no business logic)

**Pattern:**
```typescript
// src/repositories/products.repository.ts
import { and, asc, count, eq, like } from "drizzle-orm"
import { db } from "@/db"
import { products } from "@/db/schema"
import type { Product } from "@/db"

export interface FindProductsOptions {
  q?: string
  gender?: string
  page?: number
  limit?: number
}

export class ProductsRepository {
  async findMany(options: FindProductsOptions) {
    const { q, gender, page = 1, limit = 20 } = options
    const offset = (page - 1) * limit

    const conditions = []
    if (q) conditions.push(like(products.name, `%${q}%`))
    if (gender) conditions.push(eq(products.gender, gender))

    const where = conditions.length ? and(...conditions) : undefined

    const [totalResult, rows] = await Promise.all([
      db.select({ count: count() }).from(products).where(where).get(),
      db.select().from(products).where(where)
        .orderBy(asc(products.name))
        .limit(limit).offset(offset).all()
    ])

    return { rows, total: totalResult?.count ?? 0, page, limit }
  }

  async findById(id: number): Promise<Product | undefined> {
    return db.select().from(products).where(eq(products.id, id)).get()
  }
}

export const productsRepository = new ProductsRepository()
```

### 4. Error Handling

**Custom Error Classes:**
```typescript
// src/lib/errors/api-error.ts
export class ApiError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message)
  }
}

export class AuthError extends ApiError {
  constructor(message = "Unauthorized") { super(401, message) }
}

export class ForbiddenError extends ApiError {
  constructor(message = "Forbidden") { super(403, message) }
}

export class NotFoundError extends ApiError {
  constructor(message = "Not found") { super(404, message) }
}

export class ValidationError extends ApiError {
  constructor(message: string) { super(400, message) }
}
```

**Unified Handler:**
```typescript
export function handleApiError(error: unknown): NextResponse {
  if (error instanceof ApiError) {
    return NextResponse.json({ error: error.message }, { status: error.statusCode })
  }
  
  console.error("Unhandled error:", error)
  return NextResponse.json({ error: "Internal server error" }, { status: 500 })
}
```

### 5. Authentication Middleware

```typescript
// src/lib/middleware/auth.ts
import { getSession } from "@/lib/session"
import { AuthError, ForbiddenError } from "@/lib/errors/api-error"

export async function getCurrentUser() {
  const session = await getSession()
  if (!session.user) throw new AuthError("Authentication required")
  return session.user
}

export async function requireAdmin() {
  const user = await getCurrentUser()
  if (user.role !== "admin") throw new ForbiddenError("Admin access required")
  return user
}
```

## Benefits

✅ **Separation of Concerns** — each layer has single responsibility  
✅ **Reusability** — services callable from API routes, Server Actions, CLI scripts  
✅ **Type Safety** — Zod validation + Drizzle type inference  
✅ **Testability** — isolated layers can be unit tested independently  
✅ **Consistency** — unified error handling across all endpoints  
✅ **DRY** — pagination, filtering, auth logic reused  
✅ **Maintainability** — clear structure, easy to locate and modify code  

## Migration Guide

### Before (inline DB access)
```typescript
export async function GET(request: Request) {
  const session = await getSession()
  if (session.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const rows = db.select().from(products).all()
  return NextResponse.json(rows)
}
```

### After (layered architecture)
```typescript
export async function GET(request: Request) {
  try {
    await requireAdmin()
    const result = await productsService.list({})
    return NextResponse.json(result)
  } catch (error) {
    return handleApiError(error)
  }
}
```

## Next Steps

- [ ] Create `products.service.ts` and `products.repository.ts`
- [ ] Create `categories.service.ts` and `categories.repository.ts`
- [ ] Migrate all public API routes to use services
- [ ] Add integration tests for services
- [ ] Document API endpoints with examples
