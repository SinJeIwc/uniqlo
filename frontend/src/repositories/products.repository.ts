import { and, asc, count, eq, like, or } from "drizzle-orm"
import type { Product, ProductsResponse } from "@/db"
import { db } from "@/db"
import { products } from "@/db/schema"

export interface FindProductsOptions {
  q?: string
  gender?: string
  category?: string
  categoryId?: number
  active?: 0 | 1
  page?: number
  limit?: number
}

/**
 * Data access layer for products table.
 */
export class ProductsRepository {
  /**
   * Find products with filtering, pagination, and sorting.
   */
  async findMany(options: FindProductsOptions): Promise<ProductsResponse> {
    const { q, gender, category, categoryId, active, page = 1, limit = 20 } = options
    const offset = (page - 1) * limit

    const conditions = []

    // Search by product_id or name (Russian or original)
    if (q) {
      conditions.push(
        or(
          like(products.name, `%${q}%`),
          like(products.nameRu, `%${q}%`),
          like(products.productId, `%${q}%`),
        ),
      )
    }

    // Filter by gender
    if (gender) {
      conditions.push(eq(products.gender, gender))
    }

    // Filter by category name
    if (category) {
      conditions.push(eq(products.category, category))
    }

    // Filter by category ID (foreign key)
    if (categoryId !== undefined) {
      conditions.push(eq(products.categoryId, categoryId))
    }

    // Filter by active flag
    if (active !== undefined) {
      conditions.push(eq(products.active, active))
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined

    // Parallel queries for total count and paginated rows
    const [totalResult, rows] = await Promise.all([
      db.select({ count: count() }).from(products).where(where).get(),
      db
        .select()
        .from(products)
        .where(where)
        .orderBy(asc(products.gender), asc(products.category), asc(products.name))
        .limit(limit)
        .offset(offset)
        .all(),
    ])

    return {
      rows,
      total: totalResult?.count ?? 0,
      page,
      limit,
    }
  }

  /**
   * Find product by internal database ID.
   */
  async findById(id: number): Promise<Product | undefined> {
    return db.select().from(products).where(eq(products.id, id)).get()
  }

  /**
   * Find product by external product_id (UNIQLO SKU).
   */
  async findByProductId(productId: string): Promise<Product | undefined> {
    return db.select().from(products).where(eq(products.productId, productId)).get()
  }

  /**
   * Get total product count (optionally filtered by active status).
   */
  async count(active?: 0 | 1): Promise<number> {
    const where = active !== undefined ? eq(products.active, active) : undefined
    const result = db.select({ count: count() }).from(products).where(where).get()
    return result?.count ?? 0
  }

  /**
   * Update product by ID.
   */
  async update(id: number, data: Partial<Product>): Promise<Product | undefined> {
    db.update(products).set(data).where(eq(products.id, id)).run()
    return this.findById(id)
  }

  /**
   * Soft-delete product (set active = 0).
   */
  async deactivate(id: number): Promise<void> {
    db.update(products).set({ active: 0 }).where(eq(products.id, id)).run()
  }

  /**
   * Hard-delete product by ID.
   */
  async delete(id: number): Promise<void> {
    db.delete(products).where(eq(products.id, id)).run()
  }
}

export const productsRepository = new ProductsRepository()
