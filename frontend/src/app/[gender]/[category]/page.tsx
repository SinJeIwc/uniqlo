import { and, eq, inArray, isNull, or } from "drizzle-orm"
import { notFound } from "next/navigation"
import { ProductGrid } from "@/components/products/ProductGrid"
import { Banner } from "@/components/shared/Banner"
import { CategoryNav } from "@/components/categories/CategoryNav"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { db } from "@/db"
import { categories, products } from "@/db/schema"

type PageProps = {
  params: Promise<{ gender: string; category: string }>
}

export default async function CategoryPage({ params }: PageProps) {
  const { gender, category: slug } = await params

  const category = await db
    .select()
    .from(categories)
    .where(
      and(eq(categories.slug, slug), eq(categories.gender, gender), isNull(categories.parentId)),
    )
    .get()

  if (!category) {
    notFound()
  }

  const allCategories = await db
    .select({ id: categories.id })
    .from(categories)
    .where(or(eq(categories.id, category.id), eq(categories.parentId, category.id)))
    .all()

  const categoryIds = allCategories.map((c) => c.id)

  const categoryProducts = await db
    .select()
    .from(products)
    .where(and(inArray(products.categoryId, categoryIds), eq(products.active, 1)))
    .all()

  const children = await db
    .select({
      id: categories.id,
      name: categories.name,
      nameRu: categories.nameRu,
      slug: categories.slug,
      imageNav: categories.imageNav,
    })
    .from(categories)
    .where(eq(categories.parentId, category.id))
    .orderBy(categories.order, categories.name)
    .all()

  const displayName = category.nameRu || category.name
  const displaySubtitle = category.subtitleRu || category.subtitle

  return (
    <>
      <Header variant="solid" />
      <main className="container mx-auto px-4 pt-14 lg:pt-16 py-6">
        <Banner
          videoUrl={category.videoUrl}
          videoPoster={category.videoPoster}
          imagePc={category.imagePc}
          imageSp={category.imageSp}
          title={displayName}
          subtitle={displaySubtitle}
        />


				<CategoryNav gender={gender} parentSlug={slug} parentName={displayName} parentImage={category.imageNav} items={children} showTitle />

        <ProductGrid products={categoryProducts} />
      </main>
      <Footer />
    </>
  )
}

export async function generateStaticParams() {
  const allCategories = await db
    .select({ gender: categories.gender, slug: categories.slug })
    .from(categories)
    .where(isNull(categories.parentId))
    .all()

  return allCategories.map((cat) => ({
    gender: cat.gender,
    category: cat.slug,
  }))
}
