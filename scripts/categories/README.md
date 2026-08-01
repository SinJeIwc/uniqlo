# UNIQLO Parser

Парсит uniqlo.com/jp/ja/ — категории, товары, варианты.

## Быстрый старт

```bash
cd scripts
uv sync                                              # первый раз
```

## Команды

```bash
# Только категории (быстро, ~2-5 мин)
uv run python categories/parse.py categories
uv run python categories/parse.py categories --gender women

# Только товары (читает категории из БД)
uv run python categories/parse.py products
uv run python categories/parse.py products --max 50     # лимит для тестов

# Всё сразу
uv run python categories/parse.py all
uv run python categories/parse.py all --gender men --max 100

# Один товар (дебаг)
uv run python categories/parse.py product --url https://www.uniqlo.com/jp/ja/products/E424873-000/00 --pretty
```

## Проверка

```bash
# 1. Быстрый тест категорий (одна gender-секция, ~30 сек)
cd scripts
uv run python categories/parse.py categories --gender women

# 2. Проверить структуру в БД
cd ../frontend
sqlite3 data/uniqlo.db <<SQL
SELECT kind, gender, count(*) FROM categories GROUP BY kind, gender;
SELECT gender, count(*) FROM categories WHERE id NOT IN (SELECT DISTINCT parent_id FROM categories WHERE parent_id IS NOT NULL) GROUP BY gender;
SQL

# 3. Тест товаров (лимит 10, ~30 сек)
cd ../scripts
uv run python categories/parse.py products --max 10

# 4. Проверить что section/category/subcategory заполнены
cd ../frontend
sqlite3 data/uniqlo.db "SELECT product_id, gender, section, category, subcategory, category_id FROM products LIMIT 10"
```

## Архитектура

```
categories/
├── parse.py              # CLI с подкомандами (categories/products/all/product)
├── lib/
│   ├── crawl.py          # Обход категорий: flyout → lineup → terminal
│   ├── products.py       # Парсинг товаров: параллельный (4 вкладки), resume
│   ├── db.py             # Сохранение категорий в SQLite
│   ├── flyout.py         # Парсинг навигации: a[data-category="navi"]
│   ├── subs.py           # Парсинг #lineupLinkWrapper (подкатегории)
│   └── product_js.py     # JS-экстрактор: JSON-LD + DOM
└── parse_product.py      # Отдельный товар (дебаг)
```

## Уровни категорий

Три уровня в БД + gender как сквозной атрибут:

| Уровень | Источник | kind | Пример | Где товары |
|---------|----------|------|--------|-----------|
| gender | табы на главной | — | women | — |
| section | Flyout nav `a[data-category="navi"]` | `section` / `feature` | Tシャツ・スウェット | — |
| category | `#lineupLinkWrapper` дети | `category` | Tシャツ・カットソー | — |
| **terminal** | страница без lineup | — | /women/tops/t-shirts | ← товары здесь |

Терминальные страницы = листья дерева (нет дочерних категорий). Товар получает `category_id` = id терминала.

## Структура товара

Парсится из JSON-LD (`<script type="application/ld+json">`) на странице товара:

### Из JSON-LD

| Поле БД | Источник в JSON-LD |
|---------|-------------------|
| `product_id` | `ProductGroup.productGroupID` |
| `name` | `ProductGroup.name` |
| `description` | `ProductGroup.description` |
| `gender` | `BreadcrumbList[0].name` |
| `section` | `BreadcrumbList[1].name` |
| `category` | `BreadcrumbList[2].name` |
| `subcategory` | `ProductGroup.category` → последний сегмент после ` / ` |
| `brand` | `ProductGroup.brand.name` |
| `material` | `ProductGroup.material` |
| `rating` | `ProductGroup.aggregateRating.ratingValue` |
| `review_count` | `ProductGroup.aggregateRating.reviewCount` |
| `price` | `hasVariant[0].offers.price` |
| `colors` | `hasVariant[*].color` — уникальные |
| `sizes` | `hasVariant[*].size` — уникальные |
| `variants` | `hasVariant[*]` — все SKU с ценой/цветом/размером/наличием |
| `gallery` | `ProductGroup.image[]` |
| `in_stock` | `hasVariant[*].offers.availability` — есть ли InStock |

### Из DOM

| Поле БД | DOM-источник |
|---------|-------------|
| `color_chips` | `main ul > li img[alt]` — цветные чипы |
| `ai_review` | `ITOCard` после `h4:contains("レビュー要約")` |
| `product_description` | `aside > ul > li` — details/specs/materials |

### Пример subcategory

```
ProductGroup.category = "Women / Tシャツ・スウェット / Tシャツ・カットソー / Uniqlo U"
                                           section      category         subcategory
```

## База данных

`frontend/data/uniqlo.db` — SQLite (WAL mode).

```bash
# Создать/обновить таблицы
cd frontend && pnpm drizzle-kit push

# Посмотреть данные
pnpm drizzle-kit studio
# или
sqlite3 data/uniqlo.db "SELECT count(*) FROM categories"
sqlite3 data/uniqlo.db "SELECT count(*) FROM products"
```

## Resume и параллельность

- Товары парсятся в 4 вкладки одновременно
- Уже спаршенные `product_id` пропускаются — можно перезапускать
- `--max N` ограничивает количество НОВЫХ товаров (resume не учитывается в лимите)
