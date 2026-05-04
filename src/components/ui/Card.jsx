const Card = ({ className = "", children }) => (
  <div className={`rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] ${className}`}>{children}</div>
)

export default Card
