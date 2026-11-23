import type { shelf } from "@/db/schema";
import type { ListFilters } from "@/features/shared/types/types";
import type { CopyStatus, ReleasedStatus } from "../copy/types";
import type { ShelfSort } from "./schemas";

export type Shelf = typeof shelf.$inferSelect;
export type NewShelf = {
  name: string;
  nameKey: string;
  description: string | null;
};
export type ShelfPatch = Partial<NewShelf>;
export type ShelfListItem = Shelf & { copyCount: number };
export type ShelfListFilters = ListFilters<ShelfSort>;
export type ShelfUsage = { copies: number };

export type ShelfCopy = {
  id: number;
  bookId: number;
  bookTitle: string;
  authors: string | null;
  copyNumber: number;
  /** Los dados de baja no se listan. */
  status: Exclude<CopyStatus, ReleasedStatus>;
  labelText: string | null;
};
