#!/usr/bin/env node

/**
 * Create the first admin user (email + password).
 * Usage: pnpm setup-admin
 */

import readline from "node:readline"
import bcrypt from "bcryptjs"
import Database from "better-sqlite3"

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

function ask(q: string): Promise<string> {
  return new Promise((resolve) => rl.question(q, resolve))
}

async function main() {
  console.log("=== UNIQLO KG — Первый админ ===\n")

  const email = await ask("Email: ")
  const name = await ask("Имя: ")
  const password = await ask("Пароль: ")

  if (!email || !password) {
    console.log("Отмена.")
    process.exit(0)
  }

  const dbPath = process.env.DATABASE_URL || "data/uniqlo.db"
  const db = new Database(dbPath)
  db.pragma("journal_mode = WAL")

  // Create users table if not exists
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT,
      avatar TEXT,
      provider TEXT NOT NULL,
      provider_id TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      password_hash TEXT,
      created_at TEXT NOT NULL
    )
  `)

  // Check if admin already exists
  const existing = db.prepare("SELECT id FROM users WHERE role = 'admin'").all()
  if (existing.length > 0) {
    console.log("Админ уже существует.")
    process.exit(0)
  }

  const hash = bcrypt.hashSync(password, 10)

  db.prepare(
    "INSERT INTO users (name, email, provider, provider_id, role, password_hash, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
  ).run(name, email, "email", email, "admin", hash, new Date().toISOString())

  console.log(`\nАдмин создан: ${email}`)
  db.close()
  rl.close()
}

main()
