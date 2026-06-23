# 07 — Account (Личный кабинет)

## URL: `/account`

## Назначение
Управление профилем, историей заказов, избранным, адресами.

## Страницы внутри аккаунта

### 1. Login / Register
```
┌──────────────────────────────────┐
│        Sign In / Register        │
│                                  │
│  Email                           │
│  [___________________________]  │
│                                  │
│  Password                        │
│  [___________________________]  │
│                                  │
│  [Forgot password?]              │
│                                  │
│  [SIGN IN]                       │
│                                  │
│  ──── or ────                    │
│                                  │
│  [Continue with Google]          │
│  [Continue with Apple]           │
│                                  │
│  New to UNIQLO?                  │
│  [CREATE ACCOUNT]                │
└──────────────────────────────────┘
```

Registration:
- Email, Password, First Name, Last Name
- Phone (опционально)
- Date of Birth (опционально)
- Newsletter opt-in
- Terms & Privacy согласие

### 2. My Account Dashboard
```
┌─────────────────────────────────────────────┐
│  My Account                                 │
│                                             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐    │
│  │ Orders   │ │ Profile  │ │ Address  │    │
│  │   3      │ │  Edit    │ │  Book    │    │
│  └──────────┘ └──────────┘ └──────────┘    │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐    │
│  │ Wishlist │ │ Payment  │ │ Settings │    │
│  │   12     │ │  Methods │ │          │    │
│  └──────────┘ └──────────┘ └──────────┘    │
└─────────────────────────────────────────────┘
```

### 3. Order History
```
┌─────────────────────────────────────────────┐
│  Order History                              │
│                                             │
│  Order #UNI-KG-001                          │
│  June 23, 2026  |  $118.48  |  Delivered   │
│  ┌──────┬──────────────────────────┬──────┐ │
│  │ IMG  │ AIRism Cotton Tee        │ 2   │ │
│  │ IMG  │ Linen Blend Pants        │ 1   │ │
│  └──────┴──────────────────────────┴──────┘ │
│  [View Details]  [Track Package]            │
│  ──────────────────────────────────────     │
│                                             │
│  Order #UNI-KG-002                          │
│  May 15, 2026  |  $49.90  |  Delivered     │
│  ┌──────┬──────────────────────────┬──────┐ │
│  │ IMG  │ SUPIMA Cotton Tee        │ 1   │ │
│  └──────┴──────────────────────────┴──────┘ │
│  [View Details]                             │
└─────────────────────────────────────────────┘
```

Статусы заказов:
- **Processing** — обрабатывается
- **Shipped** — отправлен (с трек-номером)
- **Delivered** — доставлен
- **Cancelled** — отменён
- **Returned** — возврат

### 4. Order Detail
```
┌─────────────────────────────────────────────┐
│  Order #UNI-KG-001                          │
│  Placed on June 23, 2026                    │
│                                             │
│  Status: Delivered on June 28               │
│  ●────●────●────●                          │
│  Order  Ship  Out  Deliver                  │
│                                             │
│  Items                                      │
│  ┌──────┬──────────────────────────┬──────┐ │
│  │ IMG  │ AIRism Cotton...         │ 2   │ │
│  └──────┴──────────────────────────┴──────┘ │
│                                             │
│  Shipping Address                           │
│  123 Chuy Ave, Bishkek, 720000             │
│                                             │
│  Payment: Credit Card (•••• 4242)           │
│  Subtotal: $109.70                          │
│  Shipping: FREE                             │
│  Tax: $8.78                                 │
│  Total: $118.48                             │
│                                             │
│  [Need Help?]  [Return Items]               │
└─────────────────────────────────────────────┘
```

### 5. Profile
- First Name, Last Name
- Email (нередактируемое или с подтверждением)
- Phone
- Date of Birth
- Gender (опционально)
- Newsletter preferences

### 6. Address Book
- Список сохранённых адресов
- Добавить / Редактировать / Удалить
- Default address (один)

### 7. Wishlist (в аккаунте)
- Такая же сетка как PLP, но с товарами из избранного
- Можно добавлять в корзину прямо из списка
- Удалить из избранного

### 8. Payment Methods
- Сохранённые карты (последние 4 цифры)
- Добавить / Удалить
- Не хранить CVV

## Состояния
| Состояние | Описание |
|-----------|----------|
| Logged out | Редирект на /account/login |
| Logged in | Дашборд |
| No orders | «You have no orders yet» + CTA shop |
| Loading | Скелетоны |

## i18n ключи
- `account.*` — все страницы аккаунта
- `auth.*` — логин/регистрация
