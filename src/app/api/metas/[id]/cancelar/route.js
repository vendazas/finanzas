import { failure, success } from "@/lib/api-response";
import { requireSession } from "@/lib/session";
import { metasService } from "@/services/metas.service";
export async function POST(request, { params }) { try { const session = await requireSession(request); return success(await metasService.cancelar(session.userId, (await params).id)); } catch (error) { return failure(error); } }
