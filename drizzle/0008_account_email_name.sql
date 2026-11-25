PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_account` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	`email` text NOT NULL,
	`name` text NOT NULL,
	`password_hash` text NOT NULL,
	`role` text DEFAULT 'staff' NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	CONSTRAINT "ck_account_role" CHECK("__new_account"."role" IN ('owner', 'admin', 'staff'))
);
--> statement-breakpoint
INSERT INTO `__new_account`("id", "created_at", "updated_at", "email", "name", "password_hash", "role", "active") SELECT "id", "created_at", "updated_at", CASE WHEN "username" LIKE '%@%' THEN lower("username") ELSE lower("username") || '@biblioteca.local' END, "username", "password_hash", "role", "active" FROM `account`;--> statement-breakpoint
DROP TABLE `account`;--> statement-breakpoint
ALTER TABLE `__new_account` RENAME TO `account`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `uq_account_email_lower` ON `account` (lower("email"));--> statement-breakpoint
CREATE UNIQUE INDEX `uq_account_single_owner` ON `account` (`role`) WHERE role = 'owner';
