import Link from "next/link";
import Image from "next/image";
import type { CategoryTree } from "./categories";

type IconCategory = {
  id: number;
  name: string;
  slug: string;
  image: string | null;
};

/** Icon grid — shows nav categories as circular icons (homepage) */
export function CategoryIconGrid({ parents }: { parents: IconCategory[] }) {
  return (
    <section className="max-w-[1440px] mx-auto px-4 lg:px-6 py-10">
      <h2 className="text-[11px] font-semibold tracking-widest uppercase text-zinc-400 mb-6">
        Поиск по категориям
      </h2>
      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {parents.map((cat) => (
          <Link
            key={cat.id}
            href={`/categories/${cat.slug}`}
            className="flex flex-col items-center gap-2 group"
          >
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-zinc-50 overflow-hidden flex items-center justify-center">
              {cat.image ? (
                <Image
                  src={cat.image}
                  alt={cat.name}
                  width={80}
                  height={80}
                  unoptimized
                  className="object-contain p-2"
                />
              ) : (
                <span className="text-[10px] text-zinc-400 text-center leading-tight px-1">
                  {cat.name}
                </span>
              )}
            </div>
            <span className="text-[11px] text-center text-zinc-600 group-hover:text-black leading-tight">
              {cat.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

/** Text link list — shows category tree grouped by parent (gender pages) */
export function CategoryLinkList({ tree }: { tree: CategoryTree[] }) {
  return (
    <section className="max-w-[1440px] mx-auto px-4 lg:px-6 py-10">
      <h2 className="text-[11px] font-semibold tracking-widest uppercase text-zinc-400 mb-4">
        Поиск по категориям
      </h2>
      {tree.map(({ parent, children }) => (
        <div key={parent.id} className="mb-6">
          <h3 className="text-[13px] font-semibold text-zinc-900 mb-2">
            {parent.name}
          </h3>
          <nav className="grid grid-cols-6 gap-x-2 gap-y-0.5">
            {children.map((child) => (
              <Link
                key={child.id}
                href={`/categories/${child.slug}`}
                className="text-[13px] text-zinc-600 hover:text-black transition-colors py-[2px]"
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
