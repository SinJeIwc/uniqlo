PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_products` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`product_id` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`category` text,
	`price` integer,
	`rating` text,
	`review_count` integer,
	`gender` text NOT NULL,
	`category_id` integer,
	`material` text,
	`colors` text DEFAULT '[]',
	`color_chips` text DEFAULT '[]',
	`sizes` text DEFAULT '[]',
	`gallery` text DEFAULT '[]',
	`ai_review` text,
	`product_description` text DEFAULT '[]',
	`breadcrumbs` text DEFAULT '[]',
	`availability` text DEFAULT '{}',
	`in_stock` integer DEFAULT 1,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_products`("id", "product_id", "name", "description", "category", "price", "rating", "review_count", "gender", "category_id", "material", "colors", "color_chips", "sizes", "gallery", "ai_review", "product_description", "breadcrumbs", "availability", "in_stock") SELECT "id", "product_id", "name", "description", "category", "price", "rating", "review_count", "gender", "category_id", "material", "colors", "color_chips", "sizes", "gallery", "ai_review", "product_description", "breadcrumbs", "availability", "in_stock" FROM `products`;--> statement-breakpoint
DROP TABLE `products`;--> statement-breakpoint
ALTER TABLE `__new_products` RENAME TO `products`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `products_product_id_unique` ON `products` (`product_id`);--> statement-breakpoint
CREATE TABLE `__new_users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`email` text,
	`avatar` text,
	`provider` text NOT NULL,
	`provider_id` text NOT NULL,
	`role` text DEFAULT 'user' NOT NULL,
	`password_hash` text,
	`created_at` text NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_users`("id", "name", "email", "avatar", "provider", "provider_id", "role", "password_hash", "created_at") SELECT "id", "name", "email", "avatar", "provider", "provider_id", "role", "password_hash", "created_at" FROM `users`;--> statement-breakpoint
DROP TABLE `users`;--> statement-breakpoint
ALTER TABLE `__new_users` RENAME TO `users`;--> statement-breakpoint
CREATE TABLE `__new_categories` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`href` text DEFAULT '' NOT NULL,
	`gender` text NOT NULL,
	`parent_id` integer,
	`order` integer DEFAULT 0,
	`image` text,
	`kind` text DEFAULT 'category' NOT NULL,
	`nav` integer DEFAULT 0,
	`nav_order` integer DEFAULT 0,
	`visible` integer DEFAULT 1
);
--> statement-breakpoint
INSERT INTO `__new_categories`("id", "name", "slug", "href", "gender", "parent_id", "order", "image", "kind", "nav", "nav_order", "visible") SELECT "id", "name", "slug", "href", "gender", "parent_id", "order", "image", "kind", "nav", "nav_order", "visible" FROM `categories`;--> statement-breakpoint
DROP TABLE `categories`;--> statement-breakpoint
ALTER TABLE `__new_categories` RENAME TO `categories`;