import { failure, success, ApiError } from "@/lib/api-response";
import { requireSession } from "@/lib/session";
import { anulacionesService } from "@/services/anulaciones.service";
import { assertSameOrigin } from "@/lib/request-security";

export async function POST(request, { params }) {
  try {
    assertSameOrigin(request);
    const session = await requireSession(request);
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    if (body.motivo && typeof body.motivo !== "string") {
      throw new ApiError("El motivo de anulación no es válido.", 422);
    }
    return success(await anulacionesService.anularMovimiento(session.userId, id, body.motivo));
  } catch (error) {
    return failure(error);
  }
}
