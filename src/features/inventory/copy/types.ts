import type { COPY_STATUSES, copy } from "@/db/schema";

export type Copy = typeof copy.$inferSelect;
export type NewCopy = { bookId: number; shelfId: number; copyNumber: number };

export type CopyStatus = (typeof COPY_STATUSES)[number];

export const RELEASED_STATUSES = ["lost", "discarded"] as const;
export type ReleasedStatus = (typeof RELEASED_STATUSES)[number];

export type CopyLookup = {
  id: number;
  bookId: number;
  title: string;
  copyNumber: number;
  status: CopyStatus;
  labelText: string | null;
};
