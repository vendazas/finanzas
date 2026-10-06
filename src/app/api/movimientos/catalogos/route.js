import { failure, success } from "@/lib/api-response";
import { requireSession } from "@/lib/session";
import { movimientosService } from "@/services/movimientos.service";

export async function GET(request) {
  try {
    const session = await requireSession(request);
    const tipo = new URL(request.url).searchParams.get("tipo") || null;
    return success(await movimientosService.catalogos(session.userId, tipo));
  } catch (error) {
    return failure(error);
  }
}
