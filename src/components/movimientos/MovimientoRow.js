import { Badge } from "@/components/ui";
import { formatCurrency } from "@/utils/formatters";

export function MovimientoRow({ movimiento }) {
  const isIncome = movimiento.tipo === "ingreso";

  return (
    <div className="flex items-center justify-between border-b border-slate-100 py-4 last:border-0">
      <div><p className="font-medium text-slate-800">{movimiento.descripcion}</p><p className="mt-1 text-xs text-slate-500">{movimiento.fecha}</p></div>
      <div className="text-right"><Badge tone={isIncome ? "green" : "red"}>{movimiento.tipo}</Badge><p className="mt-1 font-semibold">{formatCurrency(movimiento.monto)}</p></div>
    </div>
  );
}
