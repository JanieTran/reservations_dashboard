import { Client } from "pg";
import { NextResponse } from "next/server";

import { getDbOptions, setSession } from "@/lib/session";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const username =
    typeof body?.username === "string" ? body.username.trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!username || !password) {
    return NextResponse.json(
      { error: "Username and password are required" },
      { status: 400 }
    );
  }

  let options: ReturnType<typeof getDbOptions>;
  try {
    options = getDbOptions({ username, password });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 }
    );
  }

  const client = new Client(options);
  try {
    await client.connect();
    await client.query("SELECT 1");
  } catch {
    return NextResponse.json(
      {
        error: "Could not connect to the database. Check your credentials.",
      },
      { status: 401 }
    );
  } finally {
    await client.end().catch(() => {});
  }

  await setSession({ username, password });
  return NextResponse.json({ ok: true });
}
