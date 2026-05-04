import React, { useState } from 'react';
import { Wand2, BookOpen, ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import CreateExamWithAI from './AIPoweredExamForm';
import CreateExamFromBank from './CreateExamFromBank';
import AdBanner from './AdBanner';

const MODES = [
  {
    id: 'ai',
    label: 'AI-Powered Exam',
    icon: Wand2,
    accent: '#00FF7F',
    accentDim: '#00FF7F15',
    accentBorder: '#00FF7F30',
    tagline: 'Generate a full exam in seconds',
    desc: 'Let AI build curriculum-aligned questions from your syllabus. Covers every topic, every question type — automatically.',
    features: [
      'Syllabus-based generation',
      'Curriculum-aligned content',
      'Multiple question types',
      'Automatic marking schemes',
    ],
    cta: 'Use AI Generator',
  },
  {
    id: 'bank',
    label: 'Question Bank',
    icon: BookOpen,
    accent: '#00C8FF',
    accentDim: '#00C8FF15',
    accentBorder: '#00C8FF30',
    tagline: 'Hand-pick from your library',
    desc: 'Browse, filter, and curate questions from your existing bank. Full manual control over every question selected.',
    features: [
      'Browse question library',
      'Filter by subject & difficulty',
      'Drag & drop arrangement',
      'Manual curation control',
    ],
    cta: 'Use Question Bank',
  },
];

/* ── mode selection ─────────────────────────────────────── */
const ModeCard = ({ mode, onSelect }) => {
  const [hovered, setHovered] = useState(false);
  const Icon = mode.icon;
  return (
    <div
      onClick={() => onSelect(mode.id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? mode.accentDim : '#0D0F16',
        border: `1px solid ${hovered ? mode.accentBorder : '#1A1D25'}`,
        borderRadius: 18,
        padding: '36px 32px',
        cursor: 'pointer',
        transition: 'all .3s',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: hovered ? `0 16px 48px ${mode.accent}10` : 'none',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* top accent line */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: hovered ? `linear-gradient(90deg,${mode.accent},transparent)` : 'transparent', transition: 'all .3s' }} />

      {/* icon */}
      <div style={{ width: 56, height: 56, borderRadius: 16, background: mode.accentDim, border: `1px solid ${mode.accentBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20, transition: 'all .3s' }}>
        <Icon size={24} color={mode.accent} />
      </div>

      {/* tag */}
      <div style={{ display: 'inline-block', fontSize: 10, fontFamily: "'Space Mono',monospace", textTransform: 'uppercase', letterSpacing: '0.1em', color: mode.accent, padding: '3px 10px', background: mode.accentDim, border: `1px solid ${mode.accentBorder}`, borderRadius: 100, marginBottom: 12 }}>
        {mode.tagline}
      </div>

      <h3 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 22, letterSpacing: '-0.02em', color: '#E8E8E0', marginBottom: 10 }}>{mode.label}</h3>
      <p style={{ fontSize: 14, color: '#6A6A62', lineHeight: 1.7, marginBottom: 24 }}>{mode.desc}</p>

      {/* feature list */}
      <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 28 }}>
        {mode.features.map(f => (
          <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 13, color: '#9A9A90' }}>
            <CheckCircle size={13} color={mode.accent} style={{ flexShrink: 0 }} />
            {f}
          </li>
        ))}
      </ul>

      {/* cta */}
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '11px 22px', background: mode.accent, borderRadius: 100, fontSize: 13, fontWeight: 700, color: '#080A0F', fontFamily: "'DM Sans',sans-serif", transition: 'all .2s' }}>
        <Icon size={14} /> {mode.cta} <ArrowRight size={13} />
      </div>
    </div>
  );
};

/* ── mode toggle bar ────────────────────────────────────── */
const ModeToggle = ({ selected, onChange }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px', background: '#0D0F16', border: '1px solid #1A1D25', borderRadius: 100 }}>
    {MODES.map(m => {
      const active = selected === m.id;
      const Icon = m.icon;
      return (
        <button
          key={m.id}
          onClick={() => onChange(m.id)}
          style={{
            display: 'flex', alignItems: 'center', gap: 7,
            padding: '8px 18px', borderRadius: 100,
            background: active ? m.accent : 'transparent',
            border: 'none', cursor: 'pointer',
            color: active ? '#080A0F' : '#6A6A62',
            fontSize: 13, fontWeight: active ? 700 : 400,
            fontFamily: "'DM Sans',sans-serif",
            transition: 'all .2s',
          }}
          onMouseEnter={e => { if (!active) e.currentTarget.style.color = '#E8E8E0'; }}
          onMouseLeave={e => { if (!active) e.currentTarget.style.color = '#6A6A62'; }}
        >
          <Icon size={13} /> {m.label}
        </button>
      );
    })}
  </div>
);

/* ── main component ─────────────────────────────────────── */
const ExamSetupForm = ({
  examData,
  setExamData,
  onGenerate,
  isLoading,
  availableSyllabi = [],
  isLoadingSyllabi = false,
  onSyllabusSelect,
  onShowSyllabusUpload,
  onBack,
}) => {
  const [selectedMode, setSelectedMode] = useState(null);

  /* ── mode selection screen ── */
  if (!selectedMode) {
    return (
      <>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Syne:wght@700;800&family=Space+Mono&display=swap');`}</style>
        <div style={{ margin: '0 auto', fontFamily: "'DM Sans','Helvetica Neue',sans-serif", color: '#E8E8E0' }}>

          {/* header */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
            <div>
              <h1 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 'clamp(24px,3vw,36px)', letterSpacing: '-0.03em', lineHeight: 1.06, color: '#E8E8E0', marginBottom: 6 }}>
                How do you want to build?
              </h1>
              <p style={{ fontSize: 15, color: '#6A6A62', lineHeight: 1.6 }}>Pick a mode — you can always switch after.</p>
            </div>
            {onBack && (
              <button
                onClick={onBack}
                style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', background: 'transparent', border: '1px solid #1A1D25', borderRadius: 100, color: '#6A6A62', fontSize: 13, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", transition: 'all .2s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#2A2D35'; e.currentTarget.style.color = '#E8E8E0'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#1A1D25'; e.currentTarget.style.color = '#6A6A62'; }}
              >
                <ArrowLeft size={13} /> Back
              </button>
            )}
          </div>

          {/* ad banner */}
          <div style={{ marginBottom: 28 }}><AdBanner /></div>

          {/* cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 20 }}>
            {MODES.map(m => <ModeCard key={m.id} mode={m} onSelect={setSelectedMode} />)}
          </div>
        </div>
      </>
    );
  }

  /* ── active mode screen ── */
  const activeMode = MODES.find(m => m.id === selectedMode);

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Syne:wght@700;800&family=Space+Mono&display=swap');`}</style>
      <div style={{ fontFamily: "'DM Sans','Helvetica Neue',sans-serif", color: '#E8E8E0' }}>

        {/* top bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, padding: '14px 20px', background: '#0D0F16', border: '1px solid #1A1D25', borderRadius: 14, flexWrap: 'wrap', gap: 12 }}>
          {/* breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={() => setSelectedMode(null)}
              style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#4A4D55', fontSize: 13, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", padding: 0, transition: 'color .2s' }}
              onMouseEnter={e => e.currentTarget.style.color = '#E8E8E0'}
              onMouseLeave={e => e.currentTarget.style.color = '#4A4D55'}
            >
              <ArrowLeft size={13} /> Create Exam
            </button>
            <span style={{ color: '#2A2D35' }}>/</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: activeMode.accent, fontWeight: 600 }}>
              <activeMode.icon size={13} /> {activeMode.label}
            </div>
          </div>

          {/* toggle */}
          {/* <ModeToggle selected={selectedMode} onChange={setSelectedMode} /> */}
        </div>

        {/* content */}
        <div key={selectedMode} style={{ opacity: 1, animation: 'examFadeIn .3s ease forwards' }}>
          <style>{`@keyframes examFadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }`}</style>
          {selectedMode === 'ai'
            ? <CreateExamWithAI
                examData={examData}
                setExamData={setExamData}
                onGenerate={onGenerate}
                isLoading={isLoading}
                availableSyllabi={availableSyllabi}
                isLoadingSyllabi={isLoadingSyllabi}
                onSyllabusSelect={onSyllabusSelect}
                onShowSyllabusUpload={onShowSyllabusUpload}
              />
            : <CreateExamFromBank />
          }
        </div>
      </div>
    </>
  );
};

export default ExamSetupForm;