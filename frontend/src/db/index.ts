import Database from "better-sqlite3"
import { drizzle } from "drizzle-orm/better-sqlite3"
import * as schema from "./schema"

const sqlite = new Database(process.env.DATABASE_URL || "data/uniqlo.db")
sqlite.pragma("journal_mode = WAL")

export const db = drizzle(sqlite, { schema })
export * from "./types"

// Auto-seed admin user in development
if (process.env.NODE_ENV === "development") {
  import("./seed").then((m) => m.seedDatabase()).catch(console.error)
}
