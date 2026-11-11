import { inTransaction } from "@/db/transaction";
import { ValidationError, type ValidationIssue } from "@/errors/errors";
import type { Page } from "@/shared/types/types";
import { parseOrThrow } from "@/shared/validation/validation";
import { requireStockRole } from "../movement/utils/auth";
import {
  findLabelStatesSync,
  listLabels as listLabelsRepo,
  markLabelsPrintedSync,
} from "./repository";
import {
  listLabelsSchema,
  markPrintedSchema,
  type LabelListParams,
  type MarkPrintedInput,
} from "./schemas";
import type { LabelItem } from "./types";

export async function listLabels(
  params: LabelListParams = {},
): Promise<Page<LabelItem>> {
  return listLabelsRepo(parseOrThrow(listLabelsSchema, params));
}

export async function markLabelsPrinted(
  actorId: number,
  input: MarkPrintedInput,
): Promise<{ printed: number; alreadyPrinted: number }> {
  await requireStockRole(actorId, "print labels");
  const { labelIds } = parseOrThrow(markPrintedSchema, input);

  return inTransaction((tx) => {
    const found = new Map(
      findLabelStatesSync(tx, labelIds).map((l) => [l.id, l]),
    );
    const issues: ValidationIssue[] = [];
    labelIds.forEach((id, i) => {
      const l = found.get(id);
      if (!l)
        issues.push({
          path: `labelIds.${i}`,
          message: "The label does not exist",
        });
      else if (l.revoked)
        issues.push({ path: `labelIds.${i}`, message: "The label is revoked" });
    });
    if (issues.length > 0) throw new ValidationError(issues);

    const printed = markLabelsPrintedSync(tx, labelIds);
    return { printed, alreadyPrinted: labelIds.length - printed };
  });
}
