# Home vs Category Pages: Data Architecture

## Вопрос

Почему есть два `CategoryNav` компонента (`home/` и `categories/`) и откуда они берут данные?

## Ответ

Это **два разных компонента** для разных целей, и они используют **разные источники данных**.

### 1. Home Pages (/, /men, /kids, /baby)

**Компонент:** `components/home/CategoryNav.tsx`
**Использование:**
- `/` (women home)
- `/[gender]` (men, kids, baby home)

**Данные:**
```tsx
// СТАТИЧЕСКИЕ JSON файлы
import catgoriesData from "@/data/categories/women-nav.json"
import homepageData from "@/data/home/women.json"
```

**Файлы:**
- `src/data/categories/{women,men,kids,baby}-nav.json` (Aug 1)
- `src/data/home/{women,men,kids,baby}.json` (Aug 20)

**UI:**
- Простая сетка категорий (grid)
- Кнопка "Посмотреть все категории"
- Показывает первые 18 категорий

### 2. Category Pages (/women/tops, /men/outerwear, etc)

**Компонент:** `components/categories/CategoryNav.tsx`
**Использование:**
- `/[gender]/[category]` (категория с подкатегориями)
- `/[gender]/[category]/[subcategory]` (страница подкатегории)

**Данные:**
```tsx
// ЖИВЫЕ запросы к БД
const children = db.select()
  .from(categories)
  .where(eq(categories.parentId, category.id))
  .orderBy(asc(categories.order))
  .all()
```

**UI:**
- Горизонтальный carousel с логотипами категорий
- Показывает подкатегории текущей категории
- Включает "Все {parent}" как первый элемент

## Проблема: Inconsistency

**Одна сущность (категории) из двух источников:**

| Страница | Источник | Актуальность | Обновление |
|----------|----------|--------------|------------|
| Home pages | Static JSON | ⚠️ Stale (Aug 1) | Manual export |
| Category pages | Database | ✅ Fresh | Auto (parser) |

**Последствия:**
- Домашняя страница показывает старые категории (Aug 1)
- Страницы категорий показывают актуальные (из БД, обновляются парсером)
- При запуске парсера категории обновляются только в БД, но не в JSON

## Откуда берутся JSON файлы?

**Неизвестно!** В текущих парсерах (`scripts/categories/`) нет экспорта в JSON.

**Возможно:**
1. Старый скрипт (удалён или не в репозитории)
2. Ручной экспорт из БД
3. Скопированы из другого источника

**Парсер пишет только в БД:**
```python
# scripts/categories/lib/db.py
def save_categories(conn, categories):
    # Только INSERT в SQLite
    conn.executemany("INSERT OR REPLACE INTO categories ...", data)
```

## Решения

### Option 1: Создать экспорт JSON (сохранить текущую архитектуру)

```python
# scripts/categories/export-json.py
def export_nav_json(db_path: str, output_dir: str):
    """Export nav categories to JSON files after parsing."""
    for gender in ["women", "men", "kids", "baby"]:
        categories = db.execute("""
            SELECT id, slug, name, nameRu, imageNav
            FROM categories
            WHERE gender = ? AND nav = 1
            ORDER BY navOrder
        """, [gender]).fetchall()
        
        with open(f"{output_dir}/{gender}-nav.json", "w") as f:
            json.dump(categories, f, ensure_ascii=False, indent=2)
```

**Pros:** Сохраняет static data (быстро)
**Cons:** Требует запуск после каждого parse

### Option 2: Мигрировать home на БД (рекомендуется)

```tsx
// app/page.tsx
import { getAllNavCategories } from "@/lib/api/categories"

export default async function HomePage() {
  // Вместо JSON import
  const categories = await getAllNavCategories("women")
  const campaigns = homepageData // Campaigns можно оставить в JSON
  // ...
}
```

**Pros:**
- ✅ Единый источник истины (БД)
- ✅ Всегда актуальные данные
- ✅ Консистентность с category pages
- ✅ Не нужен export step

**Cons:**
- DB query на каждый home page load (приемлемо для SSR)

### Option 3: Гибридный подход

```tsx
// Keep campaigns in JSON (редко меняются)
import homepageData from "@/data/home/women.json"

// Fetch categories from DB (часто обновляются)
const categories = await getAllNavCategories("women")
```

## Рекомендация

**Использовать Option 2 или 3:**

1. **Campaigns** (баннеры, акции) редко меняются → JSON OK
2. **Categories** парсятся регулярно → должны быть из БД
3. Обновить `lib/api/categories.ts`:
   ```ts
   export async function getAllNavCategories(gender: string): Promise<NavItem[]>
   ```
4. Обновить home pages для использования этой функции

## Текущее состояние

**Работает, но устарело:**
- ✅ Build успешный
- ✅ Home pages рендерятся
- ⚠️ Показывают категории от Aug 1 (19 дней назад)
- ✅ Category pages показывают актуальные данные

## Файлы для изменения (если выбрать Option 2/3)

1. `src/lib/api/categories.ts` - добавить `getAllNavCategories(gender)`
2. `src/app/page.tsx` - заменить JSON import на DB query
3. `src/app/[gender]/page.tsx` - заменить JSON import на DB query
4. Опционально: удалить `src/data/categories/*.json` после миграции

## Полная картина парсинга

### Categories Parser (scripts/categories/parse.py)

```bash
uv run python categories/parse.py all
```

**Пишет:**
- ✅ `frontend/data/uniqlo.db` (categories + products таблицы)

**НЕ пишет:**
- ❌ `frontend/src/data/categories/*-nav.json`

**Используется:**
- Category pages (`/women/tops`, etc) - читают из БД ✅

### Homepage Parser (scripts/homepage/parse.py)

```bash
uv run python homepage/parse.py
```

**Пишет:**
- ✅ `frontend/src/data/home/{gender}.json` (campaigns/banners)

**Используется:**
- Home pages (`/`, `/men`, etc) - читают JSON ✅

### Missing: Nav Categories Export

**Нужен скрипт:**
```bash
# Не существует!
uv run python categories/export-nav.py
```

**Должен писать:**
- `frontend/src/data/categories/{gender}-nav.json`

**Используется:**
- Home pages для сетки категорий ⚠️ (currently stale)

## Итоговая таблица

| Данные | Источник | Генератор | Актуальность |
|--------|----------|-----------|--------------|
| Categories (DB) | uniqlo.com | `categories/parse.py` | ✅ Fresh |
| Products (DB) | uniqlo.com | `categories/parse.py` | ✅ Fresh |
| Home campaigns | uniqlo.com | `homepage/parse.py` | ✅ Fresh (Aug 20) |
| Nav categories JSON | ❓ Unknown | ❓ Missing | ❌ Stale (Aug 1) |

## Рекомендация (обновлено)

**Не создавать export скрипт** - вместо этого мигрировать home pages на БД:

```tsx
// app/page.tsx
import homepageData from "@/data/home/women.json" // ✅ Generated by homepage/parse.py

export default async function HomePage() {
  const campaigns = homepageData
  
  // ✅ Read from DB instead of stale JSON
  const categories = await getAllNavCategories("women")
  
  return <CategoryNav categories={categories} />
}
```

**Преимущества:**
- Убираем зависимость от несуществующего генератора
- Единый источник истины для категорий (БД)
- Campaigns остаются в JSON (homepage/parse.py работает)
