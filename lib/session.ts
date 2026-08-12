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

/**
 * Derives the AES-256-GCM key from AUTH_SECRET via SHA-256.
 */
function getKey(): Buffer {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET is not set");
  }
  return createHash("sha256").update(secret).digest();
}

/**
 * Builds a Postgres connection string from the given credentials and the
 * DATABASE_HOST, DATABASE_PORT, and DATABASE_NAME environment variables.
 */
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

/**
 * Returns pg Client options for a connection, disabling SSL entirely when
 * DATABASE_SSL=disable, otherwise accepting self-signed certificates.
 */
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

/**
 * Encrypts the session credentials with AES-256-GCM and returns a
 * base64url-encoded token containing the IV, auth tag, and ciphertext.
 */
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

/**
 * Decrypts a session token, returning its payload, or null if the token is
 * invalid, tampered with, or expired.
 */
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

/**
 * Reads and decrypts the session cookie, returning null when absent.
 */
export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return decryptSession(token);
}

/**
 * Sets an HttpOnly session cookie for the given credentials, lasting 7 days.
 */
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

/**
 * Deletes the session cookie.
 */
export async function clearSession(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}
