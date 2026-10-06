export function Select({ label, id, options = [], className = "", ...props }) {
  const selectId = id || label?.toLowerCase().replaceAll(" ", "-");

  return (
    <label className="grid gap-1.5 text-sm font-medium text-slate-700" htmlFor={selectId}>
      {label}
      <select className={`min-h-11 rounded-xl border border-slate-300 bg-white px-3 ${className}`} id={selectId} {...props}>
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </label>
  );
}
