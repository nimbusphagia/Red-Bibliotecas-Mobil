-- Custom SQL migration file, put your code below! --
INSERT INTO `category` (`name`, `name_key`, `code`) VALUES
  ('Literatura', 'literatura', '800'),
  ('Texto Escolar', 'texto escolar', '300'),
  ('Consulta', 'consulta', '100');
--> statement-breakpoint
INSERT INTO `subcategory` (`name`, `name_key`, `code`) VALUES
  ('Cuento', 'cuento', 'CUE'),
  ('Poesía', 'poesia', 'POE'),
  ('Historia', 'historia', 'HIS'),
  ('Ciencias Sociales', 'ciencias sociales', 'CSO'),
  ('Lengua y Literatura', 'lengua y literatura', 'LEN'),
  ('Ciencias de la Naturaleza', 'ciencias de la naturaleza', 'CNA'),
  ('Personajes', 'personajes', 'PER'),
  ('Geografía', 'geografia', 'GEO');
--> statement-breakpoint
INSERT INTO `author` (`first_name`, `last_name`, `name_key`, `is_protected`) VALUES
  ('Anónimo', NULL, 'anonimo', 1);
--> statement-breakpoint
INSERT INTO `shelf` (`name`, `description`, `is_default`) VALUES
  ('Default', 'Guarda los libros que no tienen un estante asignado', 1);
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
