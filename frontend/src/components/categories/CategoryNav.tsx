import Link from "next/link"
import Image from "next/image"

type CategoryNavItem = {
  id: number
  slug: string
  name: string
  nameRu: string | null
  imageNav?: string | null
}

type CategoryNavProps = {
  gender: string
  parentSlug: string
  items: CategoryNavItem[]
  showAll?: boolean
  currentSlug?: string
}

export function CategoryNav({
  gender,
  parentSlug,
  items,
  showAll = true,
  currentSlug,
}: CategoryNavProps) {
  if (items.length === 0 && !showAll) {
    return null
  }

  return (
    <div className="mb-6 pb-4 border-b overflow-x-auto">
      <div className="flex gap-6 min-w-max">
        {showAll && (
          <Link
            href={`/${gender}/${parentSlug}`}
            className={`flex flex-col items-center gap-2 min-w-[80px] group ${
              !currentSlug ? "opacity-100" : "opacity-60 hover:opacity-100"
            }`}
          >
            <div className="w-16 h-16 rounded-full border-2 border-gray-200 flex items-center justify-center bg-gray-50">
              <span className="text-2xl">📦</span>
            </div>
            <span className="text-xs text-center font-medium">Все</span>
          </Link>
        )}
        {items.map((item) => (
          <Link
            key={item.id}
            href={`/${gender}/${parentSlug}/${item.slug}`}
            className={`flex flex-col items-center gap-2 min-w-[80px] group ${
              currentSlug === item.slug ? "opacity-100" : "opacity-60 hover:opacity-100"
            }`}
          >
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-200 bg-white">
              {item.imageNav ? (
                <Image
                  src={item.imageNav}
                  alt={item.nameRu || item.name}
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-50">
                  <span className="text-xs text-gray-400">
                    {(item.nameRu || item.name).slice(0, 2)}
                  </span>
                </div>
              )}
            </div>
            <span className="text-xs text-center max-w-[80px] line-clamp-2">
              {item.nameRu || item.name}
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
