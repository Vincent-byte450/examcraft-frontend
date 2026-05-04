import { memo, Profiler, useCallback, useEffect, useMemo, useState } from "react"
import {
  BookOpen,
  FileText,
  Settings,
  Save,
  LogOut,
  Bell,
  Crown,
  Menu,
  X,
  WandIcon,
  LayoutDashboard,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { useGlobals } from "./Globals"

const MOBILE_BP = 768
const MENU_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "create-exam", label: "Create Exam", icon: WandIcon },
  { id: "schemes-generator", label: "Manage Schemes", icon: FileText },
  { id: "question-bank", label: "Question Bank", icon: BookOpen },
  { id: "my-exams", label: "My Exams", icon: Save },
  { id: "settings", label: "Settings", icon: Settings },
]
const PLAN_COLORS = { basic: "#185FA5", premium: "#534AB7", pro: "#854F0B" }
const PLAN_BG = { basic: "#00C8FF20", premium: "#9B6BFF20", pro: "#FF9B3B20" }
const BASE_SPINNER = { width: 14, height: 14, borderRadius: "50%", animation: "spin .8s linear infinite" }

const getUserInitials = (name) => {
  if (!name) return "U"
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

const SubBadge = memo(function SubBadge({ subscription }) {
  if (!subscription || subscription.status !== "active") return null
  const { plan } = subscription
  const color = PLAN_COLORS[plan] || "#6A6A62"
  return (
    <span className="sub-badge" style={{ background: PLAN_BG[plan] || "#1A1D25", color, border: `1px solid ${color}40` }}>
      {plan === "pro" && <Crown size={10} />}
      {plan}
    </span>
  )
})

const NavItem = memo(function NavItem({ item, isActive, collapsed, badge, onClick }) {
  const Icon = item.icon
  const className = `nav-item ${isActive ? "is-active" : ""} ${collapsed ? "is-collapsed" : ""}`.trim()

  return (
    <button onClick={onClick} title={collapsed ? item.label : ""} className={className}>
      {isActive && <div className="nav-item-active-bar" />}
      <Icon size={16} className="nav-item-icon" />
      {!collapsed && (
        <>
          <span className="nav-item-label">{item.label}</span>
          {badge > 0 && <span className="nav-item-badge">{Math.min(badge, 9)}</span>}
        </>
      )}
    </button>
  )
})

const NavHeader = memo(function NavHeader({ collapsed, isDrawer, onCloseDrawer }) {
  return (
    <div className={`nav-header ${collapsed && !isDrawer ? "is-collapsed" : ""}`}>
      {(!collapsed || isDrawer) && (
        <>
          <div className="nav-brand-icon"><span>📖</span></div>
          <div className="nav-brand-text">
            <div className="nav-brand-title">Mtihani Kenya</div>
            <div className="nav-brand-subtitle">Exam Craft</div>
          </div>
        </>
      )}
      {collapsed && !isDrawer && <div className="nav-brand-icon"><span>📖</span></div>}
      {isDrawer && (
        <button onClick={onCloseDrawer} className="nav-close-btn">
          <X size={20} />
        </button>
      )}
    </div>
  )
})

const NavMenu = memo(function NavMenu({ currentView, collapsed, isDrawer, recentActivityCount, onNavigate }) {
  return (
    <div className="nav-menu">
      {MENU_ITEMS.map((item) => (
        <NavItem
          key={item.id}
          item={item}
          isActive={currentView === item.id}
          collapsed={collapsed && !isDrawer}
          badge={item.id === "dashboard" ? recentActivityCount : 0}
          onClick={() => onNavigate(item.id)}
        />
      ))}
    </div>
  )
})

const RecentPanel = memo(function RecentPanel({ activities }) {
  if (!activities?.length) return null
  return (
    <div className="recent-panel">
      <div className="recent-header"><Bell size={13} color="#00FF7F" /><span>Recent</span></div>
      {activities.slice(0, 2).map((a, i) => (
        <div key={i} className="recent-item">· {a.message || a.title || "Recent activity"}</div>
      ))}
    </div>
  )
})

const UserSection = memo(function UserSection({ user, subscription, collapsed, loading, onLogout }) {
  return (
    <div className="user-section">
      {!collapsed && subscription && (
        <div className="user-subscription-wrap"><SubBadge subscription={subscription} /></div>
      )}
      <div className={`user-row ${collapsed ? "is-collapsed" : ""}`}>
        <div className="user-avatar">
          {loading ? <div style={{ ...BASE_SPINNER, border: "2px solid #00FF7F30", borderTopColor: "#00FF7F" }} /> : getUserInitials(user?.name)}
        </div>
        {!collapsed && (
          <div className="user-meta">
            <div className="user-name">{user?.name || "Loading…"}</div>
            <div className="user-role">{user?.role || "User"}{user?.email && ` · ${user.email.split("@")[0]}`}</div>
          </div>
        )}
      </div>
      <button onClick={onLogout} title={collapsed ? "Logout" : ""} className={`logout-btn ${collapsed ? "is-collapsed" : ""}`}>
        <LogOut size={15} />
        {!collapsed && <span>Logout</span>}
      </button>
    </div>
  )
})

const NavFooter = memo(function NavFooter(props) {
  const { collapsed, recentActivity, ...userSectionProps } = props
  return (
    <>
      {!collapsed && <RecentPanel activities={recentActivity} />}
      <UserSection collapsed={collapsed} {...userSectionProps} />
    </>
  )
})

const SidebarContent = memo(function SidebarContent(props) {
  const { isDrawer = false, collapsed, currentView, stats, user, subscription, loading, onCloseDrawer, onNavigate, onLogout } = props
  const isCollapsed = collapsed && !isDrawer
  return (
    <div className={`sidebar-content ${isDrawer ? "is-drawer" : ""}`}>
      <NavHeader collapsed={collapsed} isDrawer={isDrawer} onCloseDrawer={onCloseDrawer} />
      <NavMenu currentView={currentView} collapsed={collapsed} isDrawer={isDrawer} recentActivityCount={stats.recentActivity.length} onNavigate={onNavigate} />
      <NavFooter user={user} subscription={subscription} collapsed={isCollapsed} loading={loading} onLogout={onLogout} recentActivity={stats.recentActivity} />
    </div>
  )
})

const MobileDrawer = memo(function MobileDrawer({ mobileOpen, userInitials, onOpen, onClose, sidebarProps }) {
  return (
    <>
      <div className="mobile-topbar">
        <button onClick={onOpen} className="mobile-menu-btn"><Menu size={22} /></button>
        <div className="mobile-brand">Mtihani Kenya</div>
        <div className="mobile-avatar">{userInitials}</div>
      </div>
      {mobileOpen && <div onClick={onClose} className="mobile-overlay" />}
      <div className={`mobile-drawer ${mobileOpen ? "open" : ""}`}>
        <SidebarContent {...sidebarProps} isDrawer={true} />
      </div>
    </>
  )
})

const DesktopSidebar = memo(function DesktopSidebar({ collapsed, loading, onToggleCollapsed, sidebarProps }) {
  return (
    <nav className={`desktop-sidebar ${collapsed ? "is-collapsed" : ""}`}>
      <button onClick={onToggleCollapsed} className="collapse-toggle">
        {collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
      </button>
      {loading && (
        <div className="sidebar-loading-overlay">
          <div style={{ ...BASE_SPINNER, width: 24, height: 24, border: "2px solid #1A1D25", borderTopColor: "#00FF7F" }} />
        </div>
      )}
      <SidebarContent {...sidebarProps} />
    </nav>
  )
})

const Navigation = () => {
  const { currentView, setCurrentView, user, logout, getDashboardStats, getSubscriptionInfo, apiRequest, isAuthenticated } = useGlobals()
  const [collapsed, setCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [subscription, setSubscription] = useState(null)
  const [stats, setStats] = useState({ totalExams: 0, totalQuestions: 0, recentActivity: [] })

  const detectScreen = useCallback(() => {
    const mobile = window.innerWidth < MOBILE_BP
    setIsMobile(mobile)
    if (!mobile) setMobileOpen(false)
  }, [])

  useEffect(() => {
    detectScreen()
    window.addEventListener("resize", detectScreen)
    return () => window.removeEventListener("resize", detectScreen)
  }, [detectScreen])

  useEffect(() => {
    const k = (e) => {
      if (e.key === "Escape") setMobileOpen(false)
    }
    window.addEventListener("keydown", k)
    return () => window.removeEventListener("keydown", k)
  }, [])

  useEffect(() => {
    if (!isAuthenticated || !user) return
    ;(async () => {
      try {
        const [dash, sub] = await Promise.all([getDashboardStats(), getSubscriptionInfo()])
        if (dash) setStats({ totalExams: dash.totalExams || 0, totalQuestions: dash.totalQuestions || 0, recentActivity: dash.recentActivity || [] })
        setSubscription(sub)
      } catch {
      } finally {
        setLoading(false)
      }
    })()
  }, [isAuthenticated, user, getDashboardStats, getSubscriptionInfo])

  const handleLogout = useCallback(async () => {
    try {
      try { await apiRequest("/api/auth/logout", { method: "POST" }) } catch {}
      logout()
    } catch {
      logout()
    }
  }, [apiRequest, logout])

  const navigate = useCallback((id) => {
    setCurrentView(id)
    if (isMobile) setMobileOpen(false)
  }, [isMobile, setCurrentView])

  const handleNavProfile = useCallback((id, phase, actualDuration) => {
    if (process.env.NODE_ENV !== "production") {
      console.debug(`[NavProfiler] ${id} ${phase} ${actualDuration.toFixed(2)}ms`)
    }
  }, [])

  const sidebarProps = useMemo(() => ({
    collapsed,
    currentView,
    stats,
    user,
    subscription,
    loading,
    onCloseDrawer: () => setMobileOpen(false),
    onNavigate: navigate,
    onLogout: handleLogout,
  }), [collapsed, currentView, stats, user, subscription, loading, navigate, handleLogout])

  if (!isAuthenticated) return null

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Syne:wght@700;800&family=Space+Mono&display=swap');@keyframes spin{to{transform:rotate(360deg)}}.sub-badge{display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:100px;font-size:10px;font-family:'Space Mono',monospace;font-weight:700;letter-spacing:.06em;text-transform:uppercase}.nav-item{width:100%;display:flex;align-items:center;gap:12px;padding:10px 14px;justify-content:flex-start;border-radius:12px;border:1px solid transparent;background:transparent;color:#6A6A62;cursor:pointer;transition:all .2s;font-family:'DM Sans',sans-serif;font-size:14px;font-weight:400;position:relative}.nav-item:hover{background:#0D0F16;color:#B8B8B0}.nav-item.is-active{border-color:#00FF7F30;background:#0D1410;color:#00FF7F;font-weight:600}.nav-item.is-collapsed{gap:0;padding:11px 0;justify-content:center}.nav-item-icon{flex-shrink:0}.nav-item-active-bar{position:absolute;left:0;top:50%;transform:translateY(-50%);width:3px;height:20px;background:#00FF7F;border-radius:0 2px 2px 0}.nav-item-label{flex:1;text-align:left;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.nav-item-badge{background:#00FF7F;color:#080A0F;font-size:10px;font-weight:700;border-radius:100px;min-width:18px;height:18px;display:flex;align-items:center;justify-content:center;padding:0 5px;font-family:'Space Mono',monospace}.sidebar-content{display:flex;flex-direction:column;height:100%;padding:28px 16px}.sidebar-content.is-drawer{padding:24px 20px}.nav-header{display:flex;align-items:center;gap:10px;margin-bottom:36px}.nav-header.is-collapsed{justify-content:center;margin-bottom:32px}.nav-brand-icon{width:36px;height:36px;border-radius:10px;background:linear-gradient(135deg,#00FF7F,#00C8FF);display:flex;align-items:center;justify-content:center;flex-shrink:0}.nav-brand-title{font-family:'Syne',sans-serif;font-weight:800;font-size:15px;letter-spacing:-.01em;line-height:1;color:#E8E8E0}.nav-brand-subtitle{font-size:9px;color:#4A4D55;letter-spacing:.1em;text-transform:uppercase;font-family:'Space Mono',monospace}.nav-close-btn{margin-left:auto;background:none;border:none;color:#4A4D55;cursor:pointer;display:flex;padding:4px}.nav-menu{flex:1;display:flex;flex-direction:column;gap:4px}.recent-panel{margin-bottom:16px;padding:14px 16px;background:#0D0F16;border:1px solid #1A1D25;border-radius:12px}.recent-header{display:flex;align-items:center;gap:7px;margin-bottom:10px}.recent-header span{font-size:11px;font-family:'Space Mono',monospace;text-transform:uppercase;letter-spacing:.08em;color:#00FF7F}.recent-item{font-size:12px;color:#5A5D65;margin-bottom:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.user-section{border-top:1px solid #1A1D25;padding-top:16px}.user-subscription-wrap{margin-bottom:12px;display:flex;justify-content:center}.user-row{display:flex;align-items:center;gap:10px;margin-bottom:12px}.user-row.is-collapsed{gap:0;justify-content:center}.user-avatar{width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#00FF7F40,#00C8FF40);border:1px solid #00FF7F30;display:flex;align-items:center;justify-content:center;font-family:'Space Mono',monospace;font-weight:700;font-size:12px;color:#00FF7F;flex-shrink:0}.user-meta{flex:1;min-width:0}.user-name{font-size:13px;font-weight:600;color:#E8E8E0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.user-role{font-size:11px;color:#4A4D55;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.logout-btn{width:100%;display:flex;align-items:center;gap:8px;justify-content:flex-start;padding:9px 14px;border-radius:10px;background:transparent;border:1px solid transparent;color:#4A4D55;cursor:pointer;transition:all .2s;font-family:'DM Sans',sans-serif;font-size:13px}.logout-btn.is-collapsed{gap:0;justify-content:center;padding:9px 0}.logout-btn:hover{background:#FF444415;color:#FF6666;border-color:#FF444430}.mobile-topbar{position:fixed;top:0;left:0;right:0;height:58px;background:rgba(8,10,15,.95);backdrop-filter:blur(16px);border-bottom:1px solid #1A1D25;display:flex;align-items:center;padding:0 18px;z-index:100}.mobile-menu-btn{background:none;border:none;color:#E8E8E0;cursor:pointer;padding:4px;display:flex;align-items:center}.mobile-brand{margin-left:12px;font-family:'Syne',sans-serif;font-weight:800;font-size:15px;color:#E8E8E0}.mobile-avatar{margin-left:auto;width:34px;height:34px;border-radius:50%;background:linear-gradient(135deg,#00FF7F40,#00C8FF40);border:1px solid #00FF7F30;display:flex;align-items:center;justify-content:center;font-family:'Space Mono',monospace;font-weight:700;font-size:12px;color:#00FF7F}.mobile-overlay{position:fixed;inset:0;background:rgba(8,10,15,.7);backdrop-filter:blur(4px);z-index:150}.mobile-drawer{position:fixed;top:0;left:0;bottom:0;width:260px;background:#080A0F;border-right:1px solid #1A1D25;transform:translateX(-100%);transition:transform .32s cubic-bezier(.4,0,.2,1);z-index:200;overflow-y:auto}.mobile-drawer.open{transform:translateX(0)}.desktop-sidebar{width:240px;min-height:100vh;background:#080A0F;border-right:1px solid #1A1D25;transition:width .3s cubic-bezier(.4,0,.2,1);flex-shrink:0;position:relative;font-family:'DM Sans',sans-serif}.desktop-sidebar.is-collapsed{width:72px}.collapse-toggle{position:absolute;top:28px;right:-12px;width:24px;height:24px;border-radius:50%;background:#0D0F16;border:1px solid #2A2D35;display:flex;align-items:center;justify-content:center;cursor:pointer;z-index:10;color:#6A6A62;transition:all .2s}.collapse-toggle:hover{border-color:#00FF7F50;color:#00FF7F}.sidebar-loading-overlay{position:absolute;inset:0;background:rgba(8,10,15,.7);display:flex;align-items:center;justify-content:center;z-index:5}`}</style>
      <Profiler id="navigation" onRender={handleNavProfile}>
        {isMobile ? (
          <MobileDrawer mobileOpen={mobileOpen} userInitials={getUserInitials(user?.name)} onOpen={() => setMobileOpen(true)} onClose={() => setMobileOpen(false)} sidebarProps={sidebarProps} />
        ) : (
          <DesktopSidebar collapsed={collapsed} loading={loading} onToggleCollapsed={() => setCollapsed((p) => !p)} sidebarProps={sidebarProps} />
        )}
      </Profiler>
    </>
  )
}

export default Navigation
