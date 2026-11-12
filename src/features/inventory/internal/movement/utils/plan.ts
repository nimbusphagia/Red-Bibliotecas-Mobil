import type { Executor } from "@/db/transaction";
import {
  IncompleteBookError,
  LabelConflictError,
  ValidationError,
} from "@/features/shared/errors/errors";
import { activeCopyNumbersSync } from "../../copy/repository";
import { nextFreeNumbers } from "../../copy/utils/numbering";
import {
  findActiveLabelOwnerSync,
  findBookTitleCodeSync,
} from "../../label/repository";
import { buildLabelText } from "../../label/utils/labelText";
import { titleCode } from "../../label/utils/titleCode";
import type { LabelPreview, TitleCodeSource } from "../types";
import type { PreparedLine } from "./prepare";

export type Claim = {
  bookId: number | null;
  title: string;
  seriesId: number | null;
};
export type Claims = Map<string, Claim>;

export type Conflict = { text: string; owner: Claim };

export type LinePlan = {
  titleCode: string;
  source: TitleCodeSource;
  numbers: number[];
  texts: string[];
  conflict: Conflict | null;
};

const key = (text: string) => text.toLowerCase();

function resolveTitleCode(
  ex: Executor,
  line: PreparedLine,
  bookId: number | null,
): { code: string; source: TitleCodeSource } {
  const existing = bookId === null ? null : findBookTitleCodeSync(ex, bookId);
  if (existing !== null) {
    if (line.omitWords.length > 0) {
      throw new ValidationError([
        {
          path: `lines.${line.lineIndex}.omitWords`,
          message: `The title code is already fixed as ${existing}`,
        },
      ]);
    }
    return { code: existing, source: "existing" };
  }

  const code = titleCode(line.title, line.omitWords);
  if (code === null) {
    throw new IncompleteBookError(line.lineIndex, [
      "a title with letters or digits",
    ]);
  }
  return { code, source: "generated" };
}

export function planLine(
  ex: Executor,
  line: PreparedLine,
  bookId: number | null,
  claims: Claims,
): LinePlan {
  const { code, source } = resolveTitleCode(ex, line, bookId);
  const taken = bookId === null ? [] : activeCopyNumbersSync(ex, bookId);
  const numbers = nextFreeNumbers(taken, line.quantity);
  const texts = numbers.map((copyNumber) =>
    buildLabelText({
      categoryCode: line.categoryCode,
      authorCode: line.authorCode,
      subcategoryCode: line.subcategoryCode,
      titleCode: code,
      copyNumber,
    }),
  );

  let conflict: Conflict | null = null;
  for (const text of texts) {
    const owner = claims.get(key(text)) ?? findActiveLabelOwnerSync(ex, text);
    if (owner) {
      conflict = { text, owner };
      break;
    }
  }
  return { titleCode: code, source, numbers, texts, conflict };
}

export function claimTexts(
  claims: Claims,
  line: PreparedLine,
  bookId: number | null,
  texts: string[],
): void {
  const owner: Claim = {
    bookId,
    title: line.title,
    seriesId: line.series?.id ?? null,
  };
  for (const text of texts) claims.set(key(text), owner);
}

export function toConflictError(
  line: PreparedLine,
  c: Conflict,
): LabelConflictError {
  const sameSeries =
    line.series !== null && c.owner.seriesId === line.series.id;
  return new LabelConflictError({
    lineIndex: line.lineIndex,
    labelText: c.text,
    conflictingBook: { id: c.owner.bookId, title: c.owner.title },
    sameSeries,
    suggestedOmitWords:
      sameSeries && line.series ? [line.series.name] : undefined,
  });
}

export function previewLines(
  ex: Executor,
  lines: PreparedLine[],
): LabelPreview[] {
  const claims: Claims = new Map();
  return lines.map((line) => {
    const bookId = line.source.kind === "existing" ? line.source.bookId : null;
    const plan = planLine(ex, line, bookId, claims);
    if (!plan.conflict) claimTexts(claims, line, bookId, plan.texts);
    return {
      lineIndex: line.lineIndex,
      title: line.title,
      titleCode: plan.titleCode,
      titleCodeSource: plan.source,
      labelTexts: plan.texts,
      conflict: plan.conflict && {
        labelText: plan.conflict.text,
        bookId: plan.conflict.owner.bookId,
        title: plan.conflict.owner.title,
      },
    };
  });
}
