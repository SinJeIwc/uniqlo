import { NextResponse } from "next/server"
import { handleApiError } from "@/lib/errors/api-error"
import { productsService } from "@/services/products.service"

export const dynamic = "force-dynamic"

/**
 * GET /api/products — public product listing.
 * Query params: q, gender, categoryId, limit, page
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)

    // Public API only shows active products
    const params = {
      ...Object.fromEntries(searchParams),
      active: "1",
    }

    const result = await productsService.list(params)
    return NextResponse.json(result)
  } catch (error) {
    return handleApiError(error)
  }
}
