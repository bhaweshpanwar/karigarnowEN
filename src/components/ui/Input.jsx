export default function Input({
  label,
  error,
  className = '',
  ...props
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="text-[12px] font-semibold text-mid tracking-tight px-0.5">
          {label}
        </label>
      )}
      <input
        className={`px-3.5 py-2.5 rounded-md border bg-white text-[14px] outline-none transition-all font-sans placeholder:text-muted/60
          ${error 
            ? 'border-red ring-red/10 focus:ring-4' 
            : 'border-rule focus:border-accent focus:ring-4 focus:ring-accent/5'
          } shadow-inner-soft`}
        {...props}
      />
      {error && (
        <p className="text-[11px] font-medium text-red px-0.5 animate-in fade-in">{error}</p>
      )}
    </div>
  );
}
