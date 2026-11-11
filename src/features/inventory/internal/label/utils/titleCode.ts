import { searchKey } from "@/shared/format/text";

export const CODE_LENGTH = 3;

export const STOPWORDS: ReadonlySet<string> = new Set([
  "el",
  "la",
  "los",
  "las",
  "lo",
  "un",
  "una",
  "unos",
  "unas",
  "de",
  "del",
  "al",
  "en",
  "y",
  "e",
  "o",
  "u",
  "a",
]);

export const wordsOf = (text: string): string[] =>
  searchKey(text)
    .split(/[^a-z0-9]+/)
    .filter(Boolean);

export function codeFrom(
  text: string,
  omit: readonly string[] = [],
): string | null {
  const all = wordsOf(text);
  const omitted = new Set(omit.flatMap(wordsOf));

  const candidates = [
    all.filter((w) => !STOPWORDS.has(w) && !omitted.has(w)),
    all.filter((w) => !STOPWORDS.has(w)),
    all,
  ];
  const source = (candidates.find((c) => c.length > 0) ?? []).join("");
  return source ? source.slice(0, CODE_LENGTH).toUpperCase() : null;
}

export const titleCode = (title: string, omitWords: readonly string[] = []) =>
  codeFrom(title, omitWords);
