import { NextResponse } from "next/server"
import { handleApiError } from "@/lib/errors/api-error"
import { authService } from "@/services/auth.service"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const user = await authService.loginWithTelegram(data)
    return NextResponse.json({ ok: true, user })
  } catch (error) {
    return handleApiError(error)
  }
}
