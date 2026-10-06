import { ApiError, failure, success } from "@/lib/api-response";
import { requireSession } from "@/lib/session";
import { presupuestosService } from "@/services/presupuestos.service";
import { validarPresupuesto } from "@/validations/presupuestos.validation";

function periodoActual(periodicidad) { const fecha = new Date(); if (periodicidad === "SEMANAL") { const day = fecha.getDay() || 7; fecha.setDate(fecha.getDate() - day + 1); return fecha.toISOString().slice(0, 10); } return `${fecha.toISOString().slice(0, 7)}-01`; }
export async function GET(request) { try { const session = await requireSession(request); const params = new URL(request.url).searchParams; const periodicidad = params.get("periodicidad") === "SEMANAL" ? "SEMANAL" : "MENSUAL"; const periodo = params.get("periodo") || periodoActual(periodicidad); return success(await presupuestosService.listar(session.userId, periodo, periodicidad)); } catch (error) { return failure(error); } }
export async function POST(request) { try { const session = await requireSession(request); const datos = await request.json(); const errors = validarPresupuesto(datos); if (errors.length) throw new ApiError("Revisa el presupuesto.", 422, errors); const periodicidad = datos.periodicidad || "MENSUAL"; const presupuesto = await presupuestosService.crear(session.userId, { ...datos, periodicidad, periodo: datos.periodo || periodoActual(periodicidad) }); return success(presupuesto, 201); } catch (error) { return failure(error); } }
