import { failure, success } from "@/lib/api-response";
import { requireSession } from "@/lib/session";
import { recurrentesService } from "@/services/recurrentes.service";

export async function POST(request) { try { const session = await requireSession(request); const fecha = new Date().toISOString().slice(0, 10); return success(await recurrentesService.ejecutarPendientes(session.userId, fecha)); } catch (error) { return failure(error); } }
