import type { subcategory } from "@/db/schema";

export type Subcategory = typeof subcategory.$inferSelect;
export type SubcategoryWithBookCount = Subcategory & { bookCount: number };
