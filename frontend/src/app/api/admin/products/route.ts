import { NextResponse } from "next/server"
import { handleApiError } from "@/lib/errors/api-error"
import { requireAdmin } from "@/lib/middleware/auth"
import { productsService } from "@/services/products.service"

export const dynamic = "force-dynamic"

/**
 * GET /api/admin/products — admin product listing with filters.
 * Query params: q, gender, category, active, page, limit
 */
export async function GET(request: Request) {
  try {
    await requireAdmin()

    const { searchParams } = new URL(request.url)
    const result = await productsService.list(Object.fromEntries(searchParams))

    return NextResponse.json(result)
  } catch (error) {
    return handleApiError(error)
  }
}
