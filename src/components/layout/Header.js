"use client";

import { useRouter } from "next/navigation";
import { Icon } from "./Icon";

export function Header({ onMenuClick }) {
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-20 flex min-h-18 items-center justify-between border-b border-slate-200 bg-slate-50/90 px-4 backdrop-blur md:px-8">
      <button aria-label="Abrir menú" className="min-h-11 min-w-11 rounded-xl text-slate-700 hover:bg-slate-200 lg:hidden" onClick={onMenuClick} type="button">
        <Icon name="menu" />
      </button>
      <div className="hidden lg:block"><p className="text-sm text-slate-500">Lunes, 5 de octubre</p></div>
      <div className="ml-auto flex items-center gap-3">
        <button aria-label="Ver notificaciones" className="grid min-h-11 min-w-11 place-items-center rounded-xl text-slate-600 hover:bg-slate-200" type="button">
          <Icon name="bell" />
        </button>
        <button aria-label="Cerrar sesión" className="grid h-10 w-10 place-items-center rounded-full bg-blue-800 text-sm font-bold text-white hover:bg-blue-900" onClick={logout} type="button">MP</button>
      </div>
    </header>
  );
}
