"use client";

import { useEffect, useState } from "react";
import { Card, EmptyState, Loading, Table } from "@/components/ui";
import { formatCurrency } from "@/utils/formatters";

function CurrencyTotals({ totals }) {
  if (!totals.length) return <EmptyState description="Crea una cuenta para ver tus saldos separados por moneda." title="Todavía no hay saldos" />;
  return <section className="grid gap-4 sm:grid-cols-2">{totals.map((total) => <Card className="p-5" key={total.moneda}><p className="text-sm font-medium text-slate-600">Total {total.moneda}</p><p className="mt-3 text-2xl font-bold tracking-tight">{formatCurrency(total.saldo, total.moneda)}</p></Card>)}</section>;
}

function ExpenseChart({ rows }) {
  if (!rows.length) return <EmptyState description="Registra gastos categorizados para ver su distribución." title="No hay gastos este mes" />;
  const groups = rows.reduce((result, row) => {
    result[row.moneda] = [...(result[row.moneda] || []), row];
    return result;
  }, {});

  return (
    <div className="mt-5 space-y-6">
      {Object.entries(groups).map(([moneda, items]) => {
        const max = Math.max(...items.map((item) => Number(item.monto)));
        return <div key={moneda}><p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">{moneda}</p><div className="space-y-4">{items.map((row) => <div key={row.categoria}><div className="mb-1 flex justify-between gap-3 text-sm"><span className="truncate text-slate-700">{row.categoria}</span><span className="font-semibold">{formatCurrency(row.monto, row.moneda)}</span></div><div className="h-2 rounded-full bg-slate-100"><div aria-label={`${row.categoria}: ${row.monto}`} className="h-2 rounded-full bg-blue-700" style={{ width: `${Math.max(4, (Number(row.monto) / max) * 100)}%` }} /></div></div>)}</div></div>;
      })}
    </div>
  );
}

export function DashboardOverview() {
  const [data, setData] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/dashboard").then((response) => response.json()).then((result) => {
      if (result.success) setData(result.data);
      else setMessage(result.message);
    }).catch(() => setMessage("No fue posible cargar el resumen financiero."));
  }, []);

  if (message) return <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">{message}</p>;
  if (!data) return <div className="space-y-5"><Loading label="Cargando resumen financiero" /><div className="grid gap-4 md:grid-cols-3">{[1, 2, 3].map((item) => <div className="h-32 animate-pulse rounded-2xl bg-slate-200" key={item} />)}</div></div>;

  const movementColumns = [{ key: "fecha", label: "Fecha" }, { key: "descripcion", label: "Movimiento" }, { key: "cuenta", label: "Cuenta" }, { key: "monto", label: "Monto" }];
  const movementRows = data.ultimosMovimientos.map((movement) => ({ ...movement, descripcion: movement.descripcion || movement.categoria || "Sin descripción", monto: formatCurrency(movement.monto, movement.moneda) }));

  return (
    <div className="space-y-8">
      <section><p className="text-sm font-semibold text-blue-800">Resumen financiero</p><h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">Dashboard</h1><p className="mt-2 text-sm text-slate-600">Una vista clara de tus cuentas y movimientos.</p></section>
      <CurrencyTotals totals={data.totalesPorMoneda} />
      <section className="grid gap-6 xl:grid-cols-2"><Card className="p-6"><h2 className="font-bold">Presupuesto mensual</h2>{data.presupuestos?.length ? <div className="mt-4 space-y-3">{data.presupuestos.map((item) => <div key={item.id}><div className="flex justify-between text-sm"><span>{item.categoria}</span><span>{item.porcentaje}%</span></div><div className="mt-1 h-2 rounded-full bg-slate-100"><div className={`h-2 rounded-full ${item.estado === "PELIGRO" ? "bg-red-600" : item.estado === "ADVERTENCIA" ? "bg-amber-500" : "bg-emerald-600"}`} style={{ width: `${Math.min(100, item.porcentaje)}%` }} /></div><p className="mt-1 text-xs text-slate-600">Gastado {formatCurrency(item.gastado, item.moneda)} · Disponible {formatCurrency(item.disponible, item.moneda)}</p></div>)}</div> : <p className="mt-3 text-sm text-slate-600">No hay presupuestos configurados.</p>}</Card><Card className="p-6"><h2 className="font-bold">Próximos movimientos</h2>{data.proximosMovimientos?.length ? <div className="mt-4 space-y-3">{data.proximosMovimientos.map((item) => <div className="flex justify-between gap-3 text-sm" key={item.id}><span>{item.descripcion || item.tipo}</span><span className="font-semibold">{item.proximaEjecucion}</span></div>)}</div> : <p className="mt-3 text-sm text-slate-600">No hay movimientos recurrentes próximos.</p>}</Card></section>
      {data.patrimonioConvertido && <Card className="border-emerald-100 bg-emerald-50 p-5"><p className="text-sm font-medium text-emerald-900">Patrimonio convertido</p><p className="mt-2 text-2xl font-bold text-emerald-950">{formatCurrency(data.patrimonioConvertido.saldo, data.patrimonioConvertido.moneda)}</p><p className="mt-1 text-xs text-emerald-800">Calculado con los tipos de cambio registrados.</p></Card>}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {data.resumenMensual.map((item) => <Card className="p-5" key={item.moneda}><p className="text-sm font-semibold text-slate-700">Flujo mensual · {item.moneda}</p><dl className="mt-4 space-y-2 text-sm"><div className="flex justify-between"><dt className="text-slate-600">Ingresos</dt><dd className="font-semibold text-emerald-700">{formatCurrency(item.ingresos, item.moneda)}</dd></div><div className="flex justify-between"><dt className="text-slate-600">Gastos</dt><dd className="font-semibold text-red-700">{formatCurrency(item.gastos, item.moneda)}</dd></div><div className="flex justify-between border-t border-slate-200 pt-2"><dt className="font-semibold">Ahorro</dt><dd className="font-bold">{formatCurrency(item.ahorro, item.moneda)}</dd></div></dl></Card>)}
        <Card className="p-5"><p className="text-sm font-medium text-slate-600">Cuentas activas</p><p className="mt-5 text-3xl font-bold">{data.cantidadCuentas}</p></Card>
      </section>
      <section className="grid gap-6 xl:grid-cols-2">
        <Card className="p-6"><h2 className="font-bold text-slate-900">Gastos por categoría</h2><p className="mt-1 text-sm text-slate-600">Mes actual, separados por moneda.</p><ExpenseChart rows={data.gastosPorCategoria} /></Card>
        <Card className="p-6"><h2 className="font-bold text-slate-900">Tus cuentas</h2><div className="mt-5 space-y-3">{data.cuentas.length ? data.cuentas.map((cuenta) => <div className="flex items-center justify-between gap-4 rounded-xl bg-slate-50 p-3" key={cuenta.id}><div><p className="font-medium">{cuenta.nombre}</p><p className="text-xs text-slate-500">{cuenta.tipoCuenta.nombre} · {cuenta.moneda.codigo}</p></div><p className="font-semibold">{formatCurrency(cuenta.saldo, cuenta.moneda.codigo)}</p></div>) : <EmptyState description="Agrega una cuenta desde el módulo Cuentas." title="No hay cuentas activas" />}</div></Card>
      </section>
      <section><h2 className="mb-4 text-xl font-bold">Últimos movimientos</h2>{movementRows.length ? <Table columns={movementColumns} rows={movementRows} /> : <EmptyState description="Cuando registres movimientos, aparecerán en esta lista." title="Aún no hay movimientos" />}</section>
    </div>
  );
}
