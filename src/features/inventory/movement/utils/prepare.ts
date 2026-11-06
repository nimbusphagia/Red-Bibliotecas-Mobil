import { db } from "@/db/client";
import { NotFoundError, ValidationError } from "@/errors/errors";
import { IncompleteBookError } from "@/errors/errors";
import { getAuthor } from "@/features/catalog/author/service";
import { getBook, prepareBook } from "@/features/catalog/book/service";
import type { BookCollaborator, NewBook } from "@/features/catalog/book/types";
import { getCategory } from "@/features/catalog/category/service";
import { getSeries } from "@/features/catalog/series/service";
import { getSubcategory } from "@/features/catalog/subcategory/service";
import { authorCode } from "../../label/utils/labelText";
import {
  findDefaultShelfSync,
  findShelfByIdSync,
} from "../../shelf/repository";
import type { EntryLineParsed } from "../schemas";

export type LineSource =
  | { kind: "existing"; bookId: number }
  | { kind: "new"; values: NewBook; collaborators: BookCollaborator[] };

export type PreparedLine = {
  lineIndex: number;
  quantity: number;
  shelfId: number;
  omitWords: string[];
  title: string;
  source: LineSource;
  categoryCode: string;
  subcategoryCode: string;
  authorCode: string;
  series: { id: number; name: string } | null;
};

type BookFacts = {
  title: string;
  categoryId: number | null;
  subcategoryId: number | null;
  seriesId: number | null;
  writer: { firstName: string; lastName: string | null } | null;
};

async function labelCodes(lineIndex: number, f: BookFacts) {
  const code = f.writer
    ? authorCode(f.writer.firstName, f.writer.lastName)
    : null;
  const { categoryId, subcategoryId } = f;

  if (categoryId === null || subcategoryId === null || code === null) {
    const missing = [
      categoryId === null && "a category",
      subcategoryId === null && "a subcategory",
      code === null && "a writer with a usable name",
    ].filter((m): m is string => m !== false);
    throw new IncompleteBookError(lineIndex, missing);
  }

  const [category, subcategory, series] = await Promise.all([
    getCategory(categoryId),
    getSubcategory(subcategoryId),
    f.seriesId === null ? null : getSeries(f.seriesId),
  ]);
  return {
    categoryCode: category.code,
    subcategoryCode: subcategory.code,
    authorCode: code,
    series: series ? { id: series.id, name: series.name } : null,
  };
}

async function shelfFor(
  line: EntryLineParsed,
  movementShelfId: number | undefined,
): Promise<number> {
  const id = line.shelfId ?? movementShelfId;
  const found =
    id === undefined ? findDefaultShelfSync(db) : findShelfByIdSync(db, id);
  if (!found) throw new NotFoundError("shelf", id ?? "default");
  return found.id;
}

async function factsFor(
  lineIndex: number,
  line: EntryLineParsed,
): Promise<{ source: LineSource; facts: BookFacts }> {
  if (line.kind === "existing") {
    const b = await getBook(line.bookId);
    if (!b.active) {
      throw new ValidationError([
        { path: `lines.${lineIndex}.bookId`, message: "The book is inactive" },
      ]);
    }
    const writer = b.collaborators.find((c) => c.role === "writer") ?? null;
    return {
      source: { kind: "existing", bookId: b.id },
      facts: { ...b, writer },
    };
  }

  const prepared = await prepareBook(line.book);
  const writerIds = new Set(
    prepared.collaborators
      .filter((c) => c.role === "writer")
      .map((c) => c.authorId),
  );
  const writers = await Promise.all([...writerIds].map(getAuthor));
  writers.sort((a, b) =>
    a.nameKey < b.nameKey ? -1 : a.nameKey > b.nameKey ? 1 : 0,
  );
  return {
    source: { kind: "new", ...prepared },
    facts: { ...prepared.values, writer: writers[0] ?? null },
  };
}

export async function prepareLines(
  lines: EntryLineParsed[],
  movementShelfId: number | undefined,
): Promise<PreparedLine[]> {
  const out: PreparedLine[] = [];
  for (const [lineIndex, line] of lines.entries()) {
    const { source, facts } = await factsFor(lineIndex, line);
    out.push({
      lineIndex,
      quantity: line.quantity,
      shelfId: await shelfFor(line, movementShelfId),
      omitWords: line.omitWords,
      title: facts.title,
      source,
      ...(await labelCodes(lineIndex, facts)),
    });
  }
  return out;
}
