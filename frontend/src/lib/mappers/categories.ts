import type { CategoryNavItem } from "@/components/home/types"

/**
 * Pure mapper: Category data → CategoryNavItem for UI.
 * No DB imports - safe for client components.
 * Uses image field (transparent PNG navi icons, no background).
 */
export function mapCategoryToNavItem(cat: {
	name: string
	nameRu: string | null
	slug: string
	gender: string
	image: string | null
}): CategoryNavItem {
	return {
		text: cat.nameRu || cat.name,
		href: `/${cat.gender}/${cat.slug}`,
		slug: cat.slug,
		image: cat.image ?? "",
	}
}
