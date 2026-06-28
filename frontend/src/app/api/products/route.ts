import { NextResponse } from "next/server"
import { db } from "@/db"
import { products } from "@/db/schema"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const gender = searchParams.get("gender")
  const categoryId = searchParams.get("categoryId")
  const limit = Number(searchParams.get("limit") || 20)

  const rows = db.select().from(products).all()

  let filtered = rows
  if (gender) filtered = filtered.filter((p) => p.gender === gender)
  if (categoryId) filtered = filtered.filter((p) => p.categoryId === categoryId)

  return NextResponse.json(filtered.slice(0, limit))
}
