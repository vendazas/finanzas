import { failure, success } from "@/lib/api-response";
import { requireSession } from "@/lib/session";
import { patrimonioService } from "@/services/patrimonio.service";
export async function POST(request, { params }) { try { const session = await requireSession(request); return success(await patrimonioService.desactivar(session.userId, (await params).id)); } catch (error) { return failure(error); } }
