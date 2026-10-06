import { failure, success } from "@/lib/api-response";
import { requireSession } from "@/lib/session";
import { authService } from "@/services/auth.service";

export async function GET(request) {
  try {
    const session = await requireSession(request);
    return success(await authService.obtenerPerfil(session.userId));
  } catch (error) {
    return failure(error);
  }
}
