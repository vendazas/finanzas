import { ApiError, failure, success } from "@/lib/api-response";
import { requireSession } from "@/lib/session";
import { movimientosService } from "@/services/movimientos.service";
import { validarMovimiento } from "@/validations/movimientos.validation";
import { assertSameOrigin } from "@/lib/request-security";

function filtersFrom(url) {
  const { searchParams } = new URL(url);
  const page = Math.max(1, Number.parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(100, Math.max(1, Number.parseInt(searchParams.get("limit") || "20", 10)));
  return {
    page,
    limit,
    fechaDesde: searchParams.get("fechaDesde") || "",
    fechaHasta: searchParams.get("fechaHasta") || "",
    cuentaId: searchParams.get("cuentaId") || "",
    categoriaId: searchParams.get("categoriaId") || "",
    tipo: searchParams.get("tipo") || "",
    moneda: searchParams.get("moneda") || "",
    texto: searchParams.get("texto") || "",
  };
}

export async function GET(request) {
  try {
    assertSameOrigin(request);
    const session = await requireSession(request);
    return success(await movimientosService.listar(session.userId, filtersFrom(request.url)));
  } catch (error) {
    return failure(error);
  }
}

export async function POST(request) {
  try {
    const session = await requireSession(request);
    const datos = await request.json();
    const errors = validarMovimiento(datos);
    if (errors.length) throw new ApiError("Revisa los datos del movimiento.", 422, errors);
    return success(await movimientosService.crear(session.userId, datos), 201);
  } catch (error) {
    return failure(error);
  }
}
