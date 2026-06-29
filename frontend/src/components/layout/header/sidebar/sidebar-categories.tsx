"use client";

import { CategoryGrid } from "@/components/home/CategoryGrid";
import type { CategoryNavItem } from "@/components/home/types";

export function SidebarCategories({
  items,
  onClose,
}: {
  items: CategoryNavItem[];
  onClose: () => void;
}) {
  console.log(items);
  return <CategoryGrid items={items} onClose={onClose} />;
}
