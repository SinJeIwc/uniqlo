import type { InferInsertModel, InferSelectModel } from "drizzle-orm"
import type { categories, products, users } from "./schema"

// Select types (for reading from DB)
export type Category = InferSelectModel<typeof categories>
export type Product = InferSelectModel<typeof products>
export type User = InferSelectModel<typeof users>

// Insert types (for inserting into DB)
export type CategoryInsert = InferInsertModel<typeof categories>
export type ProductInsert = InferInsertModel<typeof products>
export type UserInsert = InferInsertModel<typeof users>

// Parsed product type with JSON fields typed
export type ProductParsed = Omit<
  Product,
  "colors" | "colorChips" | "sizes" | "variants" | "gallery" | "productDescription"
> & {
  colors: string[]
  colorChips: string[]
  sizes: string[]
  variants: Array<{ id: string; color: string; size: string; inStock: boolean }>
  gallery: string[]
  productDescription: Array<{ title: string; content: string }>
}

// Admin list response types
export type ProductsResponse = {
  rows: Product[]
  total: number
  page: number
  limit: number
}

export type CategoriesTreeNode = Category & {
  children: Array<CategoriesTreeNode>
}
