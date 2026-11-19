import type { shelf } from "@/db/schema";
import type { ListFilters } from "@/features/shared/types/types";
import type { CopyStatus } from "../copy/types";
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
  copyNumber: number;
  status: CopyStatus;
  labelText: string | null;
};
