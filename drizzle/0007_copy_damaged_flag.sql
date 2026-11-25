PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_copy` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	`book_id` integer NOT NULL,
	`shelf_id` integer NOT NULL,
	`copy_number` integer NOT NULL,
	`status` text DEFAULT 'available' NOT NULL,
	`notes` text,
	`labeled_text` text,
	`labeled_at` integer,
	`labeled_by_id` integer,
	`damaged_at` integer,
	`damaged_by_id` integer,
	FOREIGN KEY (`book_id`) REFERENCES `book`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`shelf_id`) REFERENCES `shelf`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`labeled_by_id`) REFERENCES `account`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`damaged_by_id`) REFERENCES `account`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "ck_copy_status" CHECK("__new_copy"."status" IN ('available', 'on_loan', 'lost', 'discarded')),
	CONSTRAINT "ck_copy_damaged_pair" CHECK(("__new_copy"."damaged_at" IS NULL) = ("__new_copy"."damaged_by_id" IS NULL)),
	CONSTRAINT "ck_copy_number_positive" CHECK("__new_copy"."copy_number" > 0)
);
--> statement-breakpoint
INSERT INTO `__new_copy`("id", "created_at", "updated_at", "book_id", "shelf_id", "copy_number", "status", "notes", "labeled_text", "labeled_at", "labeled_by_id", "damaged_at", "damaged_by_id") SELECT "id", "created_at", "updated_at", "book_id", "shelf_id", "copy_number", "status", "notes", "labeled_text", "labeled_at", "labeled_by_id", NULL, NULL FROM `copy`;--> statement-breakpoint
DROP TABLE `copy`;--> statement-breakpoint
ALTER TABLE `__new_copy` RENAME TO `copy`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `uq_copy_book_number` ON `copy` (`book_id`,`copy_number`) WHERE status NOT IN ('lost', 'discarded');--> statement-breakpoint
CREATE UNIQUE INDEX `uq_copy_labeled_text` ON `copy` (`labeled_text`) WHERE labeled_text IS NOT NULL AND status NOT IN ('lost', 'discarded');--> statement-breakpoint
CREATE INDEX `idx_copy_book` ON `copy` (`book_id`);--> statement-breakpoint
CREATE INDEX `idx_copy_shelf` ON `copy` (`shelf_id`);--> statement-breakpoint
CREATE TABLE `__new_stock_movement` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`type` text NOT NULL,
	`reason` text NOT NULL,
	`signed_by_id` integer NOT NULL,
	`notes` text,
	FOREIGN KEY (`signed_by_id`) REFERENCES `account`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "ck_stock_movement_type_reason" CHECK(("__new_stock_movement"."type" = 'entry' AND "__new_stock_movement"."reason" IN ('purchase', 'donation', 'other', 'recovery')) OR ("__new_stock_movement"."type" = 'exit' AND "__new_stock_movement"."reason" IN ('loss', 'discard')))
);
--> statement-breakpoint
INSERT INTO `__new_stock_movement`("id", "created_at", "type", "reason", "signed_by_id", "notes") SELECT "id", "created_at", "type", "reason", "signed_by_id", "notes" FROM `stock_movement`;--> statement-breakpoint
DROP TABLE `stock_movement`;--> statement-breakpoint
ALTER TABLE `__new_stock_movement` RENAME TO `stock_movement`;