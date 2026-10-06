import { failure, success } from "@/lib/api-response";
import { requireSession } from "@/lib/session";
import { metasService } from "@/services/metas.service";
export async function GET(request, { params }) { try { const session = await requireSession(request); return success(await metasService.obtener(session.userId, (await params).id)); } catch (error) { return failure(error); } }
export async function PATCH(request, { params }) { try { const session = await requireSession(request); return success(await metasService.actualizar(session.userId, (await params).id, await request.json())); } catch (error) { return failure(error); } }
