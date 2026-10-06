import { ApiError } from "@/lib/api-response";
import { readSessionToken, SESSION_COOKIE } from "@/lib/auth-token";

export async function requireSession(request) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = await readSessionToken(token);

  if (!session) {
    throw new ApiError("No autenticado.", 401);
  }

  return { userId: session.sub, email: session.email };
}
