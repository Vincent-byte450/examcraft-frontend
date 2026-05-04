const Button = ({ className = "", variant = "ghost", children, ...props }) => {
  const variants = {
    ghost: "bg-transparent border border-transparent text-[var(--color-text-muted)] hover:bg-[var(--color-danger-soft)] hover:text-[var(--color-danger)] hover:border-[var(--color-danger-border)]",
    primary: "bg-[var(--color-brand)] text-[var(--color-bg)] border border-[var(--color-brand)] hover:brightness-110",
  }

  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] px-3 py-2 text-sm transition-all duration-[var(--motion-duration-fast)] ${variants[variant] || variants.ghost} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export default Button
