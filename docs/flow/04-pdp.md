# 04 — PDP (Product Detail Page — страница товара)

## URL: `/products/[productId]/[colorCode]/[sizeCode]`
Пример: `/products/E465185-000/00?colorDisplayCode=00&sizeDisplayCode=003`

## Назначение
Детальная информация о товаре, выбор опций, добавление в корзину.

## Компоненты

### Layout (десктоп — 2 колонки)
```
┌──────────────────────────┬─────────────────────────┐
│                          │ Breadcrumbs             │
│                          │ WOMEN > T-Shirts > ...  │
│   Image Gallery          │                         │
│   ┌───────────────────┐  │ AIRism Cotton           │
│   │                   │  │ Oversized T-Shirt       │
│   │    MAIN IMAGE     │  │ Half-Sleeve             │
│   │                   │  │ [Bestseller]            │
│   │                   │  │                         │
│   └───────────────────┘  │ Color: 00 WHITE         │
│   [●] [●] [●] [●] [●]   │ ■ □ □ □ □ □ □ □ □ □ □ □│
│   (thumbnails)           │ (color swatches)        │
│                          │                         │
│                          │ Size: MEN S             │
│                          │ XXS XS [S] M L XL XXL   │
│                          │ 3XL | Size Guide        │
│                          │                         │
│                          │ $24.90                  │
│                          │ ★ 4.8 (999+)           │
│                          │ UNISEX, Recycled        │
│                          │                         │
│                          │ [-] 1 [+]               │
│                          │ [ADD TO CART]           │
│                          │                         │
│                          │ ✓ In stock              │
│                          │ 🚚 Free ship $99+       │
│                          │ 📍 Store availability   │
│                          │ [Select store ▼]        │
│                          │ [Check stores]          │
│                          │                         │
│                          │ [Share] [♡ Wishlist]    │
└──────────────────────────┴─────────────────────────┘
```

### 1. Breadcrumbs
```
Women > T-Shirts, Bra Tops & Sweats > T-Shirts
```
- Кликабельные, кроме последнего
- Schema.org BreadcrumbList для SEO

### 2. Image Gallery (левая колонка, ~55%)
```
┌───────────────────────┐
│                       │
│   [ZOOMABLE IMAGE]    │  ← Основное изображение
│                       │     При наведении — лупа (zoom)
│                       │
└───────────────────────┘
  ●  ●  ●  ●  ●  ●  ●     ← Тумбнейлы (горизонтальный скролл)
```
- 5-7 изображений: front, back, detail, lifestyle, video
- Клик по тумбнейлу — смена основного изображения
- На мобильном: свайп-галерея
- Zoom: увеличительное стекло при наведении (десктоп)
- Видео: автоплей в галерее

### 3. Product Info (правая колонка, ~45%)

#### Заголовок + Бейдж
```
AIRism Cotton Oversized T-Shirt | Half-Sleeve
[Bestseller]
```

#### Color Selector
```
Color: 00 WHITE
┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐
│WH│ │LG│ │GR│ │BK│ │PK│ │RD│ │BR│ │YW│  ...
└──┘ └──┘ └──┘ └──┘ └──┘ └──┘ └──┘ └──┘
```
- Круглые свотчи с цветом
- Выбранный — обводка (2px черная)
- При выборе: меняется URL, изображения, цена (если отличается)
- 10+ цветов, горизонтальный скролл если не влезают

#### Size Selector
```
Size: MEN S
┌────┬────┬─────┬────┬────┬────┬────┬─────┐
│XXS │ XS │ [S] │ M  │ L  │ XL │XXL │3XL  │
└────┴────┴─────┴────┴────┴────┴────┴─────┘
                    [Size Guide]
```
- Кнопки-пилюли
- Выбранный размер — залит чёрным
- Недоступные размеры — зачёркнуты (out of stock)
- Size Guide: ссылка на размерную таблицу
- При выборе: меняется URL, проверяется наличие

#### Цена
```
$24.90
```
- Крупный шрифт (24-28px)
- Если скидка: старая цена зачёркнута, новая — красная
- Валюта: сом (KGS) в нашей версии

#### Рейтинг
```
★ ★ ★ ★ ☆  4.8  (999+)
```
- Звёзды + число + количество отзывов
- Ссылка на секцию отзывов ниже

#### Quantity Selector
```
[-]  1  [+]
```
- Кнопки увеличения/уменьшения
- Минимум 1, максимум зависит от стока
- Дебаунс 300ms для проверки наличия

#### Add to Cart Button
```
┌──────────────────────────────┐
│       ADD TO CART            │
└──────────────────────────────┘
```
- Полноширинная, чёрная кнопка
- Hover: затемнение
- При клике: анимация + мини-корзина справа
- Если размер не выбран: disabled + подсказка «Select size»
- После добавления: «Added!» + кнопка «View Cart»

#### Статус наличия
```
✓ In stock
🚚 Ships free: $99+ orders and in-store pickups
```

#### Store Availability
```
📍 Store availability
You can check store stock status here.
[Select a store ▼]
─────────────────
[Check additional stores ▼]
```
- Выбор магазина из списка
- Показывает наличие в выбранном магазине
- Аккордеон для дополнительных магазинов

#### Share / Wishlist
```
[↗ Share]  [♡ ADD TO WISH LIST]
```
- Share: нативные share API или копирование ссылки
- Wishlist: toggle, сохраняется в localStorage/аккаунт

### 4. Product Description (ниже галереи)
```
┌─────────────────────────────────────────────┐
│ Description                                 │
│ Product ID: 482295                          │
│                                             │
│ ▼ Features                                  │
│   AIRism fabric with the look of cotton.    │
│   Stay-fresh comfort. Instantly cool and    │
│   comfortable.                              │
│                                             │
│ ▶ Materials                                 │
│ ▶ Care Instructions                         │
│ ▶ Size & Fit                                │
│ ▶ Shipping & Returns                        │
└─────────────────────────────────────────────┘
```
- Аккордеон-секции
- Features — раскрыта по умолчанию
- Product ID для поддержки

### 5. Ratings & Reviews (ниже)
```
┌─────────────────────────────────────────────┐
│ Ratings & Reviews                           │
│                                             │
│ ★★★★☆  4.8 out of 5                        │
│ 999+ reviews                               │
│                                             │
│ ★★★★★  85%                                 │
│ ★★★★   10%                                 │
│ ★★★     3%                                 │
│ ★★      1%                                 │
│ ★       1%                                 │
│                                             │
│ [Write a Review]                            │
│                                             │
│ ──────────────────────────────────────      │
│ ★★★★★  Great quality!                       │
│ John D.  June 2026                         │
│ ...                                        │
│ [Load More Reviews]                         │
└─────────────────────────────────────────────┘
```

### 6. Styling Ideas / Complete the Look (ниже)
```
┌─────────────────────────────────────────────┐
│ Styling Ideas                               │
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐        │
│ │      │ │      │ │      │ │      │        │
│ │ IMG  │ │ IMG  │ │ IMG  │ │ IMG  │        │
│ │      │ │      │ │      │ │      │        │
│ │$29.90│ │$39.90│ │$24.90│ │$49.90│        │
│ └──────┘ └──────┘ └──────┘ └──────┘        │
└─────────────────────────────────────────────┘
```
- Перекрёстные продажи (cross-sell)
- Горизонтальный скролл карточек

### 7. You May Also Like (рекомендации)
- Аналогичная сетка, AI-рекомендации

## Состояния
| Компонент | Состояния |
|-----------|----------|
| Image | loading / loaded / zoom-active |
| Color | default / selected / out-of-stock |
| Size | available / selected / out-of-stock |
| Qty | 1 / N / max-reached |
| ATC Button | disabled / active / loading / added |
| Store | no-store / store-selected / checking / in-stock / out-of-stock |

## ATC Flow (детально)
```
1. Пользователь выбирает цвет (по умолчанию — первый)
2. Пользователь выбирает размер
   → Если не выбран: кнопка disabled + текст «Select size»
3. Пользователь выбирает количество (по умолчанию 1)
4. Нажимает ADD TO CART
   → Проверка наличия (оптимистичный UI или реальный запрос)
   → Успех: товар в корзине, мини-корзина выезжает справа
   → Ошибка: «Item out of stock in selected size» toast
5. После добавления:
   → Кнопка меняется на «Added!» (2 секунды)
   → Бейдж на иконке корзины обновляется
```

## i18n ключи
- `pdp.color`, `pdp.size`, `pdp.quantity`
- `pdp.addToCart`, `pdp.added`, `pdp.selectSize`
- `pdp.inStock`, `pdp.outOfStock`
- `pdp.storeAvailability`, `pdp.selectStore`
- `pdp.share`, `pdp.addToWishlist`
- `pdp.description.*` — все секции описания
- `pdp.reviews.*` — отзывы
- `pdp.stylingIdeas`, `pdp.youMayAlsoLike`
