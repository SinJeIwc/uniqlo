# Парсер главной — `homepage/parse.py`

## Что делает

- Playwright, два viewport'а: 1440px (desktop) + 375px (mobile)
- Скролл для lazy-load (12 шагов + полный скролл)
- Извлекает промо-блоки: картинки, видео, цены, бейджи
- Фильтрует по href (классификация gender) и SKIP_PATTERNS
- Перевод ja→ru через `trans -b -e bing`
- Сливает desktop + mobile → `imageMobile`, `videoMobile`
- Сохраняет в `frontend/src/data/home/{gender}.json`

## Запуск

```bash
cd scripts
uv run python homepage/parse.py                      # JP, все гендеры
uv run python homepage/parse.py --categories women    # только women
uv run python homepage/parse.py --no-translate       # без перевода
uv run python homepage/parse.py --region us           # US сайт
```

## Параметры

| Флаг | По умолчанию | Описание |
|------|-------------|----------|
| `--region` | `jp` | Регион: jp, us, uk, fr, de, kr, sg, my, th, ph, id, au, ca |
| `--categories` | `women,men,kids,baby` | Через запятую |
| `--no-translate` | нет | Пропустить перевод |

## Формат выхода

```json
[
  {
    "image": "https://...",
    "video": "https://...",
    "imageMobile": "https://...",
    "videoMobile": "https://...",
    "title": "...",
    "description": "...",
    "price": "¥1,990",
    "saleText": "7月2日まで期間限定価格",
    "badge": "NEW",
    "badgeImage": "https://...",
    "note": "※店舗により...",
    "link": "/jp/ja/women/tops/t-shirts"
  }
]
```
