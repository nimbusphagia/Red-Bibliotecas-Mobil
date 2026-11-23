import { collapse } from "@/features/shared/format/text";
import { z } from "zod";
import { RESERVED_USERNAMES } from "./setup";

const username = z
  .string()
  .transform(collapse)
  .pipe(
    z.string().min(3, "Mínimo 3 caracteres").max(32, "Máximo 32 caracteres"),
  );
const password = z
  .string()
  .min(6, "Mínimo 6 caracteres")
  .max(128, "Máximo 128 caracteres");

const CREATABLE_ROLES = ["admin", "staff"] as const;

export const createAccountSchema = z.object({
  username,
  password,
  role: z.enum(CREATABLE_ROLES),
});

export const loginSchema = z.object({
  username: z.string().transform(collapse),
  password: z.string().min(1),
});

export const setActiveSchema = z.object({ active: z.boolean() });
export const changeRoleSchema = z.object({ role: z.enum(CREATABLE_ROLES) });
export const resetPasswordSchema = z.object({ password });

export const changeOwnPasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: password,
});

const registerOwnerSchema = z.object({ username, password });

export const completeSetupSchema = registerOwnerSchema.refine(
  (d) => !RESERVED_USERNAMES.has(d.username.toLowerCase()),
  { path: ["username"], message: "Ese nombre de usuario está reservado" },
);
