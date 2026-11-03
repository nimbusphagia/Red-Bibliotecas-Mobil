import type { publisher } from "@/db/schema";
import type { SortDirection } from "@/shared/types";

export type Publisher = typeof publisher.$inferSelect;
export type PublisherWithBookCount = Publisher & { bookCount: number };

export type NewPublisher = {
  name: string;
};

export const PUBLISHER_SORT_KEYS = ["name", "createdAt", "bookCount"] as const;
export type PublisherSort = (typeof PUBLISHER_SORT_KEYS)[number];

export type PublisherListFilters = {
  tokens: string[];
  withBooks?: boolean;
  sortBy: PublisherSort;
  sortDir: SortDirection;
  limit: number;
  offset: number;
};

export type PublisherUsage = { books: number; collections: number };
