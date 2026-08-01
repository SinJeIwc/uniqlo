import { NextResponse } from "next/server"
import { handleApiError } from "@/lib/errors/api-error"
import { authService } from "@/services/auth.service"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const user = await authService.getCurrentUser()
    if (!user) {
      return NextResponse.json({ user: null }, { status: 401 })
    }
    return NextResponse.json({ user })
  } catch (error) {
    return handleApiError(error)
  }
}
