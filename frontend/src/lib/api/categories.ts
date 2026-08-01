import { asc, eq } from "drizzle-orm"
import { db } from "@/db"
import { categories } from "@/db/schema"

/** Nav item with optional Russian name. */
export type NavItem = {
  name: string
  nameRu: string | null
  slug: string
  gender: string
  image: string | null // image_nav from DB
}

export async function getAllNavCategories(): Promise<NavItem[]> {
  return db
    .select({
      name: categories.name,
      nameRu: categories.nameRu,
      slug: categories.slug,
      gender: categories.gender,
      image: categories.imageNav,
    })
    .from(categories)
    .where(eq(categories.nav, 1))
    .orderBy(asc(categories.navOrder))
    .all()
}
