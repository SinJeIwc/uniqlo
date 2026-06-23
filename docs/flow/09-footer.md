# 09 — Footer & Static Pages

## URL: различные

## Footer (присутствует на всех страницах)

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│  Help              About                Group company            │
│  My Account        Company              GU                       │
│  Store Locator     Sustainability       Theory                   │
│  Exchanges &       Careers              Helmut Lang              │
│  Returns           UNIQLO App                                   │
│  Gift Card                                                      │
│  Contact Us & FAQ                                                │
│                                                                  │
│  ─────────────────────────────────────────────────────────────── │
│                                                                  │
│  🚚 FREE shipping 5,000 KGS+ | 🏪 FREE in-store pick up          │
│                                                                  │
│  [Join our membership & save up to 1,000 KGS!]                   │
│  [Elsom | MBank | O!Dengi]                                       │
│                                                                  │
│  Accessibility  Terms & Conditions  Privacy Policy               │
│  Do Not Sell My Information  Ad Choices                          │
│                                                                  │
│  ─────────────────────────────────────────────────────────────── │
│                                                                  │
│  © 2026 UNIQLO KG. All rights reserved.                          │
│                                                                  │
│  [🇰🇬 Kyrgyzstan ▼]  Language: [Русский | Кыргызча]              │
│                                                                  │
│  [f] [𝕏] [▶] [📷] [🎵]  (social icons)                          │
└──────────────────────────────────────────────────────────────────┘
```

### Секции футера

#### Help
- My Account → `/account`
- Store Locator → `/stores`
- Exchanges & Returns → `/returns`
- Gift Card → `/gift-card`
- Contact Us & FAQ → `/contact`

#### About
- Company → `/about`
- Sustainability → `/sustainability`
- Careers → `/careers`
- UNIQLO App → `/app`

#### Group Company
- GU → внешняя ссылка
- Theory → внешняя ссылка
- Helmut Lang → внешняя ссылка

### Promo Bar (над футером)
- FREE shipping (порог в KGS)
- FREE in-store pick up
- Ссылка на программу лояльности
- Локальные платёжные системы (Elsom, MBank, O!Dengi)

## Статические страницы

### Store Locator `/stores`
- Карта Кыргызстана с отметками магазинов
- Список магазинов: адрес, часы работы, телефон
- Фильтр по городу
- Для v1: только Бишкек (флагманский магазин)

### Contact Us `/contact`
- FAQ аккордеон
- Форма обратной связи
- Телефон поддержки: +996 XXX XXXXXX
- Email: support@uniqlo.kg
- Часы работы поддержки

### Returns & Exchanges `/returns`
- Политика возврата (30 дней)
- Как оформить возврат
- Возврат в магазине
- Возврат доставкой

### About `/about`
- История бренда в Кыргызстане
- Миссия, ценности
- LifeWear концепция

### Sustainability `/sustainability`
- Экологические инициативы
- Переработка одежды
- RE.UNIQLO программа

### Careers `/careers`
- Открытые вакансии
- Культура компании

### Terms `/terms`
- Условия использования
- Политика конфиденциальности

### Gift Card `/gift-card`
- Информация о подарочных картах
- Проверка баланса

## i18n ключи
- `footer.*` — все секции футера
- `static.*` — статические страницы
