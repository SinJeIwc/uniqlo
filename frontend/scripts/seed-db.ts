#!/usr/bin/env node

/**
 * Production database seeding script.
 * Run with: pnpm seed-db
 */

import { resolve } from "node:path"
import { config } from "dotenv"

// Load .env.local (Next.js convention)
config({ path: resolve(process.cwd(), ".env.local") })
config({ path: resolve(process.cwd(), ".env") })

import { seedDatabase } from "../src/db/seed"

seedDatabase()
  .then(() => {
    console.log("✅ Database seeding complete")
    process.exit(0)
  })
  .catch((error) => {
    console.error("❌ Seeding failed:", error)
    process.exit(1)
  })
