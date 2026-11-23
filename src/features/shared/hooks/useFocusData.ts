import { useFocusEffect } from "expo-router";
import { useCallback, useRef, useState } from "react";

/**
 * Carga `fetch` cada vez que la pantalla toma foco (y cuando `fetch` cambia).
 * Descarta respuestas viejas: si llega tarde una carga anterior, no pisa la
 * actual. `fetch` debe venir de useCallback.
 */
export function useFocusData<T>(fetch: () => Promise<T>) {
  const [data, setData] = useState<T>();
  const generation = useRef(0);

  const reload = useCallback(() => {
    const mine = ++generation.current;
    return fetch().then((d) => {
      if (mine === generation.current) setData(d);
    });
  }, [fetch]);

  useFocusEffect(
    useCallback(() => {
      reload();
      return () => {
        generation.current++;
      };
    }, [reload]),
  );

  return { data, reload };
}
