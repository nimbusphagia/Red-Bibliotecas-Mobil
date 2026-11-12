import type { shelf } from "@/db/schema";
import type { ListFilters } from "@/features/shared/types/types";
import type { ShelfSort } from "./schemas";

export type Shelf = typeof shelf.$inferSelect;
export type NewShelf = { name: string; description: string | null };
export type ShelfPatch = Partial<NewShelf>;
export type ShelfListItem = Shelf & { copyCount: number };
export type ShelfListFilters = ListFilters<ShelfSort>;
export type ShelfUsage = { copies: number };
