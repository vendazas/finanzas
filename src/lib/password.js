import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(scrypt);

export async function hashPassword(password) {
  const salt = randomBytes(16).toString("base64url");
  const derivedKey = await scryptAsync(password, salt, 64);

  return `scrypt$${salt}$${derivedKey.toString("base64url")}`;
}

export async function verifyPassword(password, passwordHash) {
  const [algorithm, salt, storedKey] = passwordHash.split("$");

  if (algorithm !== "scrypt" || !salt || !storedKey) {
    return false;
  }

  const derivedKey = await scryptAsync(password, salt, 64);
  const storedBuffer = Buffer.from(storedKey, "base64url");

  return storedBuffer.length === derivedKey.length && timingSafeEqual(storedBuffer, derivedKey);
}
