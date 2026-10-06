import { failure, success } from "@/lib/api-response";
import { requireSession } from "@/lib/session";

export async function GET(request) {
  try {
    await requireSession(request);
    return success({ status: "ok", application: "MiPlata" });
  } catch (error) {
    return failure(error);
  }
}
