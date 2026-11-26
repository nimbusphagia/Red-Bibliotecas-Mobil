import type { Page } from "@/features/shared/types/types";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";

export function useInfiniteList<T>(
  fetchPage: (offset: number) => Promise<Page<T>>,
) {
  const [items, setItems] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const generation = useRef(0);
  const busy = useRef(false);
  const loaded = useRef(0);

  const load = useCallback(
    async (offset: number) => {
      const mine = generation.current;
      busy.current = true;
      setLoading(true);
      try {
        const page = await fetchPage(offset);
        if (mine !== generation.current) return;
        loaded.current = offset + page.items.length;
        setItems((prev) =>
          offset === 0 ? page.items : [...prev, ...page.items],
        );
        setTotal(page.total);
        setError(null);
      } catch (e) {
        if (mine === generation.current) setError(e);
      } finally {
        if (mine === generation.current) {
          busy.current = false;
          setLoading(false);
        }
      }
    },
    [fetchPage],
  );

  useEffect(() => {
    generation.current++;
    setItems([]);
    setTotal(0);
    setError(null);
    void load(0);
  }, [load]);
  const loadRef = useRef(load);
  useEffect(() => {
    loadRef.current = load;
  }, [load]);

  const reload = useCallback(() => {
    generation.current++;
    void loadRef.current(0);
  }, []);

  const firstFocus = useRef(true);
  useFocusEffect(
    useCallback(() => {
      if (firstFocus.current) {
        firstFocus.current = false;
        return;
      }
      reload();
    }, [reload]),
  );

  const loadMore = useCallback(() => {
    if (busy.current || error || loaded.current >= total) return;
    void load(loaded.current);
  }, [load, error, total]);

  return { items, total, loading, error, loadMore, reload };
}

const ALL_PAGES_SIZE = 100;

/** Pide página tras página hasta traer todos los elementos. */
export async function loadAllPages<T>(
  fetchPage: (offset: number, limit: number) => Promise<Page<T>>,
): Promise<T[]> {
  const items: T[] = [];
  for (;;) {
    const page = await fetchPage(items.length, ALL_PAGES_SIZE);
    items.push(...page.items);
    if (!page.items.length || items.length >= page.total) return items;
  }
}
