import { revalidateTag } from "next/cache"
import { NextResponse } from "next/server"
import { z } from "zod"
import { handleApiError, ValidationError } from "@/lib/errors/api-error"
import { requireAdmin } from "@/lib/middleware/auth"

const revalidateSchema = z.object({
  tag: z.string().min(1, "Tag is required"),
})

/**
 * POST /api/revalidate — revalidate Next.js cache by tag (admin only).
 * Body: { tag: "products" | "categories" | ... }
 */
export async function POST(request: Request) {
  try {
    await requireAdmin()

    const body = await request.json()
    const validated = revalidateSchema.safeParse(body)

    if (!validated.success) {
      throw new ValidationError(validated.error.issues[0]?.message ?? "Invalid input")
    }

    const { tag } = validated.data

    // Next.js 16: revalidateTag requires cache profile as second argument
    revalidateTag(tag, "default")

    return NextResponse.json({ revalidated: tag, ok: true })
  } catch (error) {
    return handleApiError(error)
  }
}
