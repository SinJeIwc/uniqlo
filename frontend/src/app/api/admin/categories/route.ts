import { and, asc, eq, isNull } from "drizzle-orm"
import { NextResponse } from "next/server"
import { db } from "@/db"
import { categories } from "@/db/schema"
import { getSession } from "@/lib/session"

export const dynamic = "force-dynamic"

/** GET /api/admin/categories?gender=women — tree of categories for admin */
export async function GET(request: Request) {
  const session = await getSession()
  if (!session.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const gender = searchParams.get("gender")

  const all = gender
    ? db
        .select()
        .from(categories)
        .where(eq(categories.gender, gender))
        .orderBy(asc(categories.order))
        .all()
    : db.select().from(categories).orderBy(asc(categories.gender), asc(categories.order)).all()

  // Build tree: group by parentId
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
}

/** PATCH /api/admin/categories — update category */
export async function PATCH(request: Request) {
  const session = await getSession()
  if (!session.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const { id, name, slug, image, visible, order } = body

  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 })

  const updates: Record<string, any> = {}
  if (name !== undefined) updates.name = name
  if (slug !== undefined) updates.slug = slug
  if (image !== undefined) updates.image = image
  if (visible !== undefined) updates.visible = visible ? 1 : 0
  if (order !== undefined) updates.order = order

  db.update(categories).set(updates).where(eq(categories.id, id)).run()

  return NextResponse.json({ ok: true })
}

/** DELETE /api/admin/categories — delete category */
export async function DELETE(request: Request) {
  const session = await getSession()
  if (!session.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const id = Number(searchParams.get("id"))
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 })

  db.delete(categories).where(eq(categories.id, id)).run()
  return NextResponse.json({ ok: true })
}
