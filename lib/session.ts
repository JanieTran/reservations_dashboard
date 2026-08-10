import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from "crypto";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export interface DbCredentials {
  username: string;
  password: string;
}

interface SessionPayload extends DbCredentials {
  exp: number;
}

function getKey(): Buffer {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET is not set");
  }
  return createHash("sha256").update(secret).digest();
}

export function buildConnectionString({
  username,
  password,
}: DbCredentials): string {
  const host = process.env.DATABASE_HOST;
  const database = process.env.DATABASE_NAME;
  if (!host || !database) {
    throw new Error("DATABASE_HOST and DATABASE_NAME must be set");
  }
  const port = process.env.DATABASE_PORT ?? "5432";
  const user = encodeURIComponent(username);
  const pass = encodeURIComponent(password);
  return `postgres://${user}:${pass}@${host}:${port}/${database}`;
}

export function getDbOptions(credentials: DbCredentials): {
  connectionString: string;
  ssl: false | { rejectUnauthorized: boolean };
} {
  return {
    connectionString: buildConnectionString(credentials),
    ssl:
      process.env.DATABASE_SSL === "disable"
        ? false
        : { rejectUnauthorized: false },
  };
}

export function encryptSession(credentials: DbCredentials): string {
  const key = getKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const payload = JSON.stringify({
    ...credentials,
    exp: Date.now() + SESSION_MAX_AGE * 1000,
  });
  const encrypted = Buffer.concat([
    cipher.update(payload, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();
  return [iv, authTag, encrypted].map((b) => b.toString("base64url")).join(".");
}

export function decryptSession(token: string): SessionPayload | null {
  try {
    const [ivB64, tagB64, dataB64] = token.split(".");
    if (!ivB64 || !tagB64 || !dataB64) return null;
    const decipher = createDecipheriv(
      "aes-256-gcm",
      getKey(),
      Buffer.from(ivB64, "base64url")
    );
    decipher.setAuthTag(Buffer.from(tagB64, "base64url"));
    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(dataB64, "base64url")),
      decipher.final(),
    ]);
    const payload = JSON.parse(decrypted.toString("utf8")) as SessionPayload;
    if (typeof payload.exp !== "number" || payload.exp < Date.now())
      return null;
    return payload;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return decryptSession(token);
}

export async function setSession(credentials: DbCredentials): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, encryptSession(credentials), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });
}

export async function clearSession(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}
