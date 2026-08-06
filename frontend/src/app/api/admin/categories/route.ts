import { NextResponse } from "next/server"
import { handleApiError } from "@/lib/errors/api-error"
import { requireAdmin } from "@/lib/middleware/auth"
import { categoriesService } from "@/services/categories.service"

export const dynamic = "force-dynamic"

/**
 * GET /api/admin/categories — admin category tree or flat list.
 * Query params: gender, flat=1 (for dropdown options)
 */
export async function GET(request: Request) {
  try {
    await requireAdmin()

    const { searchParams } = new URL(request.url)
    const result = await categoriesService.getCategories(Object.fromEntries(searchParams))

    return NextResponse.json(result)
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * POST /api/admin/categories — create new category.
 * Body: { name, slug, gender, nameRu?, parentId?, ... }
 */
export async function POST(request: Request) {
  try {
    await requireAdmin()

    const body = await request.json()
    const category = await categoriesService.create(body)

    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * PATCH /api/admin/categories — update category.
 * Body: { id, name?, slug?, image?, visible?, order?, ... }
 */
export async function PATCH(request: Request) {
  try {
    await requireAdmin()

    const body = await request.json()
    const { id, ...data } = body

    if (!id) {
      return NextResponse.json({ error: "id required" }, { status: 400 })
    }

    await categoriesService.update({ id: Number(id), data })

    return NextResponse.json({ ok: true })
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * DELETE /api/admin/categories?id=123 — delete category.
 */
export async function DELETE(request: Request) {
  try {
    await requireAdmin()

    const { searchParams } = new URL(request.url)
    const id = Number(searchParams.get("id"))

    if (!id) {
      return NextResponse.json({ error: "id required" }, { status: 400 })
    }

    await categoriesService.delete(id)

    return NextResponse.json({ ok: true })
  } catch (error) {
    return handleApiError(error)
  }
}
