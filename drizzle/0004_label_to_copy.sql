DROP TABLE `label_revision`;--> statement-breakpoint
DROP TABLE `label`;--> statement-breakpoint
ALTER TABLE `author` ADD `code` text;--> statement-breakpoint
ALTER TABLE `book` ADD `title_code` text;--> statement-breakpoint
ALTER TABLE `book` ADD `omit_words` text DEFAULT '[]' NOT NULL;--> statement-breakpoint
ALTER TABLE `copy` ADD `labeled_text` text;--> statement-breakpoint
ALTER TABLE `copy` ADD `labeled_at` integer;--> statement-breakpoint
ALTER TABLE `copy` ADD `labeled_by_id` integer REFERENCES account(id);--> statement-breakpoint
CREATE UNIQUE INDEX `uq_copy_labeled_text` ON `copy` (`labeled_text`) WHERE labeled_text IS NOT NULL AND status NOT IN ('lost', 'discarded');--> statement-breakpoint
-- El autor protegido sembrado en 0001 no pasa por el service, así que su código va aquí.
UPDATE `author` SET `code` = 'ANO' WHERE `name_key` = 'anonimo' AND `is_protected` = 1;
