import { failure, success } from "@/lib/api-response";
import { requireSession } from "@/lib/session";
import { cuentasService } from "@/services/cuentas.service";

export async function GET(request, { params }) {
  try {
    const session = await requireSession(request);
    const { id } = await params;
    return success(await cuentasService.movimientos(session.userId, id));
  } catch (error) {
    return failure(error);
  }
}
