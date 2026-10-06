"use client";

import { useCallback, useEffect, useState } from "react";
import { Badge, Button, Card, EmptyState, Input, Loading, Modal, Select, Table } from "@/components/ui";
import { formatCurrency } from "@/utils/formatters";
import { MovimientoForm } from "./MovimientoForm";
import { RecurrentesPanel } from "./RecurrentesPanel";

export function MovimientosManager() {
  const [catalogos, setCatalogos] = useState({ cuentas: [], categorias: [] });
  const [data, setData] = useState(null);
  const [open, setOpen] = useState(false);
  const [filters, setFilters] = useState({ page: 1, fechaDesde: "", fechaHasta: "", cuentaId: "", categoriaId: "", tipo: "", moneda: "", texto: "" });

  const load = useCallback(async () => {
    const result = await fetch(`/api/movimientos?${new URLSearchParams({ ...filters, limit: "20" })}`).then((response) => response.json());
    if (result.success) setData(result.data);
  }, [filters]);

  useEffect(() => {
    async function bootstrap() {
      const result = await fetch("/api/movimientos/catalogos").then((response) => response.json());
      if (result.success) setCatalogos(result.data);
      await load();
    }
    bootstrap();
  }, [load]);

  const update = (field, value) => setFilters((current) => ({ ...current, [field]: value, page: 1 }));
  const rows = (data?.items || []).map((item) => ({ ...item, tipo: <Badge tone={item.tipo === "INGRESO" ? "green" : item.tipo === "GASTO" ? "red" : "blue"}>{item.tipo}</Badge>, descripcion: item.descripcion || "—", monto: formatCurrency(item.monto, item.moneda) }));
  const columns = [{ key: "fecha", label: "Fecha" }, { key: "tipo", label: "Tipo" }, { key: "cuenta", label: "Cuenta" }, { key: "categoria", label: "Categoría" }, { key: "descripcion", label: "Descripción" }, { key: "monto", label: "Monto" }, { key: "moneda", label: "Moneda" }];

  return <div className="space-y-6"><section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-sm font-semibold text-blue-800">Operaciones</p><h1 className="mt-1 text-3xl font-bold tracking-tight">Movimientos</h1><p className="mt-2 text-sm text-slate-600">Registra ingresos, gastos y transferencias.</p></div><Button onClick={() => setOpen(true)}>Nuevo movimiento</Button></section>
    <section className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 md:grid-cols-3 xl:grid-cols-4"><Input label="Texto" onChange={(event) => update("texto", event.target.value)} placeholder="Descripción o categoría" value={filters.texto} /><Input label="Desde" onChange={(event) => update("fechaDesde", event.target.value)} type="date" value={filters.fechaDesde} /><Input label="Hasta" onChange={(event) => update("fechaHasta", event.target.value)} type="date" value={filters.fechaHasta} /><Select label="Cuenta" onChange={(event) => update("cuentaId", event.target.value)} options={[{ value: "", label: "Todas" }, ...catalogos.cuentas.map((item) => ({ value: item.id, label: item.nombre }))]} value={filters.cuentaId} /><Select label="Categoría" onChange={(event) => update("categoriaId", event.target.value)} options={[{ value: "", label: "Todas" }, ...catalogos.categorias.map((item) => ({ value: item.id, label: item.nombre }))]} value={filters.categoriaId} /><Select label="Tipo" onChange={(event) => update("tipo", event.target.value)} options={[{ value: "", label: "Todos" }, { value: "INGRESO", label: "Ingreso" }, { value: "GASTO", label: "Gasto" }, { value: "TRANSFERENCIA_ENTRADA", label: "Transferencia entrada" }, { value: "TRANSFERENCIA_SALIDA", label: "Transferencia salida" }]} value={filters.tipo} /><Select label="Moneda" onChange={(event) => update("moneda", event.target.value)} options={[{ value: "", label: "Todas" }, { value: "BOB", label: "BOB" }, { value: "USD", label: "USD" }]} value={filters.moneda} /></section>
    {!data ? <Loading label="Cargando movimientos" /> : <><section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{data.resumen.map((item) => <Card className="p-5" key={item.moneda}><p className="font-semibold">Resumen · {item.moneda}</p><p className="mt-3 text-sm text-emerald-700">Ingresos: {formatCurrency(item.ingresos, item.moneda)}</p><p className="mt-1 text-sm text-red-700">Gastos: {formatCurrency(item.gastos, item.moneda)}</p><p className="mt-3 border-t pt-3 font-bold">Balance: {formatCurrency(item.balance, item.moneda)}</p></Card>)}</section>{rows.length ? <Table columns={columns} rows={rows} /> : <EmptyState description="Registra tu primer ingreso, gasto o transferencia." title="No hay movimientos con estos filtros" />}<div className="flex items-center justify-between text-sm"><span>Página {data.page} de {Math.max(1, data.totalPages)}</span><div className="flex gap-2"><Button disabled={data.page <= 1} onClick={() => update("page", data.page - 1)} variant="secondary">Anterior</Button><Button disabled={data.page >= data.totalPages} onClick={() => update("page", data.page + 1)} variant="secondary">Siguiente</Button></div></div></>}
    <RecurrentesPanel catalogos={catalogos} /><Modal isOpen={open} onClose={() => setOpen(false)} title="Registrar movimiento"><MovimientoForm catalogos={catalogos} onCancel={() => setOpen(false)} onSaved={() => { setOpen(false); load(); }} /></Modal></div>;
}
