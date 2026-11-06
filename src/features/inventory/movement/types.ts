import type { stockMovement } from "@/db/schema";
import type { ENTRY_REASONS } from "./schemas";

export type StockMovement = typeof stockMovement.$inferSelect;
export type EntryReason = (typeof ENTRY_REASONS)[number];

export type NewEntryMovement = {
  reason: EntryReason;
  signedById: number;
  notes: string | null;
};

export type TitleCodeSource = "existing" | "generated";

export type RegisteredCopy = {
  copyId: number;
  copyNumber: number;
  shelfId: number;
  labelText: string;
};

export type RegisteredLine = {
  lineIndex: number;
  bookId: number;
  title: string;
  isNewBook: boolean;
  titleCode: string;
  titleCodeSource: TitleCodeSource;
  copies: RegisteredCopy[];
};

export type EntryResult = {
  movement: StockMovement;
  lines: RegisteredLine[];
};

export type LabelPreview = {
  lineIndex: number;
  title: string;
  titleCode: string;
  titleCodeSource: TitleCodeSource;
  labelTexts: string[];
  conflict: { labelText: string; bookId: number | null; title: string } | null;
};
