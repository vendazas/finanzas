import { ApiError, failure, success } from "@/lib/api-response";
import { requireSession } from "@/lib/session";
import { cuentasService } from "@/services/cuentas.service";
import { validarCuenta } from "@/validations/cuentas.validation";

export async function GET(request) {
  try {
    const session = await requireSession(request);
    const { searchParams } = new URL(request.url);
    const filtros = {
      buscar: searchParams.get("buscar") || "",
      tipoCuentaId: searchParams.get("tipoCuentaId") || "",
      monedaId: searchParams.get("monedaId") || "",
      incluirInactivas: searchParams.get("incluirInactivas") === "true",
    };
    return success(await cuentasService.listar(session.userId, filtros));
  } catch (error) {
    return failure(error);
  }
}

export async function POST(request) {
  try {
    const session = await requireSession(request);
    const datos = await request.json();
    const errors = validarCuenta(datos);
    if (errors.length) throw new ApiError("Revisa los datos de la cuenta.", 422, errors);
    return success(await cuentasService.crear(session.userId, datos), 201);
  } catch (error) {
    return failure(error);
  }
}
