import { ApiError } from "@/lib/api-response";

const globalForRateLimit = globalThis;
const attempts = globalForRateLimit.miplataRateLimits ?? new Map();

if (process.env.NODE_ENV !== "production") {
  globalForRateLimit.miplataRateLimits = attempts;
}

export function assertSameOrigin(request) {
  const origin = request.headers.get("origin");
  if (!origin) return;
  if (origin !== new URL(request.url).origin) {
    throw new ApiError("Origen de la solicitud no permitido.", 403);
  }
}

export function limitRequest(request, scope, maxAttempts = 10, windowMs = 60_000) {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0].trim() || "local";
  const key = `${scope}:${ip}`;
  const now = Date.now();
  const record = attempts.get(key);

  if (!record || now - record.startedAt >= windowMs) {
    attempts.set(key, { startedAt: now, count: 1 });
    return;
  }
  if (record.count >= maxAttempts) {
    throw new ApiError("Demasiados intentos. Intenta nuevamente en un minuto.", 429);
  }
  record.count += 1;
}
