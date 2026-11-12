import type { series } from "@/db/schema";
import type { ListFilters } from "@/features/shared/types/types";
import type { SeriesSort } from "./schemas";

export type Series = typeof series.$inferSelect;

export type SeriesListItem = Series & {
  authorFirstName: string;
  authorLastName: string | null;
  bookCount: number;
};

export type NewSeries = {
  name: string;
  nameKey: string;
  authorId: number;
};

export type SeriesPatch = Partial<NewSeries>;

export type SeriesListFilters = ListFilters<SeriesSort> & {
  authorId?: number;
  withBooks?: boolean;
};
