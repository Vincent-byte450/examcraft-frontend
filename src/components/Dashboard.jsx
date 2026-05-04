import { useState, useEffect, useRef } from "react"
import {
  BookOpen, FileText, Eye, Edit3, Plus, RefreshCw,
  AlertCircle, Target, TrendingUp, Calendar,
  CheckCircle2, Award, Activity, ArrowRight,
  Zap, BarChart3, Clock, Sparkles
} from "lucide-react"
import { useGlobals } from "./Globals"
import AdBanner from "./AdBanner"

/* ─── tiny fade-in hook ──────────────────────────────────── */
const useInView = () => {
  const ref = useRef(null)
  const [v, setV] = useState(false)
  useEffect(() => {
    const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) setV(true) }, { threshold: 0.1 })
    if (ref.current) o.observe(ref.current)
    return () => o.disconnect()
  }, [])
  return [ref, v]
}

const FadeIn = ({ children, delay = 0, style = {} }) => {
  const [ref, v] = useInView()
  return (
    <div ref={ref} style={{ opacity: v?1:0, transform: v?"translateY(0)":"translateY(20px)", transition:`opacity .6s ease ${delay}ms, transform .6s ease ${delay}ms`, ...style }}>
      {children}
    </div>
  )
}

/* ─── counter ────────────────────────────────────────────── */
const Counter = ({ target }) => {
  const [n, setN] = useState(0)
  const [ref, v] = useInView()
  useEffect(() => {
    if (!v) return
    let c = 0
    const step = Math.ceil(target / (1200 / 16))
    const t = setInterval(() => { c += step; if (c >= target) { setN(target); clearInterval(t) } else setN(c) }, 16)
    return () => clearInterval(t)
  }, [v, target])
  return <span ref={ref}>{n.toLocaleString()}</span>
}

/* ─── stat card ──────────────────────────────────────────── */
const StatCard = ({ title, value, icon: Icon, accentColor, trend, hint, loading }) => (
  <FadeIn>
    <div style={{ background:"#0D0F16", border:"1px solid #1A1D25", borderRadius:16, padding:"24px", transition:"all .3s", cursor:"default", position:"relative", overflow:"hidden" }}
      onMouseEnter={e => { e.currentTarget.style.borderColor=`${accentColor}40`; e.currentTarget.style.boxShadow=`0 0 32px ${accentColor}10`; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor="#1A1D25"; e.currentTarget.style.boxShadow="none"; }}>
      {/* accent strip */}
      <div style={{ position:"absolute", top:0, left:0, right:0, height:2, background:`linear-gradient(90deg,${accentColor}80,transparent)` }}/>

      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:16 }}>
        <div style={{ width:40, height:40, borderRadius:11, background:`${accentColor}15`, border:`1px solid ${accentColor}25`, display:"flex", alignItems:"center", justifyContent:"center" }}>
          <Icon size={18} color={accentColor}/>
        </div>
        {trend && (
          <div style={{ display:"flex", alignItems:"center", gap:4, padding:"3px 10px", background:"#00FF7F15", border:"1px solid #00FF7F30", borderRadius:100, fontSize:11, color:"#00FF7F", fontFamily:"'Space Mono',monospace" }}>
            <TrendingUp size={10}/> {trend}
          </div>
        )}
      </div>

      <div style={{ fontSize:11, color:"#4A4D55", fontFamily:"'Space Mono',monospace", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:6 }}>{title}</div>
      {loading
        ? <div style={{ height:36, width:80, background:"#1A1D25", borderRadius:6, animation:"pulse 1.5s ease-in-out infinite" }}/>
        : <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:36, color:"#E8E8E0", letterSpacing:"-0.03em", lineHeight:1 }}>
            <Counter target={typeof value === "number" ? value : 0}/>
          </div>
      }
    </div>
  </FadeIn>
)

/* ─── quick action card ──────────────────────────────────── */
const QuickCard = ({ title, desc, icon: Icon, onClick, accentColor }) => (
  <button
    onClick={onClick}
    style={{ width:"100%", textAlign:"left", padding:"20px", background:"#0D0F16", border:`1px dashed #2A2D35`, borderRadius:14, cursor:"pointer", transition:"all .25s", fontFamily:"'DM Sans',sans-serif" }}
    onMouseEnter={e => { e.currentTarget.style.borderColor=`${accentColor}60`; e.currentTarget.style.background="#0D1410"; e.currentTarget.style.transform="translateY(-2px)"; }}
    onMouseLeave={e => { e.currentTarget.style.borderColor="#2A2D35"; e.currentTarget.style.background="#0D0F16"; e.currentTarget.style.transform="translateY(0)"; }}
  >
    <div style={{ display:"flex", alignItems:"flex-start", gap:14 }}>
      <div style={{ width:38, height:38, borderRadius:10, background:`${accentColor}15`, border:`1px solid ${accentColor}25`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
        <Icon size={17} color={accentColor}/>
      </div>
      <div>
        <div style={{ fontSize:14, fontWeight:600, color:"#E8E8E0", marginBottom:4 }}>{title}</div>
        <div style={{ fontSize:12, color:"#5A5D65", lineHeight:1.5 }}>{desc}</div>
      </div>
    </div>
  </button>
)

/* ─── exam row ───────────────────────────────────────────── */
const ExamRow = ({ exam, index, onView, onEdit }) => {
  const formatDate = (d) => d ? new Date(d).toLocaleDateString("en-KE", { month:"short", day:"numeric", year:"numeric" }) : "—"
  return (
    <div
      style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"14px 16px", background:"#0D0F16", borderRadius:12, border:"1px solid #1A1D25", transition:"all .2s" }}
      onMouseEnter={e => { e.currentTarget.style.borderColor="#2A2D35"; e.currentTarget.style.background="#0F1118"; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor="#1A1D25"; e.currentTarget.style.background="#0D0F16"; }}
    >
      <div style={{ display:"flex", alignItems:"center", gap:14, flex:1, minWidth:0 }}>
        <div style={{ width:40, height:40, borderRadius:10, background:"linear-gradient(135deg,#00FF7F20,#00C8FF20)", border:"1px solid #00FF7F20", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
          <FileText size={16} color="#00FF7F"/>
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:14, fontWeight:600, color:"#E8E8E0", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", marginBottom:3 }}>{exam.title || `Exam ${index + 1}`}</div>
          <div style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
            <span style={{ display:"flex", alignItems:"center", gap:4, fontSize:12, color:"#5A5D65" }}><BookOpen size={11}/> {exam.subject || "Unknown"}</span>
            <span style={{ display:"flex", alignItems:"center", gap:4, fontSize:12, color:"#5A5D65" }}><CheckCircle2 size={11}/> {exam.totalQuestions || exam.questions?.length || 0} questions</span>
            {exam.curriculum && <span style={{ fontSize:10, padding:"2px 8px", background:"#1A1D25", border:"1px solid #2A2D35", borderRadius:100, color:"#5A5D65", fontFamily:"'Space Mono',monospace" }}>{exam.curriculum}</span>}
          </div>
        </div>
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:8, marginLeft:12, flexShrink:0 }}>
        <span style={{ fontSize:11, color:"#3A3D45", fontFamily:"'Space Mono',monospace", display:"none" }} className="exam-date">{formatDate(exam.createdAt || exam.date)}</span>
        <button onClick={() => onView(exam)} title="View" style={{ width:32, height:32, borderRadius:8, background:"none", border:"1px solid transparent", color:"#4A4D55", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", transition:"all .2s" }}
          onMouseEnter={e => { e.currentTarget.style.background="#00C8FF15"; e.currentTarget.style.borderColor="#00C8FF30"; e.currentTarget.style.color="#00C8FF"; }}
          onMouseLeave={e => { e.currentTarget.style.background="none"; e.currentTarget.style.borderColor="transparent"; e.currentTarget.style.color="#4A4D55"; }}
        ><Eye size={14}/></button>
        <button onClick={() => onEdit(exam)} title="Edit" style={{ width:32, height:32, borderRadius:8, background:"none", border:"1px solid transparent", color:"#4A4D55", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", transition:"all .2s" }}
          onMouseEnter={e => { e.currentTarget.style.background="#00FF7F15"; e.currentTarget.style.borderColor="#00FF7F30"; e.currentTarget.style.color="#00FF7F"; }}
          onMouseLeave={e => { e.currentTarget.style.background="none"; e.currentTarget.style.borderColor="transparent"; e.currentTarget.style.color="#4A4D55"; }}
        ><Edit3 size={14}/></button>
      </div>
    </div>
  )
}

/* ─── skeleton ───────────────────────────────────────────── */
const Skeleton = ({ h = 60, r = 12 }) => (
  <div style={{ height:h, background:"#0D0F16", borderRadius:r, animation:"pulse 1.5s ease-in-out infinite" }}/>
)

/* ─── DASHBOARD ──────────────────────────────────────────── */
const Dashboard = () => {
  const [stats, setStats]           = useState({ totalExams:0, thisMonth:0, subjects:0, questionBank:0 })
  const [recentExams, setRecentExams] = useState([])
  const [loadingStats, setLoadingStats] = useState(true)
  const [loadingExams, setLoadingExams] = useState(true)
  const [examsError, setExamsError]   = useState(null)
  const [statsError, setStatsError]   = useState(null)

  const { setCurrentView, user, getDashboardStats, searchExams, showNotification, setCurrentExam } = useGlobals()

  const fetchStats = async () => {
    try {
      setLoadingStats(true); setStatsError(null)
      const d = await getDashboardStats()
      if (d) setStats({ totalExams: d.stats.totalExams||0, thisMonth: d.stats.thisMonth||0, subjects: d.stats.subjects||0, questionBank: d.stats.questionBank||0 })
    } catch { setStatsError("Failed to load statistics") }
    finally { setLoadingStats(false) }
  }

  const fetchExams = async () => {
    try {
      setLoadingExams(true); setExamsError(null)
      const d = await searchExams("", { limit:5, sortBy:"createdAt", sortOrder:"desc" })
      setRecentExams(d?.exams || [])
    } catch { setExamsError("Failed to load recent exams"); setRecentExams([]) }
    finally { setLoadingExams(false) }
  }

  useEffect(() => { if (user) { fetchStats(); fetchExams() } }, [user])

  const handleRefresh = () => { fetchStats(); fetchExams(); showNotification("Dashboard refreshed", "success") }

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return "Good morning"
    if (h < 18) return "Good afternoon"
    return "Good evening"
  }

  const STAT_CARDS = [
    { title:"Total Exams",     value:stats.totalExams,    icon:FileText,   accentColor:"#00FF7F" },
    { title:"This Month",      value:stats.thisMonth,     icon:Calendar,   accentColor:"#00C8FF", trend: stats.thisMonth > 0 ? `+${stats.thisMonth}` : null },
    { title:"Subjects",        value:stats.subjects,      icon:BookOpen,   accentColor:"#9B6BFF" },
    { title:"Question Bank",   value:stats.questionBank,  icon:Award,      accentColor:"#FF9B3B" },
  ]

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Syne:wght@700;800&family=Space+Mono&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        @keyframes spin  { to{transform:rotate(360deg)} }
        .dash-grid-stats { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; }
        .dash-grid-quick { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; }
        @media (max-width:1100px) { .dash-grid-stats { grid-template-columns:repeat(2,1fr); } }
        @media (max-width:900px)  { .dash-grid-quick { grid-template-columns:repeat(2,1fr); } }
        @media (max-width:640px)  {
          .dash-grid-stats { grid-template-columns:1fr 1fr; }
          .dash-grid-quick { grid-template-columns:1fr; }
          .exam-date { display:none !important; }
          .hero-actions { flex-direction:column; align-items:flex-start !important; }
          .hero-btns { width:100%; flex-direction:column; }
          .hero-btns button { width:100%; justify-content:center; }
        }
        @media (max-width:400px) {
          .dash-grid-stats { grid-template-columns:1fr; }
        }
      `}</style>

      <div style={{ fontFamily:"'DM Sans','Helvetica Neue',sans-serif", color:"#E8E8E0", paddingBottom:48 }}>

        {/* HERO HEADER */}
        <FadeIn delay={0}>
          <div style={{ position:"relative", borderRadius:20, overflow:"hidden", marginBottom:24, padding:"36px 36px", background:"linear-gradient(135deg,#0D1A10 0%,#080F14 50%,#0A0D1A 100%)", border:"1px solid #1A1D25" }}>
            {/* background glow */}
            <div style={{ position:"absolute", top:"-40%", left:"-10%", width:400, height:400, borderRadius:"50%", background:"radial-gradient(circle,#00FF7F12 0%,transparent 70%)", pointerEvents:"none" }}/>
            <div style={{ position:"absolute", bottom:"-40%", right:"5%", width:300, height:300, borderRadius:"50%", background:"radial-gradient(circle,#00C8FF0A 0%,transparent 70%)", pointerEvents:"none" }}/>
            {/* grid pattern */}
            <div style={{ position:"absolute", inset:0, backgroundImage:"linear-gradient(#1A1D2508 1px,transparent 1px),linear-gradient(90deg,#1A1D2508 1px,transparent 1px)", backgroundSize:"40px 40px", pointerEvents:"none" }}/>

            <div className="hero-actions" style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:20, position:"relative", zIndex:1 }}>
              <div>
                <div style={{ fontSize:11, fontFamily:"'Space Mono',monospace", textTransform:"uppercase", letterSpacing:"0.12em", color:"#00FF7F", marginBottom:8 }}>{greeting()}</div>
                <h1 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:"clamp(26px,4vw,42px)", letterSpacing:"-0.03em", lineHeight:1.05, marginBottom:8, color:"#E8E8E0" }}>
                  {user?.name || "Educator"} <span style={{ background:"linear-gradient(135deg,#00FF7F,#00C8FF)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>✦</span>
                </h1>
                <p style={{ fontSize:15, color:"#6A6A62", lineHeight:1.6 }}>Ready to create curriculum-aligned exams today?</p>
              </div>
              {/* <div className="hero-btns" style={{ display:"flex", gap:10, flexShrink:0 }}>
                <button
                  onClick={handleRefresh}
                  style={{ display:"flex", alignItems:"center", gap:7, padding:"10px 18px", background:"#1A1D25", border:"1px solid #2A2D35", borderRadius:100, color:"#9A9A90", fontSize:13, fontWeight:500, cursor:"pointer", transition:"all .2s", fontFamily:"'DM Sans',sans-serif" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor="#3A3D45"; e.currentTarget.style.color="#E8E8E0"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor="#2A2D35"; e.currentTarget.style.color="#9A9A90"; }}
                >
                  <RefreshCw size={13}/> <span>Refresh</span>
                </button>
                <button
                  onClick={() => setCurrentView("create-exam")}
                  style={{ display:"flex", alignItems:"center", gap:7, padding:"10px 22px", background:"#00FF7F", border:"none", borderRadius:100, color:"#080A0F", fontSize:13, fontWeight:700, cursor:"pointer", transition:"all .2s", fontFamily:"'DM Sans',sans-serif", boxShadow:"0 4px 20px #00FF7F25" }}
                  onMouseEnter={e => { e.currentTarget.style.background="#33FF99"; e.currentTarget.style.transform="translateY(-1px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background="#00FF7F"; e.currentTarget.style.transform="translateY(0)"; }}
                >
                  <Plus size={14}/> New Exam
                </button> 
              </div> */}
            </div>
          </div>
        </FadeIn>

        {/* STATS */}
        <div className="dash-grid-stats" style={{ marginBottom:20 }}>
          {loadingStats
            ? Array(4).fill(0).map((_,i) => <FadeIn key={i} delay={i*60}><Skeleton h={120}/></FadeIn>)
            : STAT_CARDS.map((c,i) => <StatCard key={c.title} {...c} loading={loadingStats} delay={i*60}/>)
          }
        </div>

        {statsError && (
          <div style={{ display:"flex", alignItems:"center", gap:8, padding:"12px 16px", background:"#FF444415", border:"1px solid #FF444430", borderRadius:11, fontSize:13, color:"#FF8888", marginBottom:20 }}>
            <AlertCircle size={14}/> {statsError}
          </div>
        )}

        {/* QUICK ACTIONS */}
        <FadeIn delay={200}>
          <div className="dash-grid-quick" style={{ marginBottom:20 }}>
            <QuickCard title="Create New Exam" desc="Build a fresh exam from scratch with AI" icon={Plus} onClick={() => setCurrentView("create-exam")} accentColor="#00FF7F"/>
            <QuickCard title="Browse My Exams" desc="View and manage all created exams" icon={FileText} onClick={() => setCurrentView("my-exams")} accentColor="#00C8FF"/>
            <QuickCard title="Question Library" desc="Access your collection of reusable questions" icon={BookOpen} onClick={() => setCurrentView("question-bank")} accentColor="#9B6BFF"/>
          </div>
        </FadeIn>

        {/* AD BANNER */}
        <AdBanner/>

        {/* RECENT ACTIVITY */}
        <FadeIn delay={280}>
          <div style={{ background:"#0D0F16", border:"1px solid #1A1D25", borderRadius:16, overflow:"hidden", marginTop:20 }}>
            {/* Header */}
            <div style={{ padding:"20px 24px", borderBottom:"1px solid #1A1D25", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                <div style={{ width:36, height:36, borderRadius:10, background:"#00FF7F15", border:"1px solid #00FF7F25", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <Activity size={16} color="#00FF7F"/>
                </div>
                <div>
                  <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:16, color:"#E8E8E0", letterSpacing:"-0.01em" }}>Recent Activity</div>
                  <div style={{ fontSize:12, color:"#4A4D55" }}>Your latest exams at a glance</div>
                </div>
              </div>
              <button
                onClick={() => setCurrentView("my-exams")}
                style={{ display:"flex", alignItems:"center", gap:5, padding:"7px 14px", background:"transparent", border:"1px solid #1A1D25", borderRadius:100, color:"#6A6A62", fontSize:12, fontWeight:500, cursor:"pointer", transition:"all .2s", fontFamily:"'DM Sans',sans-serif" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor="#00FF7F30"; e.currentTarget.style.color="#00FF7F"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor="#1A1D25"; e.currentTarget.style.color="#6A6A62"; }}
              >
                View All <ArrowRight size={11}/>
              </button>
            </div>

            {/* Body */}
            <div style={{ padding:"20px 24px" }}>
              {examsError && (
                <div style={{ display:"flex", alignItems:"center", gap:8, padding:"11px 14px", background:"#FF444415", border:"1px solid #FF444430", borderRadius:10, fontSize:13, color:"#FF8888", marginBottom:16 }}>
                  <AlertCircle size={13}/> {examsError}
                </div>
              )}

              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                {loadingExams
                  ? Array(3).fill(0).map((_,i) => <Skeleton key={i} h={68}/>)
                  : recentExams.length > 0
                    ? recentExams.map((exam,i) => (
                        <ExamRow key={exam.id||i} exam={exam} index={i}
                          onView={e => { setCurrentExam(e); setCurrentView("review-exam") }}
                          onEdit={e => { setCurrentExam(e); setCurrentView("edit-exam") }}
                        />
                      ))
                    : (
                      /* Empty state */
                      <div style={{ textAlign:"center", padding:"52px 24px" }}>
                        <div style={{ width:72, height:72, borderRadius:"50%", background:"#1A1D25", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px", animation:"float 4s ease-in-out infinite" }}>
                          <FileText size={28} color="#3A3D45"/>
                        </div>
                        <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:18, color:"#E8E8E0", marginBottom:8 }}>No exams yet</div>
                        <p style={{ fontSize:14, color:"#5A5D65", marginBottom:28, maxWidth:320, margin:"0 auto 28px", lineHeight:1.7 }}>
                          Start your journey by creating your first exam. It only takes a few minutes with AI.
                        </p>
                        <button
                          onClick={() => setCurrentView("create-exam")}
                          style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"12px 28px", background:"#00FF7F", border:"none", borderRadius:100, color:"#080A0F", fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", boxShadow:"0 4px 20px #00FF7F20", transition:"all .2s" }}
                          onMouseEnter={e => { e.currentTarget.style.background="#33FF99"; e.currentTarget.style.transform="translateY(-1px)"; }}
                          onMouseLeave={e => { e.currentTarget.style.background="#00FF7F"; e.currentTarget.style.transform="translateY(0)"; }}
                        >
                          <Plus size={15}/> Create Your First Exam
                        </button>
                      </div>
                    )
                }
              </div>
            </div>
          </div>
        </FadeIn>

        {/* PRO TIP */}
        <FadeIn delay={360}>
          <div style={{ marginTop:20, padding:"22px 24px", background:"#0D0F16", border:"1px solid #9B6BFF30", borderRadius:16, display:"flex", alignItems:"flex-start", gap:16 }}>
            <div style={{ width:36, height:36, borderRadius:10, background:"#9B6BFF20", border:"1px solid #9B6BFF30", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
              <Sparkles size={16} color="#9B6BFF"/>
            </div>
            <div>
              <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:14, color:"#C8A8FF", marginBottom:6 }}>Pro Tip</div>
              <p style={{ fontSize:13, color:"#6A6A62", lineHeight:1.75 }}>
                Build your question bank as you create exams. Reusable questions save hours and ensure consistency across all your assessments. Tag questions by topic for easy retrieval later.
              </p>
            </div>
          </div>
        </FadeIn>
      </div>
    </>
  )
}

export default Dashboard