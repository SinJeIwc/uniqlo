import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import Link from "next/link";
import { cn } from "@/lib/utils";
import categoriesData from "@/data/categories.json";
import productsIndex from "@/data/products-index.json";
import homepageData from "@/data/homepage-campaigns.json";

const GENDER_HEROS: Record<string, {
  image: string; brand?: string; tagline?: string; title: string; description: string; price?: string; originalPrice?: string; saleText?: string; href: string;
}> = {
  men: {
    image: "https://image.uniqlo.com/UQ/ST3/us/imagesgoods/473200/item/usgoods_00_473200_3x4.jpg",
    brand: "SUPIMA",
    title: "Мужская футболка SUPIMA хлопок",
    description: "Премиум качество для базового гардероба. Гладкая текстура и классический крой.",
    price: "1 990 KGS",
    href: "/products/E473200",
  },
  kids: {
    image: "https://image.uniqlo.com/UQ/ST3/us/imagesgoods/475100/item/usgoods_00_475100_3x4.jpg",
    title: "Детская футболка SUPIMA хлопок",
    description: "Мягкая ткань для комфорта каждый день. Бирка с именем внутри.",
    price: "1 490 KGS",
    href: "/products/E475100",
  },
  baby: {
    image: "https://image.uniqlo.com/UQ/ST3/us/imagesgoods/476500/item/usgoods_00_476500_3x4.jpg",
    title: "Боди для малышей",
    description: "Органический хлопок для нежной кожи. Плоские швы, кнопки для смены подгузника.",
    price: "1 490 KGS",
    href: "/products/E476500",
  },
};

const GENDER_LABELS: Record<string, string> = {
  women: "Женщины", men: "Мужчины", kids: "Дети", baby: "Младенцы",
};

type Campaign = {
  type: string;
  image: string | null;
  video: string | null;
  badge: string | null;
  title: string | null;
  description: string | null;
  price: string | null;
  originalPrice: string | null;
  link: string | null;
  titleRu: string | null;
  descriptionRu: string | null;
};

function formatPrice(price: string | null): string {
  if (!price) return "";
  return price.replace("¥", "").replace(/,/g, "").trim() + " KGS";
}

export default function MenPage() {
  return <GenderPageContent gender="men" />;
}

export function GenderPageContent({ gender }: { gender: string }) {
  const category = categoriesData.categories.find((c) => c.id === gender)!;
  const hero = GENDER_HEROS[gender] || {
    image: "https://image.uniqlo.com/UQ/ST3/us/imagesgoods/465185/item/usgoods_00_465185_3x4.jpg",
    title: category.nameRu,
    description: "Одежда на каждый день. LifeWear.",
    href: `/${gender}`,
  };

  const genderProducts = productsIndex.filter((p) => {
    if (gender === "women") return p.gender === "women" || p.gender === "unisex";
    return p.gender === gender;
  });

  const campaigns: Campaign[] = (homepageData as Record<string, Campaign[]>)[gender] || [];

  return (
    <>
      <Header />
      <main>
        {/* Hero */}
        <Link href={hero.href} className="block relative w-full">
          <div className="relative w-full aspect-[21/9] max-h-[70vh] bg-zinc-100 overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={hero.image}
              alt={hero.title}
              className="w-full h-full object-cover"
              style={{ animation: "image-reveal 0.6s ease-out both" }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
            <div className="absolute bottom-8 left-6 lg:left-12 text-white max-w-md">
              {hero.tagline && (
                <p className="text-xs tracking-wider uppercase mb-1 opacity-70">{hero.tagline}</p>
              )}
              {hero.brand && (
                <p className="text-[11px] font-bold tracking-[0.15em] uppercase mb-1 opacity-80">{hero.brand}</p>
              )}
              <p className="text-lg lg:text-xl font-bold leading-tight mb-0.5">{hero.title}</p>
              <p className="text-sm opacity-80 mb-0.5">{hero.description}</p>
              {hero.price && (
                <div className="flex items-baseline gap-2">
                  <p className="text-sm font-bold">{hero.price}</p>
                  {hero.originalPrice && (
                    <p className="text-xs line-through opacity-60">{hero.originalPrice}</p>
                  )}
                </div>
              )}
              {hero.saleText && (
                <p className="text-[11px] opacity-70 mt-0.5">{hero.saleText}</p>
              )}
            </div>
          </div>
        </Link>

        {/* Campaign blocks from parser */}
        {campaigns.filter(c => c.image || c.video).length > 0 && (
          <div className="flex flex-col gap-4">
            {campaigns.filter(c => c.image || c.video).map((campaign, i) => {
              const title = campaign.titleRu || campaign.title;
              const desc = campaign.descriptionRu || campaign.description;
              const href = campaign.link || "#";

              return (
                <Link key={i} href={href} className="group relative block w-full overflow-hidden bg-zinc-50">
                  <div className="relative w-full">
                    {campaign.video ? (
                      <video
                        src={campaign.video}
                        className="w-full h-auto group-hover:scale-[1.02] transition-transform duration-500"
                        autoPlay muted loop playsInline
                      />
                    ) : (
                      <img
                        src={campaign.image!}
                        alt={title || ""}
                        className="w-full h-auto group-hover:scale-[1.02] transition-transform duration-500"
                        loading="lazy"
                      />
                    )}
                    <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-10 bg-gradient-to-t from-black/60 via-black/15 to-transparent">
                      <div className="max-w-[1440px] mx-auto">
                        {campaign.badge && (
                          <span className="inline-block bg-white text-black text-[10px] font-bold px-2 py-0.5 uppercase mb-2 lg:mb-4">{campaign.badge}</span>
                        )}
                        {title && <p className="text-white text-[22px] font-bold leading-tight">{title}</p>}
                        {desc && <p className="text-white/80 text-base mt-2 lg:mt-4 max-w-lg">{desc}</p>}
                        {campaign.price && (
                          <p className="text-white text-sm font-bold mt-2 lg:mt-4">{formatPrice(campaign.price)}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Search by category */}
        <section className="max-w-[1440px] mx-auto px-4 lg:px-6 py-10">
          <h2 className="text-[11px] font-semibold tracking-widest uppercase text-zinc-400 mb-4">
            Поиск по категориям
          </h2>
          <nav className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-1.5">
            {category.children.map((child) => (
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

        {/* Products */}
        {genderProducts.length > 0 && (
          <section className="max-w-[1440px] mx-auto px-4 lg:px-6 pb-16">
            <h2 className="text-xl font-bold text-zinc-900 mb-6">Популярное</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {genderProducts.slice(0, 8).map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.id}`}
                  className="group"
                >
                  <div className="aspect-[3/4] bg-zinc-100 overflow-hidden mb-3 relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`https://image.uniqlo.com/UQ/ST3/us/imagesgoods/${product.productId}/item/usgoods_00_${product.productId}_3x4.jpg`}
                      alt={product.nameRu}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      style={{ animation: "image-reveal 0.4s ease-out both" } as React.CSSProperties}
                    />
                    {product.badges.length > 0 && (
                      <span className="absolute top-2 left-2 bg-black text-white text-[10px] font-bold px-2 py-0.5 uppercase">
                        {product.badges[0] === "bestseller" ? "Хит" : product.badges[0]}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">
                    {GENDER_LABELS[product.gender] || product.gender}
                  </p>
                  <h3 className="text-sm font-medium text-zinc-900 line-clamp-2 group-hover:underline">
                    {product.nameRu}
                  </h3>
                  <p className="text-sm font-semibold text-zinc-900 mt-1">
                    {product.price.toLocaleString()} KGS
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-xs text-yellow-500">★</span>
                    <span className="text-xs text-zinc-600">
                      {product.rating} ({product.reviewCount})
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
