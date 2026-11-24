export const REPUTATIONS = ["new", "reliable", "regular", "at_risk"] as const;
export type Reputation = (typeof REPUTATIONS)[number];

export const HISTORY_MONTHS = 12;
export const LATE_GRACE_DAYS = 3;
const MIN_HISTORY = 3;

/** Líneas resueltas en la ventana; cada una cae en una sola categoría. */
export type LineHistory = {
  resolved: number;
  late: number;
  damaged: number;
  discarded: number;
  lost: number;
};

const POINTS = { late: 1, damaged: 2, discarded: 3, lost: 4 } as const;

export function reputationOf(h: LineHistory): Reputation {
  const serious = h.discarded + h.lost;
  const points =
    h.late * POINTS.late +
    h.damaged * POINTS.damaged +
    h.discarded * POINTS.discarded +
    h.lost * POINTS.lost;
  const score = h.resolved === 0 ? 0 : points / h.resolved;

  if (serious >= 3 || (serious >= 2 && score >= 1.5)) return "at_risk";
  if (h.resolved < MIN_HISTORY) return "new";
  if (score >= 0.5) return "regular";
  return "reliable";
}
