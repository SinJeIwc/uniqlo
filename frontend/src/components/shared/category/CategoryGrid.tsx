import Image from "next/image";
import Link from "next/link";
import type { CategoryNavItem } from "../../home/types";

type CategoryGridProps = {
  items: CategoryNavItem[];
  onClose?: () => void;
};

export function CategoryGrid({ items, onClose }: CategoryGridProps) {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-y-4 sm:gap-y-6 gap-x-2">
      {items.map((cat) => (
        <Link
          key={cat.slug}
          href={`/categories/${cat.slug}`}
          className="flex flex-col items-center gap-1.5 group"
          onClick={onClose}
        >
          {cat.image ? (
            <Image
              src={cat.image}
              alt={cat.text}
              width={96}
              height={96}
              unoptimized
              className="size-17 sm:size-21 lg:size-24 object-contain"
            />
          ) : (
            <div className="size-17 sm:size-21 lg:size-24 flex items-center justify-center bg-muted">
              <span className="text-[10px] text-muted-foreground text-center leading-tight px-0.5">
                {cat.text}
              </span>
            </div>
          )}
          <span className="text-[11px] text-center text-muted-foreground group-hover:text-foreground leading-tight">
            {cat.text}
          </span>
        </Link>
      ))}
    </div>
  );
}
