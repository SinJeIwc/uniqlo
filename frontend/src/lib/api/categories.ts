import { asc, eq } from "drizzle-orm"
import { db } from "@/db"
import { categories } from "@/db/schema"

export type NavItem = {
  name: string
  slug: string
  gender: string
  image: string | null
}

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
