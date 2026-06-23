# UNIQLO Parser

## Установка (один раз)

```bash
cd scripts
uv sync                  # установит зависимости в .venv
uv run playwright install chromium  # браузер для парсинга
```

## Запуск

```bash
cd scripts

# US, только главная
uv run python parse-homepage.py

# US, все страницы (home + men + kids + baby)
uv run python parse-homepage.py --all

# Япония (когда сеть пустит)
uv run python parse-homepage.py --region jp --all
```

## Вывод

Данные сохраняются в `../frontend/src/data/homepage-campaigns.json`.

Структура:
```json
{
  "home": [{ "type": "card", "image": "...", "title": "...", "price": "...", ... }],
  "men": [...],
  "kids": [...],
  "baby": [...]
}
```

## Автоматизация (cron)

На сервере:
```bash
0 8 * * 1 cd /path/to/uniqlo/scripts && uv run python parse-homepage.py --all
```
(каждый понедельник в 8 утра)
