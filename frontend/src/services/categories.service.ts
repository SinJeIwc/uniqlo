import { z } from "zod"
import type { CategoriesTreeNode, Category } from "@/db"
import { NotFoundError, ValidationError } from "@/lib/errors/api-error"
import { categoriesRepository } from "@/repositories/categories.repository"

const getCategoriesSchema = z.object({
  gender: z.enum(["women", "men", "kids", "baby"]).optional(),
  flat: z
    .enum(["0", "1"])
    .optional()
    .transform((v) => v === "1"),
})

const createCategorySchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  gender: z.enum(["women", "men", "kids", "baby"]),
  nameRu: z.string().optional(),
  subtitle: z.string().optional(),
  subtitleRu: z.string().optional(),
  parentId: z.number().int().nullable().optional(),
  order: z.number().int().default(0),
  image: z.string().nullable().optional(),
  imageSp: z.string().nullable().optional(),
  imagePc: z.string().nullable().optional(),
  imageNav: z.string().nullable().optional(),
  visible: z.number().int().min(0).max(1).default(1),
  nav: z.number().int().min(0).max(1).default(0),
  navOrder: z.number().int().default(0),
})

const updateCategorySchema = z.object({
  id: z.number().int().positive(),
  data: z.object({
    name: z.string().optional(),
    nameRu: z.string().optional(),
    slug: z.string().optional(),
    subtitle: z.string().optional(),
    subtitleRu: z.string().optional(),
    image: z.string().nullable().optional(),
    imageSp: z.string().nullable().optional(),
    imagePc: z.string().nullable().optional(),
    imageNav: z.string().nullable().optional(),
    visible: z.number().int().min(0).max(1).optional(),
    order: z.number().int().optional(),
    navOrder: z.number().int().optional(),
  }),
})

/**
 * Business logic for categories management.
 */
export class CategoriesService {
  /**
   * Get categories as a flat list or hierarchical tree.
   * @throws {ValidationError} if input is invalid
   */
  async getCategories(params: unknown) {
    const validated = getCategoriesSchema.safeParse(params)
    if (!validated.success) {
      throw new ValidationError(validated.error.issues[0]?.message ?? "Invalid input")
    }

    const { gender, flat } = validated.data

    const all = await categoriesRepository.findMany({ gender })

    // Flat mode: return only categories that have products
    if (flat) {
      // Get categories that have products linked
      const withProducts = await categoriesRepository.findWithProducts()
      
      return {
        categories: withProducts.map((c) => ({
          id: c.id,
          name: c.nameRu || c.name,
          slug: c.slug,
        })),
      }
    }

    // Tree mode: build hierarchical structure
    return this.buildTree(all)
  }

  /**
   * Build hierarchical tree from flat category list.
   */
  buildTree(categories: Category[]): CategoriesTreeNode[] {
    const parents = categories.filter((c) => c.parentId === null)
    const children = categories.filter((c) => c.parentId !== null)

    return parents.map((parent) => ({
      ...parent,
      children: this.buildChildrenRecursive(parent.id, children),
    }))
  }

  /**
   * Recursively build children tree.
   */
  private buildChildrenRecursive(parentId: number, allChildren: Category[]): CategoriesTreeNode[] {
    const directChildren = allChildren.filter((c) => c.parentId === parentId)

    return directChildren.map((child) => ({
      ...child,
      children: this.buildChildrenRecursive(child.id, allChildren),
    }))
  }

  /**
   * Get navbar categories (nav = 1) with Russian names.
   */
  async getNavCategories() {
    const navCats = await categoriesRepository.findNavCategories()

	return navCats.map((cat) => ({
		name: cat.name,
		nameRu: cat.nameRu,
		slug: cat.slug,
		gender: cat.gender,
		image: cat.image, // Flyout icons (no gray background)
	}))
  }

  /**
   * Get single category by ID.
   * @throws {NotFoundError} if category not found
   */
  async getById(id: number) {
    const category = await categoriesRepository.findById(id)
    if (!category) {
      throw new NotFoundError("Category not found")
    }
    return category
  }

  /**
   * Get category by slug.
   * @throws {NotFoundError} if category not found
   */
  async getBySlug(slug: string) {
    const category = await categoriesRepository.findBySlug(slug)
    if (!category) {
      throw new NotFoundError("Category not found")
    }
    return category
  }

  /**
   * Create new category (admin only).
   * @throws {ValidationError} if input is invalid
   */
  async create(params: unknown) {
    const validated = createCategorySchema.safeParse(params)
    if (!validated.success) {
      throw new ValidationError(validated.error.issues[0]?.message ?? "Invalid input")
    }

    return categoriesRepository.create(validated.data)
  }

  /**
   * Update category (admin only).
   * @throws {ValidationError} if input is invalid
   * @throws {NotFoundError} if category not found
   */
  async update(params: unknown) {
    const validated = updateCategorySchema.safeParse(params)
    if (!validated.success) {
      throw new ValidationError(validated.error.issues[0]?.message ?? "Invalid input")
    }

    const { id, data } = validated.data

    const existing = await categoriesRepository.findById(id)
    if (!existing) {
      throw new NotFoundError("Category not found")
    }

    const updated = await categoriesRepository.update(id, data)
    return updated ?? existing
  }

  /**
   * Delete category (admin only).
   * @throws {NotFoundError} if category not found
   */
  async delete(id: number) {
    const existing = await categoriesRepository.findById(id)
    if (!existing) {
      throw new NotFoundError("Category not found")
    }

    await categoriesRepository.delete(id)
  }
}

export const categoriesService = new CategoriesService()
