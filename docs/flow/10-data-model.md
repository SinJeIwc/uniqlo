# 10 — Data Model (Модель данных)

## Общая структура

Данные для моков и будущей БД (PocketBase).

## Сущности

### Product (Товар)
```typescript
interface Product {
  id: string;              // E465185 (как у Uniqlo)
  productId: number;       // 482295 (внутренний SKU)
  name: string;            // "AIRism Cotton Oversized T-Shirt | Half-Sleeve"
  slug: string;            // "airism-cotton-oversized-t-shirt-half-sleeve"
  description: string;     // SEO-описание
  features: string[];      // ["AIRism fabric", "Stay-fresh comfort", ...]
  categoryId: string;      // ссылка на Category
  gender: Gender;          // 'women' | 'men' | 'kids' | 'baby' | 'unisex'
  price: number;           // 2490 (в сомах KGS)
  originalPrice?: number;  // 3490 (если скидка)
  currency: string;        // "KGS" (у нас всегда)
  rating: number;          // 4.8
  reviewCount: number;     // 999
  badges: Badge[];         // ["bestseller", "new", "sale", "limited"]
  tags: Tag[];             // ["UNISEX", "Made with recycled materials"]
  materials: string[];     // ["Cotton 100%", ...]
  careInstructions: string[];
  sizeFit: string;         // "Relaxed fit. True to size."
  isActive: boolean;       // true
  createdAt: string;       // ISO date
  updatedAt: string;

  // Relations
  variants: ProductVariant[];
  images: ProductImage[];
  styles: Style[];         // Styling ideas (cross-sell)
}
```

### Gender
```typescript
type Gender = 'women' | 'men' | 'kids' | 'baby' | 'unisex';
```

### Badge
```typescript
type Badge = 'bestseller' | 'new' | 'sale' | 'limited' | 'online_only' | 'coming_soon';
```

### Tag
```typescript
type Tag = 'UNISEX' | 'Made with recycled materials' | 'UV Protection' | 'AIRism' | 'Linen' | 'Organic Cotton' | 'Stretch';
```

### ProductVariant (Вариант: цвет + размер)
```typescript
interface ProductVariant {
  id: string;
  productId: string;
  colorCode: string;       // "00", "02", "07", "09", ...
  colorName: string;       // "WHITE", "BLACK", "GRAY"
  colorHex: string;        // "#FFFFFF"
  sizeCode: string;        // "003", "004", "005"
  sizeName: string;        // "S", "M", "L"
  sizeOrder: number;       // 3 (для сортировки)
  stock: number;           // 25 (0 = out of stock)
  price?: number;          // override цены для этого варианта
}
```

### ProductImage
```typescript
interface ProductImage {
  id: string;
  productId: string;
  colorCode: string;       // к какому цвету относится
  url: string;             // "/images/products/E465185-000-01.jpg"
  alt: string;
  order: number;           // порядок в галерее
  type: 'front' | 'back' | 'detail' | 'lifestyle' | 'video';
}
```

### Category (Категория)
```typescript
interface Category {
  id: string;              // "women-tops-t-shirts"
  name: string;            // "T-Shirts & Tank Tops"
  slug: string;            // "t-shirts-and-tank-tops"
  description: string;     // SEO-текст
  gender: Gender;
  parentId?: string;       // родительская категория
  order: number;           // порядок сортировки
  image?: string;          // Hero-изображение
  seoTitle?: string;
  seoDescription?: string;
}
```

### Иерархия категорий (на основе Uniqlo)
```
Women
├── T-Shirts & Sweats
│   ├── T-Shirts and Tank Tops
│   │   ├── Short Sleeve
│   │   ├── Cropped
│   │   ├── Long Sleeve
│   │   └── ...
│   ├── Bra Tops
│   ├── Sweatshirts & Hoodies
│   └── UT: Graphic Tees
├── Shirts & Blouses
├── Sweaters & Cardigans
├── Bottoms
│   ├── Pants
│   ├── Wide-Leg Pants
│   ├── Leggings
│   └── Skirts
├── Shorts & Culottes
├── Jeans
├── Outerwear
│   ├── Jackets & Blazers
│   ├── Coats
│   └── Vests
├── Dresses & Skirts
├── Innerwear & Underwear
├── Accessories
├── Linen
├── AIRism
└── UNIQLO F.RISSO

Men
├── T-Shirts & Sweats
├── Shirts
├── Sweaters
├── Bottoms
├── Shorts
├── Jeans
├── Outerwear
├── Innerwear
├── Accessories
└── ...

Kids
├── T-Shirts
├── Bottoms
├── Outerwear
├── ...
└── (разбивка по возрасту: 4-8, 9-13)

Baby
├── Bodysuits
├── Tops
├── Bottoms
├── ...
└── (разбивка: 0-12m, 12-24m, 24-36m)
```

### Cart (Корзина)
```typescript
interface CartItem {
  productId: string;
  variantId: string;       // конкретный цвет + размер
  quantity: number;
}

interface Cart {
  items: CartItem[];
  promoCode?: string;
  discount?: number;
}

// Хранение: Zustand (in-memory) + localStorage (персистентность)
```

### Order (Заказ)
```typescript
interface Order {
  id: string;              // "UNI-KG-20260623-001"
  userId?: string;         // null для гостевого
  status: OrderStatus;
  items: OrderItem[];
  shipping: ShippingInfo;
  payment: PaymentInfo;
  subtotal: number;
  shippingCost: number;
  tax: number;
  total: number;
  createdAt: string;
  updatedAt: string;
}

interface OrderItem {
  productId: string;
  productName: string;
  variantId: string;
  colorName: string;
  sizeName: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

type OrderStatus = 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';

interface ShippingInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  region: string;
  postalCode: string;
  country: string;         // "KG"
  method: 'standard' | 'express' | 'pickup';
}

interface PaymentInfo {
  method: 'card' | 'cash' | 'elsom' | 'mbank' | 'odengi';
  cardLast4?: string;
  status: 'pending' | 'paid' | 'failed' | 'refunded';
}
```

### User (Пользователь)
```typescript
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  birthDate?: string;
  gender?: 'male' | 'female' | 'other';
  addresses: Address[];
  wishlist: string[];      // productIds
  newsletter: boolean;
  createdAt: string;
}

interface Address {
  id: string;
  label: string;           // "Home", "Work"
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  city: string;
  region: string;
  postalCode: string;
  isDefault: boolean;
}
```

### Store (Магазин)
```typescript
interface Store {
  id: string;
  name: string;            // "UNIQLO Bishkek"
  address: string;
  city: string;            // "Bishkek"
  phone: string;
  hours: string;           // "10:00 - 22:00"
  latitude: number;
  longitude: number;
  isActive: boolean;
}
```

## Мок-данные

### Для первого этапа (~50 товаров)

| Категория | Товаров |
|-----------|---------|
| Women T-Shirts | 8 |
| Women Bottoms | 6 |
| Women Outerwear | 4 |
| Women Dresses | 3 |
| Women Accessories | 3 |
| Men T-Shirts | 6 |
| Men Bottoms | 4 |
| Men Outerwear | 3 |
| Kids | 5 |
| Baby | 3 |
| Linen Collection | 5 |
| **Total** | **50** |

### Формат хранения
```
data/
├── categories.json       # дерево категорий
├── products/
│   ├── E465185.json     # продукт + варианты
│   ├── E465190.json
│   └── ...
├── stores.json           # магазины
├── campaigns.json        # акции и промо-блоки
└── search-index.json     # поисковый индекс
```

## API Endpoints (будущий бэкенд)
```
GET    /api/categories
GET    /api/categories/:slug
GET    /api/products?category=&gender=&sort=&page=&limit=
GET    /api/products/:id
GET    /api/products/:id/variants
GET    /api/search?q=
GET    /api/stores
GET    /api/campaigns
POST   /api/cart/add
POST   /api/cart/remove
POST   /api/orders
GET    /api/orders/:id
POST   /api/auth/register
POST   /api/auth/login
```
