import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import type { CategoryTree } from "./categories";

type IconCategory = {
  id: number;
  name: string;
  slug: string;
  image: string | null;
};

const VISIBLE_COUNT = 18;

export function CategoryIconGrid({ parents }: { parents: IconCategory[] }) {
  const visible = parents.slice(0, VISIBLE_COUNT);
  const hasMore = parents.length > VISIBLE_COUNT;

  return (
    <section className="px-4 lg:px-6 py-10">
      <h2 className="text-[11px] font-semibold tracking-widest uppercase text-zinc-400 mb-4">
        Поиск по категориям
      </h2>
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-y-6 gap-x-2">
        {visible.map((cat) => (
          <Link
            key={cat.id}
            href={`/categories/${cat.slug}`}
            className="flex flex-col items-center gap-1.5 group"
          >
            {cat.image ? (
              <Image
                src={cat.image}
                alt={cat.name}
                width={96}
                height={96}
                unoptimized
                className="size-[68px] sm:size-[84px] lg:size-[96px] object-contain"
              />
            ) : (
              <div className="size-[68px] sm:size-[84px] lg:size-[96px] flex items-center justify-center bg-muted">
                <span className="text-[10px] text-muted-foreground text-center leading-tight px-0.5">
                  {cat.name}
                </span>
              </div>
            )}
            <span className="text-[11px] text-center text-zinc-600 group-hover:text-zinc-900 leading-tight">
              {cat.name}
            </span>
          </Link>
        ))}
      </div>
      {hasMore && (
        <div className="mt-6 text-center">
          <Button variant="outline" size="sm" render={<Link href="/categories" />}>
            Посмотреть все категории
          </Button>
        </div>
      )}
    </section>
  );
}

export function CategoryLinkList({ tree }: { tree: CategoryTree[] }) {
  return (
    <section className="px-4 lg:px-6 py-10">
      <h2 className="text-[11px] font-semibold tracking-widest uppercase text-zinc-400 mb-4">
        Поиск по категориям
      </h2>
      {tree.map(({ parent, children }) => (
        <div key={parent.id} className="mb-6">
          <h3 className="text-[13px] font-semibold text-zinc-900 mb-2">
            {parent.name}
          </h3>
          <nav className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-0.5">
            {children.map((child) => (
              <Link
                key={child.id}
                href={`/categories/${child.slug}`}
                className="text-[13px] text-zinc-600 hover:text-zinc-900 transition-colors py-[2px]"
              >
                {child.name}
              </Link>
            ))}
          </nav>
        </div>
      ))}
    </section>
  );
}
