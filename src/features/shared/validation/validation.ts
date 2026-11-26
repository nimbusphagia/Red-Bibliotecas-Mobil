import {
  isForeignKeyViolation,
  isUniqueViolation,
  uniqueViolationColumns,
} from "@/features/shared/errors/db-errors";
import {
  DuplicateError,
  InvalidReferenceError,
  ValidationError,
  type ValidationIssue,
} from "@/features/shared/errors/errors";
import { z } from "zod";

z.config(z.locales.es());

function toIssues(error: z.ZodError): ValidationIssue[] {
  return error.issues.map((issue) => ({
    path: issue.path.map(String).join(".") || "(root)",
    message: issue.message,
  }));
}

export function parseOrThrow<T extends z.ZodType>(
  schema: T,
  input: unknown,
): z.output<T> {
  const result = schema.safeParse(input);
  if (!result.success) throw new ValidationError(toIssues(result.error));
  return result.data;
}

const FIELD_LABELS: Record<string, string> = {
  name_key: "name",
  code: "code",
};

export async function mapWriteErrors<T>(
  entity: string,
  op: () => Promise<T>,
): Promise<T> {
  try {
    return await op();
  } catch (error) {
    if (isUniqueViolation(error)) {
      const field = uniqueViolationColumns(error)
        .map((c) => FIELD_LABELS[c])
        .find(Boolean);
      throw new DuplicateError(entity, field);
    }
    if (isForeignKeyViolation(error)) {
      throw new InvalidReferenceError(entity, "reference");
    }
    throw error;
  }
}
