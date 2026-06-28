import { sqliteTable, AnySQLiteColumn, foreignKey, text, integer, real } from "drizzle-orm/sqlite-core"
  import { sql } from "drizzle-orm"

export const products = sqliteTable("products", {
	id: text().primaryKey(),
	productId: text("product_id").notNull(),
	name: text().notNull(),
	nameRu: text("name_ru").notNull(),
	description: text(),
	descriptionRu: text("description_ru"),
	price: integer().notNull(),
	originalPrice: integer("original_price"),
	gender: text().notNull(),
	categoryId: text("category_id").references(() => categories.id),
	images: text().notNull(),
	badges: text().default("[]"),
	rating: real(),
	reviewCount: integer("review_count").default(0),
	inStock: integer("in_stock").default(1),
});

export const users = sqliteTable("users", {
	id: integer().primaryKey({ autoIncrement: true }),
	name: text().notNull(),
	email: text(),
	avatar: text(),
	provider: text().notNull(),
	providerId: text("provider_id").notNull(),
	role: text().default("user").notNull(),
	passwordHash: text("password_hash"),
	createdAt: text("created_at").notNull(),
});

export const categories = sqliteTable("categories", {
	id: integer().primaryKey(),
	name: text().notNull(),
	slug: text().notNull(),
	gender: text().notNull(),
	parentId: integer("parent_id"),
	order: integer().default(0),
	image: text(),
	visible: integer().default(1),
});

