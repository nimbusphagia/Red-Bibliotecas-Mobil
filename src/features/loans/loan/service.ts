import { db } from "@/db/client";
import { inTransaction } from "@/db/transaction";
import {
  NotFoundError,
  ValidationError,
  type ValidationIssue,
} from "@/errors/errors";
import {
  CopiesNotLendableError,
  type LendProblem,
  type LendProblemKind,
} from "@/errors/errors";
import { requireActive } from "@/features/account/service";
import {
  findCopiesByIdsSync,
  setCopiesStatusSync,
} from "@/features/inventory/copy/repository";
import type { CopyStatus } from "@/features/inventory/copy/types";
import type { ExitReason } from "@/features/inventory/movement/types";
import { writeExit } from "@/features/inventory/movement/utils/exit";
import { getLoanRule } from "@/features/loans/reference/service";
import { getVisitor } from "@/features/loans/visitor/service";
import { addDays, toISODate } from "@/shared/format/dates";
import { idSchema } from "@/shared/types/schemas";
import type { Page } from "@/shared/types/types";
import { mapWriteErrors, parseOrThrow } from "@/shared/validation/validation";
import * as repo from "./repository";
import { assertCanBorrow, statusOf } from "./rules";
import {
  lendSchema,
  listLinesSchema,
  listLoansSchema,
  listOpenLinesSchema,
  returnSchema,
  type LendInput,
  type LoanLinesParams,
  type LoanListParams,
  type OpenLinesParams,
  type ReturnInput,
} from "./schemas";
import type {
  LendResult,
  LineOutcome,
  LoanLine,
  LoanListItem,
  OpenLoanLine,
  ReturnResult,
  VisitorLoanStatus,
} from "./types";

const ENTITY = "loan";

const LEND_PROBLEM: Record<CopyStatus, LendProblemKind | null> = {
  available: null,
  on_loan: "on_loan",
  damaged: "damaged",
  lost: "lost",
  discarded: "discarded",
};

// Read
export async function getLoan(id: number): Promise<LoanListItem> {
  const validId = parseOrThrow(idSchema, id);
  const found = await repo.findLoanById(validId, toISODate());
  if (!found) throw new NotFoundError(ENTITY, validId);
  return found;
}

export async function listLoans(
  params: LoanListParams = {},
): Promise<Page<LoanListItem>> {
  const parsed = parseOrThrow(listLoansSchema, params);
  return repo.listLoans({ ...parsed, today: toISODate() });
}

export async function listLoanLines(
  params: LoanLinesParams,
): Promise<Page<LoanLine>> {
  const { loanId, ...page } = parseOrThrow(listLinesSchema, params);
  await getLoan(loanId);
  return repo.listLoanLines(loanId, page);
}

export async function listOpenLoanLines(
  params: OpenLinesParams = {},
): Promise<Page<OpenLoanLine>> {
  const parsed = parseOrThrow(listOpenLinesSchema, params);
  return repo.listOpenLines({ ...parsed, today: toISODate() });
}

export async function getVisitorLoanStatus(
  visitorId: number,
): Promise<VisitorLoanStatus> {
  const visitor = await getVisitor(visitorId);
  return statusOf(repo.countOpenLinesSync(db, visitor.id, toISODate()));
}

// Loans
export async function lendCopies(
  actorId: number,
  input: LendInput,
): Promise<LendResult> {
  await requireActive(actorId);
  const { visitorId, copyIds, notes } = parseOrThrow(lendSchema, input);

  const visitor = await getVisitor(visitorId);
  if (!visitor.active) {
    throw new ValidationError([
      { path: "visitorId", message: "The visitor is inactive" },
    ]);
  }
  const { maxDays } = await getLoanRule(visitor.role);
  const today = toISODate();
  const expiresBy = addDays(today, maxDays);

  return mapWriteErrors(ENTITY, async () =>
    inTransaction((tx) => {
      assertCanBorrow(
        repo.countOpenLinesSync(tx, visitorId, today),
        copyIds.length,
      );

      const found = new Map(
        findCopiesByIdsSync(tx, copyIds).map((c) => [c.id, c] as const),
      );
      const problems: LendProblem[] = [];
      for (const copyId of copyIds) {
        const c = found.get(copyId);
        const problem = c ? LEND_PROBLEM[c.status] : "not_found";
        if (problem) {
          problems.push({ copyId, labelText: c?.labelText ?? null, problem });
        }
      }
      if (problems.length > 0) throw new CopiesNotLendableError(problems);

      const movement = repo.insertLoanMovementSync(tx, {
        loanedById: actorId,
        loanedToId: visitorId,
        expiresBy,
        notes,
      });
      repo.insertLoanLinesSync(tx, movement.id, copyIds);
      setCopiesStatusSync(tx, copyIds, "on_loan");

      return {
        movement,
        copies: copyIds.map((copyId) => {
          const c = found.get(copyId)!;
          return {
            copyId,
            bookId: c.bookId,
            title: c.title,
            copyNumber: c.copyNumber,
            labelText: c.labelText,
          };
        }),
      };
    }),
  );
}

// Returns
export async function returnCopies(
  actorId: number,
  input: ReturnInput,
): Promise<ReturnResult> {
  await requireActive(actorId);
  const { items } = parseOrThrow(returnSchema, input);
  const copyIds = items.map((i) => i.copyId);

  return mapWriteErrors(ENTITY, async () =>
    inTransaction((tx) => {
      const open = new Set(
        repo.findOpenLinesByCopyIdsSync(tx, copyIds).map((l) => l.copyId),
      );
      const issues: ValidationIssue[] = [];
      items.forEach((item, i) => {
        if (!open.has(item.copyId)) {
          issues.push({
            path: `items.${i}.copyId`,
            message: "The copy is not on loan",
          });
        }
      });
      if (issues.length > 0) throw new ValidationError(issues);

      const idsOf = (outcome: LineOutcome) =>
        items.filter((i) => i.outcome === outcome).map((i) => i.copyId);
      const returned = idsOf("returned");
      const damaged = idsOf("returned_damaged");
      const lost = idsOf("lost");

      repo.resolveLinesSync(tx, returned, "returned", actorId);
      repo.resolveLinesSync(tx, damaged, "returned_damaged", actorId);
      repo.resolveLinesSync(tx, lost, "lost", actorId);

      setCopiesStatusSync(tx, returned, "available");

      const exit = (reason: ExitReason, ids: number[], notes: string) =>
        ids.length === 0
          ? null
          : writeExit(tx, { reason, signedById: actorId, notes }, ids, {
              allowOnLoan: true,
            });

      return {
        returned: returned.length,
        damaged: exit("damage", damaged, "Returned damaged from loan"),
        lost: exit("loss", lost, "Lost on loan"),
      };
    }),
  );
}
