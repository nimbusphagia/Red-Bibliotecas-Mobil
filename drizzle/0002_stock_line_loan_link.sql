PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_stock_movement` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`type` text NOT NULL,
	`reason` text NOT NULL,
	`signed_by_id` integer NOT NULL,
	`notes` text,
	FOREIGN KEY (`signed_by_id`) REFERENCES `account`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "ck_stock_movement_type_reason" CHECK(("__new_stock_movement"."type" = 'entry' AND "__new_stock_movement"."reason" IN ('purchase', 'donation', 'other')) OR ("__new_stock_movement"."type" = 'exit' AND "__new_stock_movement"."reason" IN ('loss', 'damage', 'discard')))
);
--> statement-breakpoint
INSERT INTO `__new_stock_movement`("id", "created_at", "type", "reason", "signed_by_id", "notes") SELECT "id", "created_at", "type", "reason", "signed_by_id", "notes" FROM `stock_movement`;--> statement-breakpoint
DROP TABLE `stock_movement`;--> statement-breakpoint
ALTER TABLE `__new_stock_movement` RENAME TO `stock_movement`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
ALTER TABLE `stock_movement_line` ADD `loan_line_id` integer REFERENCES loan_movement_line(id);--> statement-breakpoint
CREATE UNIQUE INDEX `uq_stock_movement_line_loan_line` ON `stock_movement_line` (`loan_line_id`);