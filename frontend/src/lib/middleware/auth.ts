import { AuthError, ForbiddenError } from "@/lib/errors/api-error"
import type { SessionUser } from "@/lib/session"
import { getSession } from "@/lib/session"

/**
 * Get the current authenticated user from session.
 * @throws {AuthError} if not authenticated
 */
export async function getCurrentUser(): Promise<SessionUser> {
  const session = await getSession()
  if (!session.user) {
    throw new AuthError("Authentication required")
  }
  return session.user
}

/**
 * Require any authenticated user.
 * @throws {AuthError} if not authenticated
 */
export async function requireAuth(_request?: Request): Promise<SessionUser> {
  return getCurrentUser()
}

/**
 * Require admin role.
 * @throws {AuthError} if not authenticated
 * @throws {ForbiddenError} if not admin
 */
export async function requireAdmin(_request?: Request): Promise<SessionUser> {
  const user = await getCurrentUser()

  if (user.role !== "admin") {
    throw new ForbiddenError("Admin access required")
  }

  return user
}

/**
 * Optional authentication — returns user or null without throwing.
 */
export async function getOptionalUser(): Promise<SessionUser | null> {
  const session = await getSession()
  return session.user ?? null
}
