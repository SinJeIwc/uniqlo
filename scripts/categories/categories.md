# Парсер категорий — `categories/parse.py`

## Что делает

1. Читает `women.md`, `men.md`, `kids.md`, `baby.md` — имена категорий
2. Скачивает `uniqlo.com/jp/ja/`, извлекает JSON (244 категории)
3. Матчит имена из md на slug'и/id из JSON
4. Переводит ja→ru через `trans -b -e bing`
5. Картинки из бургер-меню через Playwright
6. Добавляет общие фиче-ссылки (см. ниже)
7. Сохраняет в `frontend/data/uniqlo.db`:
   - `categories` — дерево (id, name, slug, gender, parent_id)
   - `nav_categories` — Level-2 для навигации

## Запуск

```bash
cd scripts
uv run python categories/parse.py               # полный: JSON + перевод + картинки
uv run python categories/parse.py --no-translate # без перевода (быстро, для отладки)
uv run python categories/parse.py --db /tmp/test.db  # другой файл БД
```

## Параметры

| Флаг | Описание |
|------|----------|
| `--no-translate` | Пропустить перевод |
| `--db PATH` | Путь к SQLite (по умолчанию `frontend/data/uniqlo.db`) |

## Формат md-файлов

Каждая строка — ровно одно имя категории как на `uniqlo.co.jp`.
Парсер дедуплицирует и ищет имя в JSON:
- Родительские группы ищутся в `parents[1].name`
- Дети ищутся в `c.name`

Если имя не найдено — предупреждение `⚠`.

## Фиче-ссылки

Захардкожены (одинаковые для всех гендеров, URL с `/women`/`/men`/...):
- 2026夏コレクション, UT, 期間限定価格商品, 値下げ商品,
  オンライン特別商品, 今週の新作, ランキング
