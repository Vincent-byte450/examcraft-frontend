const Topbar = ({ className = "", children }) => (
  <div className={`fixed left-0 right-0 top-0 z-[100] flex h-[58px] items-center border-b border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-4 backdrop-blur ${className}`}>
    {children}
  </div>
)

export default Topbar
