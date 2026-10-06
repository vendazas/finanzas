import { failure, success } from "@/lib/api-response";
import { requireSession } from "@/lib/session";
import { deudasService } from "@/services/deudas.service";
export async function POST(request, { params }) { try { const session = await requireSession(request); return success(await deudasService.cancelar(session.userId, (await params).id)); } catch (error) { return failure(error); } }
