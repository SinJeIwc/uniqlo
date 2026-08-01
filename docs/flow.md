# UNIQLO Parser — Flow & Data Model

## Типы страниц категорий

### 1. Lineup page (есть дети)
- Индикатор: `<div id="lineupLinkWrapper">`
- Содержит: карусель подкатегорий (L2 → L3)
- Медиа: **нет** `MediaBanner`, только `<h1>` с названием
- Счётчик: "308 件" — общее количество товаров во всех дочерних категориях
- Пример: `/women/tops`

### 2. Terminal page (нет детей, есть товары)
- Индикатор: нет `#lineupLinkWrapper`
- Медиа: `[_type="MediaBanner"].media-banner__plp-primary`
- Товары: `[_type="BannerWithProducts"]` блоки

#### 2a. MediaBanner (hero-блок)

```html
<div _type="MediaBanner" class="media-banner__plp-primary">
  <!-- Первый div: изображение ИЛИ видео -->
  <div>
    <!-- Вариант А: изображение -->
    <img
      src="...kv-w-image0509-pc-jp.jpg"
      smallmediumimageurl="...kv-w-image0509-sp-jp.jpg"
      largeimageurl="...kv-w-image0509-pc-jp.jpg"
      smallmediumimageratio="1x1"
      largeimageratio="2x1"
    />

    <!-- Вариант Б: видео (+ превью-картинка пока грузится) -->
    <video
      data-src="...hero-movie-pc.mp4"
      poster="...hero-movie-pc-w.jpg"
      smallmediumvideoratio="9x16"
      largevideoratio="16x9"
      autoplay loop playsinline
    />
  </div>

  <!-- Второй div: заголовок + описание -->
  <div>
    <p>ルームウェア</p>                      <!-- title -->
    <p>くつろぎ時間をやわらかに包み込む。</p>  <!-- subtitle -->
  </div>
</div>
```

**Поля для извлечения:**

| Поле | Атрибут | Пример |
|------|---------|--------|
| `image_sp` | `img[smallmediumimageurl]` | `...kv-w-image-sp-jp.jpg` |
| `image_pc` | `img[largeimageurl]` | `...kv-w-image-pc-jp.jpg` |
| `image_sp_ratio` | `img[smallmediumimageratio]` | `1x1` |
| `image_pc_ratio` | `img[largeimageratio]` | `2x1` |
| `video_sp` | `video[data-src]` + ratio `smallmediumvideoratio` | `...movie-sp.mp4` |
| `video_pc` | `video[data-src]` + ratio `largevideoratio` | `...movie-pc.mp4` |
| `video_poster` | `video[poster]` | `...thumbnail.jpg` |
| `title` | первый `<p>` во втором div | `ルームウェア` |
| `subtitle` | второй `<p>` во втором div | `くつろぎ時間を…` |

**Примечание:** только одно из {image, video} присутствует. Если видео — `poster` показывается пока грузится.

#### 2b. BannerWithProducts (группы товаров)

```html
<div _type="BannerWithProducts">
  <h2>インナー・下着</h2>                    <!-- имя подкатегории -->
  <div class="banner-with-products__grid">
    <a href="/products/E482148-000/00">...</a>  <!-- товары -->
  </div>
</div>
```

**Важно:** `h2` — это не отдельная категория, а группировка товаров внутри страницы. Одна terminal-страница может иметь несколько BannerWithProducts. Все товары со страницы принадлежат этой terminal-категории.

## Уровни категорий (3 в БД + 1 на товаре)

```
Level 0 (gender)   Level 1 (section)        Level 2 (category)       На товаре
────────────────   ────────────────────     ────────────────────────  ──────────
women              Tシャツ・スウェット        Tシャツ・カットソー        Uniqlo U
                   (lineup page)            (terminal, MediaBanner)   (JSON-LD)
```

| Уровень | Таблица | Поле | Источник |
|---------|---------|------|----------|
| Gender | categories | `gender` | URL / JSON-LD breadcrumb[0] |
| Section | categories | `kind=section/feature` | Flyout nav |
| Category | categories | `kind=category` | #lineupLinkWrapper |
| Subcategory | products | `subcategory` | JSON-LD ProductGroup.category last segment |

## Страница товара — источники данных

### JSON-LD (основной источник)

```json
{
  "@type": "ProductGroup",
  "productGroupID": "E482653-000",
  "name": "エアリズムコットンパジャマ",
  "description": "...",
  "brand": {"name": "UNIQLO"},
  "category": "Women / ルームウェア / ルームウェア・パジャマ / ルームセット",
  "material": "74% 綿, 26% ポリエステル",
  "aggregateRating": {"ratingValue": 4.4, "reviewCount": 219},
  "image": ["url1", "url2"],
  "hasVariant": [
    {
      "sku": "482653-69-004-000",
      "color": "NAVY", "size": "M",
      "offers": {"price": "2990", "priceCurrency": "JPY",
                 "availability": "InStock/OutOfStock"}
    }
  ]
}
```

Покрывает: product_id, name, description, brand, gender, section, category, subcategory, price, rating, review_count, material, gallery, colors, sizes, variants, in_stock.

### DOM (дополнительно)

| Данные | DOM-источник |
|--------|-------------|
| `color_chips` | `main ul > li img[alt]` — цветные чипы |
| `ai_review` | `ITOCard` после `<h4>レビュー要約</h4>` |
| `product_description` | `aside > ul > li` (details с картинками, specs, materials) |

## Что нужно добавить в схему

### В таблицу `categories`:

```sql
ALTER TABLE categories ADD COLUMN image_sp TEXT;       -- mobile hero image
ALTER TABLE categories ADD COLUMN image_pc TEXT;       -- desktop hero image
ALTER TABLE categories ADD COLUMN image_sp_ratio TEXT; -- "1x1"
ALTER TABLE categories ADD COLUMN image_pc_ratio TEXT; -- "2x1"
ALTER TABLE categories ADD COLUMN video_sp TEXT;       -- mobile video URL
ALTER TABLE categories ADD COLUMN video_pc TEXT;       -- desktop video URL
ALTER TABLE categories ADD COLUMN video_poster TEXT;   -- video thumbnail
ALTER TABLE categories ADD COLUMN subtitle TEXT;       -- slogan/description
ALTER TABLE categories ADD COLUMN product_count INTEGER; -- from lineup page "308 件"
```

## Алгоритм парсинга категорий (полный)

```
1. Главная → flyout → a[data-category="navi"]
   → L1 sections + features (сохраняем в БД)

2. Для каждой L1 → зайти на страницу:
   ├── есть #lineupLinkWrapper?
   │   ├── ДА → извлечь L2-детей, сохранить
   │   │        извлечь "N 件" → product_count для L1
   │   └── НЕТ → это терминал:
   │        ├── MediaBanner?
   │        │   ├── img? → image_sp, image_pc, ratios
   │        │   ├── video? → video_pc, poster, ratios
   │        │   └── title, subtitle
   │        └── BannerWithProducts → h2 + товары
   │
   └── Для каждого L2 → зайти на страницу (рекурсивно, та же логика)

3. Товары: как сейчас — с терминалов, через JSON-LD
```

## Открытые вопросы

1. **SP-видео**: видео имеет только один `data-src` (PC). SP-версия видео не обнаружена — возможно используется тот же URL с `object-fit` или `smallmediumvideoratio` только задаёт соотношение сторон.

2. **Product count на lineup**: парсить "308 件" через regex из текста страницы.

3. **Второй блок MediaBanner**: в test.md упомянут второй блок после основного — нужно изучить, но пока скипаем.
