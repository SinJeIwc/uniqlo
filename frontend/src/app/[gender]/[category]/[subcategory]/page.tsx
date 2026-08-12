import { and, eq, isNotNull, isNull } from "drizzle-orm"
import { notFound } from "next/navigation"
import { ProductGrid } from "@/components/products/ProductGrid"
import { Banner } from "@/components/shared/Banner"
import { CategoryNav } from "@/components/categories/CategoryNav"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { db } from "@/db"
import { categories, products } from "@/db/schema"

type PageProps = {
  params: Promise<{ gender: string; category: string; subcategory: string }>
}

export default async function SubcategoryPage({ params }: PageProps) {
  const { gender, category: parentSlug, subcategory: slug } = await params

  // Resolve parent category first
  const parentCategory = await db
    .select()
    .from(categories)
    .where(
      and(
        eq(categories.slug, parentSlug),
        eq(categories.gender, gender),
        isNull(categories.parentId),
      ),
    )
    .get()

  if (!parentCategory) {
    notFound()
  }

  // Find subcategory under this parent
  const subcategory = await db
    .select()
    .from(categories)
    .where(
      and(
        eq(categories.slug, slug),
        eq(categories.gender, gender),
        eq(categories.parentId, parentCategory.id),
      ),
    )
    .get()

  if (!subcategory) {
    notFound()
  }

  const categoryProducts = await db
    .select()
    .from(products)
    .where(and(eq(products.categoryId, subcategory.id), eq(products.active, 1)))
    .all()

  const siblings = await db
    .select({
      id: categories.id,
      name: categories.name,
      nameRu: categories.nameRu,
      slug: categories.slug,
      imageNav: categories.imageNav,
    })
    .from(categories)
    .where(eq(categories.parentId, parentCategory.id))
    .orderBy(categories.order, categories.name)
    .all()

  const displayName = subcategory.nameRu || subcategory.name
  const displaySubtitle = subcategory.subtitleRu || subcategory.subtitle

  return (
    <>
      <Header variant="solid" />
      <main className="container mx-auto px-4 pt-14 lg:pt-16 py-6">
        <Banner
          videoUrl={subcategory.videoUrl}
          videoPoster={subcategory.videoPoster}
          imagePc={subcategory.imagePc}
          imageSp={subcategory.imageSp}
          title={displayName}
          subtitle={displaySubtitle}
        />

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{displayName}</h1>
          <p className="text-gray-600">
            {categoryProducts.length} {categoryProducts.length === 1 ? "товар" : "товаров"}
          </p>
        </div>

        <CategoryNav
          gender={gender}
          parentSlug={parentCategory.slug}
          items={siblings}
          currentSlug={slug}
        />

        <ProductGrid products={categoryProducts} />
      </main>
      <Footer />
    </>
  )
}

export async function generateStaticParams() {
  const parents = await db
    .select({ id: categories.id, slug: categories.slug, gender: categories.gender })
    .from(categories)
    .where(isNull(categories.parentId))
    .all()

  const result = []
  for (const parent of parents) {
    const children = await db
      .select({ slug: categories.slug })
      .from(categories)
      .where(eq(categories.parentId, parent.id))
      .all()

    for (const child of children) {
      result.push({
        gender: parent.gender,
        category: parent.slug,
        subcategory: child.slug,
      })
    }
  }

  return result
}
