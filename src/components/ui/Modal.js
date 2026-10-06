"use client";

export function Modal({ isOpen, title, children, onClose }) {
  if (!isOpen) return null;

  return (
    <div aria-modal="true" className="fixed inset-0 z-50 grid place-items-center bg-slate-950/45 p-4" role="dialog" aria-labelledby="modal-title">
      <section className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-lg font-bold" id="modal-title">{title}</h2>
          <button aria-label="Cerrar ventana" className="min-h-11 min-w-11 rounded-lg text-xl text-slate-600 hover:bg-slate-100" onClick={onClose} type="button">×</button>
        </div>
        <div className="mt-4">{children}</div>
      </section>
    </div>
  );
}
