# 05 — Cart (Корзина)

## URL: `/cart`

## Назначение
Просмотр, редактирование товаров в корзине, переход к оформлению.

## Состояния

### Empty State
```
┌─────────────────────────────────────────────┐
│               Shopping cart                  │
│                                             │
│         Your cart is currently empty.       │
│    Items you have previously purchased      │
│     can be found in your Purchase History.  │
│                                             │
│         [Purchase History]                  │
│                                             │
│                                             │
│  ──── Recommended For You ────              │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐       │
│  │      │ │      │ │      │ │      │       │
│  └──────┘ └──────┘ └──────┘ └──────┘       │
│  ← scroll →                                 │
└─────────────────────────────────────────────┘
```

### With Items
```
┌──────────────────────────────────────────────────────────┐
│  Shopping cart (3 items)                                 │
│                                                          │
│  Pickup location: [Select store ▼]                       │
│                                                          │
│  ┌──────────────────────────────────────────────────────┐│
│  │ [IMG]  AIRism Cotton Oversized T-Shirt               ││
│  │        Color: WHITE  Size: S  Qty: [-] 2 [+]        ││
│  │        $24.90    [Remove]  [Save for later]          ││
│  │        ────────────────────────────────────          ││
│  │        Subtotal: $49.80                              ││
│  └──────────────────────────────────────────────────────┘│
│                                                          │
│  ┌──────────────────────────────────────────────────────┐│
│  │ [IMG]  Linen Blend Relaxed Pants                     ││
│  │        Color: BEIGE  Size: M  Qty: [-] 1 [+]        ││
│  │        $59.90    [Remove]  [Save for later]          ││
│  └──────────────────────────────────────────────────────┘│
│                                                          │
│  ┌──────────────────────────────────────────────────────┐│
│  │ [IMG]  SUPIMA Cotton T-Shirt                         ││
│  │        Color: NAVY  Size: L  Qty: [-] 1 [+]         ││
│  │        $24.90    [Remove]  [Save for later]          ││
│  └──────────────────────────────────────────────────────┘│
│                                                          │
│  ─────────────────────────────────────────────────────── │
│                                                          │
│  Order Summary                    Shopping cart total    │
│  Subtotal (3 items)  $109.70     ┌────────────────────┐ │
│  Shipping             FREE       │ Subtotal:  $109.70 │ │
│  Est. Tax             $8.78      │ Shipping:  FREE    │ │
│  ─────────────────────            │ Est. Tax:  $8.78  │ │
│  Total                $118.48    │ Total:     $118.48 │ │
│                                  │                    │ │
│  Promo code                       │ [CHECKOUT]        │ │
│  [____________] [Apply]          └────────────────────┘ │
│                                                          │
│  ──── Recommended For You ────                           │
│  ← scroll →                                              │
│                                                          │
│  ──── Recently Viewed ────                               │
│  ← scroll →                                              │
└──────────────────────────────────────────────────────────┘
```

### 1. Cart Items
Каждый айтем:
- **Изображение** (миниатюра, 80x100px)
- **Название товара** (ссылка на PDP)
- **Опции**: Color, Size (выбранные)
- **Количество**: селектор [-] N [+]
- **Цена за единицу**
- **Действия**: Remove (крестик), Save for later (сердечко)

### 2. Order Summary (сайдбар)
- Subtotal
- Shipping (бесплатно от порога)
- Estimated Tax
- Total
- Promo code input
- Checkout button

### 3. Checkout Button
```
┌──────────────────────┐
│    CHECKOUT          │
└──────────────────────┘
```
- Жирная, черная кнопка
- Ведёт на `/checkout`

### 4. Рекомендации
- Recommended For You (горизонтальный скролл)
- Recently Viewed (если есть история)

## Поведение
- Изменение количества: debounced запрос на сервер
- Remove: анимация выезда + пересчёт тоталов
- Save for later: перемещение в отдельную секцию ниже
- Промокод: проверка на сервере, мгновенный пересчёт

## Edge Cases
- Товар закончился (out of stock): предупреждение, кнопка Remove
- Цена изменилась: уведомление «Price updated»
- Товар уже в корзине (дубликат): увеличение количества
- Сессия истекла: товары сохраняются в localStorage

## i18n ключи
- `cart.title`, `cart.empty`, `cart.emptyLink`
- `cart.color`, `cart.size`, `cart.qty`
- `cart.remove`, `cart.saveForLater`
- `cart.subtotal`, `cart.shipping`, `cart.tax`, `cart.total`
- `cart.promoCode`, `cart.apply`, `cart.checkout`
- `cart.recommended`, `cart.recentlyViewed`
