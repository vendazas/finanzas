"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MODULES } from "@/constants/navigation";
import { Icon } from "./Icon";

export function Sidebar({ isOpen, onClose }) {
  const pathname = usePathname();

  return (
    <>
      {isOpen && <button aria-label="Cerrar menú" className="fixed inset-0 z-30 bg-slate-950/40 lg:hidden" onClick={onClose} type="button" />}
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-72 -translate-x-full flex-col bg-slate-950 px-4 py-6 text-slate-100 transition-transform duration-200 lg:translate-x-0 ${isOpen ? "translate-x-0" : ""}`}>
        <div className="flex items-center justify-between px-3">
          <Link className="text-xl font-bold tracking-tight" href="/dashboard" onClick={onClose}>
            Mi<span className="text-emerald-400">Plata</span>
          </Link>
          <button aria-label="Cerrar menú" className="min-h-11 min-w-11 rounded-lg hover:bg-slate-800 lg:hidden" onClick={onClose} type="button">
            <Icon name="close" />
          </button>
        </div>
        <nav aria-label="Navegación principal" className="mt-10 grid gap-1">
          {MODULES.map((item) => {
            const href = `/${item.slug}`;
            const isActive = pathname === href;

            return (
              <Link className={`flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors ${isActive ? "bg-blue-700 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"}`} href={href} key={item.slug} onClick={onClose}>
                <Icon name={item.icon} size={19} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto rounded-xl border border-slate-700 bg-slate-900 p-4">
          <p className="text-sm font-semibold">Tu dinero, más claro.</p>
          <p className="mt-1 text-xs leading-5 text-slate-400">Organiza tus decisiones financieras en un solo lugar.</p>
        </div>
      </aside>
    </>
  );
}
