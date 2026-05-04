const AppShell = ({ sidebar, topbar, children }) => (
  <div className="flex min-h-screen h-screen overflow-hidden bg-[var(--color-bg)] text-[var(--color-text)] font-sans">
    {sidebar}
    <main className="flex-1 overflow-y-auto pt-[var(--mobile-nav-offset)] app-main-scroll">
      {topbar}
      <div className="mx-auto w-full max-w-[1440px] px-7 py-8 pb-12">{children}</div>
    </main>
  </div>
)

export default AppShell
