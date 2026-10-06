"use client";

import { useState } from "react";
import { Button, Input, Select } from "@/components/ui";

const today = new Date().toISOString().slice(0, 10);

export function CuentaForm({ cuenta, catalogos, onSaved, onCancel }) {
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    const data = Object.fromEntries(new FormData(event.currentTarget).entries());
    data.incluirPatrimonio = data.incluirPatrimonio === "on";

    const response = await fetch(cuenta ? `/api/cuentas/${cuenta.id}` : "/api/cuentas", {
      method: cuenta ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await response.json();
    setSaving(false);

    if (!result.success) {
      setMessage(result.message);
      return;
    }

    onSaved();
  }

  return (
    <form className="space-y-4" onSubmit={submit}>
      <Input defaultValue={cuenta?.nombre} label="Nombre" name="nombre" required />
      <div className="grid gap-4 sm:grid-cols-2">
        <Select defaultValue={cuenta?.tipoCuentaId} label="Tipo" name="tipoCuentaId" options={[{ value: "", label: "Selecciona un tipo" }, ...catalogos.tiposCuenta.map((tipo) => ({ value: tipo.id, label: tipo.nombre }))]} required />
        <Select defaultValue={cuenta?.monedaId} label="Moneda" name="monedaId" options={[{ value: "", label: "Selecciona una moneda" }, ...catalogos.monedas.map((moneda) => ({ value: moneda.id, label: `${moneda.codigo} — ${moneda.nombre}` }))]} required />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input defaultValue={cuenta?.saldoInicial ?? "0.00"} label="Saldo inicial" name="saldoInicial" required step="0.01" type="number" />
        <Input defaultValue={cuenta?.fechaSaldoInicial ?? today} label="Fecha del saldo inicial" name="fechaSaldoInicial" required type="date" />
      </div>
      <Input defaultValue={cuenta?.descripcion ?? ""} label="Descripción (opcional)" name="descripcion" />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input defaultValue={cuenta?.color ?? "#1E40AF"} label="Color" name="color" type="color" />
        <Input defaultValue={cuenta?.icono ?? "wallet"} label="Icono" name="icono" placeholder="wallet" />
      </div>
      <label className="flex min-h-11 items-center gap-3 text-sm font-medium text-slate-700">
        <input defaultChecked={cuenta?.incluirPatrimonio ?? true} name="incluirPatrimonio" type="checkbox" />
        Incluir en patrimonio
      </label>
      {message && <p aria-live="polite" className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-800">{message}</p>}
      <div className="flex justify-end gap-3">
        <Button onClick={onCancel} type="button" variant="secondary">Cancelar</Button>
        <Button disabled={saving} type="submit">{saving ? "Guardando..." : "Guardar cuenta"}</Button>
      </div>
    </form>
  );
}
