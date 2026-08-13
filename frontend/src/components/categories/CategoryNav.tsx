import Link from "next/link"
import Image from "next/image"
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel"

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
	parentName: string
	parentImage?: string | null
	items: CategoryNavItem[]
	currentSlug?: string
	showTitle?: boolean
}

export function CategoryNav({ gender, parentSlug, parentName, parentImage, items, currentSlug, showTitle = true }: CategoryNavProps) {
	const allCategories = [
		{
			slug: "",
			name: `すべての${parentName}`,
			nameRu: `Все ${parentName}`,
			imageNav: parentImage,
			isCurrent: !currentSlug,
		},
		...items.map((item) => ({
			slug: item.slug,
			name: item.name,
			nameRu: item.nameRu,
			imageNav: item.imageNav,
			isCurrent: currentSlug === item.slug,
		})),
	]

	return (
		<div className="mb-6">
			{showTitle && <h1 className="text-3xl font-bold mb-6">{parentName}</h1>}
			<Carousel opts={{ align: "start", slidesToScroll: 1 }} className="w-full">
				<CarouselContent className="-ml-2">
					{allCategories.map((cat, i) => (
						<CarouselItem key={i} className="pl-2 basis-auto">
							<Link href={cat.slug ? `/${gender}/${parentSlug}/${cat.slug}` : `/${gender}/${parentSlug}`} className="flex flex-col items-center gap-2">
								<Image
									src={cat.imageNav!}
									alt={cat.nameRu || cat.name}
									width={130}
									height={173}
									className={`w-[130px] aspect-[3/4] object-cover border ${cat.isCurrent ? "border-black" : "border-border"}`}
								/>
								<span className={`text-xs text-center w-[130px] line-clamp-2 ${cat.isCurrent ? "font-semibold" : ""}`}>{cat.nameRu || cat.name}</span>
							</Link>
						</CarouselItem>
					))}
				</CarouselContent>
			</Carousel>
		</div>
	)
}
