import { failure, success, ApiError } from "@/lib/api-response";
import { requireSession } from "@/lib/session";
import { authService } from "@/services/auth.service";
import { validarCambioPassword } from "@/validations/auth.validation";

export const runtime = "nodejs";

export async function PATCH(request) {
  try {
    const session = await requireSession(request);
    const datos = await request.json();
    const errors = validarCambioPassword(datos);
    if (errors.length) throw new ApiError("Revisa la nueva contraseña.", 422, errors);
    await authService.cambiarPassword(session.userId, datos);
    return success({ changed: true });
  } catch (error) {
    return failure(error);
  }
}
