import { and, asc, eq, isNull } from "drizzle-orm"
import type { CategoryNavItem } from "@/components/home/types"
import { db } from "@/db"
import { categories } from "@/db/schema"
import { mapCategoryToNavItem } from "@/lib/mappers/categories"
import { categoriesService } from "@/services/categories.service"

/** Nav item with optional Russian name. */
export type NavItem = {
  name: string
  nameRu: string | null
  slug: string
  gender: string
  image: string | null // image_nav from DB
}

/**
 * Get navbar categories (uses categoriesService).
 */
export async function getAllNavCategories(): Promise<NavItem[]> {
  return categoriesService.getNavCategories()
}

// Re-export shared mapper (defined in mappers/ to avoid DB imports in client)
export { mapCategoryToNavItem } from "@/lib/mappers/categories"

/**
 * Get home page nav categories (curated subset with homeNav=1).
 * Restricted to top-level categories only (parent_id IS NULL) to avoid duplicates.
 */
export async function getHomeNavCategories(gender: string): Promise<CategoryNavItem[]> {
  const rows = db
    .select({
      name: categories.name,
      nameRu: categories.nameRu,
      slug: categories.slug,
      href: categories.href,
      image: categories.image, // Flyout icons (no gray background, for home/sidebar)
    })
    .from(categories)
    .where(
      and(
        eq(categories.gender, gender),
        eq(categories.homeNav, 1),
        isNull(categories.parentId), // Top-level only - prevents duplicates
      ),
    )
    .orderBy(asc(categories.navOrder))
    .all()

	// Map using shared mapper
	return rows.map((row) => mapCategoryToNavItem({
		name: row.name,
		nameRu: row.nameRu,
		slug: row.slug,
		gender: row.href.split('/')[1] || 'women', // Extract from href
		image: row.image,
	}))
}
