import { db } from "@/db/client";
import { inTransaction } from "@/db/transaction";
import { requireActive } from "@/features/account/internal/service";
import {
  findCopiesByIdsSync,
  markCopiesDamagedSync,
  setCopiesStatusSync,
} from "@/features/inventory/internal/copy/repository";
import type { CopyStatus } from "@/features/inventory/internal/copy/types";
import type { ExitReason } from "@/features/inventory/internal/movement/types";
import { writeExit } from "@/features/inventory/internal/movement/utils/exit";
import { getLoanRule } from "@/features/loans/internal/reference/service";
import { getVisitor } from "@/features/loans/internal/visitor/service";
import {
  CopiesNotLendableError,
  NotFoundError,
  ValidationError,
  type LendProblem,
  type LendProblemKind,
  type ValidationIssue,
} from "@/features/shared/errors/errors";
import { addDays, toISODate } from "@/features/shared/format/dates";
import { idSchema } from "@/features/shared/types/schemas";
import type { Page } from "@/features/shared/types/types";
import {
  mapWriteErrors,
  parseOrThrow,
} from "@/features/shared/validation/validation";
import * as repo from "./repository";
import { assertCanBorrow, statusOf } from "./rules";
import {
  lendSchema,
  listLinesSchema,
  listLoansSchema,
  listVisitorLinesSchema,
  returnSchema,
  VisitorLinesParams,
  type LendInput,
  type LoanLinesParams,
  type LoanListParams,
  type ReturnInput,
} from "./schemas";
import type {
  LendResult,
  LineOutcome,
  LoanLine,
  LoanListItem,
  ReturnResult,
  VisitorLine,
  VisitorLoanStatus,
} from "./types";
import { VisitorRole } from "../visitor/types";

const ENTITY = "loan";

const LEND_PROBLEM: Record<CopyStatus, LendProblemKind | null> = {
  available: null,
  on_loan: "on_loan",
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

export async function listVisitorLines(
  params: VisitorLinesParams,
): Promise<Page<VisitorLine>> {
  const parsed = parseOrThrow(listVisitorLinesSchema, params);
  await getVisitor(parsed.visitorId);
  return repo.listVisitorLines(parsed);
}

export async function getVisitorLoanStatus(
  visitorId: number,
): Promise<VisitorLoanStatus> {
  const visitor = await getVisitor(visitorId);
  return statusOf(repo.countOpenLinesSync(db, visitor.id, toISODate()));
}

const expiresOn = async (role: VisitorRole, today: string) =>
  addDays(today, (await getLoanRule(role)).maxDays);

export async function getLoanExpiry(visitorId: number): Promise<string> {
  const { role } = await getVisitor(visitorId);
  return expiresOn(role, toISODate());
}
export async function lendCopies(
  actorId: number,
  input: LendInput,
): Promise<LendResult> {
  await requireActive(actorId);
  const { visitorId, copyIds, notes } = parseOrThrow(lendSchema, input);

  const visitor = await getVisitor(visitorId);
  if (!visitor.active) {
    throw new ValidationError([
      { path: "visitorId", message: "El visitante está inactivo" },
    ]);
  }
  const today = toISODate();
  const expiresBy = await expiresOn(visitor.role, today);

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
      const openLines = repo.findOpenLinesByCopyIdsSync(tx, copyIds);
      const open = new Set(openLines.map((l) => l.copyId));
      const loanLineByCopy = new Map(openLines.map((l) => [l.copyId, l.id]));
      const issues: ValidationIssue[] = [];
      items.forEach((item, i) => {
        if (!open.has(item.copyId)) {
          issues.push({
            path: `items.${i}.copyId`,
            message: "El ejemplar no está prestado",
          });
        }
      });
      if (issues.length > 0) throw new ValidationError(issues);

      const idsOf = (outcome: LineOutcome) =>
        items.filter((i) => i.outcome === outcome).map((i) => i.copyId);
      const returned = idsOf("returned");
      const damaged = idsOf("returned_damaged");
      const discarded = idsOf("discarded");
      const lost = idsOf("lost");

      repo.resolveLinesSync(tx, returned, "returned", actorId);
      repo.resolveLinesSync(tx, damaged, "returned_damaged", actorId);
      repo.resolveLinesSync(tx, discarded, "discarded", actorId);
      repo.resolveLinesSync(tx, lost, "lost", actorId);

      // Un deteriorado no sale del stock: vuelve disponible y marcado.
      setCopiesStatusSync(tx, [...returned, ...damaged], "available");
      markCopiesDamagedSync(tx, damaged, actorId);

      const exit = (reason: ExitReason, ids: number[]) =>
        ids.length === 0
          ? null
          : writeExit(tx, { reason, signedById: actorId, notes: null }, ids, {
              allowOnLoan: true,
              loanLineByCopy,
            });

      return {
        returned: returned.length,
        damaged: damaged.length,
        lost: exit("loss", lost),
        discarded: exit("discard", discarded),
      };
    }),
  );
}
