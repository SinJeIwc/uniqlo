-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE `products` (
	`id` text PRIMARY KEY,
	`product_id` text NOT NULL,
	`name` text NOT NULL,
	`name_ru` text NOT NULL,
	`description` text,
	`description_ru` text,
	`price` integer NOT NULL,
	`original_price` integer,
	`gender` text NOT NULL,
	`category_id` text,
	`images` text NOT NULL,
	`badges` text DEFAULT '[]',
	`rating` real DEFAULT 0,
	`review_count` integer DEFAULT 0,
	`in_stock` integer DEFAULT 1,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
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
CREATE TABLE `categories` (
	`id` integer PRIMARY KEY,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`gender` text NOT NULL,
	`parent_id` integer,
	`order` integer DEFAULT 0,
	`image` text,
	`visible` integer DEFAULT 1
);

*/