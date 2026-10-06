"use client";

import { useEffect, useState } from "react";
import { Button, Card, Input, Loading, Select } from "@/components/ui";

export function ProfileSettings() {
  const [profile, setProfile] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/profile")
      .then((response) => response.json())
      .then((result) => {
        if (result.success) setProfile(result.data);
        else setMessage(result.message);
      })
      .catch(() => setMessage("No fue posible cargar el perfil."))
      .finally(() => setLoading(false));
  }, []);

  async function updateProfile(event) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget).entries());
    const response = await fetch("/api/auth/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    const result = await response.json();
    setMessage(result.success ? "Perfil actualizado." : result.message);
    if (result.success) setProfile(result.data);
  }

  async function changePassword(event) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget).entries());
    const response = await fetch("/api/auth/password", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    const result = await response.json();
    setMessage(result.success ? "Contraseña actualizada." : result.message);
    if (result.success) event.currentTarget.reset();
  }

  if (loading) return <Loading label="Cargando perfil" />;
  if (!profile) return <p className="text-red-700">{message || "No fue posible cargar el perfil."}</p>;

  return (
    <div className="grid max-w-4xl gap-6 lg:grid-cols-2">
      <Card className="p-6">
        <h2 className="text-lg font-bold">Perfil</h2>
        <p className="mt-1 text-sm text-slate-600">Administra tu información personal.</p>
        <form className="mt-6 space-y-4" onSubmit={updateProfile}>
          <Input defaultValue={profile.nombre} label="Nombre" name="nombre" required />
          <Input defaultValue={profile.apellido} label="Apellido" name="apellido" required />
          <Input defaultValue={profile.email} disabled label="Correo electrónico" type="email" />
          <Select defaultValue={profile.monedaBase} label="Moneda base" name="monedaBase" options={[{ value: "BOB", label: "Boliviano (BOB)" }, { value: "USD", label: "Dólar estadounidense (USD)" }]} />
          <Button type="submit">Guardar perfil</Button>
        </form>
      </Card>
      <Card className="p-6">
        <h2 className="text-lg font-bold">Contraseña</h2>
        <p className="mt-1 text-sm text-slate-600">Usa al menos 10 caracteres.</p>
        <form className="mt-6 space-y-4" onSubmit={changePassword}>
          <Input autoComplete="current-password" label="Contraseña actual" name="currentPassword" required type="password" />
          <Input autoComplete="new-password" label="Nueva contraseña" minLength="10" name="newPassword" required type="password" />
          <Button type="submit">Actualizar contraseña</Button>
        </form>
        {message && <p aria-live="polite" className="mt-4 text-sm text-slate-700">{message}</p>}
      </Card>
    </div>
  );
}
