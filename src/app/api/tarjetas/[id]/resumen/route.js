import { failure, success } from "@/lib/api-response";
import { requireSession } from "@/lib/session";
import { tarjetasService } from "@/services/tarjetas.service";
export async function GET(request,{params}){try{const s=await requireSession(request);const data=await tarjetasService.detalle(s.userId,(await params).id);return success(data.resumen);}catch(e){return failure(e);}}
