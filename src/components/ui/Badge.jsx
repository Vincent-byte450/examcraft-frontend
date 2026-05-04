const Badge = ({ className = "", children }) => (
  <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.06em] ${className}`}>
    {children}
  </span>
)

export default Badge
