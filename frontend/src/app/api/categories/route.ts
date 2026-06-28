import { NextResponse } from "next/server";
import { db } from "@/db";
import { categories, navCategories } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const gender = searchParams.get("gender");
  const type = searchParams.get("type"); // "nav" for nav_categories with images

  if (type === "nav") {
    const rows = gender
      ? db.select().from(navCategories).where(eq(navCategories.gender, gender)).orderBy(asc(navCategories.order)).all()
      : db.select().from(navCategories).orderBy(asc(navCategories.order)).all();
    return NextResponse.json(rows);
  }

  const rows = gender
    ? db.select().from(categories).where(eq(categories.gender, gender)).orderBy(asc(categories.order)).all()
    : db.select().from(categories).orderBy(asc(categories.order)).all();

  return NextResponse.json(rows);
}
