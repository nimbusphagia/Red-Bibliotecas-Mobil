import { collapse } from "@/features/shared/format/text";
import { z } from "zod";

export const NAME_MAX = 100;

export const nameField = z
  .string()
  .transform(collapse)
  .pipe(
    z
      .string()
      .min(1, "Obligatorio")
      .max(NAME_MAX, `Máximo ${NAME_MAX} caracteres`),
  );
