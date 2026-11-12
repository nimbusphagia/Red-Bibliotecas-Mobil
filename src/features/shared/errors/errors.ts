export abstract class AppError extends Error {
  abstract readonly code: string;
}

export class NotFoundError extends AppError {
  readonly code = "NOT_FOUND";
  constructor(
    public readonly entity: string,
    public readonly id: number | string,
  ) {
    super(`${entity} ${id} not found`);
    this.name = "NotFoundError";
  }
}

export class DuplicateError extends AppError {
  readonly code = "DUPLICATE";
  constructor(
    public readonly entity: string,
    public readonly field?: string,
  ) {
    super(
      field
        ? `A ${entity} with this ${field} already exists`
        : `A ${entity} with these details already exists`,
    );
    this.name = "DuplicateError";
  }
}

export class ProtectedError extends AppError {
  readonly code = "PROTECTED";
  constructor(
    public readonly entity: string,
    public readonly id: number | string,
  ) {
    super(`${entity} ${id} is a system record and cannot be changed`);
    this.name = "ProtectedError";
  }
}

export class InvalidReferenceError extends AppError {
  readonly code = "INVALID_REFERENCE";
  constructor(
    public readonly entity: string,
    public readonly field: string,
  ) {
    super(`${entity}: ${field} does not exist`);
    this.name = "InvalidReferenceError";
  }
}

export type Usage = Record<string, number>;

export class InUseError extends AppError {
  readonly code = "IN_USE";
  constructor(
    public readonly entity: string,
    public readonly id: number | string,
    public readonly usage: Usage,
  ) {
    const parts = Object.entries(usage)
      .map(([k, n]) => `${n} ${k}`)
      .join(", ");
    super(`${entity} ${id} is still referenced by ${parts}`);
    this.name = "InUseError";
  }
}

export type ValidationIssue = { path: string; message: string };

export class ValidationError extends AppError {
  readonly code = "VALIDATION";
  constructor(public readonly issues: ValidationIssue[]) {
    super(issues.map((i) => `${i.path}: ${i.message}`).join("; "));
    this.name = "ValidationError";
  }
}

export class ForbiddenError extends AppError {
  readonly code = "FORBIDDEN";
  constructor(public readonly action: string) {
    super(`Not allowed to ${action}`);
    this.name = "ForbiddenError";
  }
}

export class SetupClosedError extends AppError {
  readonly code = "SETUP_CLOSED";
  constructor() {
    super("Initial setup is already complete");
    this.name = "SetupClosedError";
  }
}

export class InvalidCredentialsError extends AppError {
  readonly code = "INVALID_CREDENTIALS";
  constructor() {
    super("Incorrect username or password");
    this.name = "InvalidCredentialsError";
  }
}

export class IncompleteBookError extends AppError {
  readonly code = "INCOMPLETE_BOOK";
  constructor(
    public readonly lineIndex: number,
    public readonly missing: string[],
  ) {
    super(
      `Line ${lineIndex + 1}: book needs ${missing.join(", ")} before it can be labeled`,
    );
    this.name = "IncompleteBookError";
  }
}

export type LabelConflictDetails = {
  lineIndex: number;
  labelText: string;
  conflictingBook: { id: number | null; title: string };
  sameSeries: boolean;
  suggestedOmitWords?: string[];
};

export class LabelConflictError extends AppError {
  readonly code = "LABEL_CONFLICT";
  readonly lineIndex: number;
  readonly labelText: string;
  readonly conflictingBook: { id: number | null; title: string };
  readonly sameSeries: boolean;
  readonly suggestedOmitWords?: string[];

  constructor(d: LabelConflictDetails) {
    const hint = d.sameSeries
      ? "Both books are in the same series: omit the series name words from the title code."
      : "If the books are related, omit their common words from the title code.";
    super(
      `Line ${d.lineIndex + 1}: label ${d.labelText} is already used by "${d.conflictingBook.title}". ${hint}`,
    );
    this.name = "LabelConflictError";
    this.lineIndex = d.lineIndex;
    this.labelText = d.labelText;
    this.conflictingBook = d.conflictingBook;
    this.sameSeries = d.sameSeries;
    this.suggestedOmitWords = d.suggestedOmitWords;
  }
}
export type CopyProblemKind =
  "not_found" | "on_loan" | "lost" | "discarded" | "already_damaged";

export type CopyProblem = {
  copyId: number;
  labelText: string | null;
  problem: CopyProblemKind;
};

const PROBLEM_TEXT: Record<CopyProblemKind, string> = {
  not_found: "does not exist",
  on_loan: "is on loan",
  lost: "is already lost",
  discarded: "is already discarded",
  already_damaged: "is already damaged",
};

export class CopiesNotExitableError extends AppError {
  readonly code = "COPIES_NOT_EXITABLE";
  constructor(public readonly problems: CopyProblem[]) {
    super(
      problems
        .map(
          (p) => `Copy ${p.labelText ?? p.copyId} ${PROBLEM_TEXT[p.problem]}`,
        )
        .join("; "),
    );
    this.name = "CopiesNotExitableError";
  }
}

export type LendProblemKind =
  "not_found" | "on_loan" | "damaged" | "lost" | "discarded";

export type LendProblem = {
  copyId: number;
  labelText: string | null;
  problem: LendProblemKind;
};

const LEND_PROBLEM_TEXT: Record<LendProblemKind, string> = {
  not_found: "does not exist",
  on_loan: "is already on loan",
  damaged: "is damaged",
  lost: "is lost",
  discarded: "is discarded",
};

export class CopiesNotLendableError extends AppError {
  readonly code = "COPIES_NOT_LENDABLE";
  constructor(public readonly problems: LendProblem[]) {
    super(
      problems
        .map(
          (p) =>
            `Copy ${p.labelText ?? p.copyId} ${LEND_PROBLEM_TEXT[p.problem]}`,
        )
        .join("; "),
    );
    this.name = "CopiesNotLendableError";
  }
}

export class LoanLimitError extends AppError {
  readonly code = "LOAN_LIMIT_EXCEEDED";
  constructor(
    public readonly open: number,
    public readonly requested: number,
    public readonly max: number,
  ) {
    super(
      `The visitor has ${open} open copies; ${requested} more would exceed the limit of ${max}`,
    );
    this.name = "LoanLimitError";
  }
}

export class VisitorBlockedError extends AppError {
  readonly code = "VISITOR_BLOCKED";
  constructor(
    public readonly overdue: number,
    public readonly max: number,
  ) {
    super(`The visitor has ${overdue} overdue copies (limit ${max})`);
    this.name = "VisitorBlockedError";
  }
}
