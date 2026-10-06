"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button, Input } from "@/components/ui";

export function AuthForm({ mode }) {
  const isRegister = mode === "register";
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setIsSubmitting(true);
    const formData = new FormData(event.currentTarget);
    const payload = Object.fromEntries(formData.entries());

    try {
      const response = await fetch(`/api/auth/${isRegister ? "register" : "login"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();

      if (!response.ok) {
        setMessage(result.message || "No fue posible procesar la solicitud.");
        return;
      }

      router.replace(searchParams.get("next") || "/dashboard");
      router.refresh();
    } catch {
      setMessage("No pudimos conectarnos. Intenta nuevamente.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
      {isRegister && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Input autoComplete="given-name" label="Nombre" name="nombre" required />
          <Input autoComplete="family-name" label="Apellido" name="apellido" required />
        </div>
      )}
      <Input autoComplete="email" label="Correo electrónico" name="email" placeholder="tu@correo.com" required type="email" />
      <Input autoComplete={isRegister ? "new-password" : "current-password"} label="Contraseña" minLength="10" name="password" required type="password" />
      {message && <p aria-live="polite" className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-800">{message}</p>}
      <Button className="w-full" disabled={isSubmitting} type="submit">
        {isSubmitting ? "Procesando..." : isRegister ? "Crear mi cuenta" : "Iniciar sesión"}
      </Button>
      <p className="text-center text-sm text-slate-600">
        {isRegister ? "¿Ya tienes una cuenta?" : "¿Aún no tienes una cuenta?"} {" "}
        <Link className="font-semibold text-blue-800 hover:underline" href={isRegister ? "/login" : "/registro"}>
          {isRegister ? "Inicia sesión" : "Regístrate"}
        </Link>
      </p>
    </form>
  );
}
