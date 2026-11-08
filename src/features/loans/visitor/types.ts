import type { GRADE_LEVELS, visitor } from "@/db/schema";
import type { ListFilters } from "@/shared/types/types";
import type { VisitorSort } from "./schemas";

export type Visitor = typeof visitor.$inferSelect;
export type VisitorRole = Visitor["role"];

export type NewVisitor = {
  name: string;
  nameKey: string;
  role: VisitorRole;
  gradeId: number | null;
};

export type VisitorPatch = Partial<{
  name: string;
  nameKey: string;
  gradeId: number;
  active: boolean;
}>;

export type VisitorListItem = Visitor & {
  grade: number | null;
  level: (typeof GRADE_LEVELS)[number] | null;
};

export type VisitorListFilters = ListFilters<VisitorSort> & {
  role?: VisitorRole;
  gradeId?: number;
  active?: boolean;
};

export type VisitorUsage = { loans: number };
