import type { category } from "@/db/schema";

export type Category = typeof category.$inferSelect;
export type CategoryWithBookCount = Category & { bookCount: number };
