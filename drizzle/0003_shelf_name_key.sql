ALTER TABLE `shelf` ADD `name_key` text DEFAULT '' NOT NULL;--> statement-breakpoint
UPDATE `shelf` SET `name_key` = lower(
  replace(replace(replace(replace(replace(replace(replace(
  replace(replace(replace(replace(replace(replace(replace(`name`,
  'á','a'),'é','e'),'í','i'),'ó','o'),'ú','u'),'ü','u'),'ñ','n'),
  'Á','A'),'É','E'),'Í','I'),'Ó','O'),'Ú','U'),'Ü','U'),'Ñ','N')
);--> statement-breakpoint
DROP INDEX `uq_shelf_name_lower`;--> statement-breakpoint
CREATE UNIQUE INDEX `uq_shelf_name_key` ON `shelf` (`name_key`);
