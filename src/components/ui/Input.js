export function Input({ label, id, className = "", ...props }) {
  const inputId = id || label?.toLowerCase().replaceAll(" ", "-");

  return (
    <label className="grid gap-1.5 text-sm font-medium text-slate-700" htmlFor={inputId}>
      {label}
      <input
        className={`min-h-11 rounded-xl border border-slate-300 bg-white px-3 text-slate-900 placeholder:text-slate-400 disabled:cursor-not-allowed disabled:bg-slate-100 ${className}`}
        id={inputId}
        {...props}
      />
    </label>
  );
}
