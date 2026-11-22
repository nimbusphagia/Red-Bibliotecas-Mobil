import {
  author,
  book,
  bookCollaborator,
  category,
  subcategory,
} from "@/db/schema";
import { sql } from "drizzle-orm";

// El tejuelo de un libro se arma con códigos ya guardados en cada entidad:
// categoría, subcategoría, primer escritor y el título del propio libro.
// Subconsultas escalares para no obligar a cada consulta a agregar joins.
const categoryCode = sql`(select ${category.code} from ${category} where ${category.id} = ${book.categoryId})`;

const subcategoryCode = sql`(select ${subcategory.code} from ${subcategory} where ${subcategory.id} = ${book.subcategoryId})`;

// "Primer escritor" = el de menor nameKey entre los `writer` del libro.
const writerCode = sql`(select ${author.code} from ${bookCollaborator} inner join ${author} on ${author.id} = ${bookCollaborator.collaboratorId} where ${bookCollaborator.bookId} = ${book.id} and ${bookCollaborator.role} = 'writer' order by ${author.nameKey} limit 1)`;

/**
 * Prefijo del tejuelo, común a todos los ejemplares del libro
 * (`CAT-AUT-SUB-TIT`). Es null si falta cualquier pieza. Requiere `book` en
 * el FROM de la consulta.
 */
export const bookLabelPrefixSql = sql<
  string | null
>`${categoryCode} || '-' || ${writerCode} || '-' || ${subcategoryCode} || '-' || ${book.titleCode}`;
