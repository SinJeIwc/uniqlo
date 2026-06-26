# UNIQLO Homepage Parser

Парсит главную страницу uniqlo.com, извлекает промо-блоки (кампании) с фото/видео,
переводит на русский, сохраняет в JSON для фронтенда.

## Быстрый старт

```bash
cd scripts

# Только women (главная)
uv run python -m home.parse --categories women

# Все категории (women + men + kids + baby)
uv run python -m home.parse

# Без перевода (оставить японский оригинал)
uv run python -m home.parse --categories women --no-translate

# US регион (английский контент)
uv run python -m home.parse --region us --categories women
```

## Вывод

JSON-файлы в `frontend/src/data/home/`:

```
women.json   — женские кампании (~10 блоков)
men.json     — мужские
kids.json    — детские
baby.json    — для малышей
```

## Структура блока

```json
{
  "image": "https://im.uniqlo.com/...",
  "video": null,
  "badge": "AIRism",
  "title": "Мини-футболка",
  "description": "Компактная и модная...",
  "price": "¥990",
  "saleText": "до 2 июля",
  "link": "/jp/ja/women/tops/t-shirts"
}
```

Поля `title`, `description`, `badge`, `saleText` — переведены на русский (если не `--no-translate`).

## Регионы

| Код | URL |
|-----|-----|
| jp  | uniqlo.com/jp/ja |
| us  | uniqlo.com/us/en |
| uk  | uniqlo.com/uk/en |
| fr  | uniqlo.com/fr/fr |
| de  | uniqlo.com/de/de |
| kr  | uniqlo.com/kr/ko |
| sg  | uniqlo.com/sg/en |
| my  | uniqlo.com/my/en |
| th  | uniqlo.com/th/th |
| ph  | uniqlo.com/ph/en |
| id  | uniqlo.com/id/en |
| au  | uniqlo.com/au/en |
| ca  | uniqlo.com/ca/en |

## Как работает

1. Playwright открывает страницу (headless Chromium)
2. Скроллит до низа — триггерит lazy-load картинок и видео
3. Извлекает все `<a>` блоки с большими картинками (≥200px) или `<video>`
4. Каждый блок парсится: заголовок, описание, цена, бейдж, ссылка
5. Фильтрует по категории (women/men/kids/baby) через анализ href
6. Пропускает тех-блоки (livestation — баннер над хедером)
7. Переводит через `trans -b -e bing` (translate-shell, Bing, бесплатно)
8. Сохраняет в `frontend/src/data/home/{category}.json`

## Код

```
scripts/home/parse/
  __init__.py
  __main__.py      # CLI: аргументы, цикл по категориям
  extract.py        # Playwright, DOM-извлечение, фильтры
  translate.py      # Обёртка над translate-shell
```

## Требования

- Python 3.11+
- `uv` (менеджер пакетов)
- `playwright` (установлен через `uv`)
- `translate-shell` (`brew install translate-shell`)
