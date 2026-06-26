import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import Link from "next/link";
import categoriesData from "@/data/categories.json";
import productsIndex from "@/data/products-index.json";
import homepageData from "@/data/home/men.json";
import { CampaignCard, CampaignGrid } from "@/components/home/CampaignCard";
import { CategoryLinkList } from "@/components/home/CategoryNav";
import type { Campaign } from "@/components/home/types";

const GENDER_LABELS: Record<string, string> = {
  women: "Женщины", men: "Мужчины", kids: "Дети", baby: "Младенцы",
};

const GENDER_HEROS: Record<string, {
  image: string; brand?: string; tagline?: string; title: string; description: string; price?: string; originalPrice?: string; href: string;
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

function GenderHero({ gender }: { gender: string }) {
  const category = categoriesData.categories.find((c) => c.id === gender)!;
  const hero = GENDER_HEROS[gender] || {
    image: "https://image.uniqlo.com/UQ/ST3/us/imagesgoods/465185/item/usgoods_00_465185_3x4.jpg",
    title: category.nameRu,
    description: "Одежда на каждый день. LifeWear.",
    href: `/${gender}`,
  };

  return (
    <Link href={hero.href} className="block relative w-full">
      <div className="relative w-full h-[90vh] bg-zinc-100 overflow-hidden">
        <img
          src={hero.image}
          alt={hero.title}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ animation: "image-reveal 0.6s ease-out both" } as React.CSSProperties}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
        <div className="absolute bottom-8 left-6 lg:left-12 text-white max-w-md">
          {hero.brand && <p className="text-[11px] font-bold tracking-[0.15em] uppercase mb-1 opacity-80">{hero.brand}</p>}
          <p className="text-lg lg:text-xl font-bold leading-tight mb-0.5">{hero.title}</p>
          <p className="text-sm opacity-80 mb-0.5">{hero.description}</p>
          {hero.price && <p className="text-sm font-bold">{hero.price}</p>}
        </div>
      </div>
    </Link>
  );
}

export default function MenPage() {
  return <GenderPageContent gender="men" campaigns={homepageData} />;
}

export function GenderPageContent({ gender, campaigns }: { gender: string; campaigns: Campaign[] }) {
  const category = categoriesData.categories.find((c) => c.id === gender)!;
  const campaignBlocks = campaigns.filter((c) => c.image || c.video);

  const genderProducts = productsIndex.filter((p) => {
    if (gender === "women") return p.gender === "women" || p.gender === "unisex";
    return p.gender === gender;
  });

  return (
    <>
      <Header />
      <main>
        <GenderHero gender={gender} />

        {campaignBlocks.length > 0 && <CampaignGrid campaigns={campaignBlocks} />}

        <CategoryLinkList category={category} />

        {genderProducts.length > 0 && (
          <section className="max-w-[1440px] mx-auto px-4 lg:px-6 pb-16">
            <h2 className="text-xl font-bold text-zinc-900 mb-6">Популярное</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {genderProducts.slice(0, 8).map((product) => (
                <Link key={product.id} href={`/products/${product.id}`} className="group">
                  <div className="aspect-[3/4] bg-zinc-100 overflow-hidden mb-3 relative">
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
                  <h3 className="text-sm font-medium text-zinc-900 line-clamp-2 group-hover:underline">{product.nameRu}</h3>
                  <p className="text-sm font-semibold text-zinc-900 mt-1">{product.price.toLocaleString()} KGS</p>
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
