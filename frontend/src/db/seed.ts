/**
 * Database seeding — auto-create/update admin user from ENV.
 * Runs on dev server start and in production builds.
 */

import bcrypt from "bcryptjs"
import { eq } from "drizzle-orm"
import { db } from "./index"
import { users } from "./schema"

export async function seedDatabase() {
  const adminEmail = process.env.ADMIN_EMAIL
  const adminPassword = process.env.ADMIN_PASSWORD
  const adminName = process.env.ADMIN_NAME || "Admin"

  // Skip if no admin credentials in ENV
  if (!adminEmail || !adminPassword) {
    console.log("⚠️  No ADMIN_EMAIL/ADMIN_PASSWORD in ENV — skipping admin seed")
    return
  }

  // Check if THIS admin email already exists
  const existingAdmin = db
    .select()
    .from(users)
    .where(eq(users.providerId, adminEmail))
    .get()

  const passwordHash = bcrypt.hashSync(adminPassword, 10)

  if (existingAdmin) {
    // Update existing admin (upsert)
    db.update(users)
      .set({
        name: adminName,
        email: adminEmail,
        passwordHash,
        role: "admin",
      })
      .where(eq(users.id, existingAdmin.id))
      .run()

    console.log(`✅ Admin user updated: ${adminEmail}`)
  } else {
    // Create new admin
    db.insert(users)
      .values({
        name: adminName,
        email: adminEmail,
        provider: "email",
        providerId: adminEmail,
        role: "admin",
        passwordHash,
        createdAt: new Date().toISOString(),
      })
      .run()

    console.log(`✅ Admin user created: ${adminEmail}`)
  }
}

// Auto-run in development
if (process.env.NODE_ENV === "development") {
  seedDatabase().catch(console.error)
}
