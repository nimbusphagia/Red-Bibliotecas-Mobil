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
export const PRINT_STATUSES = ["pending_print", "printed"] as const;
export const MOVEMENT_TYPES = ["entry", "exit"] as const;
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
  (t) => [
    uniqueIndex("uq_publisher_name_lower").on(lower(t.name)),
    uniqueIndex("uq_publisher_name_key").on(t.nameKey),
  ],
);

export const collection = sqliteTable(
  "collection",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    ...timestamps,
    name: text("name").notNull(),
    publisherId: integer("publisher_id")
      .notNull()
      .references(() => publisher.id),
  },
  (t) => [
    unique("uq_collection_publisher_id").on(t.publisherId, t.id),
    uniqueIndex("uq_collection_publisher_name_lower").on(
      t.publisherId,
      lower(t.name),
    ),
  ],
);

export const series = sqliteTable(
  "series",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    ...timestamps,
    name: text("name").notNull(),
    authorId: integer("author_id")
      .notNull()
      .references(() => author.id),
  },
  (t) => [
    uniqueIndex("uq_series_author_name_lower").on(t.authorId, lower(t.name)),
  ],
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
    uniqueIndex("uq_category_name_lower").on(lower(t.name)),
    uniqueIndex("uq_category_code_lower").on(lower(t.code)),
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
    uniqueIndex("uq_subcategory_name_lower").on(lower(t.name)),
    uniqueIndex("uq_subcategory_code_lower").on(lower(t.code)),
    uniqueIndex("uq_category_name_key").on(t.nameKey),
    uniqueIndex("uq_category_code").on(t.code),
  ],
);

export const book = sqliteTable(
  "book",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    ...timestamps,
    title: text("title").notNull(),
    publisherId: integer("publisher_id").references(() => publisher.id),
    collectionId: integer("collection_id"),
    seriesId: integer("series_id").references(() => series.id),
    categoryId: integer("category_id").references(() => category.id),
    subcategoryId: integer("subcategory_id").references(() => subcategory.id),
    publicationYear: integer("publication_year"),
    pageCount: integer("page_count"),
    active: integer("active", { mode: "boolean" }).notNull().default(true),
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
    description: text("description"),
    isDefault: integer("is_default", { mode: "boolean" })
      .notNull()
      .default(false),
  },
  (t) => [
    uniqueIndex("uq_shelf_name_lower").on(lower(t.name)),
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
    code: text("code").notNull(),
    status: text("status", { enum: COPY_STATUSES })
      .notNull()
      .default("available"),
    notes: text("notes"),
  },
  (t) => [
    check("ck_copy_status", oneOf(t.status, COPY_STATUSES)),
    uniqueIndex("uq_copy_code_lower").on(lower(t.code)),
    index("idx_copy_book").on(t.bookId),
    index("idx_copy_shelf").on(t.shelfId),
  ],
);

export const label = sqliteTable(
  "label",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    ...timestamps,
    copyId: integer("copy_id")
      .notNull()
      .references(() => copy.id),
    categoryCode: text("category_code").notNull(),
    authorCode: text("author_code").notNull(),
    subcategoryCode: text("subcategory_code").notNull(),
    copyNumber: integer("copy_number").notNull(),
    text: text("text").notNull(),
    printStatus: text("print_status", { enum: PRINT_STATUSES })
      .notNull()
      .default("pending_print"),
    printedAt: integer("printed_at", { mode: "timestamp" }),
    revision: integer("revision").notNull().default(1),
  },
  (t) => [
    unique("uq_label_copy").on(t.copyId),
    uniqueIndex("uq_label_text_lower").on(lower(t.text)),
    check("ck_label_print_status", oneOf(t.printStatus, PRINT_STATUSES)),
    check("ck_label_copy_number_positive", sql`${t.copyNumber} > 0`),
    check("ck_label_revision_positive", sql`${t.revision} > 0`),
  ],
);

export const labelRevision = sqliteTable(
  "label_revision",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    createdAt,
    labelId: integer("label_id")
      .notNull()
      .references(() => label.id, { onDelete: "cascade" }),
    revisionNumber: integer("revision_number").notNull(),
    categoryCode: text("category_code").notNull(),
    authorCode: text("author_code").notNull(),
    subcategoryCode: text("subcategory_code").notNull(),
    copyNumber: integer("copy_number").notNull(),
    text: text("text").notNull(),
    changeReason: text("change_reason"),
  },
  (t) => [
    unique("uq_label_revision_number").on(t.labelId, t.revisionNumber),
    check("ck_label_revision_number_positive", sql`${t.revisionNumber} > 0`),
    check("ck_label_revision_copy_number_positive", sql`${t.copyNumber} > 0`),
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
    check("ck_stock_movement_type", oneOf(t.type, MOVEMENT_TYPES)),
    check("ck_stock_movement_reason", oneOf(t.reason, MOVEMENT_REASONS)),
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
  },
  (t) => [
    unique("uq_stock_movement_line").on(t.movementId, t.copyId),
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
    role: text("role", { enum: VISITOR_ROLES })
      .notNull()
      .references(() => loanRule.role),
    gradeId: integer("grade_id").references(() => schoolGrade.id),
    active: integer("active", { mode: "boolean" }).notNull().default(true),
  },
  (t) => [
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
