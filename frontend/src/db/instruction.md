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

Не пиши тип вручную — бери из Drizzle:

```ts
import type { categories } from "@/db/schema";
type Cat = typeof categories.$inferSelect;   // для чтения
type NewCat = typeof categories.$inferInsert; // для вставки
```

## Где лежит

- Схема: `src/db/schema.ts` (генерируется `introspect`)
- Миграции: `src/db/migrations/`
- Конфиг: `drizzle.config.ts`
- БД: `data/uniqlo.db` (НЕ в git, в `.gitignore`)
