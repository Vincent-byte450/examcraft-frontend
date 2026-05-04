const Sidebar = ({ className = "", children }) => (
  <nav className={`relative min-h-screen shrink-0 border-r border-[var(--color-border)] bg-[var(--color-bg)] ${className}`}>{children}</nav>
)

export default Sidebar
