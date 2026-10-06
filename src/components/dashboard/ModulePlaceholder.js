import { EmptyState } from "@/components/ui";
import { Icon } from "@/components/layout/Icon";

export function ModulePlaceholder({ module }) {
  return (
    <div className="space-y-8">
      <section>
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-800"><Icon name={module.icon} size={24} /></div>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900">{module.label}</h1>
        <p className="mt-2 max-w-xl text-slate-600">Este módulo está listo para recibir la lógica de MiPlata. La navegación y la estructura de la interfaz ya están preparadas.</p>
      </section>
      <EmptyState title={`Aún no hay ${module.label.toLowerCase()}`} description="Cuando se implemente este módulo, sus datos se mostrarán aquí." />
    </div>
  );
}
