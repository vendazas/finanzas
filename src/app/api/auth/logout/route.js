import { expiredSessionCookie } from "@/lib/auth-token";
import { failure, success } from "@/lib/api-response";
import { requireSession } from "@/lib/session";

export async function POST(request) {
  try {
    await requireSession(request);
    const response = success({ loggedOut: true });
    response.cookies.set(expiredSessionCookie());
    return response;
  } catch (error) {
    return failure(error);
  }
}
