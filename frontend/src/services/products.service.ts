import { z } from "zod"
import { NotFoundError, ValidationError } from "@/lib/errors/api-error"
import { productsRepository } from "@/repositories/products.repository"

const listProductsSchema = z.object({
  q: z.string().optional(),
  gender: z.enum(["women", "men", "kids", "baby"]).optional(),
  section: z.string().optional(),
  category: z.string().optional(),
  subcategory: z.string().optional(),
  categoryId: z.coerce.number().int().positive().optional(),
  categoryIds: z
    .string()
    .optional()
    .transform((v) => v?.split(",").map(Number)),
  active: z
    .enum(["0", "1"])
    .optional()
    .transform((v) => (v !== undefined ? Number(v) : undefined) as 0 | 1 | undefined),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

const updateProductSchema = z.object({
  id: z.number().int().positive(),
  data: z.object({
    nameRu: z.string().optional(),
    descriptionRu: z.string().optional(),
    sectionRu: z.string().optional(),
    categoryRu: z.string().optional(),
    subcategoryRu: z.string().optional(),
    active: z.number().int().min(0).max(1).optional(),
  }),
})

/**
 * Business logic for products management.
 */
export class ProductsService {
  /**
   * List products with pagination, search, and filters.
   * @throws {ValidationError} if input is invalid
   */
  async list(params: unknown) {
    const validated = listProductsSchema.safeParse(params)
    if (!validated.success) {
      throw new ValidationError(validated.error.issues[0]?.message ?? "Invalid input")
    }

    // Convert gender to uppercase to match DB format (WOMEN, MEN, KIDS, BABY)
    const queryParams = {
      ...validated.data,
      gender: validated.data.gender?.toUpperCase(),
    }

    return productsRepository.findMany(queryParams)
  }

  /**
   * Get single product by ID.
   * @throws {NotFoundError} if product not found
   */
  async getById(id: number) {
    const product = await productsRepository.findById(id)
    if (!product) {
      throw new NotFoundError("Product not found")
    }
    return product
  }

  /**
   * Get product by external product_id (UNIQLO SKU).
   * @throws {NotFoundError} if product not found
   */
  async getByProductId(productId: string) {
    const product = await productsRepository.findByProductId(productId)
    if (!product) {
      throw new NotFoundError("Product not found")
    }
    return product
  }

  /**
   * Update product (admin only - validation in route handler).
   * @throws {ValidationError} if input is invalid
   * @throws {NotFoundError} if product not found
   */
  async update(params: unknown) {
    const validated = updateProductSchema.safeParse(params)
    if (!validated.success) {
      throw new ValidationError(validated.error.issues[0]?.message ?? "Invalid input")
    }

    const { id, data } = validated.data

    const existing = await productsRepository.findById(id)
    if (!existing) {
      throw new NotFoundError("Product not found")
    }

    const updated = await productsRepository.update(id, data)
    return updated ?? existing
  }

  /**
   * Soft-delete product (set active = 0).
   * @throws {NotFoundError} if product not found
   */
  async deactivate(id: number) {
    const existing = await productsRepository.findById(id)
    if (!existing) {
      throw new NotFoundError("Product not found")
    }

    await productsRepository.deactivate(id)
  }

  /**
   * Get total product count.
   */
  async count(active?: 0 | 1) {
    return productsRepository.count(active)
  }
}

export const productsService = new ProductsService()
