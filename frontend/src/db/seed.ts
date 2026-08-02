/**
 * Database seeding — auto-create admin user from ENV.
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

  // Check if admin already exists
  const existingAdmin = db
    .select()
    .from(users)
    .where(eq(users.role, "admin"))
    .get()

  if (existingAdmin) {
    console.log("✅ Admin user already exists:", existingAdmin.email || existingAdmin.name)
    return
  }

  // Create admin user
  const passwordHash = bcrypt.hashSync(adminPassword, 10)

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

// Auto-run in development
if (process.env.NODE_ENV === "development") {
  seedDatabase().catch(console.error)
}
