import { sql, type SQL } from "drizzle-orm";
import {
  check,
  foreignKey,
  index,
  integer,
  primaryKey,
  sqliteTable,
  text,
  unique,
  uniqueIndex,
  type AnySQLiteColumn,
} from "drizzle-orm/sqlite-core";

// Helpers
const lower = (col: AnySQLiteColumn): SQL => sql`lower(${col})`;

const oneOf = (col: AnySQLiteColumn, values: readonly string[]): SQL =>
  sql`${col} IN (${sql.raw(values.map((v) => `'${v}'`).join(", "))})`;

const createdAt = integer("created_at", { mode: "timestamp" })
  .notNull()
  .default(sql`(unixepoch())`);

const timestamps = {
  createdAt,
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`)
    .$onUpdate(() => new Date()),
};

export const COLLABORATOR_ROLES = [
  "writer",
  "illustrator",
  "translator",
] as const;
export const ACCOUNT_ROLES = ["owner", "admin", "staff"] as const;
export const COPY_STATUSES = [
  "available",
  "on_loan",
  "lost",
  "discarded",
  "damaged",
] as const;
export const MOVEMENT_TYPES = ["entry", "exit"] as const;
export const ENTRY_REASONS = ["purchase", "donation", "other"] as const;
export const EXIT_REASONS = ["loss", "damage", "discard"] as const;
export const MOVEMENT_REASONS = [
  "purchase",
  "donation",
  "loss",
  "damage",
  "discard",
  "other",
] as const;
export const GRADE_LEVELS = ["primary", "secondary"] as const;
export const VISITOR_ROLES = ["student", "teacher"] as const;
export const LINE_OUTCOMES = ["returned", "returned_damaged", "lost"] as const;

// Catalog
export const author = sqliteTable(
  "author",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    ...timestamps,
    firstName: text("first_name").notNull(),
    lastName: text("last_name"),
    nameKey: text("name_key").notNull(),
    // Código de 3 letras para el tejuelo, calculado por el service al crear o
    // editar. Null si el nombre no tiene letras ni dígitos.
    code: text("code"),
    isProtected: integer("is_protected", { mode: "boolean" })
      .notNull()
      .default(false),
  },
  (t) => [uniqueIndex("uq_author_name_key").on(t.nameKey)],
);

export const publisher = sqliteTable(
  "publisher",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    ...timestamps,
    name: text("name").notNull(),
    nameKey: text("name_key").notNull(),
  },
  (t) => [uniqueIndex("uq_publisher_name_key").on(t.nameKey)],
);

export const collection = sqliteTable(
  "collection",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    ...timestamps,
    name: text("name").notNull(),
    nameKey: text("name_key").notNull(),
    publisherId: integer("publisher_id")
      .notNull()
      .references(() => publisher.id),
  },
  (t) => [
    unique("uq_collection_publisher_id").on(t.publisherId, t.id),
    uniqueIndex("uq_collection_publisher_name_key").on(
      t.publisherId,
      t.nameKey,
    ),
  ],
);

export const series = sqliteTable(
  "series",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    ...timestamps,
    name: text("name").notNull(),
    nameKey: text("name_key").notNull(),
    authorId: integer("author_id")
      .notNull()
      .references(() => author.id),
  },
  (t) => [uniqueIndex("uq_series_author_name_key").on(t.authorId, t.nameKey)],
);

export const category = sqliteTable(
  "category",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    ...timestamps,
    name: text("name").notNull(),
    code: text("code").notNull(),
    nameKey: text("name_key").notNull(),
  },
  (t) => [
    uniqueIndex("uq_category_name_key").on(t.nameKey),
    uniqueIndex("uq_category_code").on(t.code),
  ],
);

export const subcategory = sqliteTable(
  "subcategory",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    ...timestamps,
    name: text("name").notNull(),
    code: text("code").notNull(),
    nameKey: text("name_key").notNull(),
  },
  (t) => [
    uniqueIndex("uq_subcategory_name_key").on(t.nameKey),
    uniqueIndex("uq_subcategory_code").on(t.code),
  ],
);

export const book = sqliteTable(
  "book",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    ...timestamps,
    title: text("title").notNull(),
    titleKey: text("title_key").notNull(),
    publisherId: integer("publisher_id").references(() => publisher.id),
    collectionId: integer("collection_id"),
    seriesId: integer("series_id").references(() => series.id),
    categoryId: integer("category_id").references(() => category.id),
    subcategoryId: integer("subcategory_id").references(() => subcategory.id),
    publicationYear: integer("publication_year"),
    pageCount: integer("page_count"),
    active: integer("active", { mode: "boolean" }).notNull().default(true),
    // Se calculan al guardar el libro (ver catalog/_shared/codes.ts): el
    // código del título sale de `title` sin las `omitWords`, que se guardan
    // para que quien edite sepa qué palabras se evitan.
    titleCode: text("title_code"),
    omitWords: text("omit_words", { mode: "json" })
      .$type<string[]>()
      .notNull()
      .default(sql`'[]'`),
  },
  (t) => [
    foreignKey({
      name: "fk_book_collection_publisher",
      columns: [t.publisherId, t.collectionId],
      foreignColumns: [collection.publisherId, collection.id],
    }),
    check("ck_book_page_count", sql`${t.pageCount} > 0`),
    check(
      "ck_book_collection_requires_publisher",
      sql`${t.collectionId} IS NULL OR ${t.publisherId} IS NOT NULL`,
    ),
    index("idx_book_publisher").on(t.publisherId),
    index("idx_book_collection").on(t.collectionId),
    index("idx_book_series").on(t.seriesId),
    index("idx_book_category").on(t.categoryId),
    index("idx_book_subcategory").on(t.subcategoryId),
  ],
);

export const bookCollaborator = sqliteTable(
  "book_collaborator",
  {
    bookId: integer("book_id")
      .notNull()
      .references(() => book.id, { onDelete: "cascade" }),
    collaboratorId: integer("collaborator_id")
      .notNull()
      .references(() => author.id),
    role: text("role", { enum: COLLABORATOR_ROLES }).notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.bookId, t.collaboratorId, t.role] }),
    check("ck_book_collaborator_role", oneOf(t.role, COLLABORATOR_ROLES)),
    index("idx_book_collaborator_author").on(t.collaboratorId),
  ],
);

// Accounts
export const account = sqliteTable(
  "account",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    ...timestamps,
    username: text("username").notNull(),
    passwordHash: text("password_hash").notNull(),
    role: text("role", { enum: ACCOUNT_ROLES }).notNull().default("staff"),
    active: integer("active", { mode: "boolean" }).notNull().default(true),
  },
  (t) => [
    check("ck_account_role", oneOf(t.role, ACCOUNT_ROLES)),
    uniqueIndex("uq_account_username_lower").on(lower(t.username)),
    uniqueIndex("uq_account_single_owner")
      .on(t.role)
      .where(sql`role = 'owner'`),
  ],
);

// Inventory
export const shelf = sqliteTable(
  "shelf",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    ...timestamps,
    name: text("name").notNull(),
    nameKey: text("name_key").notNull(),
    description: text("description"),
    isDefault: integer("is_default", { mode: "boolean" })
      .notNull()
      .default(false),
  },
  (t) => [
    uniqueIndex("uq_shelf_name_key").on(t.nameKey),
    uniqueIndex("uq_shelf_single_default")
      .on(t.isDefault)
      .where(sql`is_default = 1`),
  ],
);

export const copy = sqliteTable(
  "copy",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    ...timestamps,
    bookId: integer("book_id")
      .notNull()
      .references(() => book.id),
    shelfId: integer("shelf_id")
      .notNull()
      .references(() => shelf.id),
    copyNumber: integer("copy_number").notNull(),
    status: text("status", { enum: COPY_STATUSES })
      .notNull()
      .default("available"),
    notes: text("notes"),
    // Tejuelo ya pegado en el libro físico. Mientras sea null el tejuelo se
    // deriva en vivo del libro (ver inventory/copy/sql.ts); al etiquetar, el
    // sistema guarda el texto impreso y deja de cambiar. Los tres campos
    // `labeled*` van siempre juntos.
    labeledText: text("labeled_text"),
    labeledAt: integer("labeled_at", { mode: "timestamp" }),
    labeledById: integer("labeled_by_id").references(() => account.id),
  },
  (t) => [
    check("ck_copy_status", oneOf(t.status, COPY_STATUSES)),
    check("ck_copy_number_positive", sql`${t.copyNumber} > 0`),
    uniqueIndex("uq_copy_book_number")
      .on(t.bookId, t.copyNumber)
      .where(sql`status NOT IN ('lost', 'discarded')`),
    uniqueIndex("uq_copy_labeled_text")
      .on(t.labeledText)
      .where(sql`labeled_text IS NOT NULL AND status NOT IN ('lost', 'discarded')`),
    index("idx_copy_book").on(t.bookId),
    index("idx_copy_shelf").on(t.shelfId),
  ],
);

export const stockMovement = sqliteTable(
  "stock_movement",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    createdAt,
    type: text("type", { enum: MOVEMENT_TYPES }).notNull(),
    reason: text("reason", { enum: MOVEMENT_REASONS }).notNull(),
    signedById: integer("signed_by_id")
      .notNull()
      .references(() => account.id),
    notes: text("notes"),
  },
  (t) => [
    check(
      "ck_stock_movement_type_reason",
      sql`(${t.type} = 'entry' AND ${oneOf(t.reason, ENTRY_REASONS)}) OR (${t.type} = 'exit' AND ${oneOf(t.reason, EXIT_REASONS)})`,
    ),
  ],
);

export const stockMovementLine = sqliteTable(
  "stock_movement_line",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    createdAt,
    movementId: integer("movement_id")
      .notNull()
      .references(() => stockMovement.id),
    copyId: integer("copy_id")
      .notNull()
      .references(() => copy.id),
    loanLineId: integer("loan_line_id").references(() => loanMovementLine.id),
  },
  (t) => [
    unique("uq_stock_movement_line").on(t.movementId, t.copyId),
    unique("uq_stock_movement_line_loan_line").on(t.loanLineId),
    index("idx_stock_movement_line_copy").on(t.copyId),
  ],
);

// Loans

export const loanRule = sqliteTable(
  "loan_rule",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    role: text("role", { enum: VISITOR_ROLES }).notNull(),
    maxDays: integer("max_days").notNull(),
  },
  (t) => [
    unique("uq_loan_rule_role").on(t.role),
    check("ck_loan_rule_role", oneOf(t.role, VISITOR_ROLES)),
    check("ck_loan_rule_max_days_positive", sql`${t.maxDays} > 0`),
  ],
);

export const schoolGrade = sqliteTable(
  "school_grade",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    grade: integer("grade").notNull(),
    level: text("level", { enum: GRADE_LEVELS }).notNull(),
  },
  (t) => [
    unique("uq_school_grade").on(t.level, t.grade),
    check("ck_school_grade_level", oneOf(t.level, GRADE_LEVELS)),
    check(
      "ck_school_grade_range",
      sql`(${t.level} = 'primary' AND ${t.grade} BETWEEN 1 AND 6) OR (${t.level} = 'secondary' AND ${t.grade} BETWEEN 1 AND 5)`,
    ),
  ],
);
export const visitor = sqliteTable(
  "visitor",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    ...timestamps,
    name: text("name").notNull(),
    nameKey: text("name_key").notNull(),
    role: text("role", { enum: VISITOR_ROLES })
      .notNull()
      .references(() => loanRule.role),
    gradeId: integer("grade_id").references(() => schoolGrade.id),
    active: integer("active", { mode: "boolean" }).notNull().default(true),
  },
  (t) => [
    uniqueIndex("uq_visitor_name_key").on(t.nameKey),
    check("ck_visitor_role", oneOf(t.role, VISITOR_ROLES)),
    check(
      "ck_visitor_grade_by_role",
      sql`(${t.role} = 'student' AND ${t.gradeId} IS NOT NULL) OR (${t.role} = 'teacher' AND ${t.gradeId} IS NULL)`,
    ),
    index("idx_visitor_grade").on(t.gradeId),
  ],
);

export const loanMovement = sqliteTable(
  "loan_movement",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    createdAt,
    loanedById: integer("loaned_by_id")
      .notNull()
      .references(() => account.id),
    loanedToId: integer("loaned_to_id")
      .notNull()
      .references(() => visitor.id),
    expiresBy: text("expires_by").notNull(),
    notes: text("notes"),
  },
  (t) => [index("idx_loan_movement_visitor").on(t.loanedToId)],
);

export const loanMovementLine = sqliteTable(
  "loan_movement_line",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    createdAt,
    movementId: integer("movement_id")
      .notNull()
      .references(() => loanMovement.id),
    copyId: integer("copy_id")
      .notNull()
      .references(() => copy.id),
    resolvedAt: integer("resolved_at", { mode: "timestamp" }),
    resolvedById: integer("resolved_by_id").references(() => account.id),
    outcome: text("outcome", { enum: LINE_OUTCOMES }),
  },
  (t) => [
    unique("uq_loan_movement_line").on(t.movementId, t.copyId),
    uniqueIndex("uq_loan_line_open_copy")
      .on(t.copyId)
      .where(sql`resolved_at IS NULL`),
    check("ck_loan_line_outcome", oneOf(t.outcome, LINE_OUTCOMES)),
    check(
      "ck_loan_line_resolved_pair",
      sql`(${t.resolvedAt} IS NULL AND ${t.outcome} IS NULL) OR (${t.resolvedAt} IS NOT NULL AND ${t.outcome} IS NOT NULL)`,
    ),
    index("idx_loan_line_copy").on(t.copyId),
  ],
);
