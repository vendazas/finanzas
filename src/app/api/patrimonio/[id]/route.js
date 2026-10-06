import { failure, success } from "@/lib/api-response";
import { requireSession } from "@/lib/session";
import { patrimonioService } from "@/services/patrimonio.service";
export async function PATCH(request, { params }) { try { const session = await requireSession(request); return success(await patrimonioService.actualizar(session.userId, (await params).id, await request.json())); } catch (error) { return failure(error); } }
