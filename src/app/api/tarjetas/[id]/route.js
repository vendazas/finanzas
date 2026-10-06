import { failure, success } from "@/lib/api-response";
import { requireSession } from "@/lib/session";
import { tarjetasService } from "@/services/tarjetas.service";
export async function GET(request,{params}){try{const s=await requireSession(request);return success(await tarjetasService.detalle(s.userId,(await params).id));}catch(e){return failure(e);}}
export async function PATCH(request,{params}){try{const s=await requireSession(request);return success(await tarjetasService.actualizar(s.userId,(await params).id,await request.json()));}catch(e){return failure(e);}}
