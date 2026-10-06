export function Loading({ label = "Cargando" }) {
  return <p className="text-sm text-slate-600" role="status">{label}...</p>;
}
