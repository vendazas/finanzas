import { failure, success, ApiError } from "@/lib/api-response";
import { requireSession } from "@/lib/session";
import { authService } from "@/services/auth.service";
import { validarPerfil } from "@/validations/auth.validation";

export async function GET(request) {
  try {
    const session = await requireSession(request);
    return success(await authService.obtenerPerfil(session.userId));
  } catch (error) {
    return failure(error);
  }
}

export async function PATCH(request) {
  try {
    const session = await requireSession(request);
    const datos = await request.json();
    const errors = validarPerfil(datos);
    if (errors.length) throw new ApiError("Revisa los datos del perfil.", 422, errors);
    return success(await authService.actualizarPerfil(session.userId, datos));
  } catch (error) {
    return failure(error);
  }
}
