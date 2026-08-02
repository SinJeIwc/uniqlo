# Авторизация — UNIQLO KG

## Обзор

Система поддерживает два типа авторизации:

1. **Email + Password** — для админов (хранится bcrypt hash)
2. **Telegram OAuth** — для обычных пользователей (через Telegram Login Widget)

## Автоматический seed админа

### Development

При запуске `pnpm dev` админ **автоматически создается** из `.env.local`:

```env
# .env.local
ADMIN_EMAIL=admin@uniqlo.kg
ADMIN_PASSWORD=change_me_in_production
ADMIN_NAME=Admin
```

Если админ уже существует — seed пропускается.

### Production

В продакшене запустите seed **перед** стартом приложения:

```bash
# В Dockerfile / CI/CD pipeline
pnpm seed-db
pnpm start
```

Или добавьте в `package.json`:
```json
{
  "scripts": {
    "start": "pnpm seed-db && next start"
  }
}
```

### Переменные окружения

Создайте `.env.local` (игнорится git):

```env
# Telegram bot token (для OAuth через Telegram Login Widget)
TELEGRAM_BOT_TOKEN=your_bot_token_here

# Session secret (генерация: openssl rand -hex 32)
SESSION_SECRET=your_session_secret_here

# Админ (автоматически создается при старте)
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your_secure_password_here
ADMIN_NAME=Admin
```

См. `.env.example` для полного списка.

## Endpoints

### `POST /api/auth/login`
Email/password авторизация.

**Request:**
```json
{
  "email": "admin@uniqlo.kg",
  "password": "your_password"
}
```

**Response (200):**
```json
{
  "ok": true,
  "user": {
    "id": 1,
    "name": "Admin",
    "email": "admin@uniqlo.kg",
    "role": "admin",
    "provider": "email"
  }
}
```

**Errors:**
- `400` — Invalid input (Zod validation)
- `401` — Неверный email или пароль

---

### `POST /api/auth/telegram`
Telegram OAuth авторизация.

**Request:**
```json
{
  "id": 123456789,
  "first_name": "Иван",
  "username": "ivanov",
  "photo_url": "https://...",
  "auth_date": 1234567890,
  "hash": "abc123..."
}
```

**Response (200):**
```json
{
  "ok": true,
  "user": {
    "id": 2,
    "name": "Иван",
    "role": "user",
    "provider": "telegram"
  }
}
```

**Errors:**
- `400` — Invalid input
- `401` — Invalid Telegram hash

---

### `GET /api/auth/me`
Получить текущего пользователя.

**Response (200):**
```json
{
  "user": {
    "id": 1,
    "name": "Admin",
    "email": "admin@uniqlo.kg",
    "role": "admin"
  }
}
```

**Response (401):**
```json
{
  "user": null
}
```

---

### `POST /api/auth/logout`
Выход (уничтожение сессии).

**Response (200):**
```json
{
  "ok": true
}
```

## Middleware

### `requireAdmin()`
Проверяет что пользователь авторизован и имеет роль `admin`.

```typescript
import { requireAdmin } from "@/lib/middleware/auth"

export async function GET(request: Request) {
  try {
    await requireAdmin()  // throws AuthError/ForbiddenError
    // ... admin-only logic
  } catch (error) {
    return handleApiError(error)
  }
}
```

**Throws:**
- `AuthError(401)` — не авторизован
- `ForbiddenError(403)` — авторизован, но не админ

---

### `requireAuth()`
Проверяет что пользователь авторизован (любая роль).

```typescript
import { requireAuth } from "@/lib/middleware/auth"

export async function GET(request: Request) {
  try {
    const user = await requireAuth()
    console.log(user.name, user.role)
  } catch (error) {
    return handleApiError(error)
  }
}
```

---

### `getCurrentUser()`
Алиас для `requireAuth()` — бросает ошибку если не авторизован.

---

### `getOptionalUser()`
Возвращает `SessionUser | null` без броска ошибки.

```typescript
import { getOptionalUser } from "@/lib/middleware/auth"

export async function GET() {
  const user = await getOptionalUser()
  
  if (user?.role === "admin") {
    // admin-specific response
  } else {
    // public response
  }
}
```

## Сессии

Используется [iron-session](https://github.com/vvo/iron-session) — encrypted cookie-based sessions.

**Конфигурация** (`src/lib/session.ts`):
- Cookie name: `uniqlo_session`
- Max age: 30 дней
- HttpOnly, Secure (в продакшене), SameSite=Lax

## Безопасность

✅ **Пароли** — bcrypt с cost factor 10  
✅ **Session** — encrypted железной печатью (iron-session)  
✅ **Telegram OAuth** — HMAC-SHA256 верификация  
✅ **HTTPS** — Secure cookies в продакшене  
✅ **Валидация** — Zod schemas для всех входных данных  

## Миграция с интерактивного setup-admin

**Старый способ (больше не нужен):**
```bash
pnpm setup-admin  # интерактивный ввод email/password
```

**Новый способ:**
1. Добавьте credentials в `.env.local`
2. Запустите `pnpm dev` или `pnpm seed-db`
3. Админ создается автоматически

Скрипт `scripts/setup-admin.ts` оставлен для обратной совместимости, но рекомендуется использовать ENV-based seed.

## Примеры

### Создать админа вручную (CLI)

```bash
# Установите переменные
export ADMIN_EMAIL=admin@example.com
export ADMIN_PASSWORD=secure_pass
export ADMIN_NAME=Admin

# Запустите seed
pnpm seed-db
```

### Проверить текущего админа

```bash
sqlite3 data/uniqlo.db "SELECT id, name, email, role FROM users WHERE role='admin';"
```

### Сменить пароль админа

```bash
# 1. Удалите старого админа
sqlite3 data/uniqlo.db "DELETE FROM users WHERE role='admin';"

# 2. Обновите .env.local
ADMIN_PASSWORD=new_secure_password

# 3. Пересоздайте
pnpm seed-db
```
