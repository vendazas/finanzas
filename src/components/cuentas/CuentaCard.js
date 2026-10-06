import { Card } from "@/components/ui";
import { formatCurrency } from "@/utils/formatters";

export function CuentaCard({ cuenta }) {
  return (
    <Card className="p-5">
      <p className="text-sm text-slate-600">{cuenta.nombre}</p>
      <p className="mt-2 text-xl font-bold">{formatCurrency(cuenta.saldo)}</p>
    </Card>
  );
}
