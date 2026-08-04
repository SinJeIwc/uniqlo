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
