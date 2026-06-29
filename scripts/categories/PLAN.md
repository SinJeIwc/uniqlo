# Парсер UNIQLO — план

> Детали страниц: [flow.md](./flow.md)

## Этап 1 — Навбар (flyout)

### Данные которые собираем

Парсер заходит на `uniqlo.com/jp/ja/`, дёргает навбар (`a[data-category="navi"]`), извлекает 4 gender-панели.

Для каждого элемента:

| Поле | Откуда | Пример |
|---|---|---|
| `name` | текст ссылки | `"Tシャツ・スウェット"` |
| `href` | `a.href`, обрезать `https://www.uniqlo.com` | `/women/tops`, `/special-feature/ut` |
| `slug` | последний сегмент href | `tops`, `ut` |
| `image` | `img[src]` внутри ссылки | `https://image.uniqlo.com/...` |
| `gender` | из панели (women/men/kids/baby) | `women` |
| `kind` | первый сегмент href после `/` | `women`, `special-feature`, `feature`, `spl` |
| `nav_order` | позиция в панели (0, 1, 2...) | `0` |
| `parent_id` | null | — |

### Схема БД (categories)

```sql
CREATE TABLE categories (
  id        INTEGER PRIMARY KEY,
  name      TEXT NOT NULL,
  slug      TEXT NOT NULL,
  href      TEXT NOT NULL,        -- новый столбец
  gender    TEXT NOT NULL,
  parent_id INTEGER,
  "order"   INTEGER DEFAULT 0,
  image     TEXT,
  kind      TEXT NOT NULL,        -- новый: women, special-feature, feature, spl
  nav       INTEGER DEFAULT 0,    -- 1 = из flyout, показывать в навбаре
  nav_order INTEGER DEFAULT 0,    -- новый: позиция в навбаре (0-based)
  visible   INTEGER DEFAULT 1
);
```

**Новые колонки:** `href`, `kind`, `nav_order`.

### Логика парсера

```
parse_flyout() → все элементы из 4 панелей
  для каждого:
    kind = href.split('/')[1]         // women, special-feature, feature, spl
    gender = из имени панели
    nav = 1
    nav_order = индекс в панели
    сохранить в БД
```

Для `kind = "women"|"men"|"kids"|"baby"` с depth=1 (ровно 2 сегмента в href — `/women/tops`):
- Зайти на страницу
- Если `#lineupLinkWrapper` есть → собрать L3-подкатегории → `nav=0`, `parent_id=parent.id`
- Если нет → терминал, товары (этап 2)

Для `kind = "special-feature"|"feature"|"spl"`:
- Пока просто сохраняем как `nav=1`. Содержимое не парсим.

### Изменения на фронте

**Drizzle schema** — добавить `href`, `kind`, `nav_order`.

**`header-client.tsx`** — `toCategoryNavItems` берёт `item.href` напрямую.

**Страницы** — переключить с JSON на `getNavCategories(gender)`. JSON-файлы удалить.

**Админка** — `nav_order` позволяет менять порядок элементов в навбаре.

### Удалить

- `scripts/categories/parse.py`
- `frontend/src/data/categories/*-nav.json`

---

## Этап 2 — Товары (план)

1. Для terminal-категорий (`kind=gender`, нет `#lineupLinkWrapper`):
   - Парсить MediaBanner (hero)
   - Парсить BannerWithProducts → product_ids
2. Для каждого product_id → страница товара:
   - Галерея (images/videos)
   - Название, цена, размеры, цвета, рейтинг
   - Детали, спецификация, материалы
3. API или Playwright — определить после анализа Network

---

## Этап 3 — Русские названия

Ручной перевод `name` → `name_ru` через админку или API перевода.
