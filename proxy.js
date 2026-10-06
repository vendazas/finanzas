import { NextResponse } from "next/server";
import { readSessionToken, SESSION_COOKIE } from "@/lib/auth-token";

export async function proxy(request) {
  const session = await readSessionToken(request.cookies.get(SESSION_COOKIE)?.value);
  if (session) return NextResponse.next();

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/cuentas/:path*",
    "/movimientos/:path*",
    "/presupuestos/:path*",
    "/tarjetas/:path*",
    "/deudas/:path*",
    "/metas/:path*",
    "/calendario/:path*",
    "/patrimonio/:path*",
    "/reportes/:path*",
    "/configuracion/:path*",
  ],
};
