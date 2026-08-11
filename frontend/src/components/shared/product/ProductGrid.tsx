import type { Product } from "@/db"
import { ProductCard } from "./ProductCard"

type ProductGridProps = {
  products: Product[]
}

export function ProductGrid({ products }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-16 text-gray-500">
        <p>Товары не найдены</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
      {products.map((product) => (
        <ProductCard
          key={product.productId}
          id={product.productId}
          name={product.name}
          nameRu={product.nameRu}
          price={product.price}
          gallery={product.gallery || "[]"}
          colorChips={product.colorChips || "[]"}
          sizes={product.sizes}
          rating={product.rating}
          reviewCount={product.reviewCount}
        />
      ))}
    </div>
  )
}
