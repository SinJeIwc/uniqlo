# Flow парсинга UNIQLO

> Проверено на US (браузер). Japan заблокирован, но парсер через Playwright работает.
> **US и Japan — ОДИНАКОВАЯ структура** при использовании `?path=` параметра.

## Режимы страниц

У каждой категории **два режима**, переключаются через `?path=`:

| Режим | URL | Что показывает |
|---|---|---|
| Showcase | `/women/bottoms/jeans` | Маркетинг, секции, 1-2 товара |
| **Product Grid** | `/women/bottoms/jeans?path=%2C%2C23339%2C` | Полный грид товаров, `_type` атрибуты |

**Важно для парсера:** всегда добавлять `?path=` с ID категории, чтобы получить грид.

## Уровни

```
L1: gender      /women, /men, /kids, /baby
L2: категория   /women/tops, /women/special-collaboration
L3: подкатегория /women/tops/tshirts
```

## Типы страниц (Product Grid режим)

### A. Lineup-страница (есть дети)

**Признак:** `#lineupLinkWrapper` не null.

**Что парсить:** ссылки внутри `#lineupLinkWrapper` → дочерние категории.

### B. PLP-страница (терминал, нет детей) ✅ проверено на US

**Признак:** `#lineupLinkWrapper` = null. Есть `_type="MediaBanner"` + `_type="BannerWithProducts"`.

**Пример:** `/women/tops` (290 件), `/women/bottoms/jeans?path=...`

**Структура:**

```
1. [MediaBanner] _type="MediaBanner" class="media-banner__plp-primary"
   ├─ div.media-banner__children
   │   └─ <img src="..." alt="...">   (hero-картинка)
   └─ div: текст
       ├─ p.media-banner-plp__title: название категории
       └─ p: описание

2. [BannerWithProducts] _type="BannerWithProducts" (≥1)
   ├─ h2: название подкатегории
   └─ div.banner-with-products__grid
       └─ a[href*="/products/"] — ссылки на товары
```

**Подтверждено на US (`polo-shirts?path=`, `jeans?path=`):**

| Паттерн | Кол-во |
|---|---|
| `_type="BannerWithProducts"` | 4 |
| `_type="MediaBanner"` | 2-3 |
| `banner-with-products__grid` | 16 |
| `media-banner__plp-primary` | ✅ |
| `media-banner__children` | ✅ |
| `media-banner-plp__title` | ✅ |
| `product-tile_link` | 158 |

## Страница товара

URL: `/products/E482148-000/00?colorDisplayCode=11`

```
main
├─ h1 → название
├─ ul > li > button > img[alt] → цвета
├─ div.size-chip-group > div.size-chip-wrapper → размеры
├─ div.rating → рейтинг
└─ div.fr-ec-price > p → цена

aside / complementary
├─ div.media-gallery--container → img + video (gallery[])
├─ h2 → описание
├─ p: "Product ID: NNNNNN" / "商品番号: NNNNNN" → product_id
└─ ul > li:
    ├─ [1] детали: картинки + параграфы
    ├─ [2] спецификация: <p>
    ├─ [3] материалы и уход: <p>
    └─ [4+] скипаем
```

## Алгоритм

```
parse_flyout()
  → все элементы навбара (a[data-category="navi"])
  → сохранить: nav=1, kind=первый_сегмент_href, nav_order=позиция

для каждого flyout с kind=gender и depth=1:
  открыть страницу с ?path=<category_id>
  если #lineupLinkWrapper → parse_lineup() → L3 → nav=0
  если нет → parse_plp()
    → MediaBanner (hero: img + title + description)
    → BannerWithProducts[] → h2 + product_ids
    → parse_product() для каждого

kind ≠ gender → сохранить nav=1, не парсить содержимое
```

## Что пока игнорируем

- `/feature/*`, `/special-feature/*`, `/spl/*` — только nav-элементы
- Второй блок в MediaBanner
- `li[4+]` на странице товара

## Идеи из web-scraping скилла

1. **Dual-viewport** — 1440px + 375px, image/imageMobile
2. **Без кастомного UA**
3. **translate-shell** — яп→рус
4. **CDN pattern** — `image.uniqlo.com/UQ/ST3/{region}/imagesgoods/{pid}/...`
