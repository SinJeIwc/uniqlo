import { and, asc, eq, inArray, isNotNull, isNull } from "drizzle-orm"
import type { Category, CategoryInsert } from "@/db"
import { db } from "@/db"
import { categories, products } from "@/db/schema"

export interface FindCategoriesOptions {
  gender?: string
  nav?: 0 | 1
  visible?: 0 | 1
  parentId?: number | null
}

/**
 * Data access layer for categories table.
 */
export class CategoriesRepository {
  /**
   * Find all categories with optional filters.
   */
  async findMany(options: FindCategoriesOptions = {}): Promise<Category[]> {
    const { gender, nav, visible, parentId } = options

    const conditions = []

    if (gender !== undefined) {
      conditions.push(eq(categories.gender, gender))
    }

    if (nav !== undefined) {
      conditions.push(eq(categories.nav, nav))
    }

    if (visible !== undefined) {
      conditions.push(eq(categories.visible, visible))
    }

    if (parentId !== undefined) {
      if (parentId === null) {
        conditions.push(isNull(categories.parentId))
      } else {
        conditions.push(eq(categories.parentId, parentId))
      }
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined

    return db
      .select()
      .from(categories)
      .where(where)
      .orderBy(asc(categories.gender), asc(categories.order))
      .all()
  }

  /**
   * Find category by ID.
   */
  async findById(id: number): Promise<Category | undefined> {
    return db.select().from(categories).where(eq(categories.id, id)).get()
  }

  /**
   * Find category by slug.
   */
  async findBySlug(slug: string): Promise<Category | undefined> {
    return db.select().from(categories).where(eq(categories.slug, slug)).get()
  }

  /**
   * Find categories by gender.
   */
  async findByGender(gender: string): Promise<Category[]> {
    return db
      .select()
      .from(categories)
      .where(eq(categories.gender, gender))
      .orderBy(asc(categories.order))
      .all()
  }

  /**
   * Find navbar categories (nav = 1) ordered by navOrder.
   */
  async findNavCategories(): Promise<Category[]> {
    return db
      .select()
      .from(categories)
      .where(eq(categories.nav, 1))
      .orderBy(asc(categories.navOrder))
      .all()
  }

  /**
   * Find children of a parent category.
   */
  async findChildren(parentId: number): Promise<Category[]> {
    return db
      .select()
      .from(categories)
      .where(eq(categories.parentId, parentId))
      .orderBy(asc(categories.order))
      .all()
  }

  /**
   * Find root categories (parentId = null).
   */
  async findRoots(gender?: string): Promise<Category[]> {
    const conditions = [isNull(categories.parentId)]

    if (gender) {
      conditions.push(eq(categories.gender, gender))
    }

    return db
      .select()
      .from(categories)
      .where(and(...conditions))
      .orderBy(asc(categories.gender), asc(categories.order))
      .all()
  }

  /**
   * Find categories that have products linked (for filter dropdowns).
   */
  async findWithProducts(): Promise<Category[]> {
    // Get distinct category_ids from products
    const withProductsIds = await db
      .selectDistinct({ categoryId: products.categoryId })
      .from(products)
      .where(isNotNull(products.categoryId))
      .all()

    const ids = withProductsIds.map((r) => r.categoryId).filter((id): id is number => id !== null)

    if (ids.length === 0) {
      return []
    }

    // Get full categories by those IDs
    return db
      .select()
      .from(categories)
      .where(inArray(categories.id, ids))
      .orderBy(asc(categories.gender), asc(categories.name))
      .all()
  }

  /**
   * Create a new category.
   * Drizzle applies schema defaults automatically.
   */
  async create(data: CategoryInsert): Promise<Category> {
    const result = db.insert(categories).values(data).run()
    const id = Number(result.lastInsertRowid)

    const created = await this.findById(id)
    if (!created) {
      throw new Error("Failed to create category")
    }

    return created
  }

  /**
   * Update category by ID.
   */
  async update(id: number, data: Partial<CategoryInsert>): Promise<Category | undefined> {
    db.update(categories).set(data).where(eq(categories.id, id)).run()
    return this.findById(id)
  }

  /**
   * Delete category by ID.
   */
  async delete(id: number): Promise<void> {
    db.delete(categories).where(eq(categories.id, id)).run()
  }

  /**
   * Get total category count.
   */
  async count(): Promise<number> {
    const result = db
      .select({ count: db.$count(categories.id) })
      .from(categories)
      .get()
    return result?.count ?? 0
  }
}

export const categoriesRepository = new CategoriesRepository()
