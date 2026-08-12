import { Client, type QueryResult, type QueryResultRow } from "pg";

import { getDbOptions, getSession } from "./session";

const DEBUG_SQL = process.env.SQL_DEBUG === "1";

/**
 * Runs a parameterized SQL query using the current session's database
 * credentials. Each call opens and closes its own connection.
 */
export async function query<T extends QueryResultRow = QueryResultRow>(
  sql: string,
  params?: unknown[]
): Promise<QueryResult<T>> {
  const session = await getSession();
  if (!session) {
    throw new Error("Not authenticated");
  }
  const client = new Client(getDbOptions(session));
  await client.connect();
  try {
    const result = await client.query<T>(sql, params);
    if (DEBUG_SQL) {
      console.log("[db]", sql);
      console.log("[db] params:", params);
      console.log("[db] rows:", result.rows);
    }
    return result;
  } finally {
    await client.end();
  }
}
