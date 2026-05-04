import { useState, useEffect, useCallback, useRef } from "react"
import {
  BookOpen, FileText, Settings, Save, LogOut,
  Bell, Crown, Menu, X, WandIcon,
  LayoutDashboard, ChevronLeft, ChevronRight
} from "lucide-react"
import { useGlobals } from "./Globals"

const MOBILE_BP = 768

const getUserInitials = (name) => {
  if (!name) return "U"
  return name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase()
}

const SubBadge = ({ subscription }) => {
  if (!subscription || subscription.status !== "active") return null
  const { plan } = subscription
  const colors = { basic: "#185FA5", premium: "#534AB7", pro: "#854F0B" }
  const bg = { basic: "#00C8FF20", premium: "#9B6BFF20", pro: "#FF9B3B20" }
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 10px", borderRadius: 100, fontSize: 10, fontFamily: "'Space Mono',monospace", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", background: bg[plan] || "#1A1D25", color: colors[plan] || "#6A6A62", border: `1px solid ${colors[plan] || "#2A2D35"}40` }}>
      {plan === "pro" && <Crown size={10} aria-hidden="true" />}
      {plan}
    </span>
  )
}

const NavItem = ({ item, isActive, collapsed, badge, onClick }) => {
  const Icon = item.icon
  const [focusVisible, setFocusVisible] = useState(false)
  return (
    <button
      type="button"
      aria-label={collapsed ? item.label : undefined}
      onClick={onClick}
      title={collapsed ? item.label : ""}
      onFocus={() => setFocusVisible(true)}
      onBlur={() => setFocusVisible(false)}
      style={{
        width: "100%", display: "flex", alignItems: "center",
        gap: collapsed ? 0 : 12,
        padding: collapsed ? "11px 0" : "10px 14px",
        justifyContent: collapsed ? "center" : "flex-start",
        borderRadius: 12,
        border: isActive ? "1px solid #00FF7F30" : "1px solid transparent",
        background: isActive ? "#0D1410" : "transparent",
        color: isActive ? "#00FF7F" : "#6A6A62",
        cursor: "pointer", transition: "all .2s",
        fontFamily: "'DM Sans',sans-serif",
        fontSize: 14, fontWeight: isActive ? 600 : 400,
        position: "relative",
        outline: focusVisible ? "2px solid #00FF7F" : "none",
        outlineOffset: 2,
      }}
      onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = "#0D0F16"; e.currentTarget.style.color = "#B8B8B0" } }}
      onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#6A6A62" } }}
    >
      {isActive && <div style={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", width: 3, height: 20, background: "#00FF7F", borderRadius: "0 2px 2px 0" }} />}
      <Icon size={16} style={{ flexShrink: 0 }} aria-hidden="true" />
      {!collapsed && (
        <>
          <span style={{ flex: 1, textAlign: "left", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.label}</span>
          {badge > 0 && (
            <span style={{ background: "#00FF7F", color: "#080A0F", fontSize: 10, fontWeight: 700, borderRadius: 100, minWidth: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 5px", fontFamily: "'Space Mono',monospace" }}>
              {Math.min(badge, 9)}
            </span>
          )}
        </>
      )}
    </button>
  )
}

const UserSection = ({ user, subscription, collapsed, loading, onLogout }) => (
  <div style={{ borderTop: "1px solid #1A1D25", paddingTop: 16 }}>
    {!collapsed && subscription && <div style={{ marginBottom: 12, display: "flex", justifyContent: "center" }}><SubBadge subscription={subscription} /></div>}
    <div style={{ display: "flex", alignItems: "center", gap: collapsed ? 0 : 10, marginBottom: 12, justifyContent: collapsed ? "center" : "flex-start" }}>
      <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#00FF7F40,#00C8FF40)", border: "1px solid #00FF7F30", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Space Mono',monospace", fontWeight: 700, fontSize: 12, color: "#00FF7F", flexShrink: 0 }}>
        {loading
          ? <div role="status" aria-live="polite" aria-label="Loading user profile" style={{ width: 14, height: 14, border: "2px solid #00FF7F30", borderTopColor: "#00FF7F", borderRadius: "50%", animation: "spin .8s linear infinite" }} />
          : getUserInitials(user?.name)}
      </div>
      {!collapsed && (
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#E8E8E0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user?.name || "Loading…"}</div>
          <div style={{ fontSize: 11, color: "#4A4D55", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user?.role || "User"}{user?.email && ` · ${user.email.split("@")[0]}`}</div>
        </div>
      )}
    </div>
    <button
      type="button"
      aria-label={collapsed ? "Logout" : undefined}
      onClick={onLogout}
      style={{ width: "100%", display: "flex", alignItems: "center", gap: collapsed ? 0 : 8, justifyContent: collapsed ? "center" : "flex-start", padding: collapsed ? "9px 0" : "9px 14px", borderRadius: 10, background: "transparent", border: "1px solid transparent", color: "#4A4D55", cursor: "pointer", transition: "all .2s", fontFamily: "'DM Sans',sans-serif", fontSize: 13 }}
      title={collapsed ? "Logout" : ""}
      onMouseEnter={e => { e.currentTarget.style.background = "#FF444415"; e.currentTarget.style.color = "#FF6666"; e.currentTarget.style.borderColor = "#FF444430" }}
      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#4A4D55"; e.currentTarget.style.borderColor = "transparent" }}
    >
      <LogOut size={15} aria-hidden="true" />
      {!collapsed && <span>Logout</span>}
    </button>
  </div>
)

const RecentPanel = ({ activities }) => {
  if (!activities?.length) return null
  return (
    <section aria-label="Recent activity" style={{ marginBottom: 16, padding: "14px 16px", background: "#0D0F16", border: "1px solid #1A1D25", borderRadius: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 10 }}>
        <Bell size={13} color="#00FF7F" aria-hidden="true" />
        <h2 style={{ fontSize: 11, fontFamily: "'Space Mono',monospace", textTransform: "uppercase", letterSpacing: "0.08em", color: "#00FF7F", margin: 0 }}>Recent</h2>
      </div>
      {activities.slice(0, 2).map((a, i) => (
        <div key={i} style={{ fontSize: 12, color: "#5A5D65", marginBottom: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          · {a.message || a.title || "Recent activity"}
        </div>
      ))}
    </section>
  )
}

const Navigation = () => {
  const { currentView, setCurrentView, user, logout, getDashboardStats, getSubscriptionInfo, apiRequest, isAuthenticated } = useGlobals()
  const [collapsed, setCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [subscription, setSubscription] = useState(null)
  const [stats, setStats] = useState({ totalExams: 0, totalQuestions: 0, recentActivity: [] })
  const [reducedMotion, setReducedMotion] = useState(false)
  const drawerRef = useRef(null)

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "create-exam", label: "Create Exam", icon: WandIcon },
    { id: "schemes-generator", label: "Manage Schemes", icon: FileText },
    { id: "question-bank", label: "Question Bank", icon: BookOpen },
    { id: "my-exams", label: "My Exams", icon: Save },
    { id: "settings", label: "Settings", icon: Settings },
  ]

  const detectScreen = useCallback(() => { const mobile = window.innerWidth < MOBILE_BP; setIsMobile(mobile); if (!mobile) setMobileOpen(false) }, [])

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)")
    const update = () => setReducedMotion(media.matches)
    update()
    media.addEventListener("change", update)
    return () => media.removeEventListener("change", update)
  }, [])

  useEffect(() => { detectScreen(); window.addEventListener("resize", detectScreen); return () => window.removeEventListener("resize", detectScreen) }, [detectScreen])
  useEffect(() => {
    if (!mobileOpen || !drawerRef.current) return
    const node = drawerRef.current
    const focusables = node.querySelectorAll('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])')
    focusables[0]?.focus()
    const onKeyDown = (e) => {
      if (e.key === "Escape") setMobileOpen(false)
      if (e.key !== "Tab" || focusables.length === 0) return
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
    }
    node.addEventListener("keydown", onKeyDown)
    return () => node.removeEventListener("keydown", onKeyDown)
  }, [mobileOpen])

  useEffect(() => {
    if (!isAuthenticated || !user) return
    ; (async () => {
      try {
        const [dash, sub] = await Promise.all([getDashboardStats(), getSubscriptionInfo()])
        if (dash) setStats({ totalExams: dash.totalExams || 0, totalQuestions: dash.totalQuestions || 0, recentActivity: dash.recentActivity || [] })
        setSubscription(sub)
      } catch {
      } finally { setLoading(false) }
    })()
  }, [isAuthenticated, user, getDashboardStats, getSubscriptionInfo])

  const handleLogout = async () => { try { try { await apiRequest("/api/auth/logout", { method: "POST" }) } catch {} logout() } catch { logout() } }
  const navigate = (id) => { setCurrentView(id); if (isMobile) setMobileOpen(false) }
  if (!isAuthenticated) return null

  const SidebarContent = ({ isDrawer = false }) => (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", padding: isDrawer ? "24px 20px" : "28px 16px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: collapsed && !isDrawer ? 32 : 36, justifyContent: collapsed && !isDrawer ? "center" : "flex-start" }}>
        {(!collapsed || isDrawer) && <><div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#00FF7F,#00C8FF)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><span style={{ fontSize: 18 }}>📖</span></div><div style={{ flex: 1 }}><h1 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 15, letterSpacing: "-0.01em", lineHeight: 1, color: "#E8E8E0", margin: 0 }}>Mtihani Kenya</h1><div style={{ fontSize: 9, color: "#4A4D55", letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "Space Mono" }}>Exam Craft</div></div></>}
        {collapsed && !isDrawer && <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#00FF7F,#00C8FF)", display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ fontSize: 18 }}>📖</span></div>}
        {isDrawer && <button type="button" aria-label="Close navigation drawer" onClick={() => setMobileOpen(false)} style={{ marginLeft: "auto", background: "none", border: "none", color: "#4A4D55", cursor: "pointer", display: "flex", padding: 4 }}><X size={20} aria-hidden="true" /></button>}
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
        {menuItems.map(item => <NavItem key={item.id} item={item} isActive={currentView === item.id} collapsed={collapsed && !isDrawer} badge={item.id === "dashboard" ? stats.recentActivity.length : 0} onClick={() => navigate(item.id)} />)}
      </div>
      {!collapsed && <RecentPanel activities={stats.recentActivity} />}
      <UserSection user={user} subscription={subscription} collapsed={collapsed && !isDrawer} loading={loading} onLogout={handleLogout} />
    </div>
  )

  if (isMobile) return (<><style>{`@keyframes spin{to{transform:rotate(360deg)}}@media (prefers-reduced-motion: reduce){*,*::before,*::after{animation:none !important;transition:none !important;}}`}</style>
    <header style={{ position: "fixed", top: 0, left: 0, right: 0, height: 58, background: "rgba(8,10,15,.95)", backdropFilter: "blur(16px)", borderBottom: "1px solid #1A1D25", display: "flex", alignItems: "center", padding: "0 18px", zIndex: 100 }}>
      <button type="button" aria-label="Open navigation drawer" aria-expanded={mobileOpen} aria-controls="mobile-navigation-drawer" onClick={() => setMobileOpen(true)} style={{ background: "none", border: "none", color: "#E8E8E0", cursor: "pointer", padding: 4, display: "flex", alignItems: "center" }}><Menu size={22} aria-hidden="true" /></button>
      <div style={{ marginLeft: 12, fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 15, color: "#E8E8E0" }}>Mtihani Kenya</div>
      <div style={{ marginLeft: "auto", width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg,#00FF7F40,#00C8FF40)", border: "1px solid #00FF7F30", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Space Mono',monospace", fontWeight: 700, fontSize: 12, color: "#00FF7F" }}>{getUserInitials(user?.name)}</div>
    </header>
    {mobileOpen && <div onClick={() => setMobileOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(8,10,15,.7)", backdropFilter: "blur(4px)", zIndex: 150 }} />}
    <nav id="mobile-navigation-drawer" ref={drawerRef} aria-label="Primary navigation" aria-hidden={!mobileOpen} style={{ position: "fixed", top: 0, left: 0, bottom: 0, width: 260, background: "#080A0F", borderRight: "1px solid #1A1D25", transform: mobileOpen ? "translateX(0)" : "translateX(-100%)", transition: reducedMotion ? "none" : "transform .32s cubic-bezier(.4,0,.2,1)", zIndex: 200, overflowY: "auto" }}><SidebarContent isDrawer={true} /></nav>
  </>)

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Syne:wght@700;800&family=Space+Mono&display=swap'); @keyframes spin{to{transform:rotate(360deg)}} @media (prefers-reduced-motion: reduce){*,*::before,*::after{animation:none !important;transition:none !important;}} button:focus-visible{outline:2px solid #00FF7F;outline-offset:2px;}`}</style>
      <nav aria-label="Primary navigation" style={{ width: collapsed ? 72 : 240, minHeight: "100vh", background: "#080A0F", borderRight: "1px solid #1A1D25", transition: reducedMotion ? "none" : "width .3s cubic-bezier(.4,0,.2,1)", flexShrink: 0, position: "relative", fontFamily: "'DM Sans',sans-serif" }}>
        <button type="button" aria-label={collapsed ? "Expand navigation" : "Collapse navigation"} onClick={() => setCollapsed(p => !p)} style={{ position: "absolute", top: 28, right: -12, width: 24, height: 24, borderRadius: "50%", background: "#0D0F16", border: "1px solid #2A2D35", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", zIndex: 10, color: "#6A6A62", transition: "all .2s" }}>{collapsed ? <ChevronRight size={13} aria-hidden="true" /> : <ChevronLeft size={13} aria-hidden="true" />}</button>
        {loading && <div role="status" aria-live="polite" style={{ position: "absolute", inset: 0, background: "rgba(8,10,15,.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 5 }}><span style={{ position: "absolute", width: 1, height: 1, padding: 0, margin: -1, overflow: "hidden", clip: "rect(0,0,0,0)", border: 0 }}>Loading navigation data</span><div style={{ width: 24, height: 24, border: "2px solid #1A1D25", borderTopColor: "#00FF7F", borderRadius: "50%", animation: "spin .8s linear infinite" }} /></div>}
        <SidebarContent />
      </nav>
    </>
  )
}

export default Navigation
