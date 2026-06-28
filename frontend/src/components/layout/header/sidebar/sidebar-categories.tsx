"use client"

import { CategoryGrid } from "@/components/home/CategoryGrid"
import type { NavItem } from "@/lib/api/categories"

export function SidebarCategories({ items, onClose }: { items: NavItem[]; onClose: () => void }) {
  return <CategoryGrid items={items} onClose={onClose} />
}
