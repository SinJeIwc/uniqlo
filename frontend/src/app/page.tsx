import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import Link from "next/link";
import categoriesData from "@/data/categories.json";
import homepageData from "@/data/homepage-campaigns.json";

const womenCategories = categoriesData.categories.find((c) => c.id === "women")!;

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

function formatPrice(price: string | null): string {
  if (!price) return "";
  return price.replace("¥", "").replace(/,/g, "").trim() + " KGS";
}

export default function HomePage() {
  const campaigns = (homepageData as Record<string, unknown[]>).home as Array<{
    type: string;
    image: string | null;
    video: string | null;
    badge: string | null;
    title: string | null;
    description: string | null;
    price: string | null;
    originalPrice: string | null;
    saleText: string | null;
    link: string | null;
    alt: string | null;
    fullWidth: boolean;
    titleRu: string | null;
    descriptionRu: string | null;
  }>;

  return (
    <>
      <Header />

      {/* ====== HERO — full width, natural height ====== */}
      <Link href="/products/E469851" className="block relative w-full">
        <div className="relative w-full bg-zinc-100 overflow-hidden">
          <img
            src="https://image.uniqlo.com/UQ/ST3/us/imagesother/Homepage/06-19-26/HP-large-W-linen-vogue-work.jpg"
            alt="Linen Collection"
            className="w-full h-auto"
            style={{ animation: "image-reveal 0.6s ease-out both" }}
          />
          <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-12 bg-gradient-to-t from-black/60 via-black/15 to-transparent">
            <div className="max-w-[1440px] mx-auto">
              <div className="max-w-md text-white">
                <p className="text-[22px] font-bold leading-tight">
                  Linen Blend Easy Pants
                </p>
                <p className="text-base opacity-80 mt-2 lg:mt-4">
                  A soft-blend fabric that pairs perfectly with any top and dresses up or down easily.
                </p>
                <div className="flex items-baseline gap-0 mt-2 lg:mt-4">
                  <span className="text-[36px] font-bold text-[#EC1C24] leading-none">2 990 KGS</span>
                  <span className="text-base text-white/70 line-through ml-2">3 990 KGS</span>
                </div>
                <p className="text-[11px] opacity-70 mt-2 lg:mt-4">
                  Онлайн + приложение — до 25 июня
                </p>
              </div>
            </div>
          </div>
        </div>
      </Link>

      <main>
        {/* ====== SEARCH BY CATEGORY ====== */}
        <section className="max-w-[1440px] mx-auto px-4 lg:px-6 py-10">
          <h2 className="text-[11px] font-semibold tracking-widest uppercase text-zinc-400 mb-6">
            Поиск по категориям
          </h2>
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {womenCategories.children.map((child) => (
              <Link key={child.id} href={`/categories/${child.id}`} className="flex flex-col items-center gap-2 group">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-zinc-50 overflow-hidden flex items-center justify-center">
                  <img src={categoryIcons[child.id] || ""} alt={child.nameRu} className="w-full h-full object-contain p-2" loading="lazy" />
                </div>
                <span className="text-[11px] text-center text-zinc-600 group-hover:text-black leading-tight">{child.nameRu}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* ====== CAMPAIGN CARDS — full-width, 16px gap, full image height ====== */}
        <div className="flex flex-col gap-4">
        {campaigns.filter(c => c.image).map((campaign, i) => {
          const title = campaign.titleRu || campaign.title;
          const desc = campaign.descriptionRu || campaign.description;
          const href = campaign.link || "#";
          const media = campaign.video || campaign.image;

          if (!media) return null;

          return (
            <Link key={i} href={href} className="group relative block w-full overflow-hidden bg-zinc-50">
              <div className="relative w-full">
                {campaign.video ? (
                  <video
                    src={campaign.video}
                    className="w-full h-auto group-hover:scale-[1.02] transition-transform duration-500"
                    autoPlay
                    muted
                    loop
                    playsInline
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
      </main>

      <Footer />
    </>
  );
}
