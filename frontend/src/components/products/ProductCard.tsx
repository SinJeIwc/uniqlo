import Image from "next/image"
import Link from "next/link"

type GalleryItem = {
  type: string
  url: string
}

type ColorChip = {
  name: string
  image: string
}

type ProductCardProps = {
  id: string
  name: string
  nameRu: string | null
  price: number | null
  gallery: string
  colorChips: string
  sizes: string | null
  rating: string | null
  reviewCount: number | null
}

export function ProductCard({
  id,
  name,
  nameRu,
  price,
  gallery,
  colorChips,
  sizes,
  rating,
  reviewCount,
}: ProductCardProps) {
  // Parse JSON fields with correct types
  const images: GalleryItem[] = gallery ? JSON.parse(gallery) : []
  const chips: ColorChip[] = colorChips ? JSON.parse(colorChips) : []
  const availableSizes: string[] = sizes ? JSON.parse(sizes) : []

  const mainImage = images[0]?.url || "/placeholder.jpg"
  const displayName = nameRu || name

  return (
    <Link
      href={`/products/${id}`}
      className="group flex flex-col gap-2 hover:opacity-80 transition-opacity"
    >
      {/* Image */}
      <div className="relative aspect-[3/4] bg-gray-100 overflow-hidden">
        <Image
          src={mainImage}
          alt={displayName}
          fill
          unoptimized
          className="object-cover"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
      </div>

      {/* Info */}
      <div className="flex flex-col gap-1">
        {/* Name */}
        <h3 className="text-sm leading-tight line-clamp-2 min-h-[2.5rem]">{displayName}</h3>

        {/* Price */}
        {price && <p className="text-sm font-medium">¥{price.toLocaleString()}</p>}

        {/* Rating & Reviews */}
        {rating && reviewCount !== null && reviewCount > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-gray-600">
            <span className="flex items-center gap-0.5">
              <span className="text-yellow-500">★</span>
              <span className="font-medium">{rating}</span>
            </span>
            <span className="text-gray-400">•</span>
            <span>({reviewCount})</span>
          </div>
        )}

        {/* Available Sizes */}
        {availableSizes.length > 0 && (
          <div className="flex gap-1 flex-wrap">
            {availableSizes.slice(0, 6).map((size, i) => (
              <span
                key={i}
                className="px-1.5 py-0.5 text-[10px] border border-gray-300 rounded text-gray-600"
              >
                {size}
              </span>
            ))}
            {availableSizes.length > 6 && (
              <span className="text-[10px] text-gray-400">+{availableSizes.length - 6}</span>
            )}
          </div>
        )}

        {/* Color chips - render as images */}
        {chips.length > 0 && (
          <div className="flex gap-1 flex-wrap items-center">
            {chips.slice(0, 6).map((chip, i) => (
              <div
                key={i}
                className="relative w-4 h-4 rounded-full border border-gray-300 overflow-hidden"
                title={chip.name}
              >
                <Image
                  src={chip.image}
                  alt={chip.name}
                  fill
                  unoptimized
                  className="object-cover"
                  sizes="16px"
                />
              </div>
            ))}
            {chips.length > 6 && <span className="text-xs text-gray-500">+{chips.length - 6}</span>}
          </div>
        )}
      </div>
    </Link>
  )
}
