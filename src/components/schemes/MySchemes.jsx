import { useEffect, useState } from "react";
import { CheckCircle, Loader2, Clock, FileText, RefreshCw, ArrowRight, BookOpen } from "lucide-react";
import { useGlobals } from "../Globals";
import ErrorMessage from "../common/ErrorMessage";

const MySchemes = ({ setCurrentView, setSelectedScheme }) => {
  const [schemes, setSchemes]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const { apiRequest }          = useGlobals();

  const determineStatus = (scheme) => {
    if (!scheme.weeks?.length) return "in-progress";
    let total = 0;
    scheme.weeks.forEach(w => { total += w.lessons?.length || 0; });
    if (total === 0) return "in-progress";
    return (scheme.completedLessons?.length || 0) >= total ? "complete" : "in-progress";
  };

  const loadSchemes = async () => {
    setLoading(true); setError(null);
    try {
      const res = await apiRequest("/api/schemes/my-schemes", { method: "GET" });
      if (res?.success && Array.isArray(res.data)) {
        setSchemes(res.data.map(s => ({ ...s, status: determineStatus(s) })));
      } else {
        setError(res?.error || "Failed to load your saved schemes.");
      }
    } catch (err) {
      setError("Error loading schemes: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadSchemes(); }, []);

  /* ── loading ── */
  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 220, gap: 12 }}>
      <div style={{ width: 20, height: 20, border: "2px solid #1A1D25", borderTopColor: "#00FF7F", borderRadius: "50%", animation: "mySpin .8s linear infinite" }} />
      <span style={{ fontSize: 14, color: "#5A5D65", fontFamily: "'DM Sans',sans-serif" }}>Loading saved schemes…</span>
      <style>{`@keyframes mySpin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Syne:wght@700;800&family=Space+Mono&display=swap');
        @keyframes mySpin { to { transform: rotate(360deg); } }
        @keyframes myFadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      <div style={{ fontFamily: "'DM Sans','Helvetica Neue',sans-serif", color: "#E8E8E0" }}>
        <ErrorMessage error={error} onClose={() => setError(null)} />

        {/* sub-header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: "#00C8FF18", border: "1px solid #00C8FF28", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <FileText size={15} color="#00C8FF" />
            </div>
            <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 16, color: "#E8E8E0", letterSpacing: "-0.01em" }}>
              My Generated Schemes
            </div>
          </div>
          <button
            onClick={loadSchemes}
            style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 16px", background: "transparent", border: "1px solid #1A1D25", borderRadius: 100, color: "#6A6A62", fontSize: 13, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", transition: "all .2s" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "#2A2D35"; e.currentTarget.style.color = "#E8E8E0"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "#1A1D25"; e.currentTarget.style.color = "#6A6A62"; }}
          >
            <RefreshCw size={13} /> Refresh
          </button>
        </div>

        {/* empty state */}
        {schemes.length === 0 ? (
          <div style={{ textAlign: "center", padding: "56px 24px", animation: "myFadeUp .4s ease forwards" }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#1A1D25", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px" }}>
              <BookOpen size={26} color="#3A3D45" />
            </div>
            <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 17, color: "#E8E8E0", marginBottom: 8 }}>No saved schemes yet</div>
            <p style={{ fontSize: 14, color: "#5A5D65", maxWidth: 300, margin: "0 auto", lineHeight: 1.7 }}>
              Generate your first scheme of work using the form above to get started.
            </p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 16 }}>
            {schemes.map((scheme, idx) => {
              const done     = determineStatus(scheme) === "complete";
              const total    = scheme.weeks?.reduce((a, w) => a + (w.lessons?.length || 0), 0) || 0;
              const completed = scheme.completedLessons?.length || 0;
              const pct      = total > 0 ? Math.min((completed / total) * 100, 100).toFixed(0) : 0;
              const accent   = done ? "#00FF7F" : "#FF9B3B";

              return (
                <div
                  key={scheme._id}
                  style={{ background: "#0D0F16", border: "1px solid #1A1D25", borderRadius: 16, padding: "22px 22px", transition: "all .3s", animation: `myFadeUp .4s ease ${idx * 60}ms both`, position: "relative", overflow: "hidden" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = `${accent}40`; e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = `0 12px 40px ${accent}0C`; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "#1A1D25"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
                >
                  {/* top accent strip */}
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,${accent}70,transparent)` }} />

                  {/* title row */}
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
                    <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 16, color: "#E8E8E0", letterSpacing: "-0.01em", lineHeight: 1.25, flex: 1, paddingRight: 8 }}>
                      {scheme.subject || "Untitled"}
                    </div>
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: `${accent}18`, border: `1px solid ${accent}30`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      {done
                        ? <CheckCircle size={14} color="#00FF7F" />
                        : <Clock size={14} color="#FF9B3B" />
                      }
                    </div>
                  </div>

                  {/* meta pills */}
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
                    {[
                      scheme.grade ? `Grade ${scheme.grade}` : null,
                      scheme.term || null,
                    ].filter(Boolean).map(v => (
                      <span key={v} style={{ fontSize: 10, fontFamily: "'Space Mono',monospace", textTransform: "uppercase", letterSpacing: "0.06em", padding: "3px 9px", background: "#1A1D25", border: "1px solid #2A2D35", borderRadius: 100, color: "#5A5D65" }}>{v}</span>
                    ))}
                  </div>

                  {/* progress */}
                  <div style={{ marginBottom: 6 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <span style={{ fontSize: 11, color: "#4A4D55", fontFamily: "'Space Mono',monospace" }}>Lessons</span>
                      <span style={{ fontSize: 11, color: accent, fontFamily: "'Space Mono',monospace", fontWeight: 700 }}>
                        {completed}/{total}
                      </span>
                    </div>
                    <div style={{ height: 4, background: "#1A1D25", borderRadius: 2, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: accent, borderRadius: 2, transition: "width .6s ease" }} />
                    </div>
                  </div>

                  {/* footer */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 16, paddingTop: 14, borderTop: "1px solid #1A1D25" }}>
                    <button
                      onClick={() => {
                        setSelectedScheme(scheme);
                        if (setCurrentView) setCurrentView("scheme-details");
                      }}
                      style={{ display: "flex", alignItems: "center", gap: 5, background: "none", border: "none", color: accent, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", padding: 0, transition: "gap .2s" }}
                      onMouseEnter={e => { e.currentTarget.style.gap = "8px"; }}
                      onMouseLeave={e => { e.currentTarget.style.gap = "5px"; }}
                    >
                      View Details <ArrowRight size={12} />
                    </button>

                    <span style={{ fontSize: 10, fontFamily: "'Space Mono',monospace", textTransform: "uppercase", letterSpacing: "0.07em", padding: "3px 10px", background: `${accent}15`, border: `1px solid ${accent}30`, borderRadius: 100, color: accent }}>
                      {done ? "Complete" : "In Progress"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};

export default MySchemes;