import {
  DuplicateError,
  ForbiddenError,
  InvalidCredentialsError,
  SetupClosedError,
  ValidationError,
} from "./errors";

export type FormErrors = {
  form?: string;
  fields: Record<string, string>;
};

export function toFormErrors(error: unknown): FormErrors {
  if (error instanceof ValidationError) {
    const fields: Record<string, string> = {};
    for (const { path, message } of error.issues) fields[path] ??= message;
    return { fields };
  }
  if (error instanceof InvalidCredentialsError) {
    return { form: "Usuario o contraseña incorrectos", fields: {} };
  }
  if (error instanceof SetupClosedError) {
    return { form: "La configuración inicial ya se completó", fields: {} };
  }
  if (error instanceof DuplicateError && error.entity === "account") {
    return { fields: { username: "Ese nombre de usuario ya existe" } };
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
