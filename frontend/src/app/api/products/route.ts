import { NextResponse } from "next/server"
import { handleApiError } from "@/lib/errors/api-error"
import { productsService } from "@/services/products.service"

export const dynamic = "force-dynamic"

/**
 * GET /api/products — public product listing with filters and pagination.
 * Query params: q, gender, section, category, subcategory, categoryId, categoryIds, active, page, limit
 */
export async function GET(request: Request) {
	try {
		const { searchParams } = new URL(request.url)
		const result = await productsService.list(Object.fromEntries(searchParams))

		// Transform response: rows → products for consistency with ProductGrid
		return NextResponse.json({
			products: result.rows,
			total: result.total,
			page: result.page,
			limit: result.limit,
		})
	} catch (error) {
		return handleApiError(error)
	}
}
