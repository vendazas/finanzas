import { ApiError, failure, success } from "@/lib/api-response";
import { requireSession } from "@/lib/session";
import { recurrentesService } from "@/services/recurrentes.service";
import { validarRecurrente } from "@/validations/recurrentes.validation";

export async function GET(request) { try { const session = await requireSession(request); return success(await recurrentesService.listar(session.userId)); } catch (error) { return failure(error); } }
export async function POST(request) { try { const session = await requireSession(request); const datos = await request.json(); const errors = validarRecurrente(datos); if (errors.length) throw new ApiError("Revisa el movimiento recurrente.", 422, errors); return success(await recurrentesService.crear(session.userId, datos), 201); } catch (error) { return failure(error); } }
