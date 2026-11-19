import {
  DuplicateError,
  ForbiddenError,
  InvalidCredentialsError,
  SetupClosedError,
  ValidationError,
  IncompleteBookError,
  LabelConflictError,
  LendProblemKind,
  CopiesNotLendableError,
  LoanLimitError,
  VisitorBlockedError,
} from "./errors";

const LINE_PREFIX = /^lines\.\d+\.(book\.)?/;

export type FormErrors = {
  form?: string;
  fields: Record<string, string>;
  suggestedOmitWords?: string[];
};

const MESSAGES_ES: Record<string, string> = {
  "The series author must be a writer or illustrator of the book":
    "El autor de la serie debe ser escritor o ilustrador del libro",
  "The copy is lost": "El ejemplar está perdido",
  "The copy is discarded": "El ejemplar está descartado",
  "The copy does not exist": "El ejemplar no existe",
};

const LEND_PROBLEM_ES: Record<LendProblemKind, string> = {
  not_found: "no existe",
  on_loan: "ya está prestado",
  damaged: "está dañado",
  lost: "está perdido",
  discarded: "está descartado",
};

export function toFormErrors(error: unknown): FormErrors {
  if (error instanceof ValidationError) {
    const fields: Record<string, string> = {};
    for (const { path, message } of error.issues) {
      fields[path.replace(LINE_PREFIX, "")] ??= MESSAGES_ES[message] ?? message;
    }
    return { fields };
  }
  if (error instanceof InvalidCredentialsError) {
    return { form: "Usuario o contraseña incorrectos", fields: {} };
  }
  if (error instanceof SetupClosedError) {
    return { form: "La configuración inicial ya se completó", fields: {} };
  }
  if (error instanceof DuplicateError && error.entity === "shelf") {
    return { fields: { name: "Ya existe una estantería con ese nombre" } };
  }
  if (error instanceof DuplicateError && error.entity === "account") {
    return { fields: { username: "Ese nombre de usuario ya existe" } };
  }
  if (error instanceof DuplicateError) {
    return { form: "Ya existe un registro con ese nombre", fields: {} };
  }
  if (error instanceof IncompleteBookError) {
    return {
      form: "No se pudo generar el tejuelo: revisa categoría, subcategoría, escritor y título",
      fields: {},
    };
  }
  if (error instanceof LabelConflictError) {
    return {
      fields: {
        omitWords: `El tejuelo ${error.labelText} ya lo usa «${error.conflictingBook.title}». Omite palabras en común para diferenciarlo.`,
      },
      suggestedOmitWords: error.suggestedOmitWords,
    };
  }
  if (error instanceof CopiesNotLendableError) {
    const lines = error.problems.map(
      (p) => `${p.labelText ?? `#${p.copyId}`} ${LEND_PROBLEM_ES[p.problem]}`,
    );
    return { fields: { copyIds: lines.join("\n") } };
  }
  if (error instanceof LoanLimitError) {
    return {
      fields: {
        copyIds: `Ya tiene ${error.open} ejemplares abiertos; el máximo es ${error.max}`,
      },
    };
  }
  if (error instanceof VisitorBlockedError) {
    return {
      fields: {
        visitorId: `Bloqueado: tiene ${error.overdue} ejemplares vencidos`,
      },
    };
  }
  if (error instanceof ForbiddenError) {
    return { form: "No tienes permiso para esta acción", fields: {} };
  }
  console.error(error);
  return {
    form: "Ocurrió un error inesperado. Inténtalo de nuevo.",
    fields: {},
  };
}
