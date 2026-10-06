import Link from "next/link";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth/AuthForm";
import { Card } from "@/components/ui";

export default function RegisterPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 p-6">
      <Card className="w-full max-w-md p-7 sm:p-9">
        <Link className="text-xl font-bold tracking-tight text-slate-950" href="/registro">Mi<span className="text-emerald-600">Plata</span></Link>
        <p className="mt-8 text-sm font-semibold text-blue-800">Empieza hoy</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Crea tu cuenta</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">Tu información financiera comienza contigo.</p>
        <Suspense fallback={<p className="mt-8 text-sm text-slate-600">Cargando formulario...</p>}>
          <AuthForm mode="register" />
        </Suspense>
      </Card>
    </main>
  );
}
