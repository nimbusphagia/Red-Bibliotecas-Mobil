import { ACCOUNT_ROLES } from "@/db/schema";
import { z } from "zod";
import { normalizeRecoveryCode } from "./recovery";
import { INITIAL_PASSWORD } from "./setup";

const password = z
  .string()
  .min(6, "Mínimo 6 caracteres")
  .max(128, "Máximo 128 caracteres");

const role = z.enum(ACCOUNT_ROLES);

export const loginSchema = z.object({
  role,
  password: z.string().min(1, "Ingresa tu contraseña"),
});

export const resetPasswordSchema = z.object({ role });

export const changeOwnPasswordSchema = z.object({
  currentPassword: z.string().min(1, "Ingresa tu contraseña actual"),
  newPassword: password,
});

export const setInitialPasswordSchema = z.object({
  newPassword: password.refine((p) => p !== INITIAL_PASSWORD, {
    message: "Elige una contraseña distinta a la inicial",
  }),
});

export const completeSetupSchema = z.object({ password });

export const recoverAdminSchema = z.object({
  code: z
    .string()
    .transform(normalizeRecoveryCode)
    .pipe(z.string().length(12, "El código tiene 12 caracteres")),
  password,
});
