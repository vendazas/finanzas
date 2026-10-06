import { failure, success, ApiError } from "@/lib/api-response";
import { requireSession } from "@/lib/session";
import { transferenciasService } from "@/services/transferencias.service";
import { validarTransferencia } from "@/validations/transferencia.validation";
import { assertSameOrigin } from "@/lib/request-security";

export async function POST(request) {
  try {
    assertSameOrigin(request);
    const session = await requireSession(request);
    const payload = await request.json();
    const datos = { ...payload, usuarioId: session.userId };
    const errores = validarTransferencia(datos);

    if (Object.keys(errores).length > 0) {
      throw new ApiError("Revisa los datos de la transferencia.", 422, errores);
    }

    const resultado = await transferenciasService.crear(datos);
    return success(resultado, 201);
  } catch (error) {
    return failure(error);
  }
}
