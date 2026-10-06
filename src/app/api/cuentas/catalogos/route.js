import { failure, success } from "@/lib/api-response";
import { requireSession } from "@/lib/session";
import { cuentasService } from "@/services/cuentas.service";

export async function GET(request) {
  try {
    await requireSession(request);
    return success(await cuentasService.catalogos());
  } catch (error) {
    return failure(error);
  }
}
