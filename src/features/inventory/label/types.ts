import type { label } from "@/db/schema";

export type Label = typeof label.$inferSelect;

export type NewLabel = Pick<
  Label,
  | "copyId"
  | "categoryCode"
  | "authorCode"
  | "subcategoryCode"
  | "titleCode"
  | "copyNumber"
  | "text"
>;

export type LabelOwner = {
  bookId: number;
  title: string;
  seriesId: number | null;
};
