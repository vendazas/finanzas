import { ApiError, failure, success } from "@/lib/api-response";
import { requireSession } from "@/lib/session";
import { cuentasService } from "@/services/cuentas.service";
import { validarCuenta } from "@/validations/cuentas.validation";

export async function GET(request, { params }) {
  try {
    const session = await requireSession(request);
    const { id } = await params;
    return success(await cuentasService.obtener(session.userId, id));
  } catch (error) {
    return failure(error);
  }
}

export async function PATCH(request, { params }) {
  try {
    const session = await requireSession(request);
    const { id } = await params;
    const datos = await request.json();

    if (typeof datos.activo === "boolean" && Object.keys(datos).length === 1) {
      return success(await cuentasService.cambiarEstado(session.userId, id, datos.activo));
    }

    const errors = validarCuenta(datos);
    if (errors.length) throw new ApiError("Revisa los datos de la cuenta.", 422, errors);
    return success(await cuentasService.actualizar(session.userId, id, datos));
  } catch (error) {
    return failure(error);
  }
}
