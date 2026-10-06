import { failure, success } from "@/lib/api-response"; import { requireSession } from "@/lib/session"; import { tarjetasService } from "@/services/tarjetas.service";
export async function POST(r){try{const s=await requireSession(r);return success(await tarjetasService.pago(s.userId,await r.json()),201);}catch(e){return failure(e);}}
