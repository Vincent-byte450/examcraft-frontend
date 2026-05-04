import { useEffect, useState } from "react";
import {
  Loader2, CheckCircle, Circle, Trophy,
  ChevronDown, ChevronRight, BookOpen, Zap, Target,
} from "lucide-react";
import ErrorMessage from "../common/ErrorMessage";
import { useGlobals } from "../Globals";

/* ─── collapsible row ────────────────────────────────────── */
const Collapsible = ({ title, isCompleted, children }) => {
  const [open, setOpen] = useState(false);

  return (
    <div style={{
      border: `1px solid ${isCompleted ? '#00FF7F35' : '#1A1D25'}`,
      borderRadius: 10,
      overflow: 'hidden',
      background: isCompleted ? '#0D1410' : '#080A0F',
      transition: 'border-color .2s, background .2s',
    }}>
      {/* header row */}
      <button
        onClick={() => setOpen(p => !p)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', gap: 12,
          padding: '11px 14px', background: 'none', border: 'none',
          cursor: 'pointer', textAlign: 'left',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
          {/* status dot */}
          {isCompleted
            ? <CheckCircle size={15} color="#00FF7F" style={{ flexShrink: 0 }}/>
            : <Circle      size={15} color="#3A3D45" style={{ flexShrink: 0 }}/>
          }
          <span style={{
            fontSize: 13, fontFamily: "'DM Sans',sans-serif",
            color: isCompleted ? '#E8E8E0' : '#9A9A90',
            fontWeight: isCompleted ? 500 : 400,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {title}
          </span>
        </div>
        <ChevronRight size={13} color="#4A4D55"
          style={{ transition: 'transform .22s', transform: open ? 'rotate(90deg)' : 'rotate(0)', flexShrink: 0 }}/>
      </button>

      {/* body */}
      {open && (
        <div style={{ padding: '12px 14px 14px', borderTop: '1px solid #1A1D25', background: '#080A0F' }}>
          {children}
        </div>
      )}
    </div>
  );
};

/* ─── detail row inside lesson ───────────────────────────── */
const DetailRow = ({ label, value, accent = '#6A6A62' }) => (
  value ? (
    <div style={{ marginBottom: 8 }}>
      <div style={{ fontSize: 10, fontFamily: "'Space Mono',monospace", textTransform: 'uppercase', letterSpacing: '0.08em', color: accent, marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: 13, color: '#9A9A90', lineHeight: 1.65 }}>{value}</div>
    </div>
  ) : null
);

/* ─── progress bar ───────────────────────────────────────── */
const ProgressBar = ({ pct, height = 4, accent = '#00FF7F' }) => (
  <div style={{ width: '100%', height, background: '#1A1D25', borderRadius: height, overflow: 'hidden' }}>
    <div style={{
      height: '100%', width: `${pct}%`,
      background: pct === 100 ? '#00FF7F' : `linear-gradient(90deg,${accent}90,${accent})`,
      borderRadius: height, transition: 'width .6s cubic-bezier(.16,1,.3,1)',
    }}/>
  </div>
);

/* ═══════════════════════════════════════════════════════════ */
const SchemeDetails = ({ scheme }) => {
  const { apiRequest } = useGlobals();
  const [fullScheme, setFullScheme] = useState(scheme);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState(null);
  const [toggling,   setToggling]   = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiRequest(`/api/schemes/${scheme._id}`);
        if (res?.success) setFullScheme(res.data);
      } catch (err) { setError("Failed to load scheme: " + err.message); }
    })();
  }, [scheme._id]);

  const handleToggleLesson = async (week_number, lesson_number) => {
    setToggling(`${week_number}-${lesson_number}`);
    try {
      const res = await apiRequest(`/api/schemes/${scheme._id}/mark-lesson`, {
        method: 'PATCH',
        body: JSON.stringify({ week_number, lesson_number }),
      });
      if (res?.success) setFullScheme(res.data);
      else setError(res?.error || "Failed to update lesson status.");
    } catch (err) { setError("Error updating lesson: " + err.message); }
    finally { setToggling(null); }
  };

  const isLessonDone = (wk, ls) =>
    fullScheme?.completedLessons?.some(l => l.week_number === wk && l.lesson_number === ls);

  const getWeekProgress = (week) => {
    const total     = week.lessons?.length || 0;
    const completed = week.lessons?.filter(l => isLessonDone(week.week_number, l.lesson_number)).length || 0;
    return { total, completed, pct: total > 0 ? Math.round((completed / total) * 100) : 0 };
  };

  const getOverall = () => {
    const total     = fullScheme?.weeks?.flatMap(w => w.lessons).length || 0;
    const completed = fullScheme?.completedLessons?.length || 0;
    return { total, completed, pct: total > 0 ? Math.round((completed / total) * 100) : 0 };
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 240, gap: 12, fontFamily: "'DM Sans',sans-serif" }}>
      <div style={{ width: 18, height: 18, border: '2px solid #1A1D25', borderTopColor: '#00FF7F', borderRadius: '50%', animation: 'sdSpin .8s linear infinite' }}/>
      <span style={{ fontSize: 13, color: '#5A5D65' }}>Loading scheme…</span>
      <style>{`@keyframes sdSpin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  const overall = getOverall();

  /* motivational copy */
  const motivation = overall.pct === 100
    ? { icon: <Trophy size={16} color="#FFD700"/>, text: "Scheme complete — outstanding work!" }
    : overall.pct >= 75
    ? { icon: <Target size={14} color="#00FF7F"/>,  text: "Almost there! Push through to the finish." }
    : overall.pct >= 50
    ? { icon: <Zap    size={14} color="#FF9B3B"/>,  text: "Halfway through — keep the momentum." }
    : overall.pct > 0
    ? { icon: <BookOpen size={14} color="#00C8FF"/>, text: "Great start! Stay consistent." }
    : { icon: <BookOpen size={14} color="#4A4D55"/>, text: "No lessons completed yet. Let's begin!" };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Syne:wght@700;800&family=Space+Mono&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        @keyframes sdSpin   { to{transform:rotate(360deg)} }
        @keyframes sdFadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, fontFamily: "'DM Sans','Helvetica Neue',sans-serif", color: '#E8E8E0', animation: 'sdFadeUp .4s ease forwards' }}>

        <ErrorMessage error={error} onClose={() => setError(null)}/>

        {/* ── overall progress card ── */}
        <div style={{ background: '#0D0F16', border: '1px solid #1A1D25', borderRadius: 14, padding: '20px 22px', position: 'relative', overflow: 'hidden' }}>
          {/* accent strip */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,#00FF7F,transparent)` }}/>

          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
            <div>
              <div style={{ fontSize: 10, fontFamily: "'Space Mono',monospace", textTransform: 'uppercase', letterSpacing: '0.1em', color: '#00FF7F', marginBottom: 5 }}>Overall Progress</div>
              <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 20, letterSpacing: '-0.02em', color: '#E8E8E0' }}>
                {overall.pct}% Complete
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 26, color: overall.pct === 100 ? '#00FF7F' : '#E8E8E0', lineHeight: 1 }}>
                {overall.completed}
              </div>
              <div style={{ fontSize: 11, fontFamily: "'Space Mono',monospace", color: '#4A4D55' }}>of {overall.total} lessons</div>
            </div>
          </div>

          <ProgressBar pct={overall.pct} height={6} accent="#00FF7F"/>

          {/* motivation */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, padding: '9px 12px', background: '#080A0F', border: '1px solid #1A1D25', borderRadius: 8 }}>
            {motivation.icon}
            <span style={{ fontSize: 12, color: '#7A7A70' }}>{motivation.text}</span>
          </div>
        </div>

        {/* ── weeks ── */}
        {fullScheme.weeks?.map((week, wi) => {
          const { total, completed, pct } = getWeekProgress(week);
          const weekDone = pct === 100;

          return (
            <div key={wi} style={{
              background: '#0D0F16', border: `1px solid ${weekDone ? '#00FF7F25' : '#1A1D25'}`,
              borderRadius: 14, overflow: 'hidden',
              transition: 'border-color .3s',
            }}>
              {/* week header */}
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #1A1D25' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: weekDone ? '#00FF7F15' : '#1A1D25', border: `1px solid ${weekDone ? '#00FF7F30' : '#2A2D35'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {weekDone
                        ? <CheckCircle size={15} color="#00FF7F"/>
                        : <span style={{ fontSize: 11, fontFamily: "'Space Mono',monospace", color: '#5A5D65', fontWeight: 700 }}>{wi+1}</span>
                      }
                    </div>
                    <div>
                      <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 14, color: '#E8E8E0' }}>
                        Week {week.week_number}
                      </div>
                      {week.topic && (
                        <div style={{ fontSize: 11, color: '#5A5D65', marginTop: 1 }}>{week.topic}</div>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 11, fontFamily: "'Space Mono',monospace", color: weekDone ? '#00FF7F' : '#4A4D55' }}>
                      {completed}/{total}
                    </span>
                    {weekDone && (
                      <span style={{ fontSize: 10, fontFamily: "'Space Mono',monospace", textTransform: 'uppercase', letterSpacing: '0.06em', padding: '3px 9px', background: '#00FF7F15', border: '1px solid #00FF7F30', borderRadius: 100, color: '#00FF7F' }}>
                        Done
                      </span>
                    )}
                  </div>
                </div>
                <ProgressBar pct={pct} height={3} accent="#00FF7F"/>
              </div>

              {/* lessons */}
              <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                {week.lessons?.map((lesson, li) => {
                  const done    = isLessonDone(week.week_number, lesson.lesson_number);
                  const loading = toggling === `${week.week_number}-${lesson.lesson_number}`;
                  const lessonLabel = `Lesson ${lesson.lesson_number || li+1}: ${lesson.subtopic}`;

                  return (
                    <Collapsible key={li} title={lessonLabel} isCompleted={done}>
                      <DetailRow label="Objectives" value={lesson.objectives} accent="#00C8FF"/>
                      <DetailRow label="Activities"  value={lesson.activities}  accent="#9B6BFF"/>
                      <DetailRow label="Reference"   value={lesson.reference}   accent="#FF9B3B"/>

                      {/* toggle button */}
                      <button
                        onClick={() => handleToggleLesson(week.week_number, lesson.lesson_number)}
                        disabled={loading}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: 6,
                          marginTop: 12, padding: '8px 16px',
                          background:  done    ? '#00FF7F20' : '#1A1D25',
                          border:      `1px solid ${done ? '#00FF7F40' : '#2A2D35'}`,
                          borderRadius: 100,
                          color:       done    ? '#00FF7F'   : '#9A9A90',
                          fontSize:    12, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
                          fontFamily:  "'DM Sans',sans-serif", transition: 'all .2s',
                          opacity:     loading ? .6 : 1,
                        }}
                        onMouseEnter={e => {
                          if (!loading) {
                            e.currentTarget.style.background   = done ? '#00FF7F30' : '#2A2D35';
                            e.currentTarget.style.borderColor  = done ? '#00FF7F60' : '#3A3D45';
                          }
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.background  = done ? '#00FF7F20' : '#1A1D25';
                          e.currentTarget.style.borderColor = done ? '#00FF7F40' : '#2A2D35';
                        }}
                      >
                        {loading
                          ? <><div style={{ width: 12, height: 12, border: '2px solid #3A3D45', borderTopColor: '#9A9A90', borderRadius: '50%', animation: 'sdSpin .8s linear infinite' }}/> Updating…</>
                          : done
                          ? <><CheckCircle size={12}/> Completed</>
                          : <><Circle size={12}/> Mark as Done</>
                        }
                      </button>
                    </Collapsible>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default SchemeDetails;