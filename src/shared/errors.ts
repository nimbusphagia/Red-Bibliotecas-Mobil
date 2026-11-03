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
  constructor(public readonly entity: string) {
    super(`A ${entity} with these details already exists`);
    this.name = "DuplicateError";
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
