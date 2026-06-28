import { and, eq } from "drizzle-orm"
import { NextResponse } from "next/server"
import { db } from "@/db"
import { users } from "@/db/schema"
import { getSession } from "@/lib/session"
import { extractTelegramUser, verifyTelegramHash } from "@/lib/telegram"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    const data = await request.json()

    if (!verifyTelegramHash(data)) {
      return NextResponse.json({ error: "Invalid Telegram hash" }, { status: 401 })
    }

    const tg = extractTelegramUser(data)

    // Upsert: find existing or create
    let user = db
      .select()
      .from(users)
      .where(and(eq(users.provider, "telegram"), eq(users.providerId, tg.providerId)))
      .get()

    if (!user) {
      db.insert(users)
        .values({
          name: tg.name,
          avatar: tg.avatar,
          provider: "telegram",
          providerId: tg.providerId,
          role: "user",
          createdAt: new Date().toISOString(),
        })
        .run()

      user = db
        .select()
        .from(users)
        .where(and(eq(users.provider, "telegram"), eq(users.providerId, tg.providerId)))
        .get()
    }

    // Set session
    const session = await getSession()
    session.user = {
      id: user!.id,
      name: user!.name,
      email: user!.email,
      avatar: user!.avatar,
      role: user!.role,
      provider: user!.provider,
    }
    await session.save()

    return NextResponse.json({ ok: true, user: session.user })
  } catch (err) {
    console.error("Telegram auth error:", err)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
