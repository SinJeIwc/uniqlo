import { and, asc, eq, like, or, sql } from "drizzle-orm"
import { NextResponse } from "next/server"
import { db } from "@/db"
import { products } from "@/db/schema"
import { handleApiError } from "@/lib/errors/api-error"
import { requireAdmin } from "@/lib/middleware/auth"

export async function GET(request: Request) {
  try {
    await requireAdmin()

    const { searchParams } = new URL(request.url)
    const q = searchParams.get("q") || ""
    const gender = searchParams.get("gender") || ""
    const category = searchParams.get("category") || ""
    const active = searchParams.get("active") || ""
    const page = Math.max(1, Number(searchParams.get("page")) || 1)
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit")) || 20))
    const offset = (page - 1) * limit

    const conditions = []

    if (q) {
      const searchCondition = or(like(products.name, `%${q}%`), like(products.productId, `%${q}%`))
      if (searchCondition) conditions.push(searchCondition)
    }
    if (gender) conditions.push(eq(products.gender, gender))
    if (category) conditions.push(eq(products.category, category))
    if (active) conditions.push(eq(products.active, Number(active)))

    const where = conditions.length > 0 ? and(...conditions) : undefined

    const [{ count }] = db
      .select({ count: sql<number>`count(*)` })
      .from(products)
      .where(where)
      .all()

    const rows = db
      .select()
      .from(products)
      .where(where)
      .orderBy(asc(products.gender), asc(products.category), asc(products.name))
      .limit(limit)
      .offset(offset)
      .all()

    return NextResponse.json({ rows, total: count, page, limit })
  } catch (error) {
    return handleApiError(error)
  }
}
