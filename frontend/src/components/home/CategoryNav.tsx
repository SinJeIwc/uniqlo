import Link from "next/link";

type CategoryItem = {
  id: string;
  nameRu: string;
  children?: CategoryItem[];
};

const categoryIcons: Record<string, string> = {
  "women-tops-t-shirts": "https://image.uniqlo.com/UQ/ST3/us/imagesother/home_category/women/t-shirt-icon-women.png",
  "women-shirts-blouses": "https://image.uniqlo.com/UQ/ST3/us/imagesother/home_category/women/shirt-and-blouses-icon-women.png",
  "women-sweaters": "https://image.uniqlo.com/UQ/ST3/us/imagesother/home_category/women/sweaters-icon-women.png",
  "women-bottoms": "https://im.uniqlo.com/global-cms/spa/res1b03dc36596e382699b0e527b2115a6ffr.png",
  "women-shorts": "https://image.uniqlo.com/UQ/ST3/jp/imagesother/001_CMSlineup/navi/485178_32.png",
  "women-jeans": "https://image.uniqlo.com/UQ/ST3/us/imagesother/home_category/women/jeans-icon-women.png",
  "women-outerwear": "https://image.uniqlo.com/UQ/ST3/us/imagesother/home_category/women/outerwear-icon-women.png",
  "women-dresses": "https://image.uniqlo.com/UQ/ST3/us/imagesother/Top-Navigation/Women/skirts.jpg",
  "women-innerwear": "https://image.uniqlo.com/UQ/ST3/us/imagesother/home_category/women/innerwear-underwear-icon-women.png",
  "women-accessories": "https://image.uniqlo.com/UQ/ST3/us/imagesother/home_category/women/accessories-icon-women.png",
};

/** Icon grid style (used on homepage) */
export function CategoryIconGrid({ category }: { category: CategoryItem }) {
  return (
    <section className="max-w-[1440px] mx-auto px-4 lg:px-6 py-10">
      <h2 className="text-[11px] font-semibold tracking-widest uppercase text-zinc-400 mb-6">
        Поиск по категориям
      </h2>
      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {(category.children || []).map((child) => (
          <Link key={child.id} href={`/categories/${child.id}`} className="flex flex-col items-center gap-2 group">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-zinc-50 overflow-hidden flex items-center justify-center">
              <img
                src={categoryIcons[child.id] || ""}
                alt={child.nameRu}
                className="w-full h-full object-contain p-2"
                loading="lazy"
              />
            </div>
            <span className="text-[11px] text-center text-zinc-600 group-hover:text-black leading-tight">
              {child.nameRu}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

/** Text link list style (used on gender pages) */
export function CategoryLinkList({ category }: { category: CategoryItem }) {
  return (
    <section className="max-w-[1440px] mx-auto px-4 lg:px-6 py-10">
      <h2 className="text-[11px] font-semibold tracking-widest uppercase text-zinc-400 mb-4">
        Поиск по категориям
      </h2>
      <nav className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-1.5">
        {(category.children || []).map((child) => (
          <Link
            key={child.id}
            href={`/categories/${child.id}`}
            className="text-[13px] text-zinc-600 hover:text-black transition-colors py-[2px]"
          >
            {child.nameRu}
          </Link>
        ))}
        <Link
          href={`/categories/${category.id}`}
          className="text-[13px] font-semibold text-black hover:underline mt-2 col-span-full"
        >
          ВСЕ КАТЕГОРИИ →
        </Link>
      </nav>
    </section>
  );
}
