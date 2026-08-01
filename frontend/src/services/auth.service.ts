import bcrypt from "bcryptjs"
import { z } from "zod"
import { AuthError, ValidationError } from "@/lib/errors/api-error"
import type { SessionUser } from "@/lib/session"
import { getSession } from "@/lib/session"
import { extractTelegramUser, type TelegramUser, verifyTelegramHash } from "@/lib/telegram"
import { usersRepository } from "@/repositories/users.repository"

const emailLoginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
})

const telegramAuthSchema = z.object({
  id: z.number(),
  first_name: z.string(),
  last_name: z.string().optional(),
  username: z.string().optional(),
  photo_url: z.string().optional(),
  auth_date: z.number(),
  hash: z.string(),
}) satisfies z.ZodType<TelegramUser>

/**
 * Authentication service — handles login, logout, session management.
 */
export class AuthService {
  /**
   * Email/password login.
   * @throws {ValidationError} if input is invalid
   * @throws {AuthError} if credentials are wrong
   */
  async loginWithEmail(data: unknown): Promise<SessionUser> {
    const validated = emailLoginSchema.safeParse(data)
    if (!validated.success) {
      throw new ValidationError(validated.error.issues[0]?.message ?? "Invalid input")
    }

    const { email, password } = validated.data

    const user = usersRepository.findByProvider("email", email)
    if (!user?.passwordHash) {
      throw new AuthError("Неверный email или пароль")
    }

    const valid = bcrypt.compareSync(password, user.passwordHash)
    if (!valid) {
      throw new AuthError("Неверный email или пароль")
    }

    // Set session
    const sessionUser: SessionUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
      provider: user.provider,
    }

    const session = await getSession()
    session.user = sessionUser
    await session.save()

    return sessionUser
  }

  /**
   * Telegram OAuth login (via Telegram Login Widget).
   * @throws {ValidationError} if input is invalid
   * @throws {AuthError} if hash verification fails
   */
  async loginWithTelegram(data: unknown): Promise<SessionUser> {
    const validated = telegramAuthSchema.safeParse(data)
    if (!validated.success) {
      throw new ValidationError(validated.error.issues[0]?.message ?? "Invalid Telegram data")
    }

    // Verify Telegram hash
    if (!verifyTelegramHash(validated.data)) {
      throw new AuthError("Invalid Telegram hash")
    }

    const tg = extractTelegramUser(validated.data)

    // Find or create user
    let user = usersRepository.findByProvider("telegram", tg.providerId)
    if (!user) {
      user = usersRepository.create({
        name: tg.name,
        avatar: tg.avatar,
        provider: "telegram",
        providerId: tg.providerId,
        role: "user",
        createdAt: new Date().toISOString(),
      })
    }

    // Set session
    const sessionUser: SessionUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
      provider: user.provider,
    }

    const session = await getSession()
    session.user = sessionUser
    await session.save()

    return sessionUser
  }

  /**
   * Logout — destroy session.
   */
  async logout(): Promise<void> {
    const session = await getSession()
    session.destroy()
  }

  /**
   * Get current authenticated user from session.
   */
  async getCurrentUser(): Promise<SessionUser | null> {
    const session = await getSession()
    return session.user ?? null
  }
}

export const authService = new AuthService()
