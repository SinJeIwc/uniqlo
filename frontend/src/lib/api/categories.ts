import { asc, eq } from "drizzle-orm"
import { db } from "@/db"
import { categories } from "@/db/schema"
import type { Category } from "@/db/types"

/** Nav item — subset of Category fields for the header menu. */
export type NavItem = Pick<Category, "name" | "slug" | "gender" | "image">

export async function getAllNavCategories(): Promise<NavItem[]> {
  return db
    .select({
      name: categories.name,
      slug: categories.slug,
      gender: categories.gender,
      image: categories.image,
    })
    .from(categories)
    .where(eq(categories.nav, 1))
    .orderBy(asc(categories.navOrder))
    .all()
}
