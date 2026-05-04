import React, { useState, useEffect } from 'react';
import {
  Search, Filter, Plus, Trash2, Save, GripVertical,
  ChevronLeft, ChevronRight, BookOpen, FileText,
  CheckCircle, AlertCircle, RefreshCw
} from 'lucide-react';
import { useGlobals } from './Globals';
import ErrorMessage from './common/ErrorMessage';
import { curriculumSubjects } from '../constants/curriculumData';
import { getAllowedPaperTypes } from '../constants/paperTypes';

/* ─── CURRICULUM OPTIONS ─────────────────────────────────── */
const CURRICULUM_OPTIONS = {
  'Lower Primary': [
    { value: 'Grade 1', label: 'Grade 1' },
    { value: 'Grade 2', label: 'Grade 2' },
    { value: 'Grade 3', label: 'Grade 3' },
  ],
  'Upper Primary': [
    { value: 'Grade 4', label: 'Grade 4' },
    { value: 'Grade 5', label: 'Grade 5' },
    { value: 'Grade 6', label: 'Grade 6' },
  ],
  JSS: [
    { value: 'Grade 7', label: 'Grade 7' },
    { value: 'Grade 8', label: 'Grade 8' },
    { value: 'Grade 9', label: 'Grade 9' },
  ],
  'Senior School': [
    { value: 'Grade 10', label: 'Grade 10' },
    { value: 'Grade 11', label: 'Grade 11' },
    { value: 'Grade 12', label: 'Grade 12' },
  ],
  Secondary: [
    { value: 'Form 1', label: 'Form 1' },
    { value: 'Form 2', label: 'Form 2' },
    { value: 'Form 3', label: 'Form 3' },
    { value: 'Form 4', label: 'Form 4' },
  ],
};

/* ─── shared primitives ──────────────────────────────────── */
const LABEL = {
  display: 'block', fontSize: 10, fontFamily: "'Space Mono',monospace",
  textTransform: 'uppercase', letterSpacing: '0.08em', color: '#4A4D55', marginBottom: 7,
};

const FSelect = ({ value, onChange, disabled, children }) => {
  const [f, setF] = useState(false);
  return (
    <select value={value} onChange={onChange} disabled={disabled}
      onFocus={() => setF(true)} onBlur={() => setF(false)}
      style={{
        width: '100%', padding: '9px 11px',
        background: disabled ? '#0A0C11' : f ? '#0F1410' : '#080A0F',
        border: `1px solid ${f && !disabled ? '#00FF7F50' : '#1A1D25'}`,
        borderRadius: 9, color: disabled ? '#3A3D45' : '#E8E8E0',
        fontSize: 13, fontFamily: "'DM Sans',sans-serif", outline: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer', appearance: 'none',
        transition: 'all .2s', boxSizing: 'border-box',
        boxShadow: f && !disabled ? '0 0 0 3px #00FF7F0D' : 'none',
      }}>
      {children}
    </select>
  );
};

const FInput = ({ value, onChange, type = 'text', min, max, placeholder }) => {
  const [f, setF] = useState(false);
  return (
    <input type={type} value={value} onChange={onChange} min={min} max={max} placeholder={placeholder}
      onFocus={() => setF(true)} onBlur={() => setF(false)}
      style={{
        width: '100%', padding: '9px 11px',
        background: f ? '#0F1410' : '#080A0F',
        border: `1px solid ${f ? '#00FF7F50' : '#1A1D25'}`,
        borderRadius: 9, color: '#E8E8E0', fontSize: 13,
        fontFamily: "'DM Sans',sans-serif", outline: 'none',
        transition: 'all .2s', boxSizing: 'border-box',
        boxShadow: f ? '0 0 0 3px #00FF7F0D' : 'none',
      }} />
  );
};

const SearchInput = ({ value, onChange, onEnter }) => {
  const [f, setF] = useState(false);
  return (
    <div style={{ position: 'relative' }}>
      <Search size={12} color="#3A3D45" style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
      <input type="text" value={value} onChange={onChange}
        placeholder="Search questions…"
        onKeyDown={e => e.key === 'Enter' && onEnter()}
        onFocus={() => setF(true)} onBlur={() => setF(false)}
        style={{
          width: '100%', padding: '9px 11px 9px 32px',
          background: f ? '#0F1410' : '#080A0F',
          border: `1px solid ${f ? '#00FF7F50' : '#1A1D25'}`,
          borderRadius: 9, color: '#E8E8E0', fontSize: 13,
          fontFamily: "'DM Sans',sans-serif", outline: 'none',
          transition: 'all .2s', boxSizing: 'border-box',
          boxShadow: f ? '0 0 0 3px #00FF7F0D' : 'none',
        }} />
    </div>
  );
};

/* ─── difficulty pill ────────────────────────────────────── */
const DIFF = { easy: '#00FF7F', medium: '#FF9B3B', hard: '#FF4444' };
const DiffPill = ({ difficulty }) => {
  const c = DIFF[difficulty] || '#5A5D65';
  return (
    <span style={{ fontSize: 10, fontFamily: "'Space Mono',monospace", textTransform: 'uppercase', letterSpacing: '0.06em', padding: '3px 9px', background: `${c}15`, border: `1px solid ${c}28`, borderRadius: 100, color: c }}>
      {difficulty || 'unknown'}
    </span>
  );
};

const Tag = ({ label, color }) => (
  <span style={{ fontSize: 10, fontFamily: "'Space Mono',monospace", textTransform: 'uppercase', letterSpacing: '0.06em', padding: '3px 9px', background: `${color}15`, border: `1px solid ${color}28`, borderRadius: 100, color }}>
    {label}
  </span>
);

/* ─── MAIN COMPONENT ─────────────────────────────────────── */
const CreateExamFromBank = () => {
  const { apiRequest, authToken, isLoading, setIsLoading, error, setError, showNotification } = useGlobals();

  const [availableQuestions, setAvailableQuestions] = useState([]);
  const [availableSubjects, setAvailableSubjects]   = useState([]);
  const [availableTopics, setAvailableTopics]       = useState([]);

  const [examData, setExamData] = useState({
    title: '', curriculum: 'JSS', subject: '', duration: 120,
    instructions: 'Answer all questions as instructed in each section.',
    type: 'Opener', term: 'Term I', classLevel: 'Grade 7',
  });

  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [draggedItem, setDraggedItem]             = useState(null);

  const [filters, setFilters] = useState({
    curriculum: 'JSS', subject: '', topic: '', difficulty: '', searchTerm: '',
  });

  const [currentPage, setCurrentPage]     = useState(1);
  const [totalPages, setTotalPages]       = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [loadingQ, setLoadingQ]           = useState(false);
  const [loadingS, setLoadingS]           = useState(false);
  const [loadingT, setLoadingT]           = useState(false);

  const PER_PAGE = 10;

  /* ── data loaders ── */
  const loadQuestions = async (page = 1) => {
    setLoadingQ(true);
    try {
      const p = new URLSearchParams({ page: page.toString(), limit: PER_PAGE.toString(), curriculum: filters.curriculum });
      if (filters.subject)    p.append('subject',    filters.subject);
      if (filters.topic)      p.append('topic',      filters.topic);
      if (filters.difficulty) p.append('difficulty', filters.difficulty);
      if (filters.searchTerm) p.append('search',     filters.searchTerm);
      const res = await apiRequest(`/api/questions?${p}`);
      const filtered = (res.questions || []).filter(q => !selectedQuestions.find(sq => sq.id === q.id));
      setAvailableQuestions(filtered);
      setTotalPages(res.totalPages || 1);
      setTotalQuestions(res.total || 0);
      setCurrentPage(parseInt(res.currentPage) || 1);
    } catch (err) { setError(`Failed to load questions: ${err.message}`); setAvailableQuestions([]); }
    finally { setLoadingQ(false); }
  };

  const loadSubjects = async (curriculum) => {
    setLoadingS(true);
    try { const r = await apiRequest(`/api/questions/subjects?curriculum=${curriculum}`); setAvailableSubjects(r.subjects || []); }
    catch { setAvailableSubjects([]); } finally { setLoadingS(false); }
  };

  const loadTopics = async (curriculum, subject) => {
    if (!subject) { setAvailableTopics([]); return; }
    setLoadingT(true);
    try { const r = await apiRequest(`/api/questions/topics?curriculum=${curriculum}&subject=${subject}`); setAvailableTopics(r.topics || []); }
    catch { setAvailableTopics([]); } finally { setLoadingT(false); }
  };

  /* ── filter handlers ── */
  const handleFilterChange = (key, value) => {
    setFilters(prev => {
      const next = { ...prev, [key]: value };
      if (key === 'curriculum') { next.subject = ''; next.topic = ''; setAvailableTopics([]); setExamData(p => ({ ...p, curriculum: value, subject: '', paperType: '' })); }
      if (key === 'subject') next.topic = '';
      return next;
    });
    setCurrentPage(1);
  };

  /* ── question handlers ── */
  const addQuestion = (q) => {
    setSelectedQuestions(p => [...p, { ...q, examOrder: p.length + 1 }]);
    setAvailableQuestions(p => p.filter(x => x.id !== q.id));
  };

  const removeQuestion = (id) => {
    setSelectedQuestions(p => {
      const filtered = p.filter(q => q.id !== id).map((q, i) => ({ ...q, examOrder: i + 1 }));
      return filtered;
    });
    loadQuestions(currentPage);
  };

  /* ── drag handlers ── */
  const handleDragStart = (e, q) => { setDraggedItem(q); e.dataTransfer.effectAllowed = 'move'; };
  const handleDragOver  = (e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; };
  const handleDrop = (e, target) => {
    e.preventDefault();
    if (!draggedItem || draggedItem.id === target.id) { setDraggedItem(null); return; }
    const from = selectedQuestions.findIndex(q => q.id === draggedItem.id);
    const to   = selectedQuestions.findIndex(q => q.id === target.id);
    const arr  = [...selectedQuestions];
    arr.splice(from, 1); arr.splice(to, 0, draggedItem);
    setSelectedQuestions(arr.map((q, i) => ({ ...q, examOrder: i + 1 })));
    setDraggedItem(null);
  };

  const getTotalMarks = () => selectedQuestions.reduce((t, q) => t + (q.marks || 0), 0);

  /* ── save ── */
  const saveExam = async () => {
    if (!examData.title) { showNotification('Please enter an exam title', 'error'); return; }
    if (selectedQuestions.length === 0) { showNotification('Please select at least one question', 'error'); return; }
    setIsLoading(true);
    try {
      const res = await apiRequest('/api/exams/', {
        method: 'POST',
        body: JSON.stringify({ ...examData, questions: selectedQuestions, totalQuestions: selectedQuestions.length, totalMarks: getTotalMarks(), source: 'manual', status: 'completed' }),
      });
      if (res.success) {
        showNotification(`Exam "${examData.title}" saved with ${selectedQuestions.length} questions!`, 'success');
        setExamData({ title: '', curriculum: 'JSS', subject: '', duration: 120, instructions: 'Answer all questions as instructed in each section.', type: 'Opener', term: 'Term I', classLevel: 'Grade 7' });
        setSelectedQuestions([]);
        setFilters({ curriculum: 'JSS', subject: '', topic: '', difficulty: '', searchTerm: '' });
        loadQuestions(1);
      }
    } catch (err) { setError(`Failed to save exam: ${err.message}`); }
    finally { setIsLoading(false); }
  };

  /* ── effects ── */
  useEffect(() => { if (authToken) loadSubjects(filters.curriculum); }, [authToken, filters.curriculum]);
  useEffect(() => { if (authToken) loadTopics(filters.curriculum, filters.subject); }, [authToken, filters.curriculum, filters.subject]);
  useEffect(() => { if (authToken) loadQuestions(1); }, [authToken, filters.curriculum, filters.subject, filters.topic, filters.difficulty]);

  const hasActiveFilters = filters.searchTerm || filters.subject || filters.topic || filters.difficulty;
  const allowedPaperTypes = getAllowedPaperTypes(examData);
  if (allowedPaperTypes.length === 1) examData.paperType = allowedPaperTypes[0].key;
  examData.title = `${examData.classLevel || ''} ${examData.subject || ''} ${examData.type || ''} Exam`.trim();

  const canSave = examData.title && selectedQuestions.length > 0 && !isLoading;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Syne:wght@700;800&family=Space+Mono&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        select option { background: #0D0F16; color: #E8E8E0; }
        input::placeholder { color: #3A3D45; }
        @keyframes cefbSpin { to { transform: rotate(360deg); } }
        @keyframes cefbUp   { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        .cefb-scroll::-webkit-scrollbar { width: 4px; }
        .cefb-scroll::-webkit-scrollbar-track { background: transparent; }
        .cefb-scroll::-webkit-scrollbar-thumb { background: #00FF7F30; border-radius: 4px; }
        .cefb-layout { display: grid; grid-template-columns: 1fr 320px; gap: 20px; }
        @media (max-width: 900px) { .cefb-layout { grid-template-columns: 1fr; } }
        .cefb-details-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 12px; }
        .cefb-filter-grid  { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 10px; }
      `}</style>

      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          fontFamily: "'DM Sans','Helvetica Neue',sans-serif",
          color: "#E8E8E0",
          animation: "cefbUp .45s ease forwards",
        }}
      >
        <ErrorMessage error={error} onClose={() => setError(null)} />

        {/* page header */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            marginBottom: 24,
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <div>
            {/* <div style={{ fontSize: 11, fontFamily: "'Space Mono',monospace", textTransform: 'uppercase', letterSpacing: '0.12em', color: '#00C8FF', marginBottom: 6 }}>Question Bank</div>
            <h1 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 'clamp(20px,3vw,30px)', letterSpacing: '-0.03em', lineHeight: 1.05, color: '#E8E8E0', marginBottom: 4 }}>Build Exam from Bank</h1> */}
            <p style={{ fontSize: 14, color: "#6A6A62" }}>
              Select and arrange questions to create your custom exam
            </p>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                fontSize: 12,
                fontFamily: "'Space Mono',monospace",
                color: "#4A4D55",
              }}
            >
              <span style={{ color: "#00C8FF" }}>
                {selectedQuestions.length}
              </span>{" "}
              questions ·{" "}
              <span style={{ color: "#00FF7F" }}>{getTotalMarks()}</span> marks
            </div>
            <button
              onClick={saveExam}
              disabled={!canSave}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                padding: "10px 24px",
                background: canSave ? "#00FF7F" : "#1A1D25",
                border: "none",
                borderRadius: 100,
                color: canSave ? "#080A0F" : "#3A3D45",
                fontSize: 13,
                fontWeight: 700,
                cursor: canSave ? "pointer" : "not-allowed",
                fontFamily: "'DM Sans',sans-serif",
                boxShadow: canSave ? "0 4px 20px #00FF7F20" : "none",
                transition: "all .2s",
              }}
              onMouseEnter={(e) => {
                if (canSave) e.currentTarget.style.background = "#33FF99";
              }}
              onMouseLeave={(e) => {
                if (canSave) e.currentTarget.style.background = "#00FF7F";
              }}
            >
              {isLoading ? (
                <div
                  style={{
                    width: 13,
                    height: 13,
                    border: "2px solid #3A3D45",
                    borderTopColor: "#9A9A90",
                    borderRadius: "50%",
                    animation: "cefbSpin .8s linear infinite",
                  }}
                />
              ) : (
                <Save size={13} />
              )}
              Save Exam
            </button>
          </div>
        </div>

        <div className="cefb-layout">
          {/* LEFT PANEL */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* exam details */}
            <div
              style={{
                background: "#0D0F16",
                border: "1px solid #1A1D25",
                borderRadius: 14,
                padding: "20px 22px",
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  fontFamily: "'Space Mono',monospace",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: "#00FF7F",
                  marginBottom: 14,
                  paddingBottom: 10,
                  borderBottom: "1px solid #1A1D25",
                }}
              >
                Exam Details
              </div>
              <div className="cefb-details-grid">
                <div>
                  <label style={LABEL}>Curriculum *</label>
                  <FSelect
                    value={examData.curriculum}
                    onChange={(e) => {
                      handleFilterChange("curriculum", e.target.value);
                      setExamData({
                        ...examData,
                        curriculum: e.target.value,
                        subject: "",
                        topics: [],
                        useSyllabus: false,
                        selectedSyllabusId: null,
                        syllabusContent: null,
                      });
                    }}
                  >
                    <option value="">Select</option>
                    <option value="Lower Primary">
                      Lower Primary (Gr 1–3)
                    </option>
                    <option value="Upper Primary">
                      Upper Primary (Gr 4–6)
                    </option>
                    <option value="JSS">Junior Secondary (Gr 7–9)</option>
                    <option value="Senior School">
                      Senior School (Gr 10–12)
                    </option>
                    <option value="Secondary">
                      Secondary / 8-4-4 (Fm 1–4)
                    </option>
                  </FSelect>
                </div>
                <div>
                  <label style={LABEL}>Class Level *</label>
                  <FSelect
                    value={examData.classLevel}
                    onChange={(e) => {
                      const l = e.target.value;
                      setExamData({ ...examData, classLevel: l });
                    }}
                  >
                    <option value="">Select Class</option>
                    {(CURRICULUM_OPTIONS[examData.curriculum] || []).map(
                      (o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      )
                    )}
                  </FSelect>
                </div>
                <div>
                  <label style={LABEL}>Term *</label>
                  <FSelect
                    value={examData.term}
                    onChange={(e) =>
                      setExamData({ ...examData, term: e.target.value })
                    }
                  >
                    <option value="Term I">Term I</option>
                    <option value="Term II">Term II</option>
                    <option value="Term III">Term III</option>
                  </FSelect>
                </div>
                <div>
                  <label style={LABEL}>Exam Type *</label>
                  <FSelect
                    value={examData.type}
                    onChange={(e) =>
                      setExamData({ ...examData, type: e.target.value })
                    }
                  >
                    <option value="Opener">Opener</option>
                    <option value="Mid-Term">Mid-Term</option>
                    <option value="End-Term">End-Term</option>
                  </FSelect>
                </div>
                <div>
                  <label style={LABEL}>Subject *</label>
                  <FSelect
                    value={examData.subject}
                    disabled={!examData.curriculum}
                    onChange={(e) => {
                      handleFilterChange("subject", e.target.value);
                      setExamData({
                        ...examData,
                        subject: e.target.value,
                        topics: [],
                        useSyllabus: false,
                        selectedSyllabusId: null,
                        syllabusContent: null,
                      });
                    }}
                  >
                    <option value="">Select Subject</option>
                    {examData.curriculum &&
                      curriculumSubjects[examData.curriculum]?.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                  </FSelect>
                </div>
                <div>
                  <label style={LABEL}>Duration (min)</label>
                  <FInput
                    type="number"
                    value={examData.duration}
                    onChange={(e) =>
                      setExamData((p) => ({
                        ...p,
                        duration: parseInt(e.target.value),
                      }))
                    }
                    min={30}
                    max={300}
                  />
                </div>
                <div>
                  <label style={LABEL}>Paper Type *</label>
                  <FSelect
                    value={examData.paperType || ""}
                    disabled={!examData.subject}
                    onChange={(e) =>
                      setExamData({ ...examData, paperType: e.target.value })
                    }
                  >
                    {allowedPaperTypes.length === 1
                      ? <option value={allowedPaperTypes[0].key}>{allowedPaperTypes[0].title}</option>
                      : <>
                          <option value="">Select Paper</option>
                          {examData.curriculum && allowedPaperTypes.map(o => (
                            <option key={o.key} value={o.key}>{o.title}</option>
                          ))}
                        </>
                    }
                  </FSelect>
                </div>
              </div>
            </div>

            {/* filters */}
            <div
              style={{
                background: "#0D0F16",
                border: "1px solid #1A1D25",
                borderRadius: 14,
                padding: "18px 22px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 14,
                  paddingBottom: 10,
                  borderBottom: "1px solid #1A1D25",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 7,
                    fontSize: 10,
                    fontFamily: "'Space Mono',monospace",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    color: "#00C8FF",
                  }}
                >
                  <Filter size={11} /> Filter Questions
                </div>
                <button
                  onClick={() => loadQuestions(currentPage)}
                  disabled={loadingQ}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#4A4D55",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    padding: 4,
                    transition: "color .2s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = "#00C8FF")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = "#4A4D55")
                  }
                >
                  <RefreshCw
                    size={13}
                    style={{
                      animation: loadingQ
                        ? "cefbSpin .8s linear infinite"
                        : "none",
                    }}
                  />
                </button>
              </div>

              <div className="cefb-filter-grid" style={{ marginBottom: 14 }}>
                <FSelect
                  value={filters.curriculum}
                  onChange={(e) =>
                    handleFilterChange("curriculum", e.target.value)
                  }
                >
                  <option value="Lower Primary">Lower Primary (Gr 1–3)</option>
                  <option value="Upper Primary">Upper Primary (Gr 4–6)</option>
                  <option value="JSS">Junior Secondary (Gr 7–9)</option>
                  <option value="Senior School">
                    Senior School (Gr 10–12)
                  </option>
                  <option value="Secondary">Secondary / 8-4-4 (Fm 1–4)</option>
                </FSelect>
                <FSelect
                  value={filters.subject}
                  disabled={loadingS}
                  onChange={(e) =>
                    handleFilterChange("subject", e.target.value)
                  }
                >
                  <option value="">All Subjects</option>
                  {availableSubjects.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </FSelect>
                <FSelect
                  value={filters.topic}
                  disabled={!filters.subject || loadingT}
                  onChange={(e) => handleFilterChange("topic", e.target.value)}
                >
                  <option value="">All Topics</option>
                  {availableTopics.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </FSelect>
                <FSelect
                  value={filters.difficulty}
                  onChange={(e) =>
                    handleFilterChange("difficulty", e.target.value)
                  }
                >
                  <option value="">All Levels</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </FSelect>
                <SearchInput
                  value={filters.searchTerm}
                  onChange={(e) =>
                    handleFilterChange("searchTerm", e.target.value)
                  }
                  onEnter={() => loadQuestions(1)}
                />
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: 10,
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    fontFamily: "'Space Mono',monospace",
                    color: "#4A4D55",
                  }}
                >
                  Showing{" "}
                  <span style={{ color: "#00C8FF" }}>
                    {availableQuestions.length}
                  </span>{" "}
                  of {totalQuestions}
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  {hasActiveFilters && (
                    <button
                      onClick={() =>
                        setFilters((p) => ({
                          ...p,
                          subject: "",
                          topic: "",
                          difficulty: "",
                          searchTerm: "",
                        }))
                      }
                      style={{
                        padding: "5px 12px",
                        background: "transparent",
                        border: "1px solid #1A1D25",
                        borderRadius: 100,
                        color: "#5A5D65",
                        fontSize: 11,
                        cursor: "pointer",
                        fontFamily: "'DM Sans',sans-serif",
                        transition: "all .2s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "#2A2D35";
                        e.currentTarget.style.color = "#E8E8E0";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "#1A1D25";
                        e.currentTarget.style.color = "#5A5D65";
                      }}
                    >
                      Clear Filters
                    </button>
                  )}
                  <button
                    onClick={() => loadQuestions(1)}
                    style={{
                      padding: "5px 14px",
                      background: "#00C8FF15",
                      border: "1px solid #00C8FF30",
                      borderRadius: 100,
                      color: "#00C8FF",
                      fontSize: 11,
                      fontWeight: 600,
                      cursor: "pointer",
                      fontFamily: "'DM Sans',sans-serif",
                      transition: "all .2s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "#00C8FF25")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "#00C8FF15")
                    }
                  >
                    Search
                  </button>
                </div>
              </div>
            </div>

            {/* available questions */}
            <div
              style={{
                background: "#0D0F16",
                border: "1px solid #1A1D25",
                borderRadius: 14,
                overflow: "hidden",
              }}
            >
              {/* header */}
              <div
                style={{
                  padding: "14px 22px",
                  borderBottom: "1px solid #1A1D25",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: 10,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      background: "#00C8FF15",
                      border: "1px solid #00C8FF25",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <BookOpen size={14} color="#00C8FF" />
                  </div>
                  <div
                    style={{
                      fontFamily: "'Syne',sans-serif",
                      fontWeight: 700,
                      fontSize: 14,
                      color: "#E8E8E0",
                    }}
                  >
                    Available Questions
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {filters.subject && (
                    <span
                      style={{
                        fontSize: 10,
                        padding: "3px 9px",
                        background: "#00C8FF15",
                        border: "1px solid #00C8FF28",
                        borderRadius: 100,
                        color: "#00C8FF",
                        fontFamily: "'Space Mono',monospace",
                      }}
                    >
                      {filters.subject}
                    </span>
                  )}
                  {filters.topic && (
                    <span
                      style={{
                        fontSize: 10,
                        padding: "3px 9px",
                        background: "#9B6BFF15",
                        border: "1px solid #9B6BFF28",
                        borderRadius: 100,
                        color: "#9B6BFF",
                        fontFamily: "'Space Mono',monospace",
                      }}
                    >
                      {filters.topic}
                    </span>
                  )}
                  {filters.difficulty && (
                    <span
                      style={{
                        fontSize: 10,
                        padding: "3px 9px",
                        background: "#FF9B3B15",
                        border: "1px solid #FF9B3B28",
                        borderRadius: 100,
                        color: "#FF9B3B",
                        fontFamily: "'Space Mono',monospace",
                      }}
                    >
                      {filters.difficulty}
                    </span>
                  )}
                </div>
              </div>

              {/* list */}
              {loadingQ ? (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: 140,
                    gap: 10,
                  }}
                >
                  <div
                    style={{
                      width: 16,
                      height: 16,
                      border: "2px solid #1A1D25",
                      borderTopColor: "#00C8FF",
                      borderRadius: "50%",
                      animation: "cefbSpin .8s linear infinite",
                    }}
                  />
                  <span style={{ fontSize: 13, color: "#4A4D55" }}>
                    Loading questions…
                  </span>
                </div>
              ) : availableQuestions.length === 0 ? (
                <div style={{ padding: "48px 24px", textAlign: "center" }}>
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: "50%",
                      background: "#1A1D25",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 14px",
                    }}
                  >
                    <BookOpen size={22} color="#3A3D45" />
                  </div>
                  <div
                    style={{
                      fontFamily: "'Syne',sans-serif",
                      fontWeight: 700,
                      fontSize: 15,
                      color: "#E8E8E0",
                      marginBottom: 6,
                    }}
                  >
                    {hasActiveFilters
                      ? "No questions match your filters"
                      : "No questions available"}
                  </div>
                  <p
                    style={{
                      fontSize: 12,
                      color: "#4A4D55",
                      marginBottom: hasActiveFilters ? 16 : 0,
                    }}
                  >
                    {hasActiveFilters
                      ? "Try adjusting your search criteria"
                      : "No questions for the selected curriculum"}
                  </p>
                  {hasActiveFilters && (
                    <button
                      onClick={() =>
                        setFilters((p) => ({
                          ...p,
                          subject: "",
                          topic: "",
                          difficulty: "",
                          searchTerm: "",
                        }))
                      }
                      style={{
                        fontSize: 12,
                        color: "#00C8FF",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        textDecoration: "underline",
                        textUnderlineOffset: 3,
                      }}
                    >
                      Clear all filters
                    </button>
                  )}
                </div>
              ) : (
                <div>
                  {availableQuestions.map((q) => (
                    <div
                      key={q.id}
                      style={{
                        padding: "16px 22px",
                        borderBottom: "1px solid #1A1D25",
                        transition: "background .2s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "#0A0C11")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "transparent")
                      }
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 14,
                        }}
                      >
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              display: "flex",
                              gap: 6,
                              flexWrap: "wrap",
                              marginBottom: 9,
                            }}
                          >
                            {q.subject && (
                              <Tag label={q.subject} color="#00C8FF" />
                            )}
                            {q.topic && <Tag label={q.topic} color="#9B6BFF" />}
                            {q.marks && (
                              <Tag
                                label={`${q.marks} mk${
                                  q.marks !== 1 ? "s" : ""
                                }`}
                                color="#00FF7F"
                              />
                            )}
                            <DiffPill difficulty={q.difficulty} />
                          </div>
                          <p
                            style={{
                              fontSize: 13,
                              color: "#C8C8C0",
                              lineHeight: 1.7,
                              marginBottom: q.options ? 8 : 0,
                            }}
                          >
                            {q.question}
                          </p>
                          {q.options && (
                            <div
                              style={{
                                paddingLeft: 12,
                                display: "flex",
                                flexDirection: "column",
                                gap: 3,
                              }}
                            >
                              {q.options.map((opt, i) => (
                                <div
                                  key={i}
                                  style={{ fontSize: 12, color: "#5A5D65" }}
                                >
                                  {String.fromCharCode(65 + i)}. {opt}
                                </div>
                              ))}
                            </div>
                          )}
                          {q.correctAnswer && (
                            <div
                              style={{
                                fontSize: 12,
                                color: "#00FF7F",
                                marginTop: 6,
                              }}
                            >
                              <span style={{ fontWeight: 600 }}>Answer:</span>{" "}
                              {q.correctAnswer}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => addQuestion(q)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            padding: "8px 14px",
                            background: "#00FF7F15",
                            border: "1px solid #00FF7F30",
                            borderRadius: 100,
                            color: "#00FF7F",
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: "pointer",
                            fontFamily: "'DM Sans',sans-serif",
                            flexShrink: 0,
                            transition: "all .2s",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.background = "#00FF7F25")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.background = "#00FF7F15")
                          }
                        >
                          <Plus size={11} /> Add
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* pagination */}
              {totalPages > 1 && (
                <div
                  style={{
                    padding: "14px 22px",
                    borderTop: "1px solid #1A1D25",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    background: "#080A0F",
                  }}
                >
                  <button
                    onClick={() => {
                      setCurrentPage((p) => p - 1);
                      loadQuestions(currentPage - 1);
                    }}
                    disabled={currentPage === 1}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "7px 14px",
                      background: "transparent",
                      border: "1px solid #1A1D25",
                      borderRadius: 100,
                      color: currentPage === 1 ? "#2A2D35" : "#6A6A62",
                      fontSize: 12,
                      cursor: currentPage === 1 ? "not-allowed" : "pointer",
                      fontFamily: "'DM Sans',sans-serif",
                      transition: "all .2s",
                    }}
                    onMouseEnter={(e) => {
                      if (currentPage > 1)
                        e.currentTarget.style.color = "#E8E8E0";
                    }}
                    onMouseLeave={(e) => {
                      if (currentPage > 1)
                        e.currentTarget.style.color = "#6A6A62";
                    }}
                  >
                    <ChevronLeft size={12} /> Prev
                  </button>
                  <div
                    style={{
                      fontSize: 11,
                      fontFamily: "'Space Mono',monospace",
                      color: "#4A4D55",
                    }}
                  >
                    <span style={{ color: "#00C8FF" }}>{currentPage}</span> /{" "}
                    {totalPages} · {totalQuestions} total
                  </div>
                  <button
                    onClick={() => {
                      setCurrentPage((p) => p + 1);
                      loadQuestions(currentPage + 1);
                    }}
                    disabled={currentPage === totalPages}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "7px 14px",
                      background: "transparent",
                      border: "1px solid #1A1D25",
                      borderRadius: 100,
                      color: currentPage === totalPages ? "#2A2D35" : "#6A6A62",
                      fontSize: 12,
                      cursor:
                        currentPage === totalPages ? "not-allowed" : "pointer",
                      fontFamily: "'DM Sans',sans-serif",
                      transition: "all .2s",
                    }}
                    onMouseEnter={(e) => {
                      if (currentPage < totalPages)
                        e.currentTarget.style.color = "#E8E8E0";
                    }}
                    onMouseLeave={(e) => {
                      if (currentPage < totalPages)
                        e.currentTarget.style.color = "#6A6A62";
                    }}
                  >
                    Next <ChevronRight size={12} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT PANEL — selected questions */}
          <div style={{ position: "sticky", top: 24, height: "fit-content" }}>
            <div
              style={{
                background: "#0D0F16",
                border: "1px solid #1A1D25",
                borderRadius: 14,
                overflow: "hidden",
              }}
            >
              {/* header */}
              <div
                style={{
                  padding: "14px 18px",
                  borderBottom: "1px solid #1A1D25",
                  background: "#080A0F",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 6,
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <div
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: 8,
                        background: "#00FF7F15",
                        border: "1px solid #00FF7F25",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <FileText size={13} color="#00FF7F" />
                    </div>
                    <div
                      style={{
                        fontFamily: "'Syne',sans-serif",
                        fontWeight: 700,
                        fontSize: 14,
                        color: "#E8E8E0",
                      }}
                    >
                      Selected Questions
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: 11,
                      fontFamily: "'Space Mono',monospace",
                      color: "#00FF7F",
                    }}
                  >
                    {selectedQuestions.length}
                  </span>
                </div>
                <div
                  style={{
                    fontSize: 11,
                    fontFamily: "'Space Mono',monospace",
                    color: "#4A4D55",
                  }}
                >
                  <span style={{ color: "#00FF7F" }}>{getTotalMarks()}</span>{" "}
                  marks · {examData.duration} min
                </div>
              </div>

              {/* question list */}
              <div
                className="cefb-scroll"
                style={{ maxHeight: 400, overflowY: "auto" }}
              >
                {selectedQuestions.length === 0 ? (
                  <div style={{ padding: "36px 18px", textAlign: "center" }}>
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: "50%",
                        background: "#1A1D25",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 12px",
                      }}
                    >
                      <FileText size={18} color="#3A3D45" />
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        color: "#4A4D55",
                        fontFamily: "'Syne',sans-serif",
                        fontWeight: 600,
                        marginBottom: 4,
                      }}
                    >
                      No questions yet
                    </div>
                    <div style={{ fontSize: 11, color: "#3A3D45" }}>
                      Add questions from the left panel
                    </div>
                  </div>
                ) : (
                  selectedQuestions.map((q) => (
                    <div
                      key={q.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, q)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, q)}
                      style={{
                        padding: "12px 16px",
                        borderBottom: "1px solid #1A1D25",
                        cursor: "grab",
                        transition: "background .2s",
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 10,
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "#0A0C11")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "transparent")
                      }
                    >
                      <GripVertical
                        size={13}
                        color="#2A2D35"
                        style={{ flexShrink: 0, marginTop: 2 }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            display: "flex",
                            gap: 5,
                            marginBottom: 6,
                            flexWrap: "wrap",
                          }}
                        >
                          <span
                            style={{
                              fontSize: 10,
                              fontFamily: "'Space Mono',monospace",
                              padding: "2px 8px",
                              background: "#1A1D25",
                              border: "1px solid #2A2D35",
                              borderRadius: 100,
                              color: "#5A5D65",
                            }}
                          >
                            Q{q.examOrder}
                          </span>
                          <span
                            style={{
                              fontSize: 10,
                              fontFamily: "'Space Mono',monospace",
                              padding: "2px 8px",
                              background: "#00FF7F15",
                              border: "1px solid #00FF7F28",
                              borderRadius: 100,
                              color: "#00FF7F",
                            }}
                          >
                            {q.marks || 1}mk
                          </span>
                          <DiffPill difficulty={q.difficulty} />
                        </div>
                        <p
                          style={{
                            fontSize: 12,
                            color: "#9A9A90",
                            lineHeight: 1.55,
                            overflow: "hidden",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            marginBottom: 5,
                          }}
                        >
                          {q.question}
                        </p>
                        <div
                          style={{
                            fontSize: 10,
                            color: "#3A3D45",
                            fontFamily: "'Space Mono',monospace",
                          }}
                        >
                          {q.subject}
                          {q.topic ? ` · ${q.topic}` : ""}
                        </div>
                      </div>
                      <button
                        onClick={() => removeQuestion(q.id)}
                        style={{
                          width: 26,
                          height: 26,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background: "none",
                          border: "1px solid transparent",
                          borderRadius: 7,
                          color: "#4A4D55",
                          cursor: "pointer",
                          flexShrink: 0,
                          transition: "all .18s",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "#FF444415";
                          e.currentTarget.style.borderColor = "#FF444430";
                          e.currentTarget.style.color = "#FF6666";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "none";
                          e.currentTarget.style.borderColor = "transparent";
                          e.currentTarget.style.color = "#4A4D55";
                        }}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* status footer */}
              <div
                style={{
                  padding: "14px 18px",
                  borderTop: "1px solid #1A1D25",
                  background: "#080A0F",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 7,
                    fontSize: 12,
                    marginBottom: selectedQuestions.length > 0 ? 10 : 0,
                  }}
                >
                  {examData.title && selectedQuestions.length > 0 ? (
                    <>
                      <CheckCircle size={13} color="#00FF7F" />
                      <span style={{ color: "#00FF7F" }}>Ready to save</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle size={13} color="#FF9B3B" />
                      <span style={{ color: "#FF9B3B" }}>
                        {!examData.title
                          ? "Title missing"
                          : "Add questions to save"}
                      </span>
                    </>
                  )}
                </div>
                {selectedQuestions.length > 0 && (
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 3 }}
                  >
                    <div
                      style={{
                        fontSize: 11,
                        color: "#3A3D45",
                        fontFamily: "'Space Mono',monospace",
                      }}
                    >
                      Est. time: ~{Math.round(getTotalMarks() * 1.5)} min
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "#3A3D45",
                        fontFamily: "'Space Mono',monospace",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      Types:{" "}
                      {[...new Set(selectedQuestions.map((q) => q.type))].join(
                        ", "
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateExamFromBank;