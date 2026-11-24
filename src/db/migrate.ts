import { migrate } from "drizzle-orm/expo-sqlite/migrator";
import { db, sqlite } from "./client";
import migrations from "../../drizzle/migrations";

let running: Promise<void> | null = null;

// El migrador corre todo en una transacción, donde SQLite ignora
// `PRAGMA foreign_keys`; reconstruir una tabla referenciada fallaría. Se
// desactivan fuera de ella y se comprueba la integridad al terminar.
async function migrateWithoutForeignKeys(): Promise<void> {
  sqlite.execSync("PRAGMA foreign_keys = OFF;");
  try {
    await migrate(db, migrations);
    const broken = sqlite.getAllSync("PRAGMA foreign_key_check;");
    if (broken.length > 0) {
      throw new Error(
        `Migration left broken references: ${JSON.stringify(broken)}`,
      );
    }
  } finally {
    sqlite.execSync("PRAGMA foreign_keys = ON;");
  }
}

export function runMigrations(): Promise<void> {
  running ??= migrateWithoutForeignKeys().catch((error) => {
    running = null;
    throw error;
  });
  return running;
}
