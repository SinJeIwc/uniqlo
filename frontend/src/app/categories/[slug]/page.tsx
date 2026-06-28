import Link from "next/link"
import { Footer } from "@/components/layout/footer"
import { Header } from "@/components/layout/header"
import categoriesData from "@/data/categories.json"
import productsIndex from "@/data/products-index.json"
import { cn } from "@/lib/utils"

// Hero/campaign data for gender pages
const GENDER_HEROS: Record<
  string,
  {
    image: string
    brand?: string
    title: string
    description: string
    price?: string
    saleText?: string
    href: string
  }
> = {
  men: {
    image: "https://image.uniqlo.com/UQ/ST3/us/imagesgoods/473200/item/usgoods_00_473200_3x4.jpg",
    brand: "SUPIMA",
    title: "Мужская футболка SUPIMA хлопок",
    description: "Премиум качество для базового гардероба.",
    price: "1 990 KGS",
    href: "/products/E473200",
  },
  kids: {
    image: "https://image.uniqlo.com/UQ/ST3/us/imagesgoods/475100/item/usgoods_00_475100_3x4.jpg",
    brand: "SUPIMA",
    title: "Детская футболка SUPIMA хлопок",
    description: "Мягкая ткань для комфорта каждый день.",
    price: "1 490 KGS",
    href: "/products/E475100",
  },
  baby: {
    image: "https://image.uniqlo.com/UQ/ST3/us/imagesgoods/476500/item/usgoods_00_476500_3x4.jpg",
    title: "Боди для малышей",
    description: "Органический хлопок, плоские швы, удобная смена подгузника.",
    price: "1 490 KGS",
    href: "/products/E476500",
  },
}

const GENDER_LABELS: Record<string, string> = {
  women: "WOMEN",
  men: "MEN",
  kids: "KIDS",
  baby: "BABY",
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  // Check if it's a gender page
  const genderCategory = categoriesData.categories.find((c) => c.id === slug)
  const isGender = !!genderCategory

  if (isGender) {
    return <GenderPage gender={slug} category={genderCategory} />
  }

  // Subcategory page: show products
  const products = productsIndex.filter((p) => p.category === slug)
  const subcategory = findSubcategory(slug)

  return (
    <>
      <Header />
      <main className="flex-1 max-w-[1440px] mx-auto px-4 lg:px-6 py-8">
        <h1 className="text-3xl font-bold text-zinc-900 mb-2">{subcategory?.nameRu || slug}</h1>
        <p className="text-zinc-500 mb-8">{products.length} товаров</p>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((product) => (
            <Link key={product.id} href={`/products/${product.id}`} className="group">
              <div className="aspect-[3/4] bg-zinc-100 overflow-hidden mb-3 relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://image.uniqlo.com/UQ/ST3/us/imagesgoods/${product.productId}/item/usgoods_00_${product.productId}_3x4.jpg`}
                  alt={product.nameRu}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  style={{ animation: "image-reveal 0.4s ease-out both" }}
                />
                {product.badges.length > 0 && (
                  <span className="absolute top-2 left-2 bg-black text-white text-[10px] font-bold px-2 py-0.5 uppercase">
                    {product.badges[0] === "bestseller"
                      ? "Хит"
                      : product.badges[0] === "new"
                        ? "Новинка"
                        : product.badges[0]}
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">
                {product.gender === "women"
                  ? "Женщины"
                  : product.gender === "men"
                    ? "Мужчины"
                    : product.gender === "kids"
                      ? "Дети"
                      : product.gender === "baby"
                        ? "Младенцы"
                        : "Унисекс"}
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

        {products.length === 0 && (
          <p className="text-zinc-500 text-center py-20">Товары не найдены в этой категории.</p>
        )}
      </main>
      <Footer />
    </>
  )
}

// Gender page component
function GenderPage({
  gender,
  category,
}: {
  gender: string
  category: (typeof categoriesData.categories)[0]
}) {
  const hero = GENDER_HEROS[gender] || {
    image: "https://image.uniqlo.com/UQ/ST3/us/imagesgoods/465185/item/usgoods_00_465185_3x4.jpg",
    title: category.nameRu,
    description: "Одежда на каждый день. LifeWear.",
    href: `/categories/${gender}`,
  }

  // Products for this gender
  const genderProducts = productsIndex.filter((p) => {
    if (gender === "women") return p.gender === "women" || p.gender === "unisex"
    return p.gender === gender
  })

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
              {hero.brand && (
                <p className="text-[11px] font-bold tracking-[0.15em] uppercase mb-1 opacity-80">
                  {hero.brand}
                </p>
              )}
              <p className="text-lg lg:text-xl font-bold leading-tight mb-0.5">{hero.title}</p>
              <p className="text-sm opacity-80 mb-0.5">{hero.description}</p>
              {hero.price && <p className="text-sm font-bold">{hero.price}</p>}
            </div>
          </div>
        </Link>

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

        {/* Product grid */}
        {genderProducts.length > 0 && (
          <section className="max-w-[1440px] mx-auto px-4 lg:px-6 pb-16">
            <h2 className="text-xl font-bold text-zinc-900 mb-6">Популярное</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {genderProducts.slice(0, 8).map((product) => (
                <Link key={product.id} href={`/products/${product.id}`} className="group">
                  <div className="aspect-[3/4] bg-zinc-100 overflow-hidden mb-3 relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`https://image.uniqlo.com/UQ/ST3/us/imagesgoods/${product.productId}/item/usgoods_00_${product.productId}_3x4.jpg`}
                      alt={product.nameRu}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      style={{ animation: "image-reveal 0.4s ease-out both" }}
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
  )
}

function findSubcategory(slug: string) {
  for (const cat of categoriesData.categories) {
    for (const child of cat.children) {
      if (child.id === slug) return child
    }
  }
  return null
}
