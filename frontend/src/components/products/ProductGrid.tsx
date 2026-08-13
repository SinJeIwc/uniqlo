"use client"

import { useEffect, useRef, useState } from "react"
import { ProductCard } from "./ProductCard"
import type { Product } from "@/db/types"

function getRussianPlural(count: number): string {
	const m10 = count % 10
	const m100 = count % 100
	if (m10 === 1 && m100 !== 11) return "товар"
	if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return "товара"
	return "товаров"
}

type ProductGridProps = {
	products: Product[]
	pageSize?: number
	totalCount?: number
}

export function ProductGrid({ products, pageSize = 20, totalCount }: ProductGridProps) {
	const [visibleCount, setVisibleCount] = useState(pageSize)
	const [isLoading, setIsLoading] = useState(false)
	const loaderRef = useRef<HTMLDivElement>(null)

	const visibleProducts = products.slice(0, visibleCount)
	const hasMore = visibleCount < products.length
	const count = totalCount ?? products.length

	useEffect(() => {
		if (!loaderRef.current || !hasMore) return

		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting && !isLoading) {
					setIsLoading(true)
					setTimeout(() => {
						setVisibleCount((prev) => Math.min(prev + pageSize, products.length))
						setIsLoading(false)
					}, 300)
				}
			},
			{ threshold: 0.1 },
		)

		observer.observe(loaderRef.current)
		return () => observer.disconnect()
	}, [hasMore, isLoading, pageSize, products.length])

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
					{count} {getRussianPlural(count)}
				</p>
				{/* Future: filters here */}
			</div>
			<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
				{visibleProducts.map((product) => (
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
