import { ProfileSettings } from "@/components/auth/ProfileSettings";

export default function ConfigurationPage() {
  return (
    <div className="space-y-8">
      <section>
        <p className="text-sm font-semibold text-blue-800">Cuenta</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">Configuración</h1>
        <p className="mt-2 text-slate-600">Gestiona tu perfil y la seguridad de tu cuenta.</p>
      </section>
      <ProfileSettings />
    </div>
  );
}
