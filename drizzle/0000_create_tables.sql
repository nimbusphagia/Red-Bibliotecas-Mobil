CREATE TABLE `account` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	`username` text NOT NULL,
	`password_hash` text NOT NULL,
	`role` text DEFAULT 'staff' NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	CONSTRAINT "ck_account_role" CHECK("account"."role" IN ('owner', 'admin', 'staff'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_account_username_lower` ON `account` (lower("username"));--> statement-breakpoint
CREATE UNIQUE INDEX `uq_account_single_owner` ON `account` (`role`) WHERE role = 'owner';--> statement-breakpoint
CREATE TABLE `author` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	`first_name` text NOT NULL,
	`last_name` text,
	`name_key` text NOT NULL,
	`is_protected` integer DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_author_name_key` ON `author` (`name_key`);--> statement-breakpoint
CREATE TABLE `book` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	`title` text NOT NULL,
	`publisher_id` integer,
	`collection_id` integer,
	`series_id` integer,
	`category_id` integer,
	`subcategory_id` integer,
	`publication_year` integer,
	`page_count` integer,
	`active` integer DEFAULT true NOT NULL,
	FOREIGN KEY (`publisher_id`) REFERENCES `publisher`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`series_id`) REFERENCES `series`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`category_id`) REFERENCES `category`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`subcategory_id`) REFERENCES `subcategory`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`publisher_id`,`collection_id`) REFERENCES `collection`(`publisher_id`,`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "ck_book_page_count" CHECK("book"."page_count" > 0),
	CONSTRAINT "ck_book_collection_requires_publisher" CHECK("book"."collection_id" IS NULL OR "book"."publisher_id" IS NOT NULL)
);
--> statement-breakpoint
CREATE INDEX `idx_book_publisher` ON `book` (`publisher_id`);--> statement-breakpoint
CREATE INDEX `idx_book_collection` ON `book` (`collection_id`);--> statement-breakpoint
CREATE INDEX `idx_book_series` ON `book` (`series_id`);--> statement-breakpoint
CREATE INDEX `idx_book_category` ON `book` (`category_id`);--> statement-breakpoint
CREATE INDEX `idx_book_subcategory` ON `book` (`subcategory_id`);--> statement-breakpoint
CREATE TABLE `book_collaborator` (
	`book_id` integer NOT NULL,
	`collaborator_id` integer NOT NULL,
	`role` text NOT NULL,
	PRIMARY KEY(`book_id`, `collaborator_id`, `role`),
	FOREIGN KEY (`book_id`) REFERENCES `book`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`collaborator_id`) REFERENCES `author`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "ck_book_collaborator_role" CHECK("book_collaborator"."role" IN ('writer', 'illustrator', 'translator'))
);
--> statement-breakpoint
CREATE INDEX `idx_book_collaborator_author` ON `book_collaborator` (`collaborator_id`);--> statement-breakpoint
CREATE TABLE `category` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	`name` text NOT NULL,
	`code` text NOT NULL,
	`name_key` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_category_name_lower` ON `category` (lower("name"));--> statement-breakpoint
CREATE UNIQUE INDEX `uq_category_code_lower` ON `category` (lower("code"));--> statement-breakpoint
CREATE UNIQUE INDEX `uq_category_name_key` ON `category` (`name_key`);--> statement-breakpoint
CREATE UNIQUE INDEX `uq_category_code` ON `category` (`code`);--> statement-breakpoint
CREATE TABLE `collection` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	`name` text NOT NULL,
	`publisher_id` integer NOT NULL,
	FOREIGN KEY (`publisher_id`) REFERENCES `publisher`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_collection_publisher_name_lower` ON `collection` (`publisher_id`,lower("name"));--> statement-breakpoint
CREATE UNIQUE INDEX `uq_collection_publisher_id` ON `collection` (`publisher_id`,`id`);--> statement-breakpoint
CREATE TABLE `copy` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	`book_id` integer NOT NULL,
	`shelf_id` integer NOT NULL,
	`code` text NOT NULL,
	`status` text DEFAULT 'available' NOT NULL,
	`notes` text,
	FOREIGN KEY (`book_id`) REFERENCES `book`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`shelf_id`) REFERENCES `shelf`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "ck_copy_status" CHECK("copy"."status" IN ('available', 'on_loan', 'lost', 'discarded', 'damaged'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_copy_code_lower` ON `copy` (lower("code"));--> statement-breakpoint
CREATE INDEX `idx_copy_book` ON `copy` (`book_id`);--> statement-breakpoint
CREATE INDEX `idx_copy_shelf` ON `copy` (`shelf_id`);--> statement-breakpoint
CREATE TABLE `label` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	`copy_id` integer NOT NULL,
	`category_code` text NOT NULL,
	`author_code` text NOT NULL,
	`subcategory_code` text NOT NULL,
	`copy_number` integer NOT NULL,
	`text` text NOT NULL,
	`print_status` text DEFAULT 'pending_print' NOT NULL,
	`printed_at` integer,
	`revision` integer DEFAULT 1 NOT NULL,
	FOREIGN KEY (`copy_id`) REFERENCES `copy`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "ck_label_print_status" CHECK("label"."print_status" IN ('pending_print', 'printed')),
	CONSTRAINT "ck_label_copy_number_positive" CHECK("label"."copy_number" > 0),
	CONSTRAINT "ck_label_revision_positive" CHECK("label"."revision" > 0)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_label_text_lower` ON `label` (lower("text"));--> statement-breakpoint
CREATE UNIQUE INDEX `uq_label_copy` ON `label` (`copy_id`);--> statement-breakpoint
CREATE TABLE `label_revision` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`label_id` integer NOT NULL,
	`revision_number` integer NOT NULL,
	`category_code` text NOT NULL,
	`author_code` text NOT NULL,
	`subcategory_code` text NOT NULL,
	`copy_number` integer NOT NULL,
	`text` text NOT NULL,
	`change_reason` text,
	FOREIGN KEY (`label_id`) REFERENCES `label`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "ck_label_revision_number_positive" CHECK("label_revision"."revision_number" > 0),
	CONSTRAINT "ck_label_revision_copy_number_positive" CHECK("label_revision"."copy_number" > 0)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_label_revision_number` ON `label_revision` (`label_id`,`revision_number`);--> statement-breakpoint
CREATE TABLE `loan_movement` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`loaned_by_id` integer NOT NULL,
	`loaned_to_id` integer NOT NULL,
	`expires_by` text NOT NULL,
	`notes` text,
	FOREIGN KEY (`loaned_by_id`) REFERENCES `account`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`loaned_to_id`) REFERENCES `visitor`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_loan_movement_visitor` ON `loan_movement` (`loaned_to_id`);--> statement-breakpoint
CREATE TABLE `loan_movement_line` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`movement_id` integer NOT NULL,
	`copy_id` integer NOT NULL,
	`resolved_at` integer,
	`outcome` text,
	FOREIGN KEY (`movement_id`) REFERENCES `loan_movement`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`copy_id`) REFERENCES `copy`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "ck_loan_line_outcome" CHECK("loan_movement_line"."outcome" IN ('returned', 'returned_damaged', 'lost')),
	CONSTRAINT "ck_loan_line_resolved_pair" CHECK(("loan_movement_line"."resolved_at" IS NULL AND "loan_movement_line"."outcome" IS NULL) OR ("loan_movement_line"."resolved_at" IS NOT NULL AND "loan_movement_line"."outcome" IS NOT NULL))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_loan_line_open_copy` ON `loan_movement_line` (`copy_id`) WHERE resolved_at IS NULL;--> statement-breakpoint
CREATE INDEX `idx_loan_line_copy` ON `loan_movement_line` (`copy_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `uq_loan_movement_line` ON `loan_movement_line` (`movement_id`,`copy_id`);--> statement-breakpoint
CREATE TABLE `loan_rule` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`role` text NOT NULL,
	`max_days` integer NOT NULL,
	CONSTRAINT "ck_loan_rule_role" CHECK("loan_rule"."role" IN ('student', 'teacher')),
	CONSTRAINT "ck_loan_rule_max_days_positive" CHECK("loan_rule"."max_days" > 0)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_loan_rule_role` ON `loan_rule` (`role`);--> statement-breakpoint
CREATE TABLE `publisher` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	`name` text NOT NULL,
	`name_key` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_publisher_name_lower` ON `publisher` (lower("name"));--> statement-breakpoint
CREATE UNIQUE INDEX `uq_publisher_name_key` ON `publisher` (`name_key`);--> statement-breakpoint
CREATE TABLE `school_grade` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`grade` integer NOT NULL,
	`level` text NOT NULL,
	CONSTRAINT "ck_school_grade_level" CHECK("school_grade"."level" IN ('primary', 'secondary')),
	CONSTRAINT "ck_school_grade_range" CHECK(("school_grade"."level" = 'primary' AND "school_grade"."grade" BETWEEN 1 AND 6) OR ("school_grade"."level" = 'secondary' AND "school_grade"."grade" BETWEEN 1 AND 5))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_school_grade` ON `school_grade` (`level`,`grade`);--> statement-breakpoint
CREATE TABLE `series` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	`name` text NOT NULL,
	`author_id` integer NOT NULL,
	FOREIGN KEY (`author_id`) REFERENCES `author`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_series_author_name_lower` ON `series` (`author_id`,lower("name"));--> statement-breakpoint
CREATE TABLE `shelf` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`is_default` integer DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_shelf_name_lower` ON `shelf` (lower("name"));--> statement-breakpoint
CREATE UNIQUE INDEX `uq_shelf_single_default` ON `shelf` (`is_default`) WHERE is_default = 1;--> statement-breakpoint
CREATE TABLE `stock_movement` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`type` text NOT NULL,
	`reason` text NOT NULL,
	`signed_by_id` integer NOT NULL,
	`notes` text,
	FOREIGN KEY (`signed_by_id`) REFERENCES `account`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "ck_stock_movement_type" CHECK("stock_movement"."type" IN ('entry', 'exit')),
	CONSTRAINT "ck_stock_movement_reason" CHECK("stock_movement"."reason" IN ('purchase', 'donation', 'loss', 'damage', 'discard', 'other'))
);
--> statement-breakpoint
CREATE TABLE `stock_movement_line` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`movement_id` integer NOT NULL,
	`copy_id` integer NOT NULL,
	FOREIGN KEY (`movement_id`) REFERENCES `stock_movement`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`copy_id`) REFERENCES `copy`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_stock_movement_line_copy` ON `stock_movement_line` (`copy_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `uq_stock_movement_line` ON `stock_movement_line` (`movement_id`,`copy_id`);--> statement-breakpoint
CREATE TABLE `subcategory` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	`name` text NOT NULL,
	`code` text NOT NULL,
	`name_key` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_subcategory_name_lower` ON `subcategory` (lower("name"));--> statement-breakpoint
CREATE UNIQUE INDEX `uq_subcategory_code_lower` ON `subcategory` (lower("code"));--> statement-breakpoint
CREATE UNIQUE INDEX `uq_category_name_key` ON `subcategory` (`name_key`);--> statement-breakpoint
CREATE UNIQUE INDEX `uq_category_code` ON `subcategory` (`code`);--> statement-breakpoint
CREATE TABLE `visitor` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	`name` text NOT NULL,
	`role` text NOT NULL,
	`grade_id` integer,
	`active` integer DEFAULT true NOT NULL,
	FOREIGN KEY (`role`) REFERENCES `loan_rule`(`role`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`grade_id`) REFERENCES `school_grade`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "ck_visitor_role" CHECK("visitor"."role" IN ('student', 'teacher')),
	CONSTRAINT "ck_visitor_grade_by_role" CHECK(("visitor"."role" = 'student' AND "visitor"."grade_id" IS NOT NULL) OR ("visitor"."role" = 'teacher' AND "visitor"."grade_id" IS NULL))
);
--> statement-breakpoint
CREATE INDEX `idx_visitor_grade` ON `visitor` (`grade_id`);
