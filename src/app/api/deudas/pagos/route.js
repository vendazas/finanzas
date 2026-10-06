import { failure, success } from "@/lib/api-response"; import { requireSession } from "@/lib/session"; import { deudasService } from "@/services/deudas.service";
export async function POST(r){try{const s=await requireSession(r);return success(await deudasService.pagar(s.userId,await r.json()),201);}catch(e){return failure(e);}}
