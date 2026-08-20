import { and, asc, eq, isNull, sql } from "drizzle-orm"
import { notFound } from "next/navigation"
import { CategoryNav } from "@/components/categories/CategoryNav"
import { Footer } from "@/components/layout/footer"
import { Header } from "@/components/layout/header"
import { ProductGrid } from "@/components/products/ProductGrid"
import { Banner } from "@/components/shared/Banner"
import { db } from "@/db"
import { categories, products } from "@/db/schema"

type PageProps = {
  params: Promise<{ gender: string; category: string; subcategory: string }>
}

export default async function SubcategoryPage({ params }: PageProps) {
  const { gender, category: parentSlug, subcategory: slug } = await params

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

  // Get total count for subcategory
  const [{ count: totalProducts }] = db
    .select({ count: sql<number>`count(*)` })
    .from(products)
    .where(and(eq(products.categoryId, subcategory.id), eq(products.active, 1)))
    .all()

  // Get initial products (first page)
  const initialProducts = await db
    .select()
    .from(products)
    .where(and(eq(products.categoryId, subcategory.id), eq(products.active, 1)))
    .orderBy(asc(products.name), asc(products.id))
    .limit(20)
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

        <CategoryNav
          gender={gender}
          parentSlug={parentCategory.slug}
          parentName={parentCategory.nameRu || parentCategory.name}
          parentImage={parentCategory.imageNav}
          items={siblings}
          currentSlug={slug}
          showTitle
        />

        <ProductGrid
          initialProducts={initialProducts}
          categoryIds={[subcategory.id]}
          totalCount={totalProducts}
        />
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
