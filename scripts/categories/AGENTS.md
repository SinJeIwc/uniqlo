# Categories parser — conventions

## Incremental build

Каждый этап — отдельный скрипт, который запускается сам по себе и выдаёт JSON.
Только когда кусочек работает — встраиваем в общий модуль.

Порядок:

```
1. flyout          → parse.py            → JSON: [{text, href, slug, image, gender}] (фильтр: a[data-category="navi"])
2. lineup/L2       → parse_lineup.py    → JSON: [{text, href, slug, image, parent_slug}]
3. PLP (terminal)  → parse_plp.py       → JSON: {hero, subcategories: [{name, products: [id]}]}
4. product page    → parse_product.py   → JSON: {id, name, price, colors, sizes, images, ...}
5. integration     → parse.py all       → категории + товары → SQLite
```

Каждый скрипт:
- Принимает URL или gender как аргумент
- Выводит JSON в stdout или файл
- Не зависит от других этапов (кроме входных данных)

## Product ↔ category rule

Товары парсим только на **терминальных** страницах (без `#lineupLinkWrapper`).
Каждый товар получает `category_id` той страницы где найден.

```
/women/tops (терминал) → товары → category_id = tops
/women/special-collaboration (lineup) → L3 children → каждая L3 терминал → товары → category_id = L3
```

## Japan vs US

- Парсер работает с Japan (`uniqlo.com/jp/ja/`)
- US использовался только для проверки DOM-структуры
- `?path=` — только US, японцам не нужен

## Запуск

```bash
cd scripts
uv run python categories/parse.py
uv run python categories/parse_lineup.py --gender women --slug tops
uv run python categories/parse_plp.py --url https://www.uniqlo.com/jp/ja/women/tops
uv run python categories/parse_product.py --url https://www.uniqlo.com/jp/ja/products/E482148-000
```
