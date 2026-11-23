import { format } from "date-fns";
import { es } from "date-fns/locale";

const pad = (n: number) => String(n).padStart(2, "0");

export function toISODate(date: Date = new Date()): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(iso: string, days: number): string {
  const d = parseISODate(iso);
  d.setDate(d.getDate() + days);
  return toISODate(d);
}

export const formatISO = (iso: string) => iso.split("-").reverse().join("/");

export const formatDate = (d: Date) =>
  `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;

// "2025-03-12" con new Date() se lee como medianoche UTC: en Perú da el día anterior.
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * "12 de marzo". El año se agrega solo si no es el actual; `year` lo fuerza
 * (true) o lo quita (false).
 */
export const formatDateES = (input: string | Date, year?: boolean) => {
  const date =
    typeof input !== "string"
      ? input
      : ISO_DATE.test(input)
        ? parseISODate(input)
        : new Date(input);
  const withYear = year ?? date.getFullYear() !== new Date().getFullYear();
  return format(date, withYear ? "d 'de' MMMM yyyy" : "d 'de' MMMM", {
    locale: es,
  });
};
