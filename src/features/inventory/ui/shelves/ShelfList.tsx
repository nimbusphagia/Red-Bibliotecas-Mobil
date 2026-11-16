import { useState } from "react";
import { ListHeader } from "./list/ListHeader";
import { useDebounce } from "@/features/shared/hooks/useDebounce";
import { ListMain } from "./list/ListMain";

export function ShelfList() {
  const [search, setSearch] = useState("");

  const debouncedSearch = useDebounce(search);

  return (
    <>
      <ListHeader search={search} onSearchChange={() => null} />
      <ListMain />
    </>
  );
}
