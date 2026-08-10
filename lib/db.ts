import { Pool } from "pg";

const globalForDb = globalThis as unknown as { pool?: Pool };

const sslMode = process.env.DATABASE_URL?.match(/[?&]sslmode=([^&]+)/)?.[1];

export const db =
  globalForDb.pool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: sslMode === "disable" ? false : { rejectUnauthorized: false },
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.pool = db;
}
