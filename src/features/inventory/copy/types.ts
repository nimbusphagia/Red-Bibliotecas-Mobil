import type { copy } from "@/db/schema";

export type Copy = typeof copy.$inferSelect;
export type NewCopy = { bookId: number; shelfId: number; copyNumber: number };

export const RELEASED_STATUSES = ["lost", "discarded"] as const;
