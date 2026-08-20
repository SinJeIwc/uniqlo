"use client"

import { useEffect, useRef, useState } from "react"
import type { Product } from "@/db/types"
import { ProductCard } from "./ProductCard"

function getRussianPlural(count: number): string {
  const m10 = count % 10
  const m100 = count % 100
  if (m10 === 1 && m100 !== 11) return "товар"
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return "товара"
  return "товаров"
}

type ProductGridProps = {
  initialProducts: Product[]
  totalCount?: number
  categoryIds?: number[]
  filters?: {
    section?: string
    gender?: string
    category?: string
    subcategory?: string
  }
  pageSize?: number
}

export function ProductGrid({
  initialProducts,
  totalCount,
  categoryIds,
  filters = {},
  pageSize = 20,
}: ProductGridProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(totalCount ?? initialProducts.length)
  const [isLoading, setIsLoading] = useState(false)
  const loaderRef = useRef<HTMLDivElement>(null)

  const hasMore = products.length < total

  const loadMore = async () => {
    if (isLoading || !hasMore) return

    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(page + 1),
        limit: String(pageSize),
      })

      if (categoryIds && categoryIds.length > 0) {
        params.set("categoryIds", categoryIds.join(","))
      }

      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.set(key, value)
      })

      const response = await fetch(`/api/products?${params}`)
      const data = await response.json()

      setProducts((prev) => [...prev, ...data.products])
      setTotal(data.total)
      setPage(data.page)
    } catch (error) {
      console.error("Failed to load products:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!loaderRef.current || !hasMore) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoading) {
          loadMore()
        }
      },
      { threshold: 0.1 },
    )

    observer.observe(loaderRef.current)
    return () => observer.disconnect()
  }, [hasMore, isLoading, page])

  if (products.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <p>Товары не найдены</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-muted-foreground">
          {total} {getRussianPlural(total)}
        </p>
        {/* Future: filters here */}
      </div>

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

      {hasMore && (
        <div ref={loaderRef} className="flex justify-center py-8">
          {isLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-4 h-4 border-2 border-border border-t-foreground rounded-full animate-spin" />
              Загрузка...
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">Прокрутите для загрузки</div>
          )}
        </div>
      )}
    </div>
  )
}
