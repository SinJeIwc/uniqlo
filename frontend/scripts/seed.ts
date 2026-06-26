import Database from "better-sqlite3";
import { readFileSync, mkdirSync } from "fs";
import { join } from "path";

const ROOT = join(import.meta.dirname, "..");
mkdirSync(join(ROOT, "data"), { recursive: true });

const sqlite = new Database(join(ROOT, "data/uniqlo.db"));
sqlite.pragma("journal_mode = WAL");

// Create tables
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    name_ru TEXT NOT NULL,
    slug TEXT NOT NULL,
    gender TEXT NOT NULL,
    parent_id TEXT,
    "order" INTEGER DEFAULT 0,
    image TEXT
  );
  CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL,
    name TEXT NOT NULL,
    name_ru TEXT NOT NULL,
    description TEXT,
    description_ru TEXT,
    price INTEGER NOT NULL,
    original_price INTEGER,
    gender TEXT NOT NULL,
    category_id TEXT REFERENCES categories(id),
    images TEXT NOT NULL,
    badges TEXT DEFAULT '[]',
    rating REAL DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    in_stock INTEGER DEFAULT 1
  );
`);

const insert = sqlite.prepare(`
  INSERT OR IGNORE INTO categories (id, name, name_ru, slug, gender, parent_id, "order", image)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);

const categoriesData = JSON.parse(
  readFileSync(join(ROOT, "src/data/categories.json"), "utf-8")
);

for (const cat of categoriesData.categories) {
  insert.run(cat.id, cat.name, cat.nameRu, cat.id, cat.id, null, cat.order || 0, null);
  for (const child of cat.children || []) {
    insert.run(child.id, child.name, child.nameRu, child.slug || child.id, cat.id, cat.id, child.order || 0, null);
  }
}

const prodInsert = sqlite.prepare(`
  INSERT OR IGNORE INTO products
    (id, product_id, name, name_ru, description, description_ru, price, original_price, gender, category_id, images, badges, rating, review_count)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const productsData = JSON.parse(
  readFileSync(join(ROOT, "src/data/products-index.json"), "utf-8")
);

for (const p of productsData) {
  prodInsert.run(
    p.id, p.productId, p.name, p.nameRu,
    p.description || null, p.descriptionRu || null,
    p.price, p.originalPrice || null, p.gender,
    p.categoryId || null,
    JSON.stringify(p.images || []), JSON.stringify(p.badges || []),
    p.rating || 0, p.reviewCount || 0
  );
}

const cats = sqlite.prepare("SELECT count(*) as c FROM categories").get() as { c: number };
const prods = sqlite.prepare("SELECT count(*) as c FROM products").get() as { c: number };
console.log(`Seeded: ${cats.c} categories, ${prods.c} products`);
sqlite.close();
