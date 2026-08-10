import { Client, type QueryResult, type QueryResultRow } from "pg";

import { getDbOptions, getSession } from "./session";

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
    return await client.query<T>(sql, params);
  } finally {
    await client.end();
  }
}
