import type { ImportColumn } from "./columns";
import type { SheetProblem } from "./sheet";

export type ProblemCode =
  | "missing"
  | "too_long"
  | "bad_number"
  | "out_of_range"
  | "bad_person"
  | "title_unusable"
  | "writer_unusable"
  | "too_many_words"
  | "unknown_category"
  | "unknown_subcategory"
  | "unknown_shelf"
  | "collection_without_publisher"
  | "book_exists"
  | "duplicate_in_file"
  | "label_conflict"
  | "label_conflict_in_file";

export type RowProblem = {
  column: ImportColumn;
  code: ProblemCode;
  /** Texto o número de fila al que se refiere el problema. */
  detail?: string;
};

/** Algo del catálogo: `id` es null si no existe y se creará al confirmar. */
export type Ref = { key: string; name: string; id: number | null };
export type PersonRef = Ref & { firstName: string; lastName: string | null };

export type ImportRowPlan = {
  row: number;
  title: string;
  writers: PersonRef[];
  illustrators: PersonRef[];
  translators: PersonRef[];
  publisher: Ref | null;
  collection: (Ref & { publisherKey: string }) | null;
  series: (Ref & { authorKey: string }) | null;
  categoryId: number | null;
  subcategoryId: number | null;
  year: number | null;
  pages: number | null;
  omitWords: string[];
  quantity: number;
  shelfId: number | null;
  problems: RowProblem[];
};

/** Lo que falta en el catálogo para las filas sin problemas. */
export type ToCreate = {
  authors: PersonRef[];
  publishers: Ref[];
  collections: (Ref & { publisherKey: string })[];
  series: (Ref & { authorKey: string })[];
};

export type ImportPlan = {
  rows: ImportRowPlan[];
  toCreate: ToCreate;
  ignoredColumns: string[];
  problem?: SheetProblem;
};
