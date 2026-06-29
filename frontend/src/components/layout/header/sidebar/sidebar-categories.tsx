"use client";

import { CategoryGrid } from "@/components/shared/category/CategoryGrid";
import type { CategoryNavItem } from "@/components/home/types";

export function SidebarCategories({
  items,
  onClose,
}: {
  items: CategoryNavItem[];
  onClose: () => void;
}) {
  return <CategoryGrid items={items} onClose={onClose} />;
}
