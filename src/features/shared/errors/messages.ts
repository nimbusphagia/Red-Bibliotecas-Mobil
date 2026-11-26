import {
  DuplicateError,
  InUseError,
  InvalidReferenceError,
  NotFoundError,
  ProtectedError,
  ForbiddenError,
  InvalidCredentialsError,
  SetupClosedError,
  ValidationError,
  IncompleteBookError,
  LabelConflictError,
  LendProblemKind,
  CopiesNotExitableError,
  CopiesNotLendableError,
  CopyNotRecoverableError,
  CopyProblemKind,
  RecoveryProblemKind,
  LoanLimitError,
  VisitorBlockedError,
} from "./errors";

const LINE_PREFIX = /^lines\.\d+\.(book\.)?/;

export type FormErrors = {
  form?: string;
  fields: Record<string, string>;
  suggestedOmitWords?: string[];
};

const ENTITY_ES: Record<string, string> = {
  account: "La cuenta",
  author: "El autor",
  book: "El libro",
  category: "La categoría",
  collection: "La colección",
  copy: "El ejemplar",
  loan: "El préstamo",
  publisher: "La editorial",
  series: "La serie",
  shelf: "La estantería",
  "stock movement": "El movimiento",
  subcategory: "La subcategoría",
  visitor: "El visitante",
};

const entityEs = (entity: string) => ENTITY_ES[entity] ?? "El registro";

const LEND_PROBLEM_ES: Record<LendProblemKind, string> = {
  not_found: "no existe",
  on_loan: "ya está prestado",
  lost: "está perdido",
  discarded: "está descartado",
};

const EXIT_PROBLEM_ES: Record<CopyProblemKind, string> = {
  not_found: "no existe",
  on_loan: "está prestado",
  lost: "ya está perdido",
  discarded: "ya está descartado",
};

const RECOVERY_PROBLEM_ES: Record<RecoveryProblemKind, string> = {
  nothing_to_recover: "El ejemplar no tiene una pérdida por revertir",
  status_changed: "El ejemplar cambió de estado (¿está prestado?)",
  number_taken: "Otro ejemplar ya usa su número",
  label_taken: "Otro ejemplar ya usa su tejuelo",
};

const LINE_INDEX = /^lines\.(\d+)(\.|$)/;

/**
 * Como `toFormErrors`, pero indica a qué línea de una entrada pertenece el
 * error cuando se puede saber, para marcarla en la lista.
 */
export function toLineErrors(error: unknown): {
  lineIndex?: number;
  errors: FormErrors;
} {
  if (
    error instanceof IncompleteBookError ||
    error instanceof LabelConflictError
  ) {
    return { lineIndex: error.lineIndex, errors: toFormErrors(error) };
  }
  if (error instanceof ValidationError) {
    const first = error.issues
      .map((i) => LINE_INDEX.exec(i.path)?.[1])
      .find((i) => i !== undefined);
    if (first !== undefined) {
      const issues = error.issues.filter(
        (i) => LINE_INDEX.exec(i.path)?.[1] === first,
      );
      return {
        lineIndex: Number(first),
        errors: toFormErrors(new ValidationError(issues)),
      };
    }
  }
  return { errors: toFormErrors(error) };
}

export function toFormErrors(error: unknown): FormErrors {
  if (error instanceof ValidationError) {
    const fields: Record<string, string> = {};
    for (const { path, message } of error.issues) {
      fields[path.replace(LINE_PREFIX, "")] ??= message;
    }
    return { fields };
  }
  if (error instanceof InvalidCredentialsError) {
    return { form: "Contraseña incorrecta", fields: {} };
  }
  if (error instanceof SetupClosedError) {
    return { form: "La configuración inicial ya se completó", fields: {} };
  }
  if (error instanceof DuplicateError && error.entity === "shelf") {
    return { fields: { name: "Ya existe una estantería con ese nombre" } };
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
        omitWords: `El tejuelo ${error.labelText} ya lo usa «${error.conflictingBook.title}»${
          error.conflictingCopy
            ? ` (ejemplar #${error.conflictingCopy.id}, ${error.conflictingCopy.labelText})`
            : ""
        }. Omite palabras en común para diferenciarlo.`,
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
  if (error instanceof CopiesNotExitableError) {
    const lines = error.problems.map(
      (p) => `${p.labelText ?? `#${p.copyId}`} ${EXIT_PROBLEM_ES[p.problem]}`,
    );
    return { fields: { copyIds: lines.join("\n") } };
  }
  if (error instanceof CopyNotRecoverableError) {
    const holder =
      error.conflictingCopyId === undefined
        ? ""
        : ` (#${error.conflictingCopyId})`;
    return {
      form: `${RECOVERY_PROBLEM_ES[error.problem]}${holder}`,
      fields: {},
    };
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
  if (error instanceof NotFoundError) {
    return { form: `${entityEs(error.entity)} ya no existe`, fields: {} };
  }
  if (error instanceof ProtectedError) {
    return {
      form: `${entityEs(error.entity)} es del sistema y no se puede modificar`,
      fields: {},
    };
  }
  if (error instanceof InUseError) {
    return {
      form: `${entityEs(error.entity)} está en uso y no se puede modificar`,
      fields: {},
    };
  }
  if (error instanceof InvalidReferenceError) {
    return {
      form: "Uno de los datos elegidos ya no existe. Recarga e inténtalo de nuevo.",
      fields: {},
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
