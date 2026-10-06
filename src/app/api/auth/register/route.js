import { createSessionToken, sessionCookie } from "@/lib/auth-token";
import { failure, success, ApiError } from "@/lib/api-response";
import { authService } from "@/services/auth.service";
import { validarRegistro } from "@/validations/auth.validation";
import { assertSameOrigin, limitRequest } from "@/lib/request-security";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    assertSameOrigin(request);
    limitRequest(request, "register", 5);
    const datos = await request.json();
    const errors = validarRegistro(datos);
    if (errors.length) throw new ApiError("Revisa los datos del registro.", 422, errors);

    const usuario = await authService.registrar(datos);
    const response = success(usuario, 201);
    response.cookies.set(sessionCookie(await createSessionToken(usuario)));
    return response;
  } catch (error) {
    return failure(error);
  }
}
