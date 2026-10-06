"use client";

import { useCallback, useEffect, useState } from "react";
import { Icon } from "@/components/layout/Icon";
import { Badge, Button, EmptyState, Input, Loading, Modal, Select, Table } from "@/components/ui";
import { formatCurrency } from "@/utils/formatters";
import { CuentaForm } from "./CuentaForm";

function CuentaCard({ cuenta, onEdit, onToggle, onMovements }) {
  return (
    <article className={`rounded-2xl border bg-white p-5 shadow-sm ${cuenta.activo ? "border-slate-200" : "border-slate-200 opacity-60"}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-xl text-white" style={{ backgroundColor: cuenta.color || "#1E40AF" }}>
          <Icon name={cuenta.icono || cuenta.tipoCuenta.icono || "wallet"} />
        </div>
        <Badge tone={cuenta.activo ? "green" : "amber"}>{cuenta.activo ? "Activa" : "Inactiva"}</Badge>
      </div>
      <h2 className="mt-5 font-bold text-slate-900">{cuenta.nombre}</h2>
      <p className="mt-1 text-sm text-slate-600">{cuenta.tipoCuenta.nombre} · {cuenta.moneda.codigo}</p>
      <p className="mt-5 text-2xl font-bold tracking-tight text-slate-950">{formatCurrency(cuenta.saldo, cuenta.moneda.codigo)}</p>
      <div className="mt-5 flex flex-wrap gap-2">
        <Button onClick={() => onMovements(cuenta)} variant="secondary">Movimientos</Button>
        <Button onClick={() => onEdit(cuenta)} variant="secondary">Editar</Button>
        <Button onClick={() => onToggle(cuenta)} variant="secondary">{cuenta.activo ? "Desactivar" : "Activar"}</Button>
      </div>
    </article>
  );
}

export function CuentasManager() {
  const [cuentas, setCuentas] = useState([]);
  const [catalogos, setCatalogos] = useState({ monedas: [], tiposCuenta: [] });
  const [filters, setFilters] = useState({ buscar: "", tipoCuentaId: "", monedaId: "", incluirInactivas: false });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [editing, setEditing] = useState(null);
  const [movements, setMovements] = useState(null);

  const load = useCallback(async () => {
    const params = new URLSearchParams({ ...filters, incluirInactivas: String(filters.incluirInactivas) });
    const response = await fetch(`/api/cuentas?${params}`);
    const result = await response.json();
    if (result.success) setCuentas(result.data);
    else setMessage(result.message);
    setLoading(false);
  }, [filters]);

  useEffect(() => {
    async function bootstrap() {
      const catalogResponse = await fetch("/api/cuentas/catalogos");
      const result = await catalogResponse.json();
      if (result.success) setCatalogos(result.data);
      await load();
    }

    bootstrap();
  }, [load]);

  async function toggle(cuenta) {
    const response = await fetch(`/api/cuentas/${cuenta.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ activo: !cuenta.activo }) });
    const result = await response.json();
    if (!result.success) setMessage(result.message);
    else load();
  }

  async function openMovements(cuenta) {
    setMovements({ cuenta, data: null });
    const response = await fetch(`/api/cuentas/${cuenta.id}/movimientos`);
    const result = await response.json();
    setMovements({ cuenta, data: result.success ? result.data : [] });
  }

  const columns = [
    { key: "fecha", label: "Fecha" },
    { key: "descripcion", label: "Descripción" },
    { key: "tipo", label: "Tipo" },
    { key: "monto", label: "Monto" },
  ];
  const movementRows = (movements?.data || []).map((item) => ({ ...item, descripcion: item.descripcion || item.categoria || "Sin descripción", monto: formatCurrency(item.monto, movements.cuenta.moneda.codigo) }));

  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div><p className="text-sm font-semibold text-blue-800">Tus recursos</p><h1 className="mt-1 text-3xl font-bold tracking-tight">Cuentas</h1><p className="mt-2 text-sm text-slate-600">Organiza saldos y movimientos por cada cuenta.</p></div>
        <Button onClick={() => setEditing({})}>Nueva cuenta</Button>
      </section>
      <section className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 md:grid-cols-4">
        <Input label="Buscar" name="buscar" onChange={(event) => setFilters({ ...filters, buscar: event.target.value })} placeholder="Nombre de cuenta" value={filters.buscar} />
        <Select label="Tipo" onChange={(event) => setFilters({ ...filters, tipoCuentaId: event.target.value })} options={[{ value: "", label: "Todos los tipos" }, ...catalogos.tiposCuenta.map((tipo) => ({ value: tipo.id, label: tipo.nombre }))]} value={filters.tipoCuentaId} />
        <Select label="Moneda" onChange={(event) => setFilters({ ...filters, monedaId: event.target.value })} options={[{ value: "", label: "Todas las monedas" }, ...catalogos.monedas.map((moneda) => ({ value: moneda.id, label: moneda.codigo }))]} value={filters.monedaId} />
        <label className="flex min-h-11 items-end gap-2 pb-2 text-sm font-medium text-slate-700"><input checked={filters.incluirInactivas} onChange={(event) => setFilters({ ...filters, incluirInactivas: event.target.checked })} type="checkbox" /> Mostrar inactivas</label>
      </section>
      {message && <p aria-live="polite" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">{message}</p>}
      {loading ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{[1, 2, 3].map((item) => <div className="h-64 animate-pulse rounded-2xl bg-slate-200" key={item} />)}</div> : cuentas.length ? <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{cuentas.map((cuenta) => <CuentaCard cuenta={cuenta} key={cuenta.id} onEdit={setEditing} onMovements={openMovements} onToggle={toggle} />)}</section> : <EmptyState description="Crea tu primera cuenta para registrar y consultar tus saldos." title="No hay cuentas para mostrar" />}
      <Modal isOpen={Boolean(editing)} onClose={() => setEditing(null)} title={editing?.id ? "Editar cuenta" : "Nueva cuenta"}><CuentaForm catalogos={catalogos} cuenta={editing?.id ? editing : null} onCancel={() => setEditing(null)} onSaved={() => { setEditing(null); load(); }} /></Modal>
      <Modal isOpen={Boolean(movements)} onClose={() => setMovements(null)} title={movements ? `Movimientos · ${movements.cuenta.nombre}` : "Movimientos"}>{!movements?.data ? <Loading label="Cargando movimientos" /> : movementRows.length ? <Table columns={columns} rows={movementRows} /> : <EmptyState description="Los movimientos de esta cuenta aparecerán aquí." title="Aún no hay movimientos" />}</Modal>
    </div>
  );
}
