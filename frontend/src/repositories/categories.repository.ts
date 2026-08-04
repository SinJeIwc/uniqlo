import { and, asc, eq, isNull } from "drizzle-orm"
import type { Category } from "@/db"
import { db } from "@/db"
import { categories } from "@/db/schema"

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
   * Update category by ID.
   */
  async update(id: number, data: Partial<Category>): Promise<Category | undefined> {
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
