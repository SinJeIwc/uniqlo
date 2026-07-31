/** Auto-generated types from Drizzle schema — single source of truth.
 *
 * After `pnpm drizzle-kit introspect` or schema changes,
 * these types update automatically. Never write DB types by hand.
 */
import type { categories, products, users } from "./schema"

// ── Categories ──
export type Category = typeof categories.$inferSelect
export type NewCategory = typeof categories.$inferInsert

/** Category with recursive children (for tree UIs). */
export type CategoryNode = Category & { children?: CategoryNode[] }

// ── Products ──
export type Product = typeof products.$inferSelect
export type NewProduct = typeof products.$inferInsert

// ── Users ──
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert

// ── JSON column types (parse with JSON.parse()) ──
export type ProductColor = { name: string; image: string }
export type ColorChip = { name: string; image: string }
export type ProductVariant = {
  sku: string
  color: string
  size: string
  image: string
  price: number | null
  currency: string
  inStock: boolean
}
export type GalleryImage = { type: "image"; url: string }
export type ProductDescriptionBlock = {
  section: string
  text?: string
  pairs?: { image: string | null; text: { content: string; href?: string }[] }[]
}
