import { z } from "zod";
import { collapse } from "@/shared/text";

export const NAME_MAX = 100;

export const nameField = z
  .string()
  .transform(collapse)
  .pipe(z.string().min(1, "Required").max(NAME_MAX));
