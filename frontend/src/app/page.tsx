import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import Link from "next/link";
import categoriesData from "@/data/categories.json";

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

const campaigns = [
  {
    image: "https://image.uniqlo.com/UQ/ST3/us/imagesother/Homepage/06-12-26/HP-large-W-mini-tshirt-core.jpg",
    badge: "NEW",
    title: "Now in New Colors: Mini T-Shirt",
    description: "A top-rated tee designed with a 90s-inspired fit.",
    href: "/products/E465185",
  },
  {
    image: "https://image.uniqlo.com/UQ/ST3/us/imagesother/Homepage/06-05-26/HP-large-bra-top-square-neck.jpg",
    title: "Bra Tops",
    description: "Built-in cups for all-day secure comfort.",
    href: "/products/E465200",
  },
  {
    image: "https://image.uniqlo.com/UQ/ST3/us/imagesother/Homepage/06-19-26/HP-large-W-summer-giveaway-KV-26ss.jpg",
    title: "Win Our Summer Essentials",
    description: "Enter every day for a new chance to win prizes for the sun, beach, and everything in between.",
    href: "/",
  },
  {
    image: "https://image.uniqlo.com/UQ/ST3/us/imagesother/Homepage/06-05-26/HP-large-WM-26s-FPJ-KV.jpg",
    title: "UNIQLO F.RISSO",
    description: "A summer capsule collection that weaves dreams into everyday clothing.",
    href: "/products/E468900",
  },
  {
    image: "https://image.uniqlo.com/UQ/ST3/us/imagesgoods/469851/item/usgoods_31_469851_3x4.jpg",
    title: "Linen Styles: Dresses and Skirts",
    description: "Effortless elegance for tailored style or flowy fits.",
    href: "/products/E469851",
  },
  {
    image: "https://image.uniqlo.com/UQ/ST3/us/imagesgoods/472105/item/usgoods_09_472105_3x4.jpg",
    title: "Cotton Volume Easy Pants",
    description: "Made from soft and lightweight 100% cotton and an adjustable elastic waistband.",
    href: "/products/E472105",
  },
  {
    image: "https://image.uniqlo.com/UQ/ST3/us/imagesgoods/465250/item/usgoods_00_465250_3x4.jpg",
    title: "Get Ready for Summer",
    description: "Don't miss our weekly update with early summer picks, new arrivals, and special limited-time deals.",
    href: "/products/E465250",
  },
  {
    image: "https://image.uniqlo.com/UQ/ST3/us/imagesgoods/470328/item/usgoods_00_470328_3x4.jpg",
    title: "SUPIMA хлопок",
    description: "Премиум футболки из 100% хлопка SUPIMA.",
    price: "от 1 990 KGS",
    href: "/products/E470328",
  },
];

export default function HomePage() {
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
                {/* Title — 22px */}
                <p className="text-[22px] font-bold leading-tight">
                  Linen Blend Easy Pants
                </p>
                {/* Description — 16px, gap 8px/16px */}
                <p className="text-base opacity-80 mt-2 lg:mt-4">
                  A soft-blend fabric that pairs perfectly with any top and dresses up or down easily.
                </p>
                {/* Price block — 36px red, gap 8px/16px */}
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
        {campaigns.map((campaign, i) => (
          <Link key={i} href={campaign.href} className="group relative block w-full overflow-hidden bg-zinc-50">
            <div className="relative w-full">
              <img
                src={campaign.image}
                alt={campaign.title}
                className="w-full h-auto group-hover:scale-[1.02] transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-10 bg-gradient-to-t from-black/60 via-black/15 to-transparent">
                <div className="max-w-[1440px] mx-auto">
                  {campaign.badge && (
                    <span className="inline-block bg-white text-black text-[10px] font-bold px-2 py-0.5 uppercase mb-2 lg:mb-4">{campaign.badge}</span>
                  )}
                  <p className="text-white text-[22px] font-bold leading-tight">{campaign.title}</p>
                  <p className="text-white/80 text-base mt-2 lg:mt-4 max-w-lg">{campaign.description}</p>
                  {campaign.price && <p className="text-white text-sm font-bold mt-2 lg:mt-4">{campaign.price}</p>}
                </div>
              </div>
            </div>
          </Link>
        ))}
        </div>
      </main>

      <Footer />
    </>
  );
}
