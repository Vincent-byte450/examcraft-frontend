import { useState, useEffect, useCallback } from "react"
import { BookOpen, FileText, Settings, Save, LogOut, Bell, Crown, Menu, X, WandIcon, LayoutDashboard, ChevronLeft, ChevronRight } from "lucide-react"
import { useGlobals } from "./Globals"
import Badge from "./ui/Badge"
import Button from "./ui/Button"
import Card from "./ui/Card"
import Spinner from "./ui/Spinner"
import Sidebar from "./ui/Sidebar"
import Topbar from "./ui/Topbar"

const MOBILE_BP = 768
const getUserInitials = (name) => (!name ? "U" : name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase())

const SubBadge = ({ subscription }) => {
  if (!subscription || subscription.status !== "active") return null
  const { plan } = subscription
  return <Badge className="border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-info)]">{plan === "pro" && <Crown size={10} />} {plan}</Badge>
}

const Navigation = () => {
  const { currentView, setCurrentView, user, logout, getDashboardStats, getSubscriptionInfo, apiRequest, isAuthenticated } = useGlobals()
  const [collapsed, setCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [subscription, setSubscription] = useState(null)
  const [stats, setStats] = useState({ recentActivity: [] })
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard }, { id: "create-exam", label: "Create Exam", icon: WandIcon },
    { id: "schemes-generator", label: "Manage Schemes", icon: FileText }, { id: "question-bank", label: "Question Bank", icon: BookOpen },
    { id: "my-exams", label: "My Exams", icon: Save }, { id: "settings", label: "Settings", icon: Settings },
  ]
  const detectScreen = useCallback(() => { const mobile = window.innerWidth < MOBILE_BP; setIsMobile(mobile); if (!mobile) setMobileOpen(false) }, [])
  useEffect(() => { detectScreen(); window.addEventListener("resize", detectScreen); return () => window.removeEventListener("resize", detectScreen) }, [detectScreen])
  useEffect(() => { const k = (e) => e.key === "Escape" && setMobileOpen(false); window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k) }, [])
  useEffect(() => { if (!isAuthenticated || !user) return; (async () => { try { const [dash, sub] = await Promise.all([getDashboardStats(), getSubscriptionInfo()]); if (dash) setStats({ recentActivity: dash.recentActivity || [] }); setSubscription(sub) } catch {} finally { setLoading(false) } })() }, [isAuthenticated, user, getDashboardStats, getSubscriptionInfo])
  if (!isAuthenticated) return null
  const nav = (id) => { setCurrentView(id); if (isMobile) setMobileOpen(false) }
  const handleLogout = async () => { try { try { await apiRequest("/api/auth/logout", { method: "POST" }) } catch {} logout() } catch { logout() } }

  const sidebarContent = (drawer = false) => <div className={`flex h-full flex-col ${drawer ? "p-5 pt-6" : "p-4 pt-7"}`}>
    <div className={`mb-8 flex items-center gap-2.5 ${collapsed && !drawer ? "justify-center" : ""}`}>
      <div className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] bg-gradient-to-br from-[var(--color-brand)] to-[var(--color-info)] text-lg">📖</div>
      {(!collapsed || drawer) && <><div className="text-sm font-extrabold text-[var(--color-text)]">Mtihani Kenya</div>{drawer && <button onClick={() => setMobileOpen(false)} className="ml-auto text-[var(--color-text-muted)]"><X size={20} /></button>}</>}
    </div>
    <div className="flex flex-1 flex-col gap-1">
      {menuItems.map((item) => {
        const Icon = item.icon
        const active = currentView === item.id
        return <button key={item.id} onClick={() => nav(item.id)} className={`relative flex w-full items-center rounded-[var(--radius-lg)] border px-3 py-2 text-sm transition-all ${collapsed && !drawer ? "justify-center" : "gap-3"} ${active ? "border-[var(--color-brand-soft)] bg-[var(--color-surface)] text-[var(--color-brand)]" : "border-transparent text-[var(--color-text-muted)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text)]"}`}><Icon size={16} />{(!collapsed || drawer) && <span className="flex-1 text-left">{item.label}</span>}</button>
      })}
    </div>
    {!collapsed && stats.recentActivity.length > 0 && <Card className="mb-3 p-3"><div className="mb-2 flex items-center gap-2 text-[var(--color-brand)]"><Bell size={13} /><span className="font-mono text-[11px] uppercase">Recent</span></div></Card>}
    <div className="border-t border-[var(--color-border)] pt-4">
      {!collapsed && <div className="mb-3 flex justify-center"><SubBadge subscription={subscription} /></div>}
      <div className={`mb-3 flex items-center ${collapsed && !drawer ? "justify-center" : "gap-2.5"}`}><div className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--color-brand-soft)] bg-gradient-to-br from-[var(--color-brand-soft)] to-[color:rgba(0,200,255,0.25)] font-mono text-xs font-bold text-[var(--color-brand)]">{loading ? <Spinner className="h-3.5 w-3.5" /> : getUserInitials(user?.name)}</div>{(!collapsed || drawer) && <div className="min-w-0"><div className="truncate text-sm font-semibold text-[var(--color-text)]">{user?.name || "Loading…"}</div></div>}</div>
      <Button onClick={handleLogout} className={`w-full ${collapsed && !drawer ? "px-0" : "justify-start"}`}><LogOut size={15} />{(!collapsed || drawer) && <span>Logout</span>}</Button>
    </div>
  </div>

  if (isMobile) return <><Topbar><button onClick={() => setMobileOpen(true)} className="text-[var(--color-text)]"><Menu size={22} /></button><div className="ml-3 font-extrabold">Mtihani Kenya</div></Topbar>{mobileOpen && <div onClick={() => setMobileOpen(false)} className="fixed inset-0 z-[150] bg-[color:rgba(8,10,15,0.7)] backdrop-blur-sm" />}
    <aside className={`fixed bottom-0 left-0 top-0 z-[200] w-[260px] overflow-y-auto border-r border-[var(--color-border)] bg-[var(--color-bg)] transition-transform duration-300 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>{sidebarContent(true)}</aside></>

  return <Sidebar className={`${collapsed ? "w-[72px]" : "w-[240px]"} transition-all duration-300`}><button onClick={() => setCollapsed((p) => !p)} className="absolute -right-3 top-7 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:border-[var(--color-brand-soft)] hover:text-[var(--color-brand)]">{collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}</button>{loading && <div className="absolute inset-0 z-10 flex items-center justify-center bg-[color:rgba(8,10,15,0.7)]"><Spinner /></div>}{sidebarContent(false)}</Sidebar>
}

export default Navigation
