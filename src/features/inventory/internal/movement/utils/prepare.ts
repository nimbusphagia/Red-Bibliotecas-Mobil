import { db } from "@/db/client";
import { getAuthor } from "@/features/catalog/internal/author/service";
import { getBook, prepareBook } from "@/features/catalog/internal/book/service";
import type {
  BookCollaborator,
  NewBook,
} from "@/features/catalog/internal/book/types";
import {
  IncompleteBookError,
  NotFoundError,
  ValidationError,
} from "@/features/shared/errors/errors";
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
  title: string;
  titleCode: string;
  source: LineSource;
};

type BookFacts = {
  title: string;
  titleCode: string | null;
  categoryId: number | null;
  subcategoryId: number | null;
  writerCode: string | null;
};

/** Un ejemplar sin tejuelo completo no se puede registrar. */
function assertLabelable(lineIndex: number, f: BookFacts): void {
  const missing = [
    f.categoryId === null && "a category",
    f.subcategoryId === null && "a subcategory",
    f.writerCode === null && "a writer with a usable name",
    f.titleCode === null && "a title with letters or digits",
  ].filter((m): m is string => m !== false);
  if (missing.length > 0) throw new IncompleteBookError(lineIndex, missing);
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
        {
          path: `lines.${lineIndex}.bookId`,
          message: "El libro está inactivo",
        },
      ]);
    }
    const writer = b.collaborators.find((c) => c.role === "writer");
    const writerCode = writer ? (await getAuthor(writer.authorId)).code : null;
    return {
      source: { kind: "existing", bookId: b.id },
      facts: { ...b, writerCode },
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
    facts: { ...prepared.values, writerCode: writers[0]?.code ?? null },
  };
}

export async function prepareLines(
  lines: EntryLineParsed[],
  movementShelfId: number | undefined,
): Promise<PreparedLine[]> {
  const out: PreparedLine[] = [];
  for (const [lineIndex, line] of lines.entries()) {
    const { source, facts } = await factsFor(lineIndex, line);
    assertLabelable(lineIndex, facts);
    out.push({
      lineIndex,
      quantity: line.quantity,
      shelfId: await shelfFor(line, movementShelfId),
      title: facts.title,
      titleCode: facts.titleCode!,
      source,
    });
  }
  return out;
}
