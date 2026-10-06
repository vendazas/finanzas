export function Button({ className = "", variant = "primary", type = "button", ...props }) {
  const variants = {
    primary: "bg-blue-800 text-white hover:bg-blue-900 disabled:bg-slate-300",
    secondary: "bg-slate-100 text-slate-800 hover:bg-slate-200 disabled:bg-slate-100",
    danger: "bg-red-700 text-white hover:bg-red-800 disabled:bg-red-200",
  };

  return (
    <button
      className={`inline-flex min-h-11 items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      type={type}
      {...props}
    />
  );
}
