# API Documentation

Complete API reference for UNIQLO KG backend.

## Architecture

All API routes follow **layered architecture**:

```
Route Handler (HTTP) → Service (validation + logic) → Repository (data access) → Database
```

See [BACKEND_ARCHITECTURE.md](./BACKEND_ARCHITECTURE.md) for detailed patterns.

---

## Public API

### Products

#### `GET /api/products`
Public product listing (active products only).

**Query Params:**
- `q` — search by name (RU/EN) or product_id
- `gender` — filter by gender (`women`, `men`, `kids`, `baby`)
- `categoryId` — filter by category ID
- `page` — page number (default: 1)
- `limit` — items per page (default: 20, max: 100)

**Response:**
```json
{
  "rows": [
    {
      "id": 1,
      "productId": "U123456",
      "name": "T-Shirt",
      "nameRu": "Футболка",
      "price": 1500,
      "gender": "women",
      "category": "Tops",
      "active": 1
    }
  ],
  "total": 150,
  "page": 1,
  "limit": 20
}
```

---

### Categories

#### `GET /api/categories`
Public category tree or navbar list.

**Query Params:**
- `gender` — filter by gender (`women`, `men`, `kids`, `baby`)
- `flat` — return flat list for dropdowns (`0` or `1`)
- `type=nav` — return navbar categories only

**Response (tree mode):**
```json
[
  {
    "id": 1,
    "name": "Tops",
    "nameRu": "Верхняя одежда",
    "slug": "tops",
    "gender": "women",
    "children": [...]
  }
]
```

---

## Admin API

All admin endpoints require authentication and `admin` role.

### Admin Products

#### `GET /api/admin/products`
Admin product listing with full control (includes inactive).

**Query Params:** Same as public + `active` filter (`0` or `1`)

---

### Admin Categories

#### `GET /api/admin/categories`
Admin category tree or flat list.

#### `PATCH /api/admin/categories`
Update category.

**Body:**
```json
{
  "id": 1,
  "nameRu": "Новое название",
  "slug": "new-slug",
  "visible": 1
}
```

#### `DELETE /api/admin/categories?id=123`
Delete category.

---

## Services

Backend services can be imported and reused in Server Components, Server Actions, or CLI scripts.

### ProductsService

```typescript
import { productsService } from "@/services/products.service"

// List products
const { rows, total } = await productsService.list({
  gender: "women",
  page: 1,
  limit: 20,
})

// Get by ID
const product = await productsService.getById(1)

// Update
await productsService.update({ id: 1, data: { nameRu: "Новое" } })

// Deactivate
await productsService.deactivate(1)
```

---

### CategoriesService

```typescript
import { categoriesService } from "@/services/categories.service"

// Get categories
const tree = await categoriesService.getCategories({ gender: "women" })

// Get navbar categories
const navItems = await categoriesService.getNavCategories()

// Update
await categoriesService.update({ id: 1, data: { nameRu: "Новое" } })
```

---

## Error Handling

```typescript
import { handleApiError } from "@/lib/errors/api-error"
import { NotFoundError, ValidationError } from "@/lib/errors/api-error"

export async function GET(request: Request) {
  try {
    if (!product) throw new NotFoundError("Product not found")
    // ...
  } catch (error) {
    return handleApiError(error)
  }
}
```

**Error Classes:**
- `AuthError(401)` — authentication required
- `ForbiddenError(403)` — insufficient permissions
- `NotFoundError(404)` — resource not found
- `ValidationError(400)` — invalid input

---

## Middleware

```typescript
import { requireAdmin, requireAuth, getOptionalUser } from "@/lib/middleware/auth"

// Require admin
await requireAdmin()  // throws 401/403

// Require any auth
const user = await requireAuth()

// Optional auth
const user = await getOptionalUser()  // null if not authed
```

---

See [BACKEND_ARCHITECTURE.md](./BACKEND_ARCHITECTURE.md) for complete architecture guide.
