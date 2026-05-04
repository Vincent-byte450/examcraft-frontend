import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Wand2, FileText, AlertCircle, ChevronRight, Check, Upload, Sparkles, GripVertical, LayoutTemplate, X, Hash } from 'lucide-react';
import { TopicalQuestionsService } from "../services/TopicalQuestionsService";
import { curriculumSubjects, subjectTopics } from '../constants/curriculumData';
import { getAllowedPaperTypes } from '../constants/paperTypes';
import { useGlobals } from "./Globals";

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

const FInput = ({ value, onChange, type = 'number', min, max, placeholder }) => {
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

const FTextarea = ({ value, onChange, placeholder, rows = 3 }) => {
  const [f, setF] = useState(false);
  return (
    <textarea rows={rows} value={value} onChange={onChange} placeholder={placeholder}
      onFocus={() => setF(true)} onBlur={() => setF(false)}
      style={{
        width: '100%', padding: '9px 11px',
        background: f ? '#0F1410' : '#080A0F',
        border: `1px solid ${f ? '#00FF7F50' : '#1A1D25'}`,
        borderRadius: 9, color: '#E8E8E0', fontSize: 13,
        fontFamily: "'DM Sans',sans-serif", outline: 'none',
        resize: 'vertical', lineHeight: 1.65,
        transition: 'all .2s', boxSizing: 'border-box',
        boxShadow: f ? '0 0 0 3px #00FF7F0D' : 'none',
      }} />
  );
};

/* ─── section heading ────────────────────────────────────── */
const SectionHead = ({ label, accent = '#00FF7F' }) => (
  <div style={{
    fontSize: 10, fontFamily: "'Space Mono',monospace", textTransform: 'uppercase',
    letterSpacing: '0.1em', color: accent, marginBottom: 14, paddingBottom: 10,
    borderBottom: '1px solid #1A1D25',
  }}>
    {label}
  </div>
);

/* ─── source radio button ────────────────────────────────── */
const SourceButton = ({ label, isActive, onClick }) => (
  <button type="button" onClick={onClick}
    style={{
      width: '100%', display: 'flex', alignItems: 'center', gap: 12,
      padding: '12px 14px', borderRadius: 11,
      border: `1px solid ${isActive ? '#00FF7F50' : '#1A1D25'}`,
      background: isActive ? '#0D1410' : 'transparent',
      cursor: 'pointer', transition: 'all .2s', textAlign: 'left',
      boxShadow: isActive ? '0 0 20px #00FF7F0A' : 'none',
    }}
    onMouseEnter={e => { if (!isActive) { e.currentTarget.style.borderColor = '#2A2D35'; e.currentTarget.style.background = '#0D0F16'; } }}
    onMouseLeave={e => { if (!isActive) { e.currentTarget.style.borderColor = '#1A1D25'; e.currentTarget.style.background = 'transparent'; } }}>
    <div style={{
      width: 16, height: 16, borderRadius: '50%', flexShrink: 0,
      border: `2px solid ${isActive ? '#00FF7F' : '#2A2D35'}`,
      background: isActive ? '#00FF7F' : 'transparent',
      display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .2s',
    }}>
      {isActive && <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#080A0F' }} />}
    </div>
    <FileText size={13} color={isActive ? '#00FF7F' : '#4A4D55'} style={{ flexShrink: 0 }} />
    <span style={{ fontSize: 13, fontWeight: isActive ? 600 : 400, color: isActive ? '#E8E8E0' : '#6A6A62', transition: 'color .2s' }}>{label}</span>
  </button>
);

/* ─── topic panel wrapper ────────────────────────────────── */
const TopicPanel = ({ title, count, total, onSelectAll, onClearAll, accent, children }) => (
  <div>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
      <div>
        <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 15, color: '#E8E8E0', marginBottom: 3 }}>{title}</div>
        <div style={{ fontSize: 11, fontFamily: "'Space Mono',monospace", color: '#4A4D55' }}>
          <span style={{ color: accent }}>{count}</span> / {total} selected
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <BulkBtn onClick={onSelectAll} label="Select All" accent={accent} />
        <BulkBtn onClick={onClearAll} label="Clear All" accent="#FF4444" />
      </div>
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>{children}</div>
  </div>
);

/* ─── content group inside expanded topic ────────────────── */
const ContentGroup = ({ label, items, accent }) => (
  <div style={{ marginBottom: 10 }}>
    <div style={{ fontSize: 10, fontFamily: "'Space Mono',monospace", textTransform: 'uppercase', letterSpacing: '0.08em', color: accent, marginBottom: 6 }}>{label}</div>
    <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 5 }}>
      {items.slice(0, 5).map((item, i) => (
        <li key={i} style={{ fontSize: 13, color: '#9A9A90', lineHeight: 1.6, paddingLeft: 10, borderLeft: `2px solid ${accent}30` }}>{item}</li>
      ))}
      {items.length > 5 && <li style={{ fontSize: 11, color: '#3A3D45', fontStyle: 'italic', paddingLeft: 10 }}>…and {items.length - 5} more</li>}
    </ul>
  </div>
);

/* ─── topic accordion row ────────────────────────────────── */
const TopicRow = ({ isSelected, isExpanded, onToggleSelect, onToggleExpand, label, meta, children }) => (
  <div style={{
    border: `1px solid ${isSelected ? '#00FF7F40' : '#1A1D25'}`,
    borderRadius: 10, overflow: 'hidden',
    background: isSelected ? '#0D1410' : '#080A0F', transition: 'all .2s',
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px' }}>
      <div onClick={onToggleSelect}
        style={{
          width: 18, height: 18, borderRadius: 5, flexShrink: 0, cursor: 'pointer',
          border: `2px solid ${isSelected ? '#00FF7F' : '#2A2D35'}`,
          background: isSelected ? '#00FF7F' : 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .2s',
        }}>
        {isSelected && <Check size={10} color="#080A0F" strokeWidth={3} />}
      </div>
      <button type="button" onClick={onToggleExpand}
        style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, background: 'none', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'left' }}>
        <ChevronRight size={13} color="#4A4D55" style={{ transition: 'transform .25s', transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)', flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, color: isSelected ? '#E8E8E0' : '#B8B8B0', fontWeight: isSelected ? 500 : 400, fontFamily: "'DM Sans',sans-serif" }}>{label}</div>
          {meta && <div style={{ fontSize: 11, fontFamily: "'Space Mono',monospace", color: '#3A3D45', marginTop: 2 }}>{meta}</div>}
        </div>
      </button>
    </div>
    {isExpanded && (
      <div style={{ padding: '12px 16px 16px 44px', borderTop: '1px solid #1A1D25', background: '#080A0F' }}>
        {children}
      </div>
    )}
  </div>
);

/* ─── bulk action button ─────────────────────────────────── */
const BulkBtn = ({ onClick, label, accent }) => (
  <button type="button" onClick={onClick}
    style={{
      padding: '5px 12px', background: `${accent}10`, border: `1px solid ${accent}25`,
      borderRadius: 100, color: accent, fontSize: 11, fontWeight: 600,
      cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", transition: 'all .2s',
    }}
    onMouseEnter={e => e.currentTarget.style.background = `${accent}20`}
    onMouseLeave={e => e.currentTarget.style.background = `${accent}10`}>
    {label}
  </button>
);

/* ─── stat pill ──────────────────────────────────────────── */
const StatPill = ({ label, value, color }) => (
  <div style={{
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    padding: '10px 16px', background: `${color}0A`,
    border: `1px solid ${color}20`, borderRadius: 10,
  }}>
    <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 18, color, lineHeight: 1 }}>{value}</div>
    <div style={{ fontSize: 10, fontFamily: "'Space Mono',monospace", textTransform: 'uppercase', letterSpacing: '0.07em', color: '#4A4D55', marginTop: 4 }}>{label}</div>
  </div>
);

/* ─── helper: derive curriculum from class level ─────────── */
const getCurriculumFromLevel = (level) => {
  if (!level) return '';
  if (['Grade 1', 'Grade 2', 'Grade 3'].includes(level))    return 'Lower Primary';
  if (['Grade 4', 'Grade 5', 'Grade 6'].includes(level))    return 'Upper Primary';
  if (['Grade 7', 'Grade 8', 'Grade 9'].includes(level))    return 'JSS';
  if (['Grade 10', 'Grade 11', 'Grade 12'].includes(level)) return 'Senior School';
  if (['Form 1', 'Form 2', 'Form 3', 'Form 4'].includes(level)) return 'Secondary';
  return '';
};

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

/* ─── TOPIC COLORS ───────────────────────────────────────── */
const TOPIC_COLORS = [
  '#00FF7F', '#00C8FF', '#9B6BFF', '#FF9B3B', '#FF6B6B',
  '#FFD93D', '#6BCB77', '#4ECDC4', '#C77DFF', '#F4A261',
];
const getTopicColor = (index) => TOPIC_COLORS[index % TOPIC_COLORS.length];

/* ═══════════════════════════════════════════════════════════
   SECTION DISTRIBUTION PANEL  — fixed
   ═══════════════════════════════════════════════════════════ */
const SectionDistributionPanel = ({ examConfig, topics, onDistributionChange }) => {
  // ── core state ──
  // pool: array of topic indices currently unassigned
  // sections: { [sectionKey]: number[] }  — topic indices per section
  // topicMarks: { [`${sectionKey}__${idx}`]: number }
  // sectionMarks: { [sectionKey]: number }
  const [pool, setPool]                 = useState([]);
  const [sections, setSections]         = useState({});
  const [topicMarks, setTopicMarks]     = useState({});
  const [sectionMarks, setSectionMarks] = useState({});

  // drag state kept in refs (no re-render needed during drag)
  const dragPayload  = useRef(null); // { id: number, from: string }
  const [overZone, setOverZone] = useState(null);

  // ── stable keys for change-detection ──
  const configKeyRef = useRef(null);
  const topicsKeyRef = useRef(null);

  // ── initialise / reset only when examConfig or topics actually change ──
  useEffect(() => {
    if (!examConfig?.config?.sections || !topics?.length) return;

    const newConfigKey = JSON.stringify(Object.keys(examConfig.config.sections));
    const newTopicsKey = topics.join('|');

    // skip if nothing meaningful changed
    if (newConfigKey === configKeyRef.current && newTopicsKey === topicsKeyRef.current) return;
    configKeyRef.current = newConfigKey;
    topicsKeyRef.current = newTopicsKey;

    const keys = Object.keys(examConfig.config.sections);
    const initSections = {};
    keys.forEach(k => { initSections[k] = []; });

    // pre-fill sectionMarks from config, keeping any user edits across topic changes
    setSectionMarks(prev => {
      const next = {};
      keys.forEach(k => {
        next[k] = prev[k] ?? examConfig.config.sections[k]?.marks ?? 0;
      });
      return next;
    });

    setPool(topics.map((_, i) => i));
    setSections(initSections);
    setTopicMarks({});
  }, [examConfig, topics]);

  // ── notify parent — fire only when distribution genuinely changes ──
  const lastEmittedRef = useRef(null);
  useEffect(() => {
    if (!examConfig?.config?.sections || !topics?.length) return;
    const sectionKeys = Object.keys(examConfig.config.sections);

    const distribution = {};
    sectionKeys.forEach(key => {
      distribution[key] = {
        ...examConfig.config.sections[key],
        marks: sectionMarks[key] ?? examConfig.config.sections[key]?.marks ?? 0,
        topics: (sections[key] || []).map(idx => ({
          index: idx,
          name:  topics[idx],
          marks: topicMarks[`${key}__${idx}`] || 0,
        })),
      };
    });

    const serial = JSON.stringify(distribution);
    if (serial === lastEmittedRef.current) return;
    lastEmittedRef.current = serial;
    onDistributionChange?.(distribution);
  }, [sections, topicMarks, sectionMarks, examConfig, topics, onDistributionChange]);

  // ── drag handlers ──
  const handleDragStart = useCallback((e, id, from) => {
    dragPayload.current = { id, from };
    e.dataTransfer.effectAllowed = 'move';
    // ghost image opacity
    setTimeout(() => { if (e.target) e.target.style.opacity = '0.4'; }, 0);
  }, []);

  const handleDragEnd = useCallback((e) => {
    if (e.target) e.target.style.opacity = '1';
    dragPayload.current = null;
    setOverZone(null);
  }, []);

  const handleDragOver = useCallback((e, zone) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setOverZone(zone);
  }, []);

  const handleDragLeave = useCallback((e) => {
    // only clear if leaving the drop zone entirely (not entering a child)
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setOverZone(null);
    }
  }, []);

  const handleDrop = useCallback((e, targetZone) => {
    e.preventDefault();
    setOverZone(null);
    const payload = dragPayload.current;
    if (!payload) return;
    const { id, from } = payload;
    if (from === targetZone) return;
    dragPayload.current = null;

    // FIX: use functional updates for pool and sections independently — no nesting
    if (from === 'pool') {
      setPool(p => p.filter(x => x !== id));
    } else {
      setSections(prev => ({ ...prev, [from]: prev[from].filter(x => x !== id) }));
      setTopicMarks(m => { const n = { ...m }; delete n[`${from}__${id}`]; return n; });
    }

    if (targetZone === 'pool') {
      setPool(p => (p.includes(id) ? p : [...p, id]));
    } else {
      setSections(prev => ({
        ...prev,
        [targetZone]: prev[targetZone].includes(id) ? prev[targetZone] : [...prev[targetZone], id],
      }));
    }
  }, []);

  const removeTopicFromSection = useCallback((sectionKey, topicIdx) => {
    setSections(prev => ({ ...prev, [sectionKey]: prev[sectionKey].filter(x => x !== topicIdx) }));
    setPool(p => (p.includes(topicIdx) ? p : [...p, topicIdx]));
    setTopicMarks(m => { const n = { ...m }; delete n[`${sectionKey}__${topicIdx}`]; return n; });
  }, []);

  const updateTopicMarks = useCallback((sectionKey, topicIdx, val) => {
    const num = Math.max(0, parseInt(val) || 0);
    setTopicMarks(m => ({ ...m, [`${sectionKey}__${topicIdx}`]: num }));
  }, []);

  const updateSectionMarks = useCallback((key, val) => {
    const num = Math.max(0, parseInt(val) || 0);
    setSectionMarks(m => ({ ...m, [key]: num }));
  }, []);

  // auto-distribute marks equally per topic within a section
  const autoDistribute = useCallback((sectionKey) => {
    const ids    = sections[sectionKey] || [];
    const total  = sectionMarks[sectionKey] || 0;
    if (!ids.length || !total) return;
    const base   = Math.floor(total / ids.length);
    const rem    = total % ids.length;
    setTopicMarks(m => {
      const n = { ...m };
      ids.forEach((idx, i) => { n[`${sectionKey}__${idx}`] = base + (i < rem ? 1 : 0); });
      return n;
    });
  }, [sections, sectionMarks]);

  if (!examConfig?.config?.sections || !topics?.length) return null;

  const sectionKeys   = Object.keys(examConfig.config.sections);
  const totalMaxMarks = sectionKeys.reduce((s, k) => s + (sectionMarks[k] || 0), 0);
  const totalAssigned = Object.entries(sections).reduce((s, [key, ids]) =>
    s + ids.reduce((ss, idx) => ss + (topicMarks[`${key}__${idx}`] || 0), 0), 0);
  const marksOver = totalMaxMarks > 0 && totalAssigned > totalMaxMarks;
  const allAssigned = pool.length === 0;

  return (
    <div style={{
      background: '#0D0F16', border: '1px solid #1A1D25', borderRadius: 14,
      padding: '20px 22px', animation: 'caiIn .3s ease forwards',
    }}>

      {/* ── header ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <LayoutTemplate size={13} color="#00FF7F" />
            <span style={{ fontSize: 10, fontFamily: "'Space Mono',monospace", textTransform: 'uppercase', letterSpacing: '0.1em', color: '#00FF7F' }}>
              Section Distribution
            </span>
          </div>
          <p style={{ fontSize: 12, color: '#4A4D55', margin: 0 }}>
            Drag topics from the pool into exam sections, then set marks per topic.
          </p>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 100,
          background: marksOver ? '#FF4A4A0A' : allAssigned ? '#00FF7F0A' : '#00C8FF0A',
          border: `1px solid ${marksOver ? '#FF4A4A30' : allAssigned ? '#00FF7F25' : '#00C8FF25'}`,
          fontSize: 11, fontFamily: "'Space Mono',monospace",
          color: marksOver ? '#FF6B6B' : allAssigned ? '#00FF7F' : '#00C8FF',
          whiteSpace: 'nowrap',
        }}>
          {marksOver && <AlertCircle size={11} />}
          {totalAssigned} / {totalMaxMarks} marks
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* ── Topic Pool ── */}
        <div>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: 8,
          }}>
            <div style={{ fontSize: 10, fontFamily: "'Space Mono',monospace", textTransform: 'uppercase', letterSpacing: '0.08em', color: '#4A4D55' }}>
              Topic Pool{' '}
              <span style={{ color: pool.length > 0 ? '#FF9B3B' : '#3A3D45' }}>
                ({pool.length} remaining)
              </span>
            </div>
            {pool.length === 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, color: '#00FF7F', fontFamily: "'Space Mono',monospace" }}>
                <Check size={10} strokeWidth={3} /> All assigned
              </div>
            )}
          </div>

          <div
            onDragOver={e => handleDragOver(e, 'pool')}
            onDragLeave={handleDragLeave}
            onDrop={e => handleDrop(e, 'pool')}
            style={{
              minHeight: 52, padding: '8px 10px', borderRadius: 10,
              border: `1px dashed ${overZone === 'pool' ? '#FF9B3B60' : pool.length > 0 ? '#2A2D35' : '#1A1D25'}`,
              background: overZone === 'pool' ? '#FF9B3B05' : 'transparent',
              transition: 'all .2s',
              display: 'flex', flexWrap: 'wrap', gap: 6, alignContent: 'flex-start',
            }}>
            {pool.length === 0 ? (
              <div style={{ width: '100%', textAlign: 'center', fontSize: 11, color: '#2A2D35', fontFamily: "'Space Mono',monospace", padding: '6px 0' }}>
                Drag topics back here to unassign
              </div>
            ) : (
              pool.map(idx => (
                <PoolChip
                  key={idx}
                  label={topics[idx]}
                  color={getTopicColor(idx)}
                  onDragStart={e => handleDragStart(e, idx, 'pool')}
                  onDragEnd={handleDragEnd}
                />
              ))
            )}
          </div>
        </div>

        {/* ── Sections Grid ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(auto-fill, minmax(220px, 1fr))`,
          gap: 10,
        }}>
          {sectionKeys.map(key => {
            const sec         = examConfig.config.sections[key];
            const assigned    = sections[key] || [];
            const secMarks    = sectionMarks[key] || 0;
            const secAssigned = assigned.reduce((s, idx) => s + (topicMarks[`${key}__${idx}`] || 0), 0);
            const isOver      = overZone === key;
            const secOver     = secAssigned > secMarks && secMarks > 0;

            // strip "(XX MARKS)" suffix and "SECTION X:" prefix for brevity
            const shortTitle  = sec.title
              .replace(/\s*\(\d+\s*MARKS?\)/i, '')
              .replace(/^SECTION\s+[A-Z]:\s*/i, '');

            return (
              <div
                key={key}
                onDragOver={e => handleDragOver(e, key)}
                onDragLeave={handleDragLeave}
                onDrop={e => handleDrop(e, key)}
                style={{
                  background: isOver ? '#0A1510' : '#080A0F',
                  border: `1px solid ${isOver ? '#00FF7F50' : '#1A1D25'}`,
                  borderRadius: 12, padding: 12,
                  transition: 'all .2s', minHeight: 140,
                  display: 'flex', flexDirection: 'column', gap: 8,
                  boxShadow: isOver ? '0 0 16px #00FF7F08' : 'none',
                }}>

                {/* section header */}
                <div>
                  <div style={{
                    fontSize: 11, fontWeight: 600, color: '#E8E8E0',
                    lineHeight: 1.3, marginBottom: 2,
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}>
                    <div style={{
                      fontSize: 9, fontFamily: "'Space Mono',monospace",
                      color: '#4A4D55', background: '#1A1D25',
                      padding: '1px 6px', borderRadius: 4, flexShrink: 0,
                    }}>
                      {key.toUpperCase()}
                    </div>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {shortTitle}
                    </span>
                  </div>
                  <div style={{ fontSize: 10, fontFamily: "'Space Mono',monospace", color: '#3A3D45' }}>
                    {sec.questions} q · {sec.type}
                  </div>
                </div>

                {/* section marks row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Hash size={9} color="#4A4D55" />
                  <span style={{ fontSize: 10, fontFamily: "'Space Mono',monospace", color: '#4A4D55', flexShrink: 0 }}>
                    Total marks:
                  </span>
                  <input
                    type="number" min={0} value={secMarks}
                    onChange={e => updateSectionMarks(key, e.target.value)}
                    onClick={e => e.stopPropagation()}
                    style={{
                      width: 52, padding: '3px 6px', fontSize: 11,
                      background: '#0D0F16', border: '1px solid #2A2D35',
                      borderRadius: 6, color: '#E8E8E0', outline: 'none',
                      fontFamily: "'Space Mono',monospace", textAlign: 'center',
                      transition: 'border-color .15s',
                    }}
                    onFocus={e => e.target.style.borderColor = '#00FF7F40'}
                    onBlur={e => e.target.style.borderColor = '#2A2D35'}
                  />
                  <span style={{
                    fontSize: 10, fontFamily: "'Space Mono',monospace",
                    color: secOver ? '#FF6B6B' : '#3A3D45',
                    marginLeft: 'auto', flexShrink: 0, transition: 'color .2s',
                  }}>
                    {secAssigned}/{secMarks}
                  </span>
                  {/* auto-distribute button — only visible when there are assigned topics */}
                  {assigned.length > 0 && secMarks > 0 && (
                    <button
                      type="button"
                      onClick={() => autoDistribute(key)}
                      title="Distribute marks equally"
                      style={{
                        background: '#00FF7F10', border: '1px solid #00FF7F20',
                        borderRadius: 5, padding: '2px 6px', cursor: 'pointer',
                        fontSize: 9, color: '#00FF7F', fontFamily: "'Space Mono',monospace",
                        flexShrink: 0, transition: 'all .15s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = '#00FF7F25'}
                      onMouseLeave={e => e.currentTarget.style.background = '#00FF7F10'}
                    >
                      ÷ auto
                    </button>
                  )}
                </div>

                {/* drop zone / assigned topics */}
                <div style={{
                  flex: 1, borderRadius: 8, padding: assigned.length ? '4px 0 0' : '0 6px',
                  border: `1px dashed ${isOver ? '#00FF7F40' : assigned.length ? 'transparent' : '#1A1D25'}`,
                  display: 'flex', flexDirection: 'column', gap: 4, minHeight: 44,
                  transition: 'border-color .2s',
                }}>
                  {assigned.length === 0 && (
                    <div style={{
                      fontSize: 10, color: isOver ? '#00FF7F60' : '#2A2D35',
                      textAlign: 'center', fontFamily: "'Space Mono',monospace",
                      paddingTop: 10, transition: 'color .2s',
                    }}>
                      {isOver ? '↓ drop here' : 'drag topics here'}
                    </div>
                  )}
                  {assigned.map(idx => (
                    <SectionTopicChip
                      key={idx}
                      label={topics[idx]}
                      color={getTopicColor(idx)}
                      marks={topicMarks[`${key}__${idx}`] ?? ''}
                      onMarksChange={val => updateTopicMarks(key, idx, val)}
                      onRemove={() => removeTopicFromSection(key, idx)}
                      onDragStart={e => handleDragStart(e, idx, key)}
                      onDragEnd={handleDragEnd}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* ── marks balance bar ── */}
        {totalMaxMarks > 0 && (
          <div style={{ padding: '10px 14px', background: '#080A0F', border: '1px solid #1A1D25', borderRadius: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 10, fontFamily: "'Space Mono',monospace", color: '#3A3D45' }}>Marks assigned</span>
              <span style={{ fontSize: 10, fontFamily: "'Space Mono',monospace", color: marksOver ? '#FF6B6B' : '#00FF7F' }}>
                {totalAssigned} / {totalMaxMarks}
              </span>
            </div>
            <div style={{ height: 4, background: '#1A1D25', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: 99,
                width: `${Math.min(100, totalMaxMarks > 0 ? (totalAssigned / totalMaxMarks) * 100 : 0)}%`,
                background: marksOver ? '#FF6B6B' : totalAssigned === totalMaxMarks ? '#00FF7F' : '#00C8FF',
                transition: 'width .3s ease, background .3s',
              }} />
            </div>
          </div>
        )}

      </div>

      {examConfig.config.markingGuide && (
        <div style={{ marginTop: 12, padding: '8px 12px', background: '#00FF7F05', border: '1px solid #00FF7F15', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Check size={11} color="#00FF7F" />
          <span style={{ fontSize: 11, color: '#4A4D55', fontFamily: "'Space Mono',monospace" }}>{examConfig.config.markingGuide}</span>
        </div>
      )}
    </div>
  );
};

/* ─── Pool Chip ──────────────────────────────────────────── */
const PoolChip = ({ label, color, onDragStart, onDragEnd }) => (
  <div
    draggable
    onDragStart={onDragStart}
    onDragEnd={onDragEnd}
    style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '5px 9px', borderRadius: 7,
      border: '1px solid #1A1D25',
      background: '#0D0F16', cursor: 'grab',
      transition: 'all .15s', userSelect: 'none',
      maxWidth: 200,
    }}
    onMouseEnter={e => { e.currentTarget.style.borderColor = color + '50'; e.currentTarget.style.background = '#0F1218'; }}
    onMouseLeave={e => { e.currentTarget.style.borderColor = '#1A1D25'; e.currentTarget.style.background = '#0D0F16'; }}>
    <GripVertical size={9} color="#3A3D45" style={{ flexShrink: 0 }} />
    <div style={{ width: 6, height: 6, borderRadius: '50%', background: color, flexShrink: 0 }} />
    <span style={{ fontSize: 11, color: '#B8B8B0', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
      {label}
    </span>
  </div>
);

/* ─── Section Topic Chip ─────────────────────────────────── */
const SectionTopicChip = ({ label, color, marks, onMarksChange, onRemove, onDragStart, onDragEnd }) => (
  <div
    draggable
    onDragStart={onDragStart}
    onDragEnd={onDragEnd}
    style={{
      display: 'flex', alignItems: 'center', gap: 5,
      padding: '5px 7px', borderRadius: 7,
      border: `1px solid ${color}25`,
      background: `${color}08`, cursor: 'grab',
      userSelect: 'none', transition: 'border-color .15s',
    }}>
    <GripVertical size={9} color="#3A3D45" style={{ flexShrink: 0 }} />
    <div style={{ width: 5, height: 5, borderRadius: '50%', background: color, flexShrink: 0 }} />
    <span style={{ fontSize: 11, color: '#C8C8C0', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>
      {label}
    </span>
    {/* marks input */}
    <input
      type="number" min={0} placeholder="mk"
      value={marks}
      onChange={e => onMarksChange(e.target.value)}
      onMouseDown={e => e.stopPropagation()}
      onClick={e => e.stopPropagation()}
      onFocus={e => e.target.style.borderColor = color + '60'}
      onBlur={e => e.target.style.borderColor = color + '20'}
      style={{
        width: 38, padding: '2px 5px', fontSize: 10,
        background: '#0A0C11', border: `1px solid ${color}20`,
        borderRadius: 5, color: color, outline: 'none',
        fontFamily: "'Space Mono',monospace", textAlign: 'center', flexShrink: 0,
        transition: 'border-color .15s',
      }}
    />
    <button
      type="button"
      onClick={e => { e.stopPropagation(); onRemove(); }}
      style={{
        background: 'none', border: 'none', padding: '0 1px',
        cursor: 'pointer', color: '#3A3D45',
        display: 'flex', alignItems: 'center', flexShrink: 0, lineHeight: 1,
        transition: 'color .15s',
      }}
      onMouseEnter={e => e.currentTarget.style.color = '#FF6B6B'}
      onMouseLeave={e => e.currentTarget.style.color = '#3A3D45'}>
      <X size={10} />
    </button>
  </div>
);

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════ */
const CreateExamWithAI = ({
  examData, setExamData, onGenerate, isLoading,
  availableSyllabi = [], isLoadingSyllabi = false,
  onSyllabusSelect, onShowSyllabusUpload,
}) => {
  const [expandedTopics, setExpandedTopics]               = useState(new Set());
  const [selectedSyllabusTopics, setSelectedSyllabusTopics] = useState([]);
  const [selectedTopicalTopics, setSelectedTopicalTopics]   = useState([]);
  const [availableTopical, setAvailableTopical]           = useState([]);
  const [isLoadingTopical, setIsLoadingTopical]           = useState(false);

  const allowedPaperTypes = getAllowedPaperTypes(examData);
  useGlobals();

  const [examConfig, setExamConfig]           = useState(null);
  const [isLoadingConfig, setIsLoadingConfig] = useState(false);
  const [configError, setConfigError]         = useState(null);
  const [sectionDistribution, setSectionDistribution] = useState(null);

  const topicalQuestionsService = useRef(new TopicalQuestionsService()).current;

  /* ── fetch exam config ── */
  useEffect(() => {
    if (!examData.curriculum || !examData.subject || !examData.paperType) {
      setExamConfig(null);
      setSectionDistribution(null);
      return;
    }
    let cancelled = false;
    const load = async () => {
      setIsLoadingConfig(true);
      setConfigError(null);
      try {
        const token  = localStorage.getItem('authToken');
        const params = new URLSearchParams({
          curriculum: examData.curriculum,
          subject:    examData.subject,
          paperType:  examData.paperType,
        });
        const response = await fetch(
          `http://localhost:5000/api/exams/configs/config?${params}`,
          { method: 'GET', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` } },
        );
        if (!response.ok) throw new Error(`Request failed: ${response.status}`);
        const cfg = await response.json();
        if (!cancelled) setExamConfig(cfg);
      } catch {
        if (!cancelled) setConfigError('Could not load exam structure.');
      } finally {
        if (!cancelled) setIsLoadingConfig(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [examData.curriculum, examData.subject, examData.paperType]);

  /* ── push distribution back into examData ── */
  const handleDistributionChange = useCallback((distribution) => {
    setSectionDistribution(distribution);
    setExamData(p => ({ ...p, sectionDistribution: distribution }));
  }, [setExamData]);

  /* ── load topical questions ── */
  const loadTopical = useCallback(async (curriculum, subject) => {
    if (!curriculum || !subject) return;
    setIsLoadingTopical(true);
    try {
      const res = await topicalQuestionsService.getTopicalQuestions({ curriculum, subject });
      if (res.topicalQuestions) setAvailableTopical(res.topicalQuestions);
    } catch { /* silent */ }
    finally { setIsLoadingTopical(false); }
  }, [topicalQuestionsService]);

  useEffect(() => {
    if (examData.curriculum || examData.subject) {
      loadTopical(examData.curriculum, examData.subject);
    }
  }, [examData.curriculum, examData.subject, loadTopical]);

  /* ── auto-set paper type ── */
  useEffect(() => {
    if (allowedPaperTypes.length === 1 && examData.paperType !== allowedPaperTypes[0].key) {
      setExamData(p => ({ ...p, paperType: allowedPaperTypes[0].key }));
    }
  }, [allowedPaperTypes, examData.paperType, setExamData]);

  /* ── default topics ── */
  useEffect(() => {
    if (examData.curriculum && examData.subject && subjectTopics[examData.subject] && !examData.useSyllabus) {
      const all = subjectTopics[examData.subject][examData.curriculum] || [];
      setExamData(p => ({ ...p, topics: all }));
    }
  }, [examData.curriculum, examData.subject, examData.useSyllabus, setExamData]);

  /* ── auto-set duration & numQuestions ── */
  useEffect(() => {
    if (!examData.paperType || !examData.curriculum || !examData.subject) return;
    const sub = examData.subject;
    const pt  = examData.paperType;
    let duration = 60, numQuestions = 20;

    if (examData.curriculum === 'Lower Primary') {
      duration = 40; numQuestions = sub === 'Mathematical Activities' ? 20 : 15;
    } else if (examData.curriculum === 'Upper Primary') {
      duration = 60;
      if (sub === 'Mathematics') { numQuestions = 20; }
      else if (['English', 'Kiswahili'].includes(sub)) { numQuestions = 15; }
      else if (sub === 'Science and Technology') { numQuestions = 20; }
      else { numQuestions = 15; }
    } else if (examData.curriculum === 'JSS') {
      duration = 90;
      if (sub === 'Mathematics') numQuestions = 17;
      else if (['English', 'Kiswahili'].includes(sub)) numQuestions = 12;
      else if (sub === 'Integrated Science') numQuestions = 20;
      else if (sub === 'Social Studies') numQuestions = 17;
      else if (['Religious Education'].includes(sub)) numQuestions = 13;
      else numQuestions = 15;
    } else if (examData.curriculum === 'Senior School') {
      if (sub === 'Mathematics') { duration = 150; numQuestions = 20; }
      else if (['Physics', 'Chemistry', 'Biology'].includes(sub)) {
        if (pt === 'Paper 1') { duration = 120; numQuestions = 30; }
        else if (pt === 'Paper 2') { duration = 150; numQuestions = 8; }
        else if (pt === 'Paper 3') { duration = 150; numQuestions = 2; }
        else { duration = 150; numQuestions = 20; }
      } else if (['English', 'Kiswahili'].includes(sub)) { duration = 120; numQuestions = 12; }
      else if (sub === 'Computer Science') { duration = 150; numQuestions = pt === 'Paper 1' ? 24 : 2; }
      else if (['Agriculture', 'Foods and Nutrition', 'Home Management'].includes(sub)) {
        if (pt === 'Paper 1') { duration = 150; numQuestions = 20; } else { duration = 180; numQuestions = 3; }
      } else if (['Visual Arts', 'Fine Art', 'Applied Art', 'Crafts', 'Performing Arts', 'Music', 'Dance', 'Theatre and Film'].includes(sub)) {
        duration = pt === 'Paper 2' ? 90 : 150; numQuestions = pt === 'Paper 2' ? 2 : 12;
      } else if (['Ball Games', 'Athletics', 'Indoor Games', 'Gymnastics', 'Water Sports', 'Outdoor Pursuits', 'Advanced Physical Education'].includes(sub)) {
        duration = pt === 'Paper 2' ? 60 : 90; numQuestions = pt === 'Paper 2' ? 2 : 15;
      } else if (['History and Citizenship', 'Geography'].includes(sub)) { duration = 150; numQuestions = 4; }
      else if (['Christian Religious Education', 'Islamic Religious Education', 'Hindu Religious Education'].includes(sub)) { duration = 120; numQuestions = 5; }
      else if (['French', 'German', 'Arabic', 'Mandarin'].includes(sub)) {
        if (pt === 'Paper 1') { duration = 150; numQuestions = 12; } else { duration = 30; numQuestions = 4; }
      } else { duration = 120; numQuestions = 20; }
    } else if (examData.curriculum === 'Secondary') {
      if (sub === 'Mathematics') { duration = 150; numQuestions = pt === 'Paper 1' ? 16 : 13; }
      else if (sub === 'English') {
        if (pt === 'Paper 1') { duration = 120; numQuestions = 12; }
        else if (pt === 'Paper 2') { duration = 150; numQuestions = 2; }
        else { duration = 120; numQuestions = 8; }
      } else if (sub === 'Kiswahili') { duration = 180; numQuestions = pt === 'Paper 1' ? 12 : 5; }
      else if (['Physics', 'Chemistry', 'Biology'].includes(sub)) {
        if (pt === 'Paper 1') { duration = 120; numQuestions = 30; }
        else if (pt === 'Paper 2') { duration = 150; numQuestions = 8; }
        else { duration = 150; numQuestions = 2; }
      } else if (sub === 'Geography') { duration = 150; numQuestions = 4; }
      else if (sub === 'History') { duration = 150; numQuestions = 3; }
      else if (['Christian Religious Education', 'Islamic Religious Education'].includes(sub)) { duration = 180; numQuestions = 5; }
      else if (sub === 'Business Studies') { duration = 180; numQuestions = 24; }
      else if (sub === 'Agriculture') {
        if (pt === 'Paper 1') { duration = 150; numQuestions = 24; } else { duration = 180; numQuestions = 3; }
      } else if (sub === 'Home Science') {
        duration = pt === 'Paper 3' ? 180 : 150; numQuestions = pt === 'Paper 3' ? 2 : 24;
      } else if (sub === 'Computer Studies') { duration = 150; numQuestions = pt === 'Paper 1' ? 24 : 2; }
      else if (['French', 'German'].includes(sub)) {
        if (pt === 'Paper 1') { duration = 180; numQuestions = 13; } else { duration = 30; numQuestions = 4; }
      } else if (sub === 'Music') {
        if (pt === 'Paper 1') { duration = 180; numQuestions = 13; } else { duration = 60; numQuestions = 2; }
      } else { duration = 150; numQuestions = 20; }
    }

    setExamData(p => ({ ...p, duration, numQuestions }));
  }, [examData.paperType, examData.curriculum, examData.subject, setExamData]);

  /* ── handlers ── */
  const handleSyllabusChange = (id) => {
    if (onSyllabusSelect) onSyllabusSelect(id);
    setSelectedSyllabusTopics([]);
    setExpandedTopics(new Set());
  };

  const handleSyllabusTopicToggle = (topic) => {
    const exists = selectedSyllabusTopics.some(t => t.topicNumber === topic.Topic_Number);
    const next = exists
      ? selectedSyllabusTopics.filter(t => t.topicNumber !== topic.Topic_Number)
      : [...selectedSyllabusTopics, {
          topicNumber: topic.Topic_Number, topicTitle: topic.Topic_Title,
          content: topic.Content || [], objectives: topic.Specific_Objectives || [],
        }];
    setSelectedSyllabusTopics(next);
    setExamData(p => ({ ...p, topics: next.map(t => t.topicTitle), syllabusTopicDetails: next }));
  };

  const selectAllSyllabusTopics = () => {
    if (!examData.syllabusContent?.topics) return;
    const all = examData.syllabusContent.topics.map(t => ({
      topicNumber: t.Topic_Number, topicTitle: t.Topic_Title,
      content: t.Content || [], objectives: t.Specific_Objectives || [],
    }));
    setSelectedSyllabusTopics(all);
    setExamData(p => ({ ...p, topics: all.map(t => t.topicTitle), syllabusTopicDetails: all }));
  };

  const clearAllSyllabusTopics = () => {
    setSelectedSyllabusTopics([]);
    setExamData(p => ({ ...p, topics: [], syllabusTopicDetails: [] }));
  };

  const onTopicalSelect = async (id) => {
    if (!id) {
      setExamData(p => ({ ...p, useTopical: false, selectedTopicalId: null, topicalContent: null }));
      return;
    }
    try {
      const d = await topicalQuestionsService.getTopicalQuestionsById(id);
      if (d) setExamData(p => ({ ...p, useTopical: true, selectedTopicalId: id, topicalContent: d }));
      else alert('Failed to load topical questions.');
    } catch { alert('Error loading topical questions.'); }
  };

  const handleTopicalChange = (id) => {
    onTopicalSelect(id);
    setSelectedTopicalTopics([]);
    setExpandedTopics(new Set());
  };

  const handleTopicalTopicToggle = (topic) => {
    const exists = selectedTopicalTopics.some(t => t.topicId === topic.topic_id);
    const next = exists
      ? selectedTopicalTopics.filter(t => t.topicId !== topic.topic_id)
      : [...selectedTopicalTopics, { topicId: topic.topic_id, topicName: topic.topic_name, questions: topic.questions || [] }];
    setSelectedTopicalTopics(next);
    setExamData(p => ({ ...p, topics: next.map(t => t.topicName), topicalTopicDetails: next }));
  };

  const selectAllTopicalTopics = () => {
    if (!examData.topicalContent?.topics) return;
    const all = examData.topicalContent.topics.map(t => ({
      topicId: t.topic_id, topicName: t.topic_name, questions: t.questions || [],
    }));
    setSelectedTopicalTopics(all);
    setExamData(p => ({ ...p, topics: all.map(t => t.topicName), topicalTopicDetails: all }));
  };

  const clearAllTopicalTopics = () => {
    setSelectedTopicalTopics([]);
    setExamData(p => ({ ...p, topics: [], topicalTopicDetails: [] }));
  };

  const toggleExpand = (id) => setExpandedTopics(p => {
    const s = new Set(p); s.has(id) ? s.delete(id) : s.add(id); return s;
  });

  /* ── derived fields (sync without render loop) ── */
  const examTitle       = `${examData.classLevel || ''} ${examData.subject || ''} ${examData.type || ''} Exam`.trim();
  const examDescription = `A ${examData.numQuestions || 'N/A'}-question ${examData.subject || 'subject'} exam for ${examData.classLevel || 'selected class'} covering ${examData.topics?.length > 0 ? examData.topics.join(', ') : 'selected topics'}.`.trim();

  useEffect(() => {
    setExamData(p => {
      if (p.title === examTitle && p.description === examDescription) return p;
      return { ...p, title: examTitle, description: examDescription };
    });
  }, [examTitle, examDescription, setExamData]);

  const canGenerate = examData.classLevel && examData.curriculum && examData.type && examData.paperType &&
    (examData.topics?.length > 0 || examData.useSyllabus);

  const activeTopicCount = examData.useSyllabus
    ? selectedSyllabusTopics.length
    : selectedTopicalTopics.length;

  const distributionTopics = examData.useSyllabus
    ? selectedSyllabusTopics.map(t => t.topicTitle)
    : examData.useTopical
      ? selectedTopicalTopics.map(t => t.topicName)
      : examData.topics || [];

  const showDistribution = !!examConfig && distributionTopics.length > 0;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Syne:wght@700;800&family=Space+Mono&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        select option { background: #0D0F16; color: #E8E8E0; }
        input::placeholder, textarea::placeholder { color: #3A3D45; }
        .cai-scroll::-webkit-scrollbar { width: 4px; }
        .cai-scroll::-webkit-scrollbar-track { background: transparent; }
        .cai-scroll::-webkit-scrollbar-thumb { background: #00FF7F30; border-radius: 4px; }
        @keyframes caiIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes caiUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin  { to { transform: rotate(360deg); } }
        .cai-layout { display: grid; grid-template-columns: 1fr 340px; gap: 20px; align-items: start; }
        .cai-config-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 12px; }
        @media (max-width: 960px) { .cai-layout { grid-template-columns: 1fr; } .cai-right { position: static !important; } }
        @media (max-width: 560px) { .cai-config-grid { grid-template-columns: 1fr 1fr; } }
        @media (max-width: 380px) { .cai-config-grid { grid-template-columns: 1fr; } }
        input[type=number]::-webkit-inner-spin-button { opacity: 0.3; }
        .dist-chip-drag:active { cursor: grabbing; }
      `}</style>

      <div style={{ maxWidth: 1280, margin: '0 auto', fontFamily: "'DM Sans','Helvetica Neue',sans-serif", color: '#E8E8E0', animation: 'caiUp .45s ease forwards' }}>

        {/* page header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ fontSize: 11, fontFamily: "'Space Mono',monospace", textTransform: 'uppercase', letterSpacing: '0.12em', color: '#00FF7F', marginBottom: 6 }}>AI-Powered</div>
            <h1 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 'clamp(20px,3vw,30px)', letterSpacing: '-0.03em', lineHeight: 1.05, color: '#E8E8E0', marginBottom: 4 }}>Create Exam with AI</h1>
            <p style={{ fontSize: 14, color: '#6A6A62' }}>Generate curriculum-aligned questions from your syllabus</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 16px', background: '#00FF7F10', border: '1px solid #00FF7F25', borderRadius: 100, fontSize: 12, color: '#00FF7F', fontFamily: "'Space Mono',monospace" }}>
            <Sparkles size={12} /> Powered by AI
          </div>
        </div>

        <div className="cai-layout">

          {/* ── LEFT ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* exam configuration */}
            <div style={{ background: '#0D0F16', border: '1px solid #1A1D25', borderRadius: 14, padding: '20px 22px' }}>
              <SectionHead label="Exam Configuration" />
              <div className="cai-config-grid">

                <div>
                  <label style={LABEL}>Curriculum *</label>
                  <FSelect value={examData.curriculum}
                    onChange={e => setExamData({ ...examData, curriculum: e.target.value, classLevel: '', subject: '', topics: [], useSyllabus: false, selectedSyllabusId: null, syllabusContent: null })}>
                    <option value="">Select</option>
                    <option value="Lower Primary">Lower Primary (Gr 1–3)</option>
                    <option value="Upper Primary">Upper Primary (Gr 4–6)</option>
                    <option value="JSS">Junior Secondary (Gr 7–9)</option>
                    <option value="Senior School">Senior School (Gr 10–12)</option>
                    <option value="Secondary">Secondary / 8-4-4 (Fm 1–4)</option>
                  </FSelect>
                </div>

                <div>
                  <label style={LABEL}>Class Level *</label>
                  <FSelect value={examData.classLevel} disabled={!examData.curriculum}
                    onChange={e => {
                      const level = e.target.value;
                      setExamData({ ...examData, classLevel: level, curriculum: getCurriculumFromLevel(level), subject: '', topics: [], useSyllabus: false, selectedSyllabusId: null, syllabusContent: null });
                    }}>
                    <option value="">Select Class</option>
                    {(CURRICULUM_OPTIONS[examData.curriculum] || []).map(o => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </FSelect>
                </div>

                <div>
                  <label style={LABEL}>Exam Type *</label>
                  <FSelect value={examData.type} onChange={e => setExamData({ ...examData, type: e.target.value })}>
                    <option value="Opener">Opener</option>
                    <option value="Mid-Term">Mid-Term</option>
                    <option value="End-Term">End-Term</option>
                  </FSelect>
                </div>

                <div>
                  <label style={LABEL}>Subject *</label>
                  <FSelect value={examData.subject} disabled={!examData.curriculum}
                    onChange={e => setExamData({ ...examData, subject: e.target.value, topics: [], useSyllabus: false, selectedSyllabusId: null, syllabusContent: null, topicalContent: null })}>
                    <option value="">Select Subject</option>
                    {examData.curriculum && (curriculumSubjects[examData.curriculum] || []).map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </FSelect>
                </div>

                <div>
                  <label style={LABEL}>Term *</label>
                  <FSelect value={examData.term} onChange={e => setExamData({ ...examData, term: e.target.value })}>
                    <option value="Term I">Term I</option>
                    <option value="Term II">Term II</option>
                    <option value="Term III">Term III</option>
                  </FSelect>
                </div>

                <div>
                  <label style={LABEL}>Paper Type *</label>
                  <FSelect value={examData.paperType || ''} disabled={!examData.subject}
                    onChange={e => setExamData({ ...examData, paperType: e.target.value })}>
                    {allowedPaperTypes.length === 1
                      ? <option value={allowedPaperTypes[0].key}>{allowedPaperTypes[0].title}</option>
                      : (<>
                          <option value="">Select Paper</option>
                          {examData.curriculum && allowedPaperTypes.map(o => (
                            <option key={o.key} value={o.key}>{o.title}</option>
                          ))}
                        </>)
                    }
                  </FSelect>
                </div>

                <div>
                  <label style={LABEL}>Questions</label>
                  <FInput type="number" value={examData.numQuestions} onChange={e => setExamData({ ...examData, numQuestions: parseInt(e.target.value) })} min={5} max={50} />
                </div>

                <div>
                  <label style={LABEL}>Duration (min)</label>
                  <FInput type="number" value={examData.duration} onChange={e => setExamData({ ...examData, duration: parseInt(e.target.value) })} min={30} max={240} />
                </div>

                <div>
                  <label style={LABEL}>Difficulty</label>
                  <FSelect value={examData.difficulty} onChange={e => setExamData({ ...examData, difficulty: e.target.value })}>
                    <option value="mixed">Mixed</option>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </FSelect>
                </div>

              </div>
            </div>

            {/* instructions */}
            <div style={{ background: '#0D0F16', border: '1px solid #1A1D25', borderRadius: 14, padding: '20px 22px' }}>
              <SectionHead label="Instructions" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={LABEL}>AI Instructions (optional)</label>
                  <FTextarea value={examData.customPrompt} onChange={e => setExamData({ ...examData, customPrompt: e.target.value })} placeholder="e.g., Include Kenyan examples, focus on practical applications…" rows={3} />
                </div>
                <div>
                  <label style={LABEL}>Exam Instructions (optional)</label>
                  <FTextarea value={examData.instructions} onChange={e => setExamData({ ...examData, instructions: e.target.value })} placeholder="e.g., Answer all questions. Show working steps. Time: 2 hrs" rows={3} />
                </div>
              </div>
            </div>

            {/* Section Distribution Panel */}
            {isLoadingConfig && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', background: '#0D0F16', border: '1px solid #1A1D25', borderRadius: 14, fontSize: 12, color: '#4A4D55', fontFamily: "'Space Mono',monospace" }}>
                <div style={{ width: 12, height: 12, border: '2px solid #00FF7F30', borderTopColor: '#00FF7F', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                Loading exam structure…
              </div>
            )}
            {configError && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 14px', background: '#FF4A4A0A', border: '1px solid #FF4A4A25', borderRadius: 10 }}>
                <AlertCircle size={13} color="#FF6B6B" />
                <span style={{ fontSize: 12, color: '#FF6B6B' }}>{configError}</span>
              </div>
            )}
            {showDistribution && (
              <SectionDistributionPanel
                examConfig={examConfig}
                topics={distributionTopics}
                onDistributionChange={handleDistributionChange}
              />
            )}
            {examConfig && distributionTopics.length === 0 && (
              <div style={{ padding: '12px 16px', background: '#0D0F16', border: '1px dashed #1A1D25', borderRadius: 14, fontSize: 12, color: '#3A3D45', fontFamily: "'Space Mono',monospace", textAlign: 'center' }}>
                Select topics above to distribute them across exam sections
              </div>
            )}

          </div>

          {/* ── RIGHT ── */}
          <div className="cai-right" style={{ position: 'sticky', top: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>

            {examData.subject && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, animation: 'caiIn .3s ease forwards' }}>
                <StatPill label="Questions" value={examData.numQuestions || '—'} color="#00FF7F" />
                <StatPill label="Duration"  value={examData.duration ? `${examData.duration}m` : '—'} color="#00C8FF" />
                <StatPill label="Topics"    value={activeTopicCount || examData.topics?.length || '—'} color="#9B6BFF" />
              </div>
            )}

            {/* question source */}
            {examData.curriculum && examData.subject && (
              <div style={{ background: '#0D0F16', border: '1px solid #1A1D25', borderRadius: 14, padding: '18px 20px' }}>
                <SectionHead label="Question Source" accent="#00FF7F" />

                {isLoadingSyllabi ? (
                  <div style={{ fontSize: 12, color: '#4A4D55', fontFamily: "'Space Mono',monospace", padding: '8px 0' }}>Loading syllabi…</div>
                ) : availableSyllabi.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 12 }}>
                    {availableSyllabi.map(syl => {
                      const isActive = examData.useSyllabus && examData.selectedSyllabusId === syl.id;
                      return <SourceButton key={syl.id} label={`${syl.title} Syllabus`} isActive={isActive} onClick={() => handleSyllabusChange(isActive ? null : syl.id)} />;
                    })}
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 14px', background: '#FF9B3B0A', border: '1px solid #FF9B3B25', borderRadius: 10, marginBottom: 10 }}>
                    <AlertCircle size={13} color="#FF9B3B" />
                    <span style={{ fontSize: 12, color: '#B87A40' }}>No syllabi for {examData.subject} ({examData.curriculum})</span>
                  </div>
                )}

                {isLoadingTopical ? (
                  <div style={{ fontSize: 12, color: '#4A4D55', fontFamily: "'Space Mono',monospace", padding: '4px 0' }}>Loading topical questions…</div>
                ) : availableTopical.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                    {availableTopical.map(set => {
                      const isActive = examData.useTopical && examData.selectedTopicalId === set.id;
                      return <SourceButton key={set.id} label={`${set.subject} ${set.curriculum === 'Secondary' ? '' : set.curriculum} Topical`} isActive={isActive} onClick={() => handleTopicalChange(isActive ? null : set.id)} />;
                    })}
                  </div>
                )}

                {onShowSyllabusUpload && (
                  <button type="button" onClick={onShowSyllabusUpload}
                    style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 12, padding: '8px 0', background: 'none', border: 'none', color: '#4A4D55', fontSize: 12, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", transition: 'color .2s' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#00FF7F'}
                    onMouseLeave={e => e.currentTarget.style.color = '#4A4D55'}>
                    <Upload size={12} /> Upload new syllabus
                  </button>
                )}
              </div>
            )}

            {/* syllabus topics */}
            {examData.useSyllabus && examData.syllabusContent?.topics?.length > 0 && (
              <div style={{ marginTop: 16, background: '#0D0F16', border: '1px solid #00FF7F30', borderRadius: 14, padding: '20px 24px', animation: 'caiIn .3s ease forwards' }}>
                <TopicPanel title="Select Syllabus Topics" count={selectedSyllabusTopics.length} total={examData.syllabusContent.topics.length} onSelectAll={selectAllSyllabusTopics} onClearAll={clearAllSyllabusTopics} accent="#00FF7F">
                  {examData.syllabusContent.topics.map(topic => {
                    const isSelected = selectedSyllabusTopics.some(t => t.topicNumber === topic.Topic_Number);
                    const isExpanded = expandedTopics.has(topic.Topic_Number);
                    return (
                      <TopicRow key={topic.Topic_Number} isSelected={isSelected} isExpanded={isExpanded}
                        onToggleSelect={() => handleSyllabusTopicToggle(topic)}
                        onToggleExpand={() => toggleExpand(topic.Topic_Number)}
                        label={`${topic.Topic_Number}. ${topic.Topic_Title}`}
                        meta={`${topic.Specific_Objectives?.length || 0} objectives · ${topic.Content?.length || 0} content items`}>
                        {topic.Specific_Objectives?.length > 0 && <ContentGroup label="Objectives" items={topic.Specific_Objectives} accent="#00FF7F" />}
                        {topic.Content?.length > 0 && <ContentGroup label="Content" items={topic.Content} accent="#00C8FF" />}
                      </TopicRow>
                    );
                  })}
                </TopicPanel>
              </div>
            )}

            {/* topical topics */}
            {examData.useTopical && examData.topicalContent?.topics?.length > 0 && (
              <div style={{ marginTop: 16, background: '#0D0F16', border: '1px solid #9B6BFF30', borderRadius: 14, padding: '20px 24px', animation: 'caiIn .3s ease forwards' }}>
                <TopicPanel title="Select Topical Topics" count={selectedTopicalTopics.length} total={examData.topicalContent.topics.length} onSelectAll={selectAllTopicalTopics} onClearAll={clearAllTopicalTopics} accent="#9B6BFF">
                  {examData.topicalContent.topics.map(topic => {
                    const isSelected = selectedTopicalTopics.some(t => t.topicId === topic.topic_id);
                    const isExpanded = expandedTopics.has(topic.topic_id);
                    return (
                      <TopicRow key={topic.topic_id} isSelected={isSelected} isExpanded={isExpanded}
                        onToggleSelect={() => handleTopicalTopicToggle(topic)}
                        onToggleExpand={() => toggleExpand(topic.topic_id)}
                        label={topic.topic_name}
                        meta={`${topic.questions?.length || 0} questions`}>
                        {topic.questions?.length > 0 && <ContentGroup label="Sample Questions" items={topic.questions.map(q => q.question_text)} accent="#9B6BFF" />}
                      </TopicRow>
                    );
                  })}
                </TopicPanel>
              </div>
            )}

            {/* generate button */}
            <button onClick={onGenerate} disabled={!canGenerate || isLoading}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9,
                padding: '15px 0', width: '100%',
                background: canGenerate && !isLoading ? '#00FF7F' : '#1A1D25',
                border: 'none', borderRadius: 12,
                color: canGenerate && !isLoading ? '#080A0F' : '#3A3D45',
                fontSize: 14, fontWeight: 700,
                cursor: canGenerate && !isLoading ? 'pointer' : 'not-allowed',
                fontFamily: "'DM Sans',sans-serif",
                boxShadow: canGenerate && !isLoading ? '0 6px 24px #00FF7F25' : 'none',
                transition: 'all .2s',
              }}
              onMouseEnter={e => { if (canGenerate && !isLoading) { e.currentTarget.style.background = '#33FF99'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
              onMouseLeave={e => { if (canGenerate && !isLoading) { e.currentTarget.style.background = '#00FF7F'; e.currentTarget.style.transform = 'translateY(0)'; } }}>
              <Wand2 size={16} />
              {isLoading ? 'Generating…' : examData.useSyllabus ? 'Generate from Syllabus' : examData.useTopical ? 'Generate from Topical' : 'Generate Exam with AI'}
            </button>

            {/* readiness checklist */}
            <div style={{ background: '#080A0F', border: '1px solid #1A1D25', borderRadius: 12, padding: '14px 16px' }}>
              <div style={{ fontSize: 10, fontFamily: "'Space Mono',monospace", textTransform: 'uppercase', letterSpacing: '0.08em', color: '#3A3D45', marginBottom: 10 }}>Ready to generate</div>
              {[
                { label: 'Class level selected',     done: !!examData.classLevel },
                { label: 'Subject & curriculum set', done: !!examData.curriculum && !!examData.subject },
                { label: 'Paper type chosen',        done: !!examData.paperType },
                { label: 'Topics selected',          done: (examData.topics?.length > 0) || examData.useSyllabus },
                { label: 'Sections configured',      done: !!examConfig && !!sectionDistribution },
              ].map(({ label, done }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
                  <div style={{
                    width: 14, height: 14, borderRadius: '50%',
                    background: done ? '#00FF7F20' : '#1A1D25',
                    border: `1px solid ${done ? '#00FF7F50' : '#2A2D35'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    {done && <Check size={8} color="#00FF7F" strokeWidth={3} />}
                  </div>
                  <span style={{ fontSize: 12, color: done ? '#9A9A90' : '#3A3D45' }}>{label}</span>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default CreateExamWithAI;