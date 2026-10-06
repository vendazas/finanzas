"use client";

import { useEffect, useMemo, useState } from "react";
import { Button, Input, Select } from "@/components/ui";
import { formatCurrency } from "@/utils/formatters";

const today = new Date().toISOString().slice(0, 10);

export function MovimientoForm({ catalogos, onSaved, onCancel }) {
  const [type, setType] = useState("INGRESO");
  const [categories, setCategories] = useState([]);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [originId, setOriginId] = useState("");
  const [destinationId, setDestinationId] = useState("");
  const [amount, setAmount] = useState("");
  const [rate, setRate] = useState("");

  const origin = catalogos.cuentas.find((cuenta) => cuenta.id === originId);
  const destination = catalogos.cuentas.find((cuenta) => cuenta.id === destinationId);
  const sameCurrency = origin && destination && origin.monedaId === destination.monedaId;
  const destinationAmount = useMemo(() => {
    if (!amount) return "";
    if (sameCurrency) return amount;
    if (rate && /^\d+(\.\d+)?$/.test(amount) && /^\d+(\.\d+)?$/.test(rate)) return (Number(amount) * Number(rate)).toFixed(2);
    return "";
  }, [amount, rate, sameCurrency]);

  useEffect(() => {
    if (type === "TRANSFERENCIA") return;
    fetch(`/api/movimientos/catalogos?tipo=${type}`).then((response) => response.json()).then((result) => {
      if (result.success) setCategories(result.data.categorias);
    });
  }, [type]);

  async function submit(event) {
    event.preventDefault();
    setSending(true);
    setMessage("");
    const values = Object.fromEntries(new FormData(event.currentTarget).entries());
    const isTransfer = type === "TRANSFERENCIA";
    const payload = isTransfer
      ? { cuentaOrigenId: originId, cuentaDestinoId: destinationId, montoOrigen: amount, montoDestino: destinationAmount, tipoCambio: sameCurrency ? null : rate, fecha: values.fecha, descripcion: values.descripcion }
      : { tipo: type, cuentaId: values.cuentaId, categoriaId: values.categoriaId, monto: values.monto, fecha: values.fecha, descripcion: values.descripcion, observaciones: values.observaciones };
    const response = await fetch(isTransfer ? "/api/transferencias" : "/api/movimientos", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const result = await response.json();
    setSending(false);
    if (!result.success) { setMessage(result.message); return; }
    onSaved();
  }

  return (
    <form className="space-y-4" onSubmit={submit}>
      <fieldset><legend className="mb-2 text-sm font-semibold text-slate-700">Tipo de operación</legend><div className="grid grid-cols-3 gap-2">{["INGRESO", "GASTO", "TRANSFERENCIA"].map((item) => <button aria-pressed={type === item} className={`min-h-11 rounded-xl text-sm font-semibold ${type === item ? "bg-blue-800 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`} key={item} onClick={() => setType(item)} type="button">{item}</button>)}</div></fieldset>
      {type === "TRANSFERENCIA" ? <>
        <Select label="Cuenta de origen" onChange={(event) => setOriginId(event.target.value)} options={[{ value: "", label: "Selecciona una cuenta" }, ...catalogos.cuentas.map((cuenta) => ({ value: cuenta.id, label: `${cuenta.nombre} · ${cuenta.moneda.codigo}` }))]} value={originId} />
        <Select label="Cuenta de destino" onChange={(event) => setDestinationId(event.target.value)} options={[{ value: "", label: "Selecciona una cuenta" }, ...catalogos.cuentas.filter((cuenta) => cuenta.id !== originId).map((cuenta) => ({ value: cuenta.id, label: `${cuenta.nombre} · ${cuenta.moneda.codigo}` }))]} value={destinationId} />
        <Input label={`Monto origen${origin ? ` (${origin.moneda.codigo})` : ""}`} onChange={(event) => setAmount(event.target.value)} required step="0.01" type="number" value={amount} />
        {origin && destination && !sameCurrency && <Input label="Tipo de cambio" onChange={(event) => setRate(event.target.value)} required step="0.00000001" type="number" value={rate} />}
        {origin && destination && <div className="rounded-xl bg-blue-50 p-4 text-sm text-blue-950">{sameCurrency ? <p>Las cuentas usan {origin.moneda.codigo}; el monto destino será igual al monto origen.</p> : <p>{amount || "0"} {origin.moneda.codigo} × {rate || "0"} = <strong>{destinationAmount || "0.00"} {destination.moneda.codigo}</strong></p>}</div>}
      </> : <>
        <Select label="Cuenta" name="cuentaId" options={[{ value: "", label: "Selecciona una cuenta" }, ...catalogos.cuentas.map((cuenta) => ({ value: cuenta.id, label: `${cuenta.nombre} · ${cuenta.moneda.codigo}` }))]} required />
        <Select label="Categoría" name="categoriaId" options={[{ value: "", label: "Selecciona una categoría" }, ...categories.map((categoria) => ({ value: categoria.id, label: categoria.nombre }))]} required />
        <Input label="Monto" name="monto" required step="0.01" type="number" />
        <Input label="Fecha" name="fecha" required type="date" defaultValue={today} />
        <Input label="Descripción" name="descripcion" />
        <Input label="Observaciones" name="observaciones" />
      </>}
      {type === "TRANSFERENCIA" && <><Input label="Fecha" name="fecha" required type="date" defaultValue={today} /><Input label="Descripción" name="descripcion" /></>}
      {message && <p aria-live="polite" className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-800">{message}</p>}
      <div className="flex justify-end gap-3"><Button onClick={onCancel} type="button" variant="secondary">Cancelar</Button><Button disabled={sending} type="submit">{sending ? "Registrando..." : "Confirmar"}</Button></div>
    </form>
  );
}
