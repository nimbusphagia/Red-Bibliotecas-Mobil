import type { collection } from "@/db/schema";
import type { ListFilters } from "@/features/shared/types/types";
import type { CollectionSort } from "./schemas";

export type Collection = typeof collection.$inferSelect;

export type CollectionListItem = Collection & {
  publisherName: string;
  bookCount: number;
};

export type NewCollection = {
  name: string;
  nameKey: string;
  publisherId: number;
};

export type CollectionPatch = Partial<Pick<NewCollection, "name" | "nameKey">>;

export type CollectionListFilters = ListFilters<CollectionSort> & {
  publisherId?: number;
  withBooks?: boolean;
};
