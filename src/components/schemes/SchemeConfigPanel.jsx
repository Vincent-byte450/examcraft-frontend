import React, { useState } from "react";
import {
  Folder, FolderOpen, ChevronRight, ChevronDown,
  Calendar, Loader2, PlusCircle,
} from "lucide-react";
import ErrorMessage from "../common/ErrorMessage";
import { useGlobals } from "../Globals";

const normalizeSubjectName = (name) =>
  name
    .toLowerCase()
    .replace(/_and_/gi, " and ")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

const LEVELS = [
  { label: "Form 1",   type: "form",  value: 1  },
  { label: "Form 2",   type: "form",  value: 2  },
  { label: "Form 3",   type: "form",  value: 3  },
  { label: "Form 4",   type: "form",  value: 4  },
  { label: "Grade 6",  type: "grade", value: 6  },
  { label: "Grade 7",  type: "grade", value: 7  },
  { label: "Grade 8",  type: "grade", value: 8  },
  { label: "Grade 9",  type: "grade", value: 9  },
  { label: "Grade 10", type: "grade", value: 10 },
];

const SchemeConfigPanel = ({ metadata }) => {
  const { apiRequest } = useGlobals();
  const rawSubjects = metadata?.subjects || [];
  const subjects = [...new Set(rawSubjects.map(normalizeSubjectName))];

  const [expandedSubject, setExpandedSubject] = useState(null);
  const [expandedLevel, setExpandedLevel]     = useState(null);
  const [expandedTerm, setExpandedTerm]       = useState(null);
  const [schemeData, setSchemeData]           = useState({});
  const [loading, setLoading]                 = useState(false);
  const [error, setError]                     = useState(null);
  const [message, setMessage]                 = useState(null);

  const buildQuery = (subject, level) => {
    const param = level.type === "grade" ? "grade" : "form";
    return `/api/schemes/view?subject=${encodeURIComponent(subject)}&${param}=${level.value}`;
  };

  const fetchScheme = async (subject, level) => {
    setLoading(true);
    try {
      const res = await apiRequest(buildQuery(subject, level));
      if (res?.success) {
        setSchemeData(prev => ({
          ...prev,
          [subject]: { ...(prev[subject] || {}), [level.label]: res.data.schemes_of_work },
        }));
      } else {
        throw new Error(res?.error || "Failed to load scheme data.");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddScheme = async (subject, level, term, scheme) => {
    try {
      setMessage(`Adding ${subject} ${level.label} ${term} to database…`);
      const body = level.type === "grade"
        ? { subject, grade: level.value, term, scheme }
        : { subject, form: level.value, term, scheme };
      const res = await apiRequest(`/api/schemes/add`, { method: "POST", body: JSON.stringify(body) });
      if (res?.success) {
        setMessage(`Scheme for ${subject} ${level.label} ${term} added successfully.`);
      } else {
        throw new Error(res?.error || "Failed to add scheme.");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  /* ── shared label groups ── */
  const FORM_LEVELS  = LEVELS.filter(l => l.type === "form");
  const GRADE_LEVELS = LEVELS.filter(l => l.type === "grade");

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Syne:wght@700;800&family=Space+Mono:wght@400&display=swap');
        @keyframes cfgSpin { to { transform: rotate(360deg); } }
        @keyframes cfgFade { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        details > summary { list-style: none; }
        details > summary::-webkit-details-marker { display: none; }
      `}</style>

      <div style={{ fontFamily: "'DM Sans','Helvetica Neue',sans-serif", color: "#E8E8E0" }}>
        <ErrorMessage error={error} onClose={() => setError(null)} />

        {/* success message */}
        {message && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "11px 16px", background: "#0D1410", border: "1px solid #00FF7F30", borderRadius: 10, fontSize: 13, color: "#00FF7F", marginBottom: 16, fontFamily: "'Space Mono',monospace" }}>
            {message}
          </div>
        )}

        {/* loading overlay */}
        {loading && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: "28px 0" }}>
            <div style={{ width: 18, height: 18, border: "2px solid #1A1D25", borderTopColor: "#00FF7F", borderRadius: "50%", animation: "cfgSpin .8s linear infinite" }} />
            <span style={{ fontSize: 13, color: "#5A5D65" }}>Loading…</span>
          </div>
        )}

        {/* subject list */}
        {!loading && subjects.map((subject) => (
          <div key={subject} style={{ marginBottom: 4 }}>

            {/* subject toggle */}
            <button
              onClick={() => setExpandedSubject(expandedSubject === subject ? null : subject)}
              style={{ display: "flex", alignItems: "center", width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid transparent", background: expandedSubject === subject ? "#0D1410" : "transparent", color: expandedSubject === subject ? "#E8E8E0" : "#9A9A90", fontFamily: "'DM Sans',sans-serif", fontSize: 14, fontWeight: expandedSubject === subject ? 600 : 400, cursor: "pointer", textAlign: "left", transition: "all .2s", gap: 10 }}
              onMouseEnter={e => { if (expandedSubject !== subject) { e.currentTarget.style.background = "#0D0F16"; e.currentTarget.style.color = "#E8E8E0"; }}}
              onMouseLeave={e => { if (expandedSubject !== subject) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#9A9A90"; }}}
            >
              {expandedSubject === subject
                ? <FolderOpen size={15} color="#00FF7F" />
                : <Folder size={15} color="#4A4D55" />}
              <span style={{ flex: 1 }}>{subject}</span>
              {expandedSubject === subject ? <ChevronDown size={14} color="#00FF7F" /> : <ChevronRight size={14} color="#4A4D55" />}
            </button>

            {/* level tree */}
            {expandedSubject === subject && (
              <div style={{ marginLeft: 16, paddingLeft: 16, borderLeft: "1px solid #1A1D25", marginTop: 4, marginBottom: 8, animation: "cfgFade .25s ease forwards" }}>

                {/* Forms group */}
                <LevelGroup
                  groupLabel="Secondary (Forms)"
                  levels={FORM_LEVELS}
                  subject={subject}
                  expandedLevel={expandedLevel}
                  setExpandedLevel={setExpandedLevel}
                  expandedTerm={expandedTerm}
                  setExpandedTerm={setExpandedTerm}
                  schemeData={schemeData}
                  fetchScheme={fetchScheme}
                  handleAddScheme={handleAddScheme}
                />

                {/* Grades group */}
                <LevelGroup
                  groupLabel="Junior Secondary (Grades)"
                  levels={GRADE_LEVELS}
                  subject={subject}
                  expandedLevel={expandedLevel}
                  setExpandedLevel={setExpandedLevel}
                  expandedTerm={expandedTerm}
                  setExpandedTerm={setExpandedTerm}
                  schemeData={schemeData}
                  fetchScheme={fetchScheme}
                  handleAddScheme={handleAddScheme}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
};

/* ── level group ─────────────────────────────────────────── */
const LevelGroup = ({ groupLabel, levels, subject, expandedLevel, setExpandedLevel, expandedTerm, setExpandedTerm, schemeData, fetchScheme, handleAddScheme }) => (
  <div style={{ marginBottom: 8 }}>
    <div style={{ fontSize: 10, fontFamily: "'Space Mono',monospace", textTransform: "uppercase", letterSpacing: "0.1em", color: "#3A3D45", padding: "6px 0 4px", marginBottom: 2 }}>
      {groupLabel}
    </div>
    {levels.map(level => (
      <LevelRow
        key={level.label}
        level={level}
        subject={subject}
        expandedLevel={expandedLevel}
        setExpandedLevel={setExpandedLevel}
        expandedTerm={expandedTerm}
        setExpandedTerm={setExpandedTerm}
        schemeData={schemeData}
        fetchScheme={fetchScheme}
        handleAddScheme={handleAddScheme}
      />
    ))}
  </div>
);

/* ── level row ───────────────────────────────────────────── */
const LevelRow = ({ level, subject, expandedLevel, setExpandedLevel, expandedTerm, setExpandedTerm, schemeData, fetchScheme, handleAddScheme }) => {
  const isOpen = expandedLevel === level.label;

  return (
    <div style={{ marginBottom: 2 }}>
      <button
        onClick={() => {
          const next = isOpen ? null : level.label;
          setExpandedLevel(next);
          if (next && !schemeData[subject]?.[level.label]) fetchScheme(subject, level);
        }}
        style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "7px 12px", borderRadius: 8, border: "1px solid transparent", background: isOpen ? "#0D0F16" : "transparent", color: isOpen ? "#00C8FF" : "#6A6A62", fontSize: 13, fontWeight: isOpen ? 600 : 400, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", transition: "all .2s", textAlign: "left" }}
        onMouseEnter={e => { if (!isOpen) { e.currentTarget.style.color = "#B8B8B0"; e.currentTarget.style.background = "#0D0F16"; }}}
        onMouseLeave={e => { if (!isOpen) { e.currentTarget.style.color = "#6A6A62"; e.currentTarget.style.background = "transparent"; }}}
      >
        {isOpen ? <ChevronDown size={12} color="#00C8FF" /> : <ChevronRight size={12} />}
        {level.label}
      </button>

      {isOpen && schemeData[subject]?.[level.label]?.map((termData) => (
        <TermRow
          key={termData.term}
          termData={termData}
          level={level}
          subject={subject}
          expandedTerm={expandedTerm}
          setExpandedTerm={setExpandedTerm}
          handleAddScheme={handleAddScheme}
        />
      ))}
    </div>
  );
};

/* ── term row ────────────────────────────────────────────── */
const TermRow = ({ termData, level, subject, expandedTerm, setExpandedTerm, handleAddScheme }) => {
  const termKey = `${level.label}__${termData.term}`;
  const isOpen  = expandedTerm === termKey;
  const termLabel = level.type === "grade" ? `Term ${termData.term}` : `${termData.term}`;

  return (
    <div style={{ marginLeft: 16, marginBottom: 4 }}>
      <button
        onClick={() => setExpandedTerm(isOpen ? null : termKey)}
        style={{ display: "flex", alignItems: "center", gap: 7, padding: "6px 10px", borderRadius: 7, border: "1px solid transparent", background: isOpen ? "#0D1410" : "transparent", color: isOpen ? "#00FF7F" : "#5A5D65", fontSize: 12, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", transition: "all .2s" }}
        onMouseEnter={e => { if (!isOpen) { e.currentTarget.style.color = "#9A9A90"; }}}
        onMouseLeave={e => { if (!isOpen) { e.currentTarget.style.color = "#5A5D65"; }}}
      >
        <Calendar size={12} /> {termLabel}
        {isOpen ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
      </button>

      {isOpen && (
        <div style={{ marginTop: 8, marginLeft: 4, background: "#0D0F16", border: "1px solid #1A1D25", borderRadius: 12, padding: "18px 20px", animation: "cfgFade .2s ease forwards" }}>
          {/* header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 14, color: "#E8E8E0" }}>Original Scheme</div>
            <span style={{ fontSize: 10, fontFamily: "'Space Mono',monospace", padding: "3px 10px", background: "#1A1D25", border: "1px solid #2A2D35", borderRadius: 100, color: "#5A5D65" }}>
              {termData.weeks?.length || 0} Weeks
            </span>
          </div>

          {/* weeks */}
          {termData.weeks?.map((week, wIdx) => {
            const weekNum = week.week_number ?? week.week ?? wIdx + 1;
            const lessons = week.lessons
              ? week.lessons
              : [{
                  lesson_number: week.lesson ?? 1,
                  subtopic: week.topic,
                  objectives: Array.isArray(week.objectives) ? week.objectives.join(" ") : week.objectives,
                  activities: Array.isArray(week.activities) ? week.activities.join(" ") : week.activities,
                  reference: week.reference,
                  resources: Array.isArray(week.resources) ? week.resources.join(", ") : week.resources,
                }];

            return (
              <details key={wIdx} style={{ marginBottom: 8, borderRadius: 10, overflow: "hidden", border: "1px solid #1A1D25" }}>
                <summary
                  style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: "#080A0F", fontSize: 13, fontWeight: 500, cursor: "pointer", color: "#B8B8B0", userSelect: "none" }}
                  onMouseEnter={e => { e.currentTarget.style.background = "#0D0F16"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "#080A0F"; }}
                >
                  <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, color: "#00C8FF" }}>Week {weekNum}</span>
                  <span style={{ fontSize: 10, color: "#4A4D55", fontFamily: "'Space Mono',monospace" }}>
                    {lessons.length} {lessons.length === 1 ? "Lesson" : "Lessons"}
                  </span>
                </summary>

                <div style={{ background: "#0D0F16", padding: "12px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
                  {lessons.map((lesson, lIdx) => (
                    <div key={lIdx} style={{ padding: "14px 16px", background: "#080A0F", border: "1px solid #1A1D25", borderRadius: 10, fontSize: 13 }}>
                      <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 13, color: "#00C8FF", marginBottom: 8 }}>
                        {lesson.lesson_number ? `Lesson ${lesson.lesson_number}: ` : ""}
                        {lesson.subtopic || lesson.topic || "—"}
                      </div>
                      {[
                        { label: "Objectives", val: lesson.objectives },
                        { label: "Activities", val: lesson.activities },
                        { label: "Resources",  val: lesson.resources  },
                        { label: "Reference",  val: lesson.reference  },
                      ].filter(r => r.val).map(r => (
                        <p key={r.label} style={{ fontSize: 12, color: "#7A7A70", lineHeight: 1.65, marginBottom: 4 }}>
                          <span style={{ color: "#9A9A90", fontWeight: 600 }}>{r.label}: </span>{r.val}
                        </p>
                      ))}
                    </div>
                  ))}
                </div>
              </details>
            );
          })}

          {/* action */}
          <button
            onClick={() => handleAddScheme(subject, level, termData.term, termData)}
            style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 8, padding: "8px 16px", background: "#00FF7F15", border: "1px solid #00FF7F30", borderRadius: 100, color: "#00FF7F", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", transition: "all .2s" }}
            onMouseEnter={e => { e.currentTarget.style.background = "#00FF7F25"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "#00FF7F15"; }}
          >
            <PlusCircle size={13} /> Add to My Schemes
          </button>
        </div>
      )}
    </div>
  );
};

export default SchemeConfigPanel;