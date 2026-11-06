import { db } from "./client";

export type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

export type Executor = typeof db | Tx;

export function inTransaction<T>(work: (tx: Tx) => T): T {
  return db.transaction((tx) => {
    const result = work(tx);
    if (result instanceof Promise) {
      throw new Error("inTransaction callback must be synchronous");
    }
    return result;
  });
}
