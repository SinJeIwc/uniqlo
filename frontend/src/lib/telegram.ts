import crypto from "node:crypto"

export interface TelegramUser {
  id: number
  first_name: string
  last_name?: string
  username?: string
  photo_url?: string
  auth_date: number
  hash: string
}

/** Verify Telegram Login Widget hash. Returns true if valid. */
export function verifyTelegramHash(data: TelegramUser): boolean {
  const botToken = process.env.TELEGRAM_BOT_TOKEN
  if (!botToken) {
    console.error("TELEGRAM_BOT_TOKEN not set")
    return false
  }

  const { hash, ...rest } = data

  // Convert to string key-value pairs for verification
  const checkData: Record<string, string> = {}
  for (const [key, value] of Object.entries(rest)) {
    if (value !== undefined) {
      checkData[key] = String(value)
    }
  }

  // Sort keys alphabetically, join key=value with \n
  const checkString = Object.keys(checkData)
    .sort()
    .map((k) => `${k}=${checkData[k]}`)
    .join("\n")

  // SHA256(bot_token) as secret key
  const secretKey = crypto.createHash("sha256").update(botToken).digest()

  // HMAC-SHA256(check_string, secret_key)
  const hmac = crypto.createHmac("sha256", secretKey).update(checkString).digest("hex")

  return hmac === hash
}

/** Extract user info from verified Telegram login data */
export function extractTelegramUser(data: TelegramUser) {
  return {
    providerId: String(data.id),
    name: [data.first_name, data.last_name].filter(Boolean).join(" ") || data.username || "User",
    avatar: data.photo_url || null,
    username: data.username || null,
  }
}
