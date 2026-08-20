# 🛍️ UNIQLO Kyrgyzstan

> Современный e-commerce сайт UNIQLO для Кыргызстана с автоматическим парсингом товаров и категорий с японского сайта

[![Next.js](https://img.shields.io/badge/Next.js-16.0-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python-3.13-green?logo=python)](https://python.org/)

---

## ✨ Особенности

- 🌍 **Локализация**: Русский язык для рынка Кыргызстана
- 🤖 **Автопарсинг**: Автоматическое обновление каталога с uniqlo.com/jp
- 🎨 **Современный UI**: shadcn/ui компоненты + Tailwind CSS 4
- ⚡ **Быстрая работа**: SQLite база + серверные компоненты Next.js
- 📱 **Адаптивность**: Полная поддержка мобильных устройств
- 🔐 **Админ-панель**: Управление товарами и категориями
- 🌳 **Умная навигация**: Иерархическое дерево категорий с баннерами

## 🚀 Быстрый старт

### Требования

- **Node.js** 18+ (для frontend)
- **Python** 3.11+ (для парсеров)
- **pnpm** (рекомендуется) или npm

### Установка

```bash
# 1. Клонируйте репозиторий
git clone <repo-url>
cd uniqlo

# 2. Установите зависимости frontend
cd frontend
pnpm install

# 3. Создайте базу данных
pnpm drizzle-kit push

# 4. Установите зависимости парсеров
cd ../scripts
pip install uv
uv sync

# 5. Запарсите данные (категории + товары)
uv run python categories/parse.py all --max 100  # тестовый прогон

# 6. Запустите dev-сервер
cd ../frontend
pnpm dev
```

Откройте [http://localhost:3000](http://localhost:3000) 🎉

## 🏗️ Архитектура

```
uniqlo/
├── 🌐 frontend/           # Next.js приложение
│   ├── src/
│   │   ├── app/          # App Router (страницы)
│   │   ├── components/   # React компоненты
│   │   ├── db/           # База данных (Drizzle ORM)
│   │   └── lib/          # Утилиты и хелперы
│   └── data/
│       └── uniqlo.db     # SQLite база (gitignored)
│
├── 🐍 scripts/            # Python парсеры
│   └── categories/       # Парсинг категорий и товаров
│       ├── parse.py      # CLI для запуска
│       └── lib/          # Модули парсинга
│
└── 📚 docs/              # Документация
```

## 💎 Технологии

### Frontend
- **Framework**: Next.js 16 (App Router)
- **UI**: React 19, Tailwind CSS 4, shadcn/ui
- **Database**: SQLite + Drizzle ORM
- **State**: Zustand (клиентское состояние)
- **Auth**: iron-session
- **Lint**: Biome

### Парсеры
- **Python** 3.13+
- **Playwright** (headless browser)
- **uv** (package manager)
- **Структурированные данные**: JSON-LD extraction

## 📊 База данных

SQLite база с тремя таблицами:

### 📁 `categories`
Иерархическое дерево категорий:
- **Уровни**: gender → feature → category → filter
- **Поля**: name, slug, href, gender, parentId, image, imageNav, imagePc, imageSp
- **Баннеры**: MediaBanner с видео/изображениями
- **Локализация**: nameRu, subtitleRu

### 🛒 `products`
Полный каталог товаров:
- **Метаданные**: productId, name, description, price, rating
- **Варианты**: colors, sizes, variants (JSON)
- **Медиа**: gallery (массив изображений)
- **AI**: aiReview (автогенерация)
- **Локализация**: nameRu, descriptionRu

### 👤 `users`
Пользователи и админы:
- **Роли**: user / admin
- **Провайдеры**: Telegram, email/password

## 🔧 Разработка

### Frontend команды

```bash
cd frontend

pnpm dev              # Запуск dev-сервера (:3000)
pnpm build            # Production сборка
pnpm lint             # Проверка кода (Biome)
pnpm lint:fix         # Автоисправление
pnpm format           # Форматирование
pnpm drizzle-kit studio  # UI для базы данных
```

### Парсинг данных

```bash
cd scripts

# Только категории (быстро, ~3 минуты)
uv run python categories/parse.py categories

# Только товары (читает категории из БД)
uv run python categories/parse.py products

# Всё сразу (категории + товары)
uv run python categories/parse.py all

# С фильтрами
uv run python categories/parse.py all --gender women --max 100

# Один товар (для отладки)
uv run python categories/parse.py product \
  --url https://www.uniqlo.com/jp/ja/products/E424873-000/00 \
  --pretty
```

### Работа со схемой

**Schema → DB** (применить изменения):
```bash
cd frontend
pnpm drizzle-kit push
```

**DB → Schema** (импорт из БД):
```bash
pnpm drizzle-kit introspect
```

## 📖 Документация

- **[AGENTS.md](./AGENTS.md)** — полная документация проекта
- **[Frontend README](./frontend/README.md)** — детали frontend
- **[Backend Architecture](./docs/BACKEND_ARCHITECTURE.md)** — архитектура бэкенда

---

<div align="center">

**Сделано с ❤️ для рынка Кыргызстана**

[Документация](./AGENTS.md) • [Issues](../../issues) • [Frontend](./frontend)

</div>
