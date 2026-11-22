import { copy } from "@/db/schema";
import { bookLabelPrefixSql } from "@/features/catalog/internal/book/labelSql";
import { and, isNotNull, notInArray, sql } from "drizzle-orm";
import { RELEASED_STATUSES } from "./types";

// Estas expresiones requieren `copy` y `book` en el FROM/JOIN de la consulta.

/** Tejuelo que le correspondería hoy al ejemplar, según los datos del libro. */
export const derivedLabelTextSql = sql<
  string | null
>`${bookLabelPrefixSql} || '-' || ${copy.copyNumber}`;

/**
 * Tejuelo del ejemplar: el que ya se pegó (guardado al etiquetar) o, mientras
 * esté pendiente, el derivado en vivo.
 */
export const labelTextSql = sql<
  string | null
>`coalesce(${copy.labeledText}, ${derivedLabelTextSql})`;

/** Etiquetado, pero el tejuelo derivado de hoy ya no coincide con el pegado. */
export const outdatedSql = sql<boolean>`(${and(
  isNotNull(copy.labeledText),
  notInArray(copy.status, [...RELEASED_STATUSES]),
  sql`${copy.labeledText} is not ${derivedLabelTextSql}`,
)})`.mapWith(Boolean);
