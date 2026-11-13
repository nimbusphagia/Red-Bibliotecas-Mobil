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

  const load = useCallback(
    async (offset: number) => {
      const mine = generation.current;
      busy.current = true;
      setLoading(true);
      try {
        const page = await fetchPage(offset);
        if (mine !== generation.current) return;
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
    load(0);
  }, [load]);
  const loadRef = useRef(load);
  useEffect(() => {
    loadRef.current = load;
  }, [load]);

  const firstFocus = useRef(true);
  useFocusEffect(
    useCallback(() => {
      if (firstFocus.current) {
        firstFocus.current = false;
        return;
      }
      generation.current++;
      loadRef.current(0);
    }, []),
  );

  const loadMore = useCallback(() => {
    if (busy.current || error || items.length >= total) return;
    load(items.length);
  }, [load, error, items.length, total]);

  return { items, total, loading, error, loadMore };
}
