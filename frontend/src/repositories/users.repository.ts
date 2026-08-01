import { and, eq } from "drizzle-orm"
import type { User, UserInsert } from "@/db"
import { db } from "@/db"
import { users } from "@/db/schema"

/**
 * Data access layer for users table.
 */
export class UsersRepository {
  /**
   * Find user by provider and provider ID (unique identifier).
   */
  findByProvider(provider: string, providerId: string): User | undefined {
    return db
      .select()
      .from(users)
      .where(and(eq(users.provider, provider), eq(users.providerId, providerId)))
      .get()
  }

  /**
   * Find user by internal database ID.
   */
  findById(id: number): User | undefined {
    return db.select().from(users).where(eq(users.id, id)).get()
  }

  /**
   * Create a new user.
   */
  create(data: UserInsert): User {
    db.insert(users).values(data).run()

    // SQLite doesn't return the inserted row, so we query it back
    const user = db
      .select()
      .from(users)
      .where(and(eq(users.provider, data.provider), eq(users.providerId, data.providerId)))
      .get()

    if (!user) {
      throw new Error("Failed to create user")
    }

    return user
  }

  /**
   * Update user by ID.
   */
  update(id: number, data: Partial<UserInsert>): User | undefined {
    db.update(users).set(data).where(eq(users.id, id)).run()
    return this.findById(id)
  }
}

export const usersRepository = new UsersRepository()
