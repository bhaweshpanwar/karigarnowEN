export default function Card({ children, className = '', hover = false, ...props }) {
  return (
    <div
      className={`bg-white rounded-lg transition-all duration-300 border border-rule/50 ${
        hover 
          ? 'hover:shadow-premium-hover hover:-translate-y-1 hover:border-rule shadow-premium' 
          : 'shadow-premium'
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
