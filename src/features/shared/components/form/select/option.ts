/**
 * `detail` va tras un punto junto a la etiqueta (lista y chips); `caption`
 * solo se ve en la lista de resultados.
 */
export type Option = {
  id: number;
  label: string;
  detail?: string;
  caption?: string;
};
