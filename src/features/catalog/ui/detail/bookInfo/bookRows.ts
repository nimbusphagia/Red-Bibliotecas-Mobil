import type { BookListItem } from "@/features/catalog/internal/book/types";
import type { LabelCodes } from "@/features/catalog/internal/book/types";
import type { DetailRow } from "@/features/shared/components";

export function bookDetailRows(book: BookListItem): DetailRow[] {
  const namesBy = (role: BookListItem["collaborators"][number]["role"]) =>
    book.collaborators
      .filter((c) => c.role === role)
      .map((c) => [c.firstName, c.lastName].filter(Boolean).join(" "))
      .join(", ");

  return [
    { label: "Escritor", content: namesBy("writer") },
    { label: "Ilustrador", content: namesBy("illustrator") },
    { label: "Traductor", content: namesBy("translator") },
    { label: "Editorial", content: book.publisherName ?? undefined },
    { label: "Colección", content: book.collectionName ?? undefined },
    { label: "Serie", content: book.seriesName ?? undefined },
    { label: "Categoría", content: book.categoryName ?? undefined },
    { label: "Subcategoría", content: book.subcategoryName ?? undefined },
  ];
}

export function bookLabelRows(
  book: BookListItem,
  codes: LabelCodes | null,
): DetailRow[] {
  const writer = book.collaborators.find((c) => c.role === "writer");
  return [
    {
      label: codes?.categoryCode ?? "---",
      content: book.categoryName ?? undefined,
    },
    {
      label: codes?.authorCode ?? "---",
      content: writer?.lastName ?? writer?.firstName ?? undefined,
    },
    {
      label: codes?.subcategoryCode ?? "---",
      content: book.subcategoryName ?? undefined,
    },
    { label: codes?.titleCode ?? "---", content: book.title },
  ];
}
