export type SortDirection = "asc" | "desc";

export type ListFilters<Sort extends string> = {
  tokens: string[];
  sortBy: Sort;
  sortDir: SortDirection;
  limit: number;
  offset: number;
};
export type Assert<T extends true> = T;

export type Page<T> = {
  items: T[];
  total: number;
  limit: number;
  offset: number;
};
