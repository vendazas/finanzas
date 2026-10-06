export function EmptyState({ title = "Aún no hay información", description = "Los datos aparecerán aquí cuando estén disponibles." }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
      <h2 className="font-semibold text-slate-800">{title}</h2>
      <p className="mt-2 text-sm text-slate-600">{description}</p>
    </div>
  );
}
