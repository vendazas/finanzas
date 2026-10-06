import { failure, success } from "@/lib/api-response";
import { requireSession } from "@/lib/session";
import { patrimonioService } from "@/services/patrimonio.service";

export async function GET(request) { try { const session = await requireSession(request); const [resumen, activos] = await Promise.all([patrimonioService.resumen(session.userId), patrimonioService.listar(session.userId)]); return success({ resumen, activos }); } catch (error) { return failure(error); } }
export async function POST(request) { try { const session = await requireSession(request); return success(await patrimonioService.crear(session.userId, await request.json()), 201); } catch (error) { return failure(error); } }
