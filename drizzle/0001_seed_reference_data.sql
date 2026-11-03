INSERT INTO `category` (`name`, `code`) VALUES
  ('Literatura', '800'),
  ('Texto Escolar', '300'),
  ('Consulta', '100');
--> statement-breakpoint
INSERT INTO `subcategory` (`name`, `code`) VALUES
  ('Cuento', 'CUE'),
  ('Poesía', 'POE'),
  ('Historia', 'HIS'),
  ('Ciencias Sociales', 'CSO'),
  ('Lengua y Literatura', 'LEN'),
  ('Ciencias de la Naturaleza', 'CNA'),
  ('Personajes', 'PER'),
  ('Geografía', 'GEO');
  --> statement-breakpoint
INSERT INTO `author` (`first_name`, `last_name`) VALUES
  ('Anónimo', NULL);
--> statement-breakpoint
INSERT INTO `shelf` (`name`, `description`, `is_default`) VALUES
  ('Default', NULL, 1);
--> statement-breakpoint
INSERT INTO `loan_rule` (`role`, `max_days`) VALUES
  ('student', 7),
  ('teacher', 10);
--> statement-breakpoint
INSERT INTO `school_grade` (`grade`, `level`) VALUES
  (1, 'primary'),
  (2, 'primary'),
  (3, 'primary'),
  (4, 'primary'),
  (5, 'primary'),
  (6, 'primary'),
  (1, 'secondary'),
  (2, 'secondary'),
  (3, 'secondary'),
  (4, 'secondary'),
  (5, 'secondary');
