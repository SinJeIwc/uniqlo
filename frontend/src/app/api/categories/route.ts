import { NextResponse } from "next/server"
import { handleApiError } from "@/lib/errors/api-error"
import { categoriesService } from "@/services/categories.service"

export const dynamic = "force-dynamic"

/**
 * GET /api/categories — public category tree or navbar list.
 * Query params: gender, type=nav (for navbar categories)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")

    // Special case: navbar categories
    if (type === "nav") {
      const navCategories = await categoriesService.getNavCategories()
      return NextResponse.json(navCategories)
    }

    // Default: hierarchical tree (optionally filtered by gender)
    const result = await categoriesService.getCategories(Object.fromEntries(searchParams))
    return NextResponse.json(result)
  } catch (error) {
    return handleApiError(error)
  }
}
