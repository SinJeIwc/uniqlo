# Работа с БД (SQLite + Drizzle)

## Инструменты

```bash
pnpm drizzle-kit introspect   # Сгенерировать schema.ts из реальной БД
pnpm drizzle-kit generate     # Сгенерировать SQL-миграцию из schema.ts
pnpm drizzle-kit push         # Применить schema.ts к БД напрямую (без миграций)
```

## Конфиг

`drizzle.config.ts` — настройки диалекта и пути. БД: `data/uniqlo.db`.

## Рабочий процесс

1. **Меняешь БД** (SQL, админка, парсер)
2. `pnpm drizzle-kit introspect` — перегенерить `schema.ts` из БД
3. Типы `$inferSelect` / `$inferInsert` — из `schema.ts`, всегда актуальны

## Типы

**Все типы — в `src/db/types.ts`.** Меняешь `schema.ts` → типы обновляются автоматически.

```ts
import type { Category, Product, User } from "@/db/types";
import type { CategoryNode, NewCategory, ProductVariant } from "@/db/types";

// Пример: все поля категории (включая image_sp, video_url, subtitle, ...)
const cat: Category = { ... };

// Подтипы через Pick/Omit
type NavItem = Pick<Category, "name" | "slug" | "gender" | "image">;
```

**Не пиши DB-типы вручную.** Везде используй импорт из `@/db/types`.

## Где лежит

- Схема: `src/db/schema.ts` (генерируется `introspect`)
- Миграции: `src/db/migrations/`
- Конфиг: `drizzle.config.ts`
- БД: `data/uniqlo.db` (НЕ в git, в `.gitignore`)
