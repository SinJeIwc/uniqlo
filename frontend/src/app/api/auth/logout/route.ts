import { NextResponse } from "next/server"
import { handleApiError } from "@/lib/errors/api-error"
import { authService } from "@/services/auth.service"

export const dynamic = "force-dynamic"

export async function POST() {
  try {
    await authService.logout()
    return NextResponse.json({ ok: true })
  } catch (error) {
    return handleApiError(error)
  }
}
