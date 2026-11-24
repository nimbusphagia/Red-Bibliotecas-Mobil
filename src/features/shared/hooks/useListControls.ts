import type { SortDirection } from "@/features/shared/types/types";
import { useCallback, useState } from "react";
import { useDebounce } from "./useDebounce";

/** Tamaño de página de las listas. */
export const PAGE_SIZE = 20;

/** Texto del buscador y su versión con retardo, que es la que consulta. */
export function useSearch(initial = "") {
  const [search, setSearch] = useState(initial);
  const debouncedSearch = useDebounce(search);
  return { search, setSearch, debouncedSearch };
}

/** Orden actual y un `onChange(by, dir)` listo para `InlineSort`. */
export function useSort<K extends string>(initial: {
  by: K;
  dir: SortDirection;
}) {
  const [sort, setSort] = useState(initial);
  const change = useCallback(
    (by: K, dir: SortDirection) => setSort({ by, dir }),
    [],
  );
  return [sort, change] as const;
}
