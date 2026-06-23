# 03 — PLP (Product Listing Page — страница листинга товаров)

## URL: `/[gender]/[category]/[subcategory]`
Пример: `/women/tops/t-shirts`

## Назначение
Просмотр товаров в категории с фильтрацией и сортировкой.

## Компоненты (сверху вниз)

### 1. Category Hero
```
┌──────────────────────────────────────────┐
│  [IMAGE: woman wearing t-shirt]          │
│                                          │
│  Women's T-Shirts & Tank Tops            │
│  [View Fit Guide]  [View Story]          │
└──────────────────────────────────────────┘
```
- Большое lifestyle-изображение
- Название категории
- 2 кнопки: Fit Guide (размерная сетка), View Story (lookbook)

### 2. Gender Tabs (под хедером)
```
WOMEN | MEN | KIDS
```
- Фильтрует товары по гендеру
- Активный таб — подчёркнут

### 3. Category Description
```
Women's T-Shirts & Tank Tops
Discover women's T-shirts made for everyday comfort, with soft
cotton fabrics, versatile silhouettes, and lightweight styles...
```
- Заголовок H1
- SEO-текст (1-2 предложения)

### 4. Filter Bar
```
┌──────────────────────────────────────────────────────────┐
│ [Select store ▼]  [Filter ■]  [Sort by: Recommended ▼]  │
│                                                          │
│ Chips: [In-stock: online only] [XS] [S] [M] [L] [XL] ... │
└──────────────────────────────────────────────────────────┘
```
- **Store selector** — выбор магазина для проверки наличия
- **Filter button** — открывает панель фильтров (см. ниже)
- **Sort dropdown** — Recommended, Newest, Price Low→High, Price High→Low
- **Chips** — быстрые фильтры (размер, наличие онлайн)

### 5. Filter Panel (модальная/боковая)
```
┌─────────────────────────┐
│ Filter              [✕] │
│                         │
│ Size                    │
│ ☐ XXS  ☐ XS  ☐ S      │
│ ☐ M    ☐ L   ☐ XL     │
│ ☐ XXL  ☐ 3XL           │
│                         │
│ Color                   │
│ ■ White  ■ Black        │
│ ■ Gray   ■ Navy         │
│ ■ Beige  ■ Blue         │
│ ...                     │
│                         │
│ Price                   │
│ $0 ———●——— $100+       │
│                         │
│ Features                │
│ ☐ AIRism                │
│ ☐ Linen                 │
│ ☐ UV Protection         │
│ ...                     │
│                         │
│ [Clear All]  [Apply]    │
└─────────────────────────┘
```
- Модальное окно на мобильном, боковая панель на десктопе
- Группы фильтров: Size, Color, Price Range, Features
- Выбранные фильтры показываются чипами над сеткой товаров
- URL-параметры синхронизируются с фильтрами

### 6. Subcategory Sidebar (десктоп — слева)
```
┌──────────────────┐
│ View All T-Shirts │  ← active
│ Short Sleeve      │
│ Cropped           │
│ Tank Tops & Bra   │
│ Long Sleeve       │
│ Regular Length    │
│ Slim Fit          │
│ Relaxed Cut       │
│ Unisex            │
└──────────────────┘
```
- Вертикальный список подкатегорий
- Активная — жирный шрифт
- На мобильном: горизонтальный скролл-бар

### 7. Product Grid
```
┌──────────────────────┐ ┌──────────────────────┐
│ [IMAGE]              │ │ [IMAGE]              │
│ ■□ ■□ ■□ (colors)   │ │ ■□ ■□ (colors)       │
│ ♡                    │ │ ♡                    │
│ MEN, XXS-3XL         │ │ MEN, XS-3XL          │
│ AIRism Cotton        │ │ Linen Blend          │
│ Oversized T-Shirt    │ │ Relaxed Pants        │
│ $24.90               │ │ $59.90               │
│ ★ 4.8 (999+)         │ │ ★ 4.8 (62)           │
└──────────────────────┘ └──────────────────────┘
```

### 8. Product Card — детали
```
┌──────────────────────┐
│ [PRODUCT IMAGE]      │  ← 300x400px, object-cover
│                      │
│ ■□ ■□ ■□ ■□ ■□      │  ← цветовые свотчи (кликабельны)
│ ♡                    │  ← избранное (heart icon)
│                      │
│ MEN, XXS-3XL         │  ← гендер + размерный ряд
│ AIRism Cotton        │  ← название (2 строки макс)
│ Oversized T-Shirt    │
│ $24.90               │  ← цена (красный если скидка)
│ ★ 4.8 (999+)         │  ← рейтинг + кол-во отзывов
│ UNISEX, Recycled     │  ← теги
└──────────────────────┘
```

Поведение:
- Hover: показать второе изображение (lifestyle/alternate)
- Клик: переход на PDP
- Цветовой свотч: меняет изображение в карточке
- Сердечко: добавить/удалить из Wishlist
- Свотчи и сердечко — только на десктопе (на мобильном скрыты)

### 9. Pagination / Load More
- Кнопка «Load More» внизу сетки
- Или бесконечный скролл (Intersection Observer)

## Состояния
| Состояние | Описание |
|-----------|----------|
| Default | Первая страница с товарами |
| Loading | Скелетоны 8 карточек |
| Empty | «Товары не найдены» + предложения |
| Filtered | Чипы с активными фильтрами |
| No results | «Нет товаров по выбранным фильтрам» + Clear All |

## URL-параметры
```
?gender=women&sort=price_asc&size=S,M,L&color=white,black&minPrice=10&maxPrice=50
```

## i18n ключи
- `plp.title`, `plp.description`
- `plp.filters.*` — все фильтры
- `plp.sort.*` — варианты сортировки
- `plp.empty`, `plp.noResults`
- `plp.loadMore`
