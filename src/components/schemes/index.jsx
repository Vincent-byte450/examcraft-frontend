import { useState, useEffect, useCallback } from "react";
import {
  Sparkles, Calendar, BookOpen, ArrowLeft,
  FileText, TrendingUp, Layers, CheckCircle2
} from "lucide-react";
import SchemeConfigPanel from "./SchemeConfigPanel";
import MySchemes from "./MySchemes";
import SchemeDetails from "./SchemeDetails";
import { useGlobals } from "../Globals";
import ErrorMessage from "../common/ErrorMessage";
import LoadingSpinner from "../common/LoadingSpinner";

/* ─── feature card ───────────────────────────────────────── */
const FeatureCard = ({ icon: Icon, title, desc, accent }) => (
  <div
    style={{ background: "#0D0F16", border: "1px solid #1A1D25", borderRadius: 14, padding: "22px 24px", transition: "all .25s" }}
    onMouseEnter={e => { e.currentTarget.style.borderColor = `${accent}40`; e.currentTarget.style.background = `${accent}08`; e.currentTarget.style.transform = "translateY(-2px)"; }}
    onMouseLeave={e => { e.currentTarget.style.borderColor = "#1A1D25"; e.currentTarget.style.background = "#0D0F16"; e.currentTarget.style.transform = "translateY(0)"; }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
      <div style={{ width: 38, height: 38, borderRadius: 10, background: `${accent}18`, border: `1px solid ${accent}28`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Icon size={17} color={accent} />
      </div>
      <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 15, color: "#E8E8E0" }}>{title}</div>
    </div>
    <p style={{ fontSize: 13, color: "#5A5D65", lineHeight: 1.7 }}>{desc}</p>
  </div>
);

/* ─── section header ─────────────────────────────────────── */
const SectionHeader = ({ icon: Icon, title, subtitle, accent = "#00FF7F" }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24, paddingBottom: 20, borderBottom: "1px solid #1A1D25" }}>
    <div style={{ width: 38, height: 38, borderRadius: 10, background: `${accent}18`, border: `1px solid ${accent}28`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <Icon size={17} color={accent} />
    </div>
    <div>
      <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 16, color: "#E8E8E0", letterSpacing: "-0.01em" }}>{title}</div>
      <div style={{ fontSize: 12, color: "#4A4D55", marginTop: 2 }}>{subtitle}</div>
    </div>
  </div>
);

/* ─── loading screen ─────────────────────────────────────── */
const MetadataLoader = () => (
  <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 400, flexDirection: "column", gap: 20 }}>
    <div style={{ width: 64, height: 64, borderRadius: 18, background: "linear-gradient(135deg,#00FF7F,#00C8FF)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 32px #00FF7F20", animation: "schemePulse 2s ease-in-out infinite" }}>
      <Sparkles size={28} color="#080A0F" />
    </div>
    <LoadingSpinner size="large" message="Loading curriculum metadata…" />
    <style>{`@keyframes schemePulse { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.06);opacity:.8} }`}</style>
  </div>
);

/* ─── scheme overview card ───────────────────────────────── */
const SchemeOverview = ({ scheme }) => {
  const fields = [
    { label: "Subject", value: scheme.subject },
    { label: "Form",    value: `Form ${scheme.form || scheme.grade}` },
    { label: "Term",    value: scheme.term },
    { label: "Weeks",   value: `${scheme.weeks?.length || 0} weeks` },
  ];
  return (
    <div style={{ padding: "20px 24px", background: "#0D1410", border: "1px solid #00FF7F25", borderRadius: 14, marginBottom: 24, display: "flex", alignItems: "flex-start", gap: 16 }}>
      <div style={{ width: 44, height: 44, borderRadius: 12, background: "#00FF7F20", border: "1px solid #00FF7F30", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <FileText size={20} color="#00FF7F" />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 15, color: "#00FF7F", marginBottom: 12 }}>Scheme Overview</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))", gap: "10px 24px" }}>
          {fields.map(f => (
            <div key={f.label}>
              <div style={{ fontSize: 10, fontFamily: "'Space Mono',monospace", textTransform: "uppercase", letterSpacing: "0.08em", color: "#4A4D55", marginBottom: 3 }}>{f.label}</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#E8E8E0" }}>{f.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ─── MAIN ───────────────────────────────────────────────── */
const SchemeOfWorkGenerator = () => {
  const { apiRequest } = useGlobals();
  const [metadata, setMetadata]           = useState(null);
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState(null);
  const [view, setView]                   = useState("generator");
  const [selectedScheme, setSelectedScheme] = useState(null);
  const [transitioning, setTransitioning] = useState(false);

  const [formData, setFormData] = useState({
    subject: "", form: "", term: "", weeks: [],
    enhancementType: "detailed-objectives", customInstructions: "",
  });

  const handleInputChange = useCallback((field, value) => {
    setFormData(p => ({ ...p, [field]: value }));
  }, []);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      try {
        const res = await apiRequest("/api/schemes/metadata");
        if (!active) return;
        if (res?.success) setMetadata(res.data);
        else setError(res?.error || "Failed to load metadata");
      } catch (err) {
        if (active) setError("Error loading metadata: " + err.message);
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, []);

  const changeView = (next) => {
    setTransitioning(true);
    setTimeout(() => { setView(next); setTransitioning(false); }, 150);
  };

  const handleBack = () => {
    if (view === "scheme-details") { changeView("my-schemes"); setSelectedScheme(null); }
    else if (view === "my-schemes") changeView("generator");
  };

  /* header config per view */
  const HEADER = {
    generator: { eyebrow: "Scheme Builder", title: "Scheme of Work Generator", subtitle: "Create comprehensive schemes of work aligned with the curriculum", icon: Sparkles, accent: "#00FF7F" },
    "my-schemes": { eyebrow: "Library", title: "My Schemes", subtitle: "Manage and view all your saved schemes of work", icon: BookOpen, accent: "#00C8FF" },
    "scheme-details": { eyebrow: "Details", title: selectedScheme?.subject ? `${selectedScheme.subject} — Form ${selectedScheme.form || selectedScheme.grade}` : "Scheme Details", subtitle: `${selectedScheme?.term || "Term"} · Week-by-week breakdown`, icon: FileText, accent: "#9B6BFF" },
  };
  const h = HEADER[view] || HEADER.generator;

  if (loading) return <MetadataLoader />;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Syne:wght@700;800&family=Space+Mono&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        @keyframes schemeIn { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      <div style={{ fontFamily: "'DM Sans','Helvetica Neue',sans-serif", color: "#E8E8E0", paddingBottom: 48, animation: "schemeIn .5s ease forwards" }}>
        <ErrorMessage error={error} onClose={() => setError(null)} />

        {/* HERO HEADER */}
        <div style={{ position: "relative", borderRadius: 18, overflow: "hidden", marginBottom: 24, padding: "32px 36px", background: "linear-gradient(135deg,#0D1A10 0%,#080F14 60%,#0A0D1A 100%)", border: "1px solid #1A1D25" }}>
          <div style={{ position: "absolute", top: "-30%", left: "-5%", width: 400, height: 400, borderRadius: "50%", background: `radial-gradient(circle,${h.accent}10 0%,transparent 70%)`, filter: "blur(40px)", pointerEvents: "none", transition: "all .6s" }} />
          <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(#1A1D2508 1px,transparent 1px),linear-gradient(90deg,#1A1D2508 1px,transparent 1px)", backgroundSize: "40px 40px", pointerEvents: "none" }} />

          <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: `${h.accent}20`, border: `1px solid ${h.accent}30`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all .4s" }}>
                <h.icon size={24} color={h.accent} />
              </div>
              <div>
                <div style={{ fontSize: 10, fontFamily: "'Space Mono',monospace", textTransform: "uppercase", letterSpacing: "0.12em", color: h.accent, marginBottom: 4 }}>{h.eyebrow}</div>
                {/* <h1 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: "clamp(20px,3vw,30px)", letterSpacing: "-0.03em", lineHeight: 1.05, color: "#E8E8E0", marginBottom: 4 }}>{h.title}</h1> */}
                <p style={{ fontSize: 14, color: "#6A6A62" }}>{h.subtitle}</p>
              </div>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              {view !== "generator" && (
                <button
                  onClick={handleBack}
                  style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 18px", background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.12)", borderRadius: 100, color: "#E8E8E0", fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", transition: "all .2s", backdropFilter: "blur(8px)" }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,.12)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,.06)"; }}
                >
                  <ArrowLeft size={13} /> Back
                </button>
              )}
              {view === "generator" && (
                <button
                  onClick={() => changeView("my-schemes")}
                  style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 20px", background: "#00C8FF", border: "none", borderRadius: 100, color: "#080A0F", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", transition: "all .2s", boxShadow: "0 4px 20px #00C8FF25" }}
                  onMouseEnter={e => { e.currentTarget.style.background = "#33D4FF"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "#00C8FF"; e.currentTarget.style.transform = "translateY(0)"; }}
                >
                  <BookOpen size={13} /> My Schemes
                </button>
              )}
            </div>
          </div>
        </div>

        {/* FEATURE CARDS — generator only */}
        {view === "generator" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 14, marginBottom: 24 }}>
            <FeatureCard icon={Calendar}     title="Term Planning"        desc="Organise your curriculum across weeks with clear objectives and activities." accent="#00FF7F" />
            <FeatureCard icon={Layers}       title="Curriculum Aligned"   desc="Automatically aligned with CBC and KICD curriculum requirements." accent="#00C8FF" />
            <FeatureCard icon={CheckCircle2} title="Ready to Use"         desc="Generate comprehensive schemes ready for classroom implementation." accent="#9B6BFF" />
          </div>
        )}

        {/* MAIN CONTENT CARD */}
        <div style={{ background: "#0D0F16", border: "1px solid #1A1D25", borderRadius: 16, overflow: "hidden", opacity: transitioning ? 0 : 1, transition: "opacity .15s" }}>
          {view === "generator" && metadata ? (
            <div style={{ padding: "28px 28px" }}>
              <SectionHeader icon={TrendingUp} title="Configure Your Scheme" subtitle="Select subject, form level, and term to generate your scheme of work" accent="#00FF7F" />
              <SchemeConfigPanel metadata={metadata} formData={formData} onChange={handleInputChange} />
            </div>
          ) : view === "my-schemes" ? (
            <div style={{ padding: "28px 28px" }}>
              <SectionHeader icon={BookOpen} title="Saved Schemes" subtitle="Access and manage all your created schemes of work" accent="#00C8FF" />
              <MySchemes
                setSelectedScheme={scheme => {
                  setSelectedScheme(scheme);
                  changeView("scheme-details");
                }}
              />
            </div>
          ) : view === "scheme-details" && selectedScheme ? (
            <div style={{ padding: "28px 28px" }}>
              <SchemeOverview scheme={selectedScheme} />
              <SchemeDetails scheme={selectedScheme} />
            </div>
          ) : (
            /* metadata still loading */
            <div style={{ padding: "64px 24px", textAlign: "center" }}>
              <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#1A1D25", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                <Sparkles size={26} color="#3A3D45" />
              </div>
              <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 17, color: "#E8E8E0", marginBottom: 8 }}>Loading Metadata</div>
              <p style={{ fontSize: 14, color: "#4A4D55" }}>Please wait while we load the curriculum data…</p>
            </div>
          )}
        </div>

        {/* PRO TIP — generator only */}
        {view === "generator" && (
          <div style={{ marginTop: 20, padding: "22px 24px", background: "#0D0F16", border: "1px solid #00C8FF25", borderRadius: 16, display: "flex", alignItems: "flex-start", gap: 16 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "#00C8FF18", border: "1px solid #00C8FF28", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Sparkles size={16} color="#00C8FF" />
            </div>
            <div>
              <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 14, color: "#00C8FF", marginBottom: 6 }}>Pro Tip</div>
              <p style={{ fontSize: 13, color: "#6A6A62", lineHeight: 1.75 }}>
                Create schemes at the beginning of each term to stay organised. You can edit and refine your week-by-week plans as the term progresses — and reuse schemes from previous terms as templates to save hours of planning time.
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default SchemeOfWorkGenerator;