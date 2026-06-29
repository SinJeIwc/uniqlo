import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import type { CategoryNavItem } from "./types";

const VISIBLE_COUNT = 18;

export function CategoryNav({ categories }: { categories: CategoryNavItem[] }) {
  const visible = categories.slice(0, VISIBLE_COUNT);
  const hasMore = categories.length > VISIBLE_COUNT;

  return (
    <section className="container mx-auto px-4 sm:px-3 py-4 lg:py-6">
      <h2 className="text-[20px] mb-4">Категории</h2>
      <CategoryGrid items={visible} />
      {hasMore && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            className="h-full w-full sm:w-1/2 my-6 text-base font-normal rounded-full border-foreground py-4"
            render={<Link href="/categories" />}
          >
            Посмотреть все категории
          </Button>
        </div>
      )}
    </section>
  );
}
