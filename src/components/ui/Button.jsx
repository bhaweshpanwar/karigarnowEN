export default function Button({
  children,
  variant = 'solid',
  size = 'md',
  className = '',
  ...props
}) {
  const base = 'inline-flex items-center justify-center font-sans font-semibold transition-all duration-200 rounded-md active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    // Premium Deep Forest Green
    solid: 'bg-accent text-white hover:bg-ink shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0',
    // Minimalist Ghost
    ghost: 'bg-transparent text-mid hover:bg-bg2 hover:text-ink',
    // High-contrast Outline
    outline: 'bg-white border border-rule text-ink hover:border-ink hover:bg-bg2 shadow-sm',
    // Semantic Danger
    danger: 'bg-red text-white hover:bg-red/90 shadow-sm',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-[12px] gap-1.5',
    md: 'px-5 py-2.5 text-[13px] gap-2',
    lg: 'px-6 py-3.5 text-[15px] gap-2.5',
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
