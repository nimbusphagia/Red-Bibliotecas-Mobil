import { collapse } from "@/features/shared/format/text";
import { z } from "zod";
import { RESERVED_EMAILS } from "./setup";

const email = z
  .string()
  .transform((s) => s.trim().toLowerCase())
  .pipe(
    z.email("Correo electrónico inválido").max(254, "Máximo 254 caracteres"),
  );
const name = z
  .string()
  .transform(collapse)
  .pipe(z.string().min(1, "Ingresa tu nombre").max(64, "Máximo 64 caracteres"));
const password = z
  .string()
  .min(6, "Mínimo 6 caracteres")
  .max(128, "Máximo 128 caracteres");

const CREATABLE_ROLES = ["admin", "staff"] as const;

export const createAccountSchema = z.object({
  email,
  name,
  password,
  role: z.enum(CREATABLE_ROLES),
});

export const loginSchema = z.object({
  email: z.string().transform((s) => s.trim().toLowerCase()),
  password: z.string().min(1),
});

export const setActiveSchema = z.object({ active: z.boolean() });
export const changeRoleSchema = z.object({ role: z.enum(CREATABLE_ROLES) });
export const resetPasswordSchema = z.object({ password });

export const changeOwnPasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: password,
});

const registerOwnerSchema = z.object({ email, name, password });

export const completeSetupSchema = registerOwnerSchema.refine(
  (d) => !RESERVED_EMAILS.has(d.email),
  { path: ["email"], message: "Ese correo está reservado" },
);
