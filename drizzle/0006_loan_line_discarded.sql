PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_loan_movement_line` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`movement_id` integer NOT NULL,
	`copy_id` integer NOT NULL,
	`resolved_at` integer,
	`resolved_by_id` integer,
	`outcome` text,
	FOREIGN KEY (`movement_id`) REFERENCES `loan_movement`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`copy_id`) REFERENCES `copy`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`resolved_by_id`) REFERENCES `account`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "ck_loan_line_outcome" CHECK("__new_loan_movement_line"."outcome" IN ('returned', 'returned_damaged', 'discarded', 'lost')),
	CONSTRAINT "ck_loan_line_resolved_pair" CHECK(("__new_loan_movement_line"."resolved_at" IS NULL AND "__new_loan_movement_line"."outcome" IS NULL) OR ("__new_loan_movement_line"."resolved_at" IS NOT NULL AND "__new_loan_movement_line"."outcome" IS NOT NULL))
);
--> statement-breakpoint
INSERT INTO `__new_loan_movement_line`("id", "created_at", "movement_id", "copy_id", "resolved_at", "resolved_by_id", "outcome") SELECT "id", "created_at", "movement_id", "copy_id", "resolved_at", "resolved_by_id", "outcome" FROM `loan_movement_line`;--> statement-breakpoint
DROP TABLE `loan_movement_line`;--> statement-breakpoint
ALTER TABLE `__new_loan_movement_line` RENAME TO `loan_movement_line`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `uq_loan_line_open_copy` ON `loan_movement_line` (`copy_id`) WHERE resolved_at IS NULL;--> statement-breakpoint
CREATE INDEX `idx_loan_line_copy` ON `loan_movement_line` (`copy_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `uq_loan_movement_line` ON `loan_movement_line` (`movement_id`,`copy_id`);--> statement-breakpoint
-- Los irreparables se resolvían como `lost`; su salida de stock dice que fue un descarte.
UPDATE `loan_movement_line` SET `outcome` = 'discarded' WHERE `outcome` = 'lost' AND `id` IN (SELECT sml.`loan_line_id` FROM `stock_movement_line` sml INNER JOIN `stock_movement` sm ON sm.`id` = sml.`movement_id` WHERE sm.`reason` = 'discard');
