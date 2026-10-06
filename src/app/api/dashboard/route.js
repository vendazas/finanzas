import { failure, success } from "@/lib/api-response";
import { requireSession } from "@/lib/session";
import { authService } from "@/services/auth.service";
import { dashboardService } from "@/services/dashboard.service";

export async function GET(request) {
  try {
    const session = await requireSession(request);
    const usuario = await authService.obtenerPerfil(session.userId);
    return success(await dashboardService.obtenerResumen(usuario));
  } catch (error) {
    return failure(error);
  }
}
