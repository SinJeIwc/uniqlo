import type { SessionOptions } from "iron-session"
import { getIronSession } from "iron-session"
import { cookies } from "next/headers"

export interface SessionUser {
  id: number
  name: string
  email: string | null
  avatar: string | null
  role: string
  provider: string
}

export type SessionData = {
  user?: SessionUser
}

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET || "dev-secret-change-me-in-production-32chars",
  cookieName: "uniqlo_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 30 * 24 * 60 * 60, // 30 дней
  },
}

export async function getSession() {
  return getIronSession<SessionData>(await cookies(), sessionOptions)
}
