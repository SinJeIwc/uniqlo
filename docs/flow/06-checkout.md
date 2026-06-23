# 06 — Checkout (Оформление заказа)

## URL: `/checkout`

## Назначение
Многошаговое оформление заказа: контакты → доставка → оплата → подтверждение.

## Шаги

### Step 1: Contact Information
```
┌─────────────────────────────────────────────┐
│  Checkout                                   │
│  ──────────────────────────────────────     │
│                                             │
│  Contact Information                        │
│  ┌─────────────────────────────────────┐    │
│  │ Email *                             │    │
│  │ [____________________________]     │    │
│  │                                    │    │
│  │ ☐ Sign up for emails about new    │    │
│  │   arrivals, promos, and more      │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  Shipping Address                           │
│  ┌─────────────────────────────────────┐    │
│  │ Country/Region *                    │    │
│  │ [Kyrgyzstan ▼]                     │    │
│  │                                    │    │
│  │ First Name *    Last Name *        │    │
│  │ [__________]    [__________]       │    │
│  │                                    │    │
│  │ Address *                          │    │
│  │ [____________________________]    │    │
│  │                                    │    │
│  │ City *          Region *           │    │
│  │ [__________]    [__________]       │    │
│  │                                    │    │
│  │ Postal Code      Phone *           │    │
│  │ [__________]    [__________]       │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  [CONTINUE TO SHIPPING]                     │
└─────────────────────────────────────────────┘
```

### Step 2: Shipping Method
```
┌─────────────────────────────────────────────┐
│  Shipping Method                            │
│                                             │
│  ○ Standard Shipping  (3-7 days)  FREE     │
│    Ships within 1-2 business days           │
│                                             │
│  ○ Express Shipping    (1-3 days)  750 KGS  │
│    Ships same day if ordered before 2pm     │
│                                             │
│  ○ In-Store Pickup              FREE       │
│    Pick up at UNIQLO Bishkek                │
│    Available in 2-4 business days           │
│                                             │
│  [BACK]  [CONTINUE TO PAYMENT]              │
└─────────────────────────────────────────────┘
```

### Step 3: Payment
```
┌─────────────────────────────────────────────┐
│  Payment                                    │
│                                             │
│  ○ Credit / Debit Card                      │
│  ┌─────────────────────────────────────┐    │
│  │ Card Number                         │    │
│  │ [____________________________]     │    │
│  │                                    │    │
│  │ Expiry          CVC                │    │
│  │ [MM/YY]        [___]              │    │
│  │                                    │    │
│  │ Cardholder Name                    │    │
│  │ [____________________________]    │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  ○ Cash on Delivery  (оплата при получении) │
│                                             │
│  ○ Local Payment Systems                    │
│    • Elsom                                    │
│    • MBank                                    │
│    • O!Dengi (KGS)                            │
│                                             │
│  Billing Address                            │
│  ☐ Same as shipping address                │
│  ┌─────────────────────────────────────┐    │
│  │ ... (если другой)                   │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  [BACK]  [PAY NOW]                          │
└─────────────────────────────────────────────┘
```

### Step 4: Order Confirmation
```
┌─────────────────────────────────────────────┐
│  ✓ Order Confirmed!                         │
│                                             │
│  Thank you, [Name]!                         │
│  Order #UNI-KG-20260623-001                 │
│                                             │
│  We'll send a confirmation to               │
│  your@email.com                             │
│                                             │
│  Order Summary                              │
│  ┌──────┬──────────────────────┬────────┐   │
│  │ IMG  │ AIRism Cotton Tee    │ $24.90 │   │
│  │      │ Color: WHITE, Size: S│ Qty: 2 │   │
│  ├──────┼──────────────────────┼────────┤   │
│  │ IMG  │ Linen Blend Pants    │ $59.90 │   │
│  │      │ Color: BEIGE, Size: M│ Qty: 1 │   │
│  └──────┴──────────────────────┴────────┘   │
│                                             │
│  Subtotal: $109.70                          │
│  Shipping: FREE (Standard)                  │
│  Tax: $8.78                                 │
│  Total: $118.48                             │
│                                             │
│  Shipping to:                               │
│  [Address]                                  │
│                                             │
│  Estimated delivery: June 28 - July 2       │
│                                             │
│  [VIEW ORDER]  [CONTINUE SHOPPING]          │
└─────────────────────────────────────────────┘
```

## Layout
- 2 колонки: форма (лево 60%) + Order Summary (право 40%)
- Order Summary закреплён при скролле (sticky)
- Прогресс-бар: Contact → Shipping → Payment → Confirmed

## Валидация
- Email: формат + подтверждение
- Телефон: кыргызский формат (+996 XXXXXXXX)
- Адрес: обязательные поля
- Карта: базовая валидация номера, expiry > сегодня

## Состояния
| Состояние | Описание |
|-----------|----------|
| Guest | Без логина (email обязателен) |
| Logged in | Предзаполненные данные |
| Invalid | Ошибки валидации полей |
| Processing | Спиннер на кнопке оплаты |
| Success | Страница подтверждения |
| Error | Ошибка оплаты, повторить |

## i18n ключи
- `checkout.title`, `checkout.steps.*`
- `checkout.contact.*` — все поля
- `checkout.shipping.*` — методы доставки
- `checkout.payment.*` — методы оплаты
- `checkout.confirmation.*` — подтверждение
