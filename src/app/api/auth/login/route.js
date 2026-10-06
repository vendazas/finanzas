import { createSessionToken, sessionCookie } from "@/lib/auth-token";
import { failure, success, ApiError } from "@/lib/api-response";
import { authService } from "@/services/auth.service";
import { validarLogin } from "@/validations/auth.validation";
import { assertSameOrigin, limitRequest } from "@/lib/request-security";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    assertSameOrigin(request);
    limitRequest(request, "login", 10);
    const datos = await request.json();
    const errors = validarLogin(datos);
    if (errors.length) throw new ApiError("Revisa tus credenciales.", 422, errors);

    const usuario = await authService.iniciarSesion(datos);
    const response = success(usuario);
    response.cookies.set(sessionCookie(await createSessionToken(usuario)));
    return response;
  } catch (error) {
    return failure(error);
  }
}
