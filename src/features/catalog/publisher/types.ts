import type { publisher } from "@/db/schema";
import type { ListFilters } from "@/shared/types";
import type { PublisherSort } from "./schemas";

export type Publisher = typeof publisher.$inferSelect;
export type PublisherWithBookCount = Publisher & { bookCount: number };

export type NewPublisher = { name: string; nameKey: string };

export type PublisherListFilters = ListFilters<PublisherSort> & {
  withBooks?: boolean;
};

export type PublisherUsage = { books: number; collections: number };
