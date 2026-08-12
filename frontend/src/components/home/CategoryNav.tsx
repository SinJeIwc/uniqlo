"use client"

import { CategoryGrid } from "@/components/categories/CategoryGrid"
import { Button } from "@/components/ui/button"
import { useSidebarStore } from "@/store/sidebar"
import type { CategoryNavItem } from "./types"

const VISIBLE_COUNT = 18

export function CategoryNav({ categories }: { categories: CategoryNavItem[] }) {
  const visible = categories.slice(0, VISIBLE_COUNT)
  const hasMore = categories.length > VISIBLE_COUNT
  const openSidebar = useSidebarStore((s) => s.openSidebar)

  return (
    <section className="container mx-auto px-4 sm:px-3 py-4 lg:py-6">
      <h2 className="text-[20px] mb-4">Категории</h2>
      <CategoryGrid items={visible} />
      {hasMore && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            className="h-full w-full sm:w-1/2 my-6 text-base font-normal rounded-full border-foreground py-4"
            onClick={openSidebar}
          >
            Посмотреть все категории
          </Button>
        </div>
      )}
    </section>
  )
}
