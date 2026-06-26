import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

export const categories = sqliteTable("categories", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  gender: text("gender").notNull(),
  parentId: integer("parent_id"),
  order: integer("order").default(0),
  image: text("image"),
});

export const navCategories = sqliteTable("nav_categories", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  href: text("href"),
  image: text("image"),
  gender: text("gender").notNull(),
  order: integer("order").default(0),
});

export const products = sqliteTable("products", {
  id: text("id").primaryKey(),
  productId: text("product_id").notNull(),
  name: text("name").notNull(),
  nameRu: text("name_ru").notNull(),
  description: text("description"),
  descriptionRu: text("description_ru"),
  price: integer("price").notNull(),
  originalPrice: integer("original_price"),
  gender: text("gender").notNull(),
  categoryId: text("category_id").references(() => categories.id),
  images: text("images").notNull(),
  badges: text("badges").default("[]"),
  rating: real("rating").default(0),
  reviewCount: integer("review_count").default(0),
  inStock: integer("in_stock").default(1),
});
