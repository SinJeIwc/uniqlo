import { and, asc, eq, isNotNull } from "drizzle-orm"
import { NextResponse } from "next/server"
import { db } from "@/db"
import { categories } from "@/db/schema"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const gender = searchParams.get("gender")
  const type = searchParams.get("type")

  const conditions = []
  if (gender) conditions.push(eq(categories.gender, gender))
  if (type === "nav") conditions.push(isNotNull(categories.image))

  const query = db.select().from(categories).$dynamic()
  if (conditions.length > 0) query.where(and(...conditions))

  const rows = query.orderBy(asc(categories.order)).all()
  return NextResponse.json(rows)
}
