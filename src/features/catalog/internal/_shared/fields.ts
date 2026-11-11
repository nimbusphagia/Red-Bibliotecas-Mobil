import { collapse } from "@/shared/format/text";
import { z } from "zod";

export const NAME_MAX = 100;

export const nameField = z
  .string()
  .transform(collapse)
  .pipe(z.string().min(1, "Required").max(NAME_MAX));
