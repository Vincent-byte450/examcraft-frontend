const Spinner = ({ className = "" }) => (
  <div className={`h-6 w-6 rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-brand)] animate-spin ${className}`} />
)

export default Spinner
