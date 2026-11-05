import { collapse } from "@/shared/format/text";
import { z } from "zod";

const username = z.string().transform(collapse).pipe(z.string().min(3).max(32));
const password = z.string().min(6).max(128);

export const registerOwnerSchema = z.object({ username, password });

export const CREATABLE_ROLES = ["admin", "staff"] as const;

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
