import { migrate } from "drizzle-orm/expo-sqlite/migrator";
import { db } from "./client";
import migrations from "../../drizzle/migrations";

let running: Promise<void> | null = null;

export function runMigrations(): Promise<void> {
  running ??= migrate(db, migrations).catch((error) => {
    running = null;
    throw error;
  });
  return running;
}
