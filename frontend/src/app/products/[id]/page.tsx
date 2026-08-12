import { Heart, Minus, Plus, Share2 } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Footer } from "@/components/layout/footer"
import { Header } from "@/components/layout/header"

// Dynamic product loading
async function getProduct(id: string) {
  try {
    const product = await import(`@/data/products/${id}.json`)
    return product.default || product
  } catch {
    return null
  }
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const product = await getProduct(id)

  if (!product) notFound()

  const mainColor = product.colors[0]
  const imageUrl = `https://image.uniqlo.com/UQ/ST3/us/imagesgoods/${product.productId}/item/usgoods_${mainColor.code}_${product.productId}_3x4.jpg`

  return (
    <>
      <Header />
      <main className="flex-1 max-w-[1440px] mx-auto px-4 lg:px-8 py-8">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left: Image Gallery */}
          <div>
            <div className="aspect-[3/4] bg-zinc-100 overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt={product.nameRu}
                className="w-full h-full object-cover"
                style={{ animation: "image-reveal 0.6s ease-out both" }}
              />
            </div>
          </div>

          {/* Right: Product Info */}
          <div className="space-y-6">
            {/* Name + Badges */}
            <div>
              {product.badges.length > 0 && (
                <div className="flex gap-2 mb-2">
                  {product.badges.map((badge: string) => (
                    <span
                      key={badge}
                      className="bg-black text-white text-[10px] font-bold px-2 py-0.5 uppercase"
                    >
                      {badge === "bestseller" ? "Хит продаж" : badge}
                    </span>
                  ))}
                </div>
              )}
              <h1 className="text-2xl lg:text-3xl font-bold text-zinc-900">{product.nameRu}</h1>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-zinc-900">
                {product.price.toLocaleString()} KGS
              </span>
              {product.originalPrice && (
                <span className="text-lg text-zinc-400 line-through">
                  {product.originalPrice.toLocaleString()} KGS
                </span>
              )}
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <span className="text-yellow-500">★</span>
              <span className="text-sm font-medium">{product.rating}</span>
              <Link href="#reviews" className="text-sm text-zinc-500 underline hover:text-zinc-900">
                ({product.reviewCount} отзывов)
              </Link>
            </div>

            {/* Tags */}
            {product.tags.length > 0 && (
              <div className="flex gap-2">
                {product.tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="text-xs text-zinc-500 border border-zinc-200 px-2 py-0.5"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Color Selector */}
            <div>
              <p className="text-sm text-zinc-500 mb-2">Цвет: {mainColor.name}</p>
              <div className="flex gap-2 flex-wrap">
                {product.colors.map((c: { code: string; name: string; hex: string }) => (
                  <button
                    key={c.code}
                    className="size-10 rounded-full border-2 border-zinc-300 hover:border-zinc-900 transition-colors"
                    style={{ backgroundColor: c.hex }}
                    title={c.name}
                  />
                ))}
              </div>
            </div>

            {/* Size Selector */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-zinc-500">Размер</p>
                <button className="text-sm text-zinc-500 underline hover:text-zinc-900">
                  Размерная сетка
                </button>
              </div>
              <div className="flex gap-2 flex-wrap">
                {product.sizes.map((s: string) => (
                  <button
                    key={s}
                    className="px-4 py-2 text-sm border border-zinc-300 hover:border-zinc-900 transition-colors min-w-[48px]"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity + ATC */}
            <div className="flex gap-3 items-end">
              <div className="flex items-center border border-zinc-300">
                <button className="px-3 py-3 text-zinc-600 hover:text-zinc-900">
                  <Minus className="size-4" />
                </button>
                <span className="px-4 py-3 text-sm font-medium min-w-[48px] text-center border-x border-zinc-300">
                  1
                </span>
                <button className="px-3 py-3 text-zinc-600 hover:text-zinc-900">
                  <Plus className="size-4" />
                </button>
              </div>
              <button className="flex-1 bg-black text-white font-medium py-3 px-8 hover:bg-zinc-800 transition-colors">
                ДОБАВИТЬ В КОРЗИНУ
              </button>
            </div>

            {/* Wishlist + Share */}
            <div className="flex gap-4">
              <button className="flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900">
                <Heart className="size-4" />В избранное
              </button>
              <button className="flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900">
                <Share2 className="size-4" />
                Поделиться
              </button>
            </div>

            {/* Availability */}
            <div className="text-sm text-zinc-600 space-y-1 pt-4 border-t border-zinc-200">
              <p className="text-green-600">✓ В наличии</p>
              <p>🚚 Бесплатная доставка от 5 000 KGS</p>
            </div>
          </div>
        </div>

        {/* Description */}
        <section className="mt-16 max-w-2xl">
          <h2 className="text-xl font-bold text-zinc-900 mb-4">Описание</h2>
          <p className="text-sm text-zinc-600 mb-1">Код товара: {product.productId}</p>
          <ul className="space-y-2 mt-4">
            {product.features.map((f: string, i: number) => (
              <li key={i} className="text-sm text-zinc-600 flex gap-2">
                <span className="text-zinc-400">•</span>
                {f}
              </li>
            ))}
          </ul>

          <div className="mt-6 space-y-3">
            <div>
              <h3 className="text-sm font-semibold text-zinc-900">Материалы</h3>
              <ul className="mt-1 space-y-1">
                {product.materials.map((m: string, i: number) => (
                  <li key={i} className="text-sm text-zinc-600">
                    {m}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-900">Уход</h3>
              <ul className="mt-1 space-y-1">
                {product.careInstructions.map((c: string, i: number) => (
                  <li key={i} className="text-sm text-zinc-600">
                    {c}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-900">Размер и посадка</h3>
              <p className="text-sm text-zinc-600 mt-1">{product.sizeFit}</p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
