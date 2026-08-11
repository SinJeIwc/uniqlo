import { and, eq, inArray, or } from "drizzle-orm"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ProductGrid } from "@/components/shared/product/ProductGrid"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { db } from "@/db"
import { categories, products } from "@/db/schema"

type PageProps = {
  params: Promise<{ gender: string; category: string[] }>
}

const GENDER_LABELS: Record<string, string> = {
  women: "Женщины",
  men: "Мужчины",
  kids: "Дети",
  baby: "Младенцы",
}

export default async function CategoryPage({ params }: PageProps) {
  const { gender, category: categorySegments } = await params

  // Last segment is the category slug
  // /women/tops → ["tops"]
  // /women/tops/bratop → ["tops", "bratop"]
  const slug = categorySegments[categorySegments.length - 1]

  // Find category by slug AND gender (resolve ambiguity)
  const category = await db
    .select()
    .from(categories)
    .where(and(eq(categories.slug, slug), eq(categories.gender, gender)))
    .get()

  if (!category) {
    notFound()
  }

  // Find all descendant categories (this category + direct children)
  const allCategories = await db
    .select({ id: categories.id })
    .from(categories)
    .where(
      or(
        eq(categories.id, category.id), // parent itself
        eq(categories.parentId, category.id), // direct children
      ),
    )
    .all()

  const categoryIds = allCategories.map((c) => c.id)

  // Fetch products from this category AND all descendants
  const categoryProducts = await db
    .select()
    .from(products)
    .where(and(inArray(products.categoryId, categoryIds), eq(products.active, 1)))
    .all()

  // Get subcategories for lineupLinkWrapper navigation
  const subcategories = await db
    .select({
      id: categories.id,
      name: categories.name,
      nameRu: categories.nameRu,
      slug: categories.slug,
    })
    .from(categories)
    .where(eq(categories.parentId, category.id))
    .orderBy(categories.order, categories.name)
    .all()

  const displayName = category.nameRu || category.name
  const genderLabel = GENDER_LABELS[gender] || gender

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Главная</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href={`/${gender}`}>{genderLabel}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{displayName}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Category Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{displayName}</h1>
          <p className="text-gray-600">
            {categoryProducts.length} {categoryProducts.length === 1 ? "товар" : "товаров"}
          </p>
        </div>

        {/* Subcategories Navigation (lineupLinkWrapper) */}
        {subcategories.length > 0 && (
          <div className="mb-6 pb-4 border-b">
            <div className="flex gap-2 flex-wrap">
              <Link
                href={`/${gender}/${slug}`}
                className="px-4 py-2 text-sm border rounded-full hover:bg-gray-100 transition-colors"
              >
                Все
              </Link>
              {subcategories.map((sub) => (
                <Link
                  key={sub.id}
                  href={`/${gender}/${sub.slug}`}
                  className="px-4 py-2 text-sm border rounded-full hover:bg-gray-100 transition-colors"
                >
                  {sub.nameRu || sub.name}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Products Grid */}
        <ProductGrid products={categoryProducts} />
      </main>
      <Footer />
    </>
  )
}

// Generate static params for all gender/category combinations
export async function generateStaticParams() {
  const allCategories = await db
    .select({ gender: categories.gender, slug: categories.slug, href: categories.href })
    .from(categories)
    .all()

  return allCategories.map((cat) => {
    // Convert href to category segments
    // /women/tops → ["tops"]
    // /women/tops/bratop → ["tops", "bratop"]
    const segments = cat.href.split("/").filter(Boolean).slice(1) // skip gender
    return {
      gender: cat.gender,
      category: segments,
    }
  })
}
