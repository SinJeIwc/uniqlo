import { asc, eq } from "drizzle-orm"
import { NextResponse } from "next/server"
import type { Category } from "@/db"
import { db } from "@/db"
import { categories } from "@/db/schema"
import { handleApiError } from "@/lib/errors/api-error"
import { requireAdmin } from "@/lib/middleware/auth"

export const dynamic = "force-dynamic"

/** GET /api/admin/categories?gender=women — tree of categories for admin */
export async function GET(request: Request) {
  try {
    await requireAdmin()

    const { searchParams } = new URL(request.url)
    const gender = searchParams.get("gender")
    const flat = searchParams.get("flat") === "1"

    const query = gender
      ? db.select().from(categories).where(eq(categories.gender, gender))
      : db.select().from(categories)

    const all = query.orderBy(asc(categories.gender), asc(categories.order)).all()

    // Flat mode: return name+slug for filter dropdowns
    if (flat) {
      return NextResponse.json({
        categories: all.map((c) => ({ name: c.nameRu || c.name, slug: c.slug })),
      })
    }

    // Tree mode: group by parentId
    const parents = all.filter((c) => c.parentId === null)
    const children = all.filter((c) => c.parentId !== null)

    const tree = parents.map((p) => ({
      ...p,
      children: children
        .filter((c) => c.parentId === p.id)
        .map((c) => ({
          ...c,
          children: children.filter((gc) => gc.parentId === c.id),
        })),
    }))

    return NextResponse.json(tree)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PATCH(request: Request) {
  try {
    await requireAdmin()

    const body = await request.json()
    const { id, name, slug, image, visible, order } = body
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 })

    const updates: Partial<Category> = {}
    if (name !== undefined) updates.name = name
    if (slug !== undefined) updates.slug = slug
    if (image !== undefined) updates.image = image
    if (visible !== undefined) updates.visible = visible ? 1 : 0
    if (order !== undefined) updates.order = order

    db.update(categories).set(updates).where(eq(categories.id, id)).run()

    return NextResponse.json({ ok: true })
  } catch (error) {
    return handleApiError(error)
  }
}

/** DELETE /api/admin/categories — delete category */
export async function DELETE(request: Request) {
  try {
    await requireAdmin()

    const { searchParams } = new URL(request.url)
    const id = Number(searchParams.get("id"))
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 })

    db.delete(categories).where(eq(categories.id, id)).run()
    return NextResponse.json({ ok: true })
  } catch (error) {
    return handleApiError(error)
  }
}
