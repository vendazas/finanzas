const encoder = new TextEncoder();
const decoder = new TextDecoder();

export const SESSION_COOKIE = "miplata_session";
const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7;

function toBase64Url(value) {
  const bytes = typeof value === "string" ? encoder.encode(value) : value;
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
}

function fromBase64Url(value) {
  const normalized = value.replaceAll("-", "+").replaceAll("_", "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  const binary = atob(padded);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

async function signingKey() {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET no está configurado.");
  }

  return crypto.subtle.importKey(
    "raw",
    encoder.encode(process.env.JWT_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

export async function createSessionToken(user) {
  const now = Math.floor(Date.now() / 1000);
  const header = toBase64Url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = toBase64Url(JSON.stringify({ sub: user.id, email: user.email, iat: now, exp: now + SESSION_DURATION_SECONDS }));
  const unsignedToken = `${header}.${payload}`;
  const signature = await crypto.subtle.sign("HMAC", await signingKey(), encoder.encode(unsignedToken));

  return `${unsignedToken}.${toBase64Url(new Uint8Array(signature))}`;
}

export async function readSessionToken(token) {
  if (!token) return null;

  const [header, payload, signature] = token.split(".");
  if (!header || !payload || !signature) return null;

  try {
    const valid = await crypto.subtle.verify(
      "HMAC",
      await signingKey(),
      fromBase64Url(signature),
      encoder.encode(`${header}.${payload}`)
    );
    const session = JSON.parse(decoder.decode(fromBase64Url(payload)));

    if (!valid || !session.sub || !session.exp || session.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

export function sessionCookie(token) {
  return {
    name: SESSION_COOKIE,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DURATION_SECONDS,
  };
}

export function expiredSessionCookie() {
  return { ...sessionCookie(""), maxAge: 0 };
}
