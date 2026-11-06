import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import type { Executor } from "@/db/transaction";
import { shelf } from "@/db/schema";
import type { Shelf } from "./types";

export async function findShelfById(id: number): Promise<Shelf | null> {
  const [row] = await db.select().from(shelf).where(eq(shelf.id, id));
  return row ?? null;
}

export function findShelfByIdSync(ex: Executor, id: number): Shelf | null {
  return ex.select().from(shelf).where(eq(shelf.id, id)).get() ?? null;
}

export function findDefaultShelfSync(ex: Executor): Shelf | null {
  return ex.select().from(shelf).where(eq(shelf.isDefault, true)).get() ?? null;
}
