import { useState, useEffect, useRef } from 'react';
import { X, Zap, Image, Plus, Trash2, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';

const API = API_API_BASE_URL;

/* ─── field label ────────────────────────────────────────── */
const Label = ({ children, required }) => (
  <label style={{ display:'block', fontSize:10, fontFamily:"'Space Mono',monospace", textTransform:'uppercase', letterSpacing:'0.08em', color:'#4A4D55', marginBottom:7 }}>
    {children}{required && <span style={{ color:'#FF4444', marginLeft:3 }}>*</span>}
  </label>
);

/* ─── shared input styles ────────────────────────────────── */
const inputStyle = (focused) => ({
  width:'100%', padding:'10px 12px', background: focused ? '#0F1410' : '#080A0F',
  border:`1px solid ${focused ? '#00FF7F50' : '#1A1D25'}`, borderRadius:10,
  color:'#E8E8E0', fontSize:13, fontFamily:"'DM Sans',sans-serif", outline:'none',
  transition:'all .2s', boxSizing:'border-box',
  boxShadow: focused ? '0 0 0 3px #00FF7F0D' : 'none',
});

const Field = ({ children, style = {} }) => (
  <div style={{ marginBottom:18, ...style }}>{children}</div>
);

/* ─── Focusable input wrappers ───────────────────────────── */
const Input = ({ value, onChange, placeholder, type='text', min, max }) => {
  const [f, setF] = useState(false);
  return <input type={type} value={value} onChange={onChange} placeholder={placeholder} min={min} max={max}
    style={inputStyle(f)} onFocus={() => setF(true)} onBlur={() => setF(false)}/>;
};

const Textarea = ({ value, onChange, placeholder, rows=3 }) => {
  const [f, setF] = useState(false);
  return <textarea rows={rows} value={value} onChange={onChange} placeholder={placeholder}
    style={{ ...inputStyle(f), resize:'vertical', lineHeight:1.65 }}
    onFocus={() => setF(true)} onBlur={() => setF(false)}/>;
};

const Select = ({ value, onChange, children }) => {
  const [f, setF] = useState(false);
  return <select value={value} onChange={onChange}
    style={{ ...inputStyle(f), appearance:'none', cursor:'pointer' }}
    onFocus={() => setF(true)} onBlur={() => setF(false)}>
    {children}
  </select>;
};

/* ─── section block ──────────────────────────────────────── */
const Section = ({ title, accent='#1A1D25', children, defaultOpen=true }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ background:'#080A0F', border:`1px solid ${accent}30`, borderRadius:12, overflow:'hidden', marginBottom:16 }}>
      <button type="button" onClick={() => setOpen(p => !p)}
        style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 16px', background:'none', border:'none', color:'#9A9A90', fontSize:12, fontFamily:"'Space Mono',monospace", textTransform:'uppercase', letterSpacing:'0.08em', cursor:'pointer' }}>
        <span style={{ color: accent === '#1A1D25' ? '#5A5D65' : accent }}>{title}</span>
        {open ? <ChevronUp size={12}/> : <ChevronDown size={12}/>}
      </button>
      {open && <div style={{ padding:'0 16px 16px' }}>{children}</div>}
    </div>
  );
};

/* ─── error strip ────────────────────────────────────────── */
const ErrStrip = ({ msg }) => !msg ? null : (
  <div style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 14px', background:'#FF444415', border:'1px solid #FF444430', borderRadius:9, fontSize:12, color:'#FF8888', marginBottom:14 }}>
    {msg}
  </div>
);

/* ─── QUESTION TYPES ─────────────────────────────────────── */
const QUESTION_TYPES = [
  { value:'short-answer',        label:'Short Answer'        },
  { value:'structured',          label:'Structured'          },
  { value:'essay',               label:'Essay'               },
  { value:'multiple-choice',     label:'Multiple Choice'     },
  { value:'true-false',          label:'True / False'        },
  { value:'fill-in-blank',       label:'Fill in the Blank'   },
  { value:'analysis',            label:'Analysis'            },
  { value:'experimental-design', label:'Experimental Design' },
];

/* ═══════════════════════════════════════════════════════════
   MAIN MODAL
═══════════════════════════════════════════════════════════ */
const EditQuestionModal = ({ question, onSave, onCancel }) => {
  const [eq, setEq] = useState(null);
  const [isGenerating, setIsGenerating]     = useState(false);
  const [isSaving, setIsSaving]             = useState(false);
  const [isGenImg, setIsGenImg]             = useState(false);
  const [genErr, setGenErr]                 = useState(null);
  const [imgErr, setImgErr]                 = useState(null);
  const [mounted, setMounted]               = useState(false);
  const backdropRef = useRef(null);

  /* mount animation */
  useEffect(() => { requestAnimationFrame(() => setMounted(true)); }, []);

  /* populate form */
  useEffect(() => {
    if (!question) return;
    setEq({
      id: question._id || null,
      question: question.question || '',
      type: question.type || 'short-answer',
      marks: question.marks || 1,
      difficulty: question.difficulty || 'medium',
      topic: question.topic || '',
      section: question.section || '',
      options: Array.isArray(question.options) ? question.options : [],
      markingScheme: Array.isArray(question.markingScheme) ? question.markingScheme : [],
      correctAnswer: question.correctAnswer || question.expectedAnswer || '',
      expectedAnswer: question.expectedAnswer || question.correctAnswer || '',
      explanation: question.explanation || '',
      subQuestions: Array.isArray(question.subQuestions) ? question.subQuestions : [],
      parts: Array.isArray(question.parts) ? question.parts : [],
      hasImage: question.hasImage || false,
      imageDescription: question.imageDescription || '',
      imageUrl: question.imageUrl || '',
      hasPassage: question.hasPassage || false,
      passageText: question.passageText || '',
      passageDescription: question.passageDescription || '',
      questionFormat: question.questionFormat || '',
    });
  }, [question]);

  /* escape key */
  useEffect(() => {
    const fn = (e) => { if (e.key === 'Escape') handleClose(); };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, []);

  const upd = (key, val) => setEq(p => ({ ...p, [key]: val }));

  const handleClose = () => {
    setMounted(false);
    setTimeout(onCancel, 250);
  };

  /* backdrop click */
  const onBackdrop = (e) => { if (e.target === backdropRef.current) handleClose(); };

  /* generate missing details */
  const generateMissingDetails = async () => {
    if (!eq.question.trim()) return;
    setIsGenerating(true); setGenErr(null);
    try {
      const res = await fetch(`${API}/groq/generate-details`, {
        method:'POST', headers:{ 'Content-Type':'application/json' },
        body: JSON.stringify({ question: eq.question, type: eq.type, topic: eq.topic, existingData: eq }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const result = await res.json();
      if (!result.success) throw new Error(result.error || 'Failed to generate details');
      const d = result.data;
      setEq(p => ({
        ...p,
        topic:          !p.topic                    && d.topic          ? d.topic          : p.topic,
        difficulty:     (!p.difficulty || p.difficulty === 'medium')    ? d.difficulty || p.difficulty : p.difficulty,
        expectedAnswer: !p.expectedAnswer           && d.expectedAnswer ? d.expectedAnswer : p.expectedAnswer,
        correctAnswer:  !p.correctAnswer            && d.correctAnswer  ? d.correctAnswer  : p.correctAnswer,
        explanation:    !p.explanation              && d.explanation    ? d.explanation    : p.explanation,
        questionFormat: !p.questionFormat           && d.questionFormat ? d.questionFormat : p.questionFormat,
        section:        !p.section                  && d.section        ? d.section        : p.section,
        marks:          (p.marks === 1 || !p.marks) && d.marks          ? d.marks          : p.marks,
        options:        p.type === 'multiple-choice' && p.options.length === 0 && d.options ? d.options : p.options,
        subQuestions:   (p.type === 'structured' || p.type === 'essay') && p.subQuestions.length === 0 && d.subQuestions ? d.subQuestions : p.subQuestions,
        markingScheme:  p.type === 'structured' && p.markingScheme.length === 0 && d.markingScheme ? d.markingScheme : p.markingScheme,
        parts:          p.type === 'essay' && p.parts.length === 0 && d.parts ? d.parts : p.parts,
      }));
    } catch (err) {
      setGenErr(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  /* generate image */
  const generateImage = async () => {
    if (!eq.imageDescription.trim()) return;
    setIsGenImg(true); setImgErr(null);
    try {
      const res = await fetch(`${API}/images/generate`, {
        method:'POST', headers:{ 'Content-Type':'application/json' },
        body: JSON.stringify({ description: eq.imageDescription, questionId: eq.id, subject: eq.topic }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const result = await res.json();
      if (!result.success || !result.data) throw new Error(result.error || 'Failed to generate image');
      upd('imageUrl', result.data.externalUrl);
      upd('hasImage', true);
    } catch (err) {
      setImgErr(err.message);
    } finally {
      setIsGenImg(false);
    }
  };

  /* save */
  const handleSave = () => {
    if (!eq.question.trim()) { alert('Question text is required'); return; }
    if (!eq.correctAnswer && !eq.expectedAnswer) {
      const fallback = eq.type === 'multiple-choice' && eq.options.length > 0
        ? eq.options[0] : 'Answer not specified';
      setEq(p => ({ ...p, correctAnswer: fallback, expectedAnswer: fallback }));
    }
    setIsSaving(true);
    onSave(eq);
    setIsSaving(false);
  };

  /* options */
  const handleOptionChange = (i, v) => { const o = [...eq.options]; o[i] = v; upd('options', o); };
  const addOption           = ()    => upd('options', [...eq.options, '']);
  const removeOption        = (i)   => upd('options', eq.options.filter((_,j) => j !== i));

  /* sub-questions */
  const addSubQ = () => upd('subQuestions', [...eq.subQuestions, { part:`${String.fromCharCode(97+eq.subQuestions.length)})`, question:'', marks:1, expectedAnswer:'' }]);
  const updSubQ = (i, field, val) => { const s=[...eq.subQuestions]; s[i]={...s[i],[field]:val}; upd('subQuestions',s); };
  const removeSubQ = (i) => {
    const filtered = eq.subQuestions.filter((_,j)=>j!==i).map((s,j)=>({...s,part:`${String.fromCharCode(97+j)})`}));
    upd('subQuestions', filtered);
  };

  /* marking scheme */
  const updMS       = (i,v)    => { const m=[...eq.markingScheme]; m[i]=typeof m[i]==='object'?{...m[i],step:v}:v; upd('markingScheme',m); };
  const updMSMarks  = (i,v)    => { const m=[...eq.markingScheme]; m[i]=typeof m[i]==='object'?{...m[i],marks:v}:{step:m[i],marks:v}; upd('markingScheme',m); };
  const addMSPoint  = ()       => upd('markingScheme', [...eq.markingScheme, typeof eq.markingScheme[0]==='object'?{step:'',marks:1}:'']);
  const removeMSPoint = (i)    => upd('markingScheme', eq.markingScheme.filter((_,j)=>j!==i));

  if (!eq) return null;

  /* add-row button */
  const AddBtn = ({ onClick, label }) => (
    <button type="button" onClick={onClick}
      style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'6px 12px', background:'transparent', border:'1px dashed #2A2D35', borderRadius:8, color:'#4A4D55', fontSize:12, cursor:'pointer', fontFamily:"'DM Sans',sans-serif", transition:'all .18s' }}
      onMouseEnter={e => { e.currentTarget.style.borderColor='#00FF7F40'; e.currentTarget.style.color='#00FF7F'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor='#2A2D35'; e.currentTarget.style.color='#4A4D55'; }}>
      <Plus size={11}/> {label}
    </button>
  );

  const RemoveBtn = ({ onClick }) => (
    <button type="button" onClick={onClick}
      style={{ width:28, height:28, display:'flex', alignItems:'center', justifyContent:'center', background:'none', border:'1px solid transparent', borderRadius:7, color:'#4A4D55', cursor:'pointer', transition:'all .18s', flexShrink:0 }}
      onMouseEnter={e => { e.currentTarget.style.background='#FF444415'; e.currentTarget.style.borderColor='#FF444430'; e.currentTarget.style.color='#FF6666'; }}
      onMouseLeave={e => { e.currentTarget.style.background='none'; e.currentTarget.style.borderColor='transparent'; e.currentTarget.style.color='#4A4D55'; }}>
      <Trash2 size={12}/>
    </button>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Syne:wght@700;800&family=Space+Mono&display=swap');
        * { box-sizing:border-box; }
        textarea { resize: vertical; }
        select option { background: #0D0F16; color: #E8E8E0; }
        input::placeholder, textarea::placeholder { color: #3A3D45; }
        input[type=checkbox] { accent-color: #00FF7F; width:15px; height:15px; cursor:pointer; }
        @keyframes eqBackdrop { from{opacity:0} to{opacity:1} }
        @keyframes eqSlide    { from{opacity:0;transform:translateY(24px) scale(.97)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes eqSpin     { to{transform:rotate(360deg)} }
        ::-webkit-scrollbar       { width:4px; }
        ::-webkit-scrollbar-track { background: #080A0F; }
        ::-webkit-scrollbar-thumb { background: #00FF7F30; border-radius:4px; }
      `}</style>

      {/* BACKDROP */}
      <div
        ref={backdropRef}
        onClick={onBackdrop}
        style={{
          position:'fixed', inset:0, background:'rgba(4,5,8,.85)',
          backdropFilter:'blur(6px)', zIndex:500, display:'flex',
          alignItems:'center', justifyContent:'center', padding:'16px',
          opacity: mounted ? 1 : 0,
          animation:'eqBackdrop .25s ease forwards',
        }}
      >
        {/* MODAL */}
        <div style={{
          width:'100%', maxWidth:780, maxHeight:'92vh', display:'flex', flexDirection:'column',
          background:'#0D0F16', border:'1px solid #2A2D35', borderRadius:20,
          boxShadow:'0 40px 120px rgba(0,0,0,.8), 0 0 0 1px #00FF7F08',
          animation:'eqSlide .28s cubic-bezier(.16,1,.3,1) forwards',
          overflow:'hidden',
        }}>

          {/* ── HEADER ── */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'18px 24px', borderBottom:'1px solid #1A1D25', flexShrink:0, background:'#080A0F' }}>
            <div>
              <div style={{ fontSize:10, fontFamily:"'Space Mono',monospace", textTransform:'uppercase', letterSpacing:'0.1em', color:'#00FF7F', marginBottom:3 }}>
                Question Editor
              </div>
              <h2 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:18, letterSpacing:'-0.02em', color:'#E8E8E0', lineHeight:1 }}>
                Edit Question
              </h2>
            </div>

            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              {/* generate button */}
              <button
                type="button"
                onClick={generateMissingDetails}
                disabled={isGenerating || !eq.question.trim()}
                style={{ display:'flex', alignItems:'center', gap:7, padding:'9px 18px', background: isGenerating || !eq.question.trim() ? '#1A1D25' : '#00FF7F', border:'none', borderRadius:100, color: isGenerating || !eq.question.trim() ? '#3A3D45' : '#080A0F', fontSize:12, fontWeight:700, cursor: isGenerating || !eq.question.trim() ? 'not-allowed' : 'pointer', fontFamily:"'DM Sans',sans-serif", transition:'all .2s' }}
                onMouseEnter={e => { if (!isGenerating && eq.question.trim()) e.currentTarget.style.background='#33FF99'; }}
                onMouseLeave={e => { if (!isGenerating && eq.question.trim()) e.currentTarget.style.background='#00FF7F'; }}
              >
                {isGenerating
                  ? <><div style={{ width:13, height:13, border:'2px solid #3A3D45', borderTopColor:'#9A9A90', borderRadius:'50%', animation:'eqSpin .8s linear infinite' }}/> Generating…</>
                  : <><Zap size={12}/> Generate Details</>
                }
              </button>

              {/* close */}
              <button
                type="button"
                onClick={handleClose}
                style={{ width:32, height:32, display:'flex', alignItems:'center', justifyContent:'center', background:'none', border:'1px solid #1A1D25', borderRadius:9, color:'#4A4D55', cursor:'pointer', transition:'all .18s' }}
                onMouseEnter={e => { e.currentTarget.style.background='#FF444415'; e.currentTarget.style.borderColor='#FF444430'; e.currentTarget.style.color='#FF6666'; }}
                onMouseLeave={e => { e.currentTarget.style.background='none'; e.currentTarget.style.borderColor='#1A1D25'; e.currentTarget.style.color='#4A4D55'; }}
              >
                <X size={14}/>
              </button>
            </div>
          </div>

          {/* ── SCROLL BODY ── */}
          <div style={{ flex:1, overflowY:'auto', padding:'20px 24px' }}>
            <ErrStrip msg={genErr}/>
            <ErrStrip msg={imgErr}/>

            {/* Question text */}
            <Field>
              <Label required>Question Text</Label>
              <Textarea value={eq.question} onChange={e => upd('question', e.target.value)} placeholder="Enter question text…" rows={3}/>
              {!eq.question.trim() && (
                <div style={{ fontSize:11, color:'#4A4D55', marginTop:6, fontFamily:"'Space Mono',monospace" }}>
                  💡 Type your question, then click Generate Details to auto-fill everything else.
                </div>
              )}
            </Field>

            {/* Topic + Section */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:18 }}>
              <div>
                <Label required>Topic</Label>
                <Input value={eq.topic} onChange={e => upd('topic', e.target.value)} placeholder="Topic (or generate)"/>
              </div>
              <div>
                <Label required>Section</Label>
                <Select value={eq.section} onChange={e => upd('section', e.target.value)}>
                  <option value="">Select section</option>
                  {['A','B','C','D'].map(s => <option key={s} value={s}>Section {s}</option>)}
                </Select>
              </div>
            </div>

            {/* Type / Marks / Difficulty / Format */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:18 }}>
              <div>
                <Label required>Type</Label>
                <Select value={eq.type} onChange={e => upd('type', e.target.value)}>
                  {QUESTION_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </Select>
              </div>
              <div>
                <Label required>Marks</Label>
                <Input type="number" min={1} max={50} value={eq.marks} onChange={e => upd('marks', parseInt(e.target.value)||1)}/>
              </div>
              <div>
                <Label required>Difficulty</Label>
                <Select value={eq.difficulty} onChange={e => upd('difficulty', e.target.value)}>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </Select>
              </div>
              <div>
                <Label>Format</Label>
                <Input value={eq.questionFormat} onChange={e => upd('questionFormat', e.target.value)} placeholder="e.g. define, state"/>
              </div>
            </div>

            {/* Passage */}
            <Section title="Passage / Reading Text" accent="#00C8FF">
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom: eq.hasPassage ? 14 : 0 }}>
                <input type="checkbox" id="hasPassage" checked={eq.hasPassage} onChange={e => upd('hasPassage', e.target.checked)}/>
                <label htmlFor="hasPassage" style={{ fontSize:13, color:'#9A9A90', cursor:'pointer' }}>Question has passage / reading text</label>
              </div>
              {eq.hasPassage && <>
                <Field>
                  <Label>Passage Text</Label>
                  <Textarea value={eq.passageText} onChange={e => upd('passageText', e.target.value)} placeholder="Enter passage…" rows={4}/>
                </Field>
                <Field style={{ marginBottom:0 }}>
                  <Label>Passage Description (optional)</Label>
                  <Input value={eq.passageDescription} onChange={e => upd('passageDescription', e.target.value)} placeholder="Brief description of passage"/>
                </Field>
              </>}
            </Section>

            {/* Image */}
            <Section title="Image / Diagram" accent="#9B6BFF">
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom: eq.hasImage ? 14 : 0, flexWrap:'wrap', gap:8 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <input type="checkbox" id="hasImage" checked={eq.hasImage} onChange={e => upd('hasImage', e.target.checked)}/>
                  <label htmlFor="hasImage" style={{ fontSize:13, color:'#9A9A90', cursor:'pointer' }}>Question has image / diagram</label>
                </div>
                {eq.hasImage && eq.imageDescription.trim() && (
                  <button
                    type="button" onClick={generateImage} disabled={isGenImg}
                    style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 14px', background: isGenImg ? '#1A1D25' : '#9B6BFF20', border:`1px solid ${isGenImg ? '#2A2D35' : '#9B6BFF40'}`, borderRadius:100, color: isGenImg ? '#4A4D55' : '#9B6BFF', fontSize:12, fontWeight:600, cursor: isGenImg ? 'not-allowed' : 'pointer', fontFamily:"'DM Sans',sans-serif", transition:'all .2s' }}
                  >
                    {isGenImg
                      ? <><div style={{ width:12, height:12, border:'2px solid #3A3D45', borderTopColor:'#9B6BFF', borderRadius:'50%', animation:'eqSpin .8s linear infinite' }}/> Generating…</>
                      : <><Image size={12}/> Generate Image</>
                    }
                  </button>
                )}
              </div>
              {eq.hasImage && <>
                <Field>
                  <Label required>Image Description</Label>
                  <Textarea value={eq.imageDescription} onChange={e => upd('imageDescription', e.target.value)} placeholder="Describe the diagram (e.g. cross-section of a plant cell…)" rows={2}/>
                  <div style={{ fontSize:11, color:'#4A4D55', marginTop:5, fontFamily:"'Space Mono',monospace" }}>
                    💡 Describe the educational diagram, then click Generate Image.
                  </div>
                </Field>
                {eq.imageUrl && (
                  <div style={{ border:'1px solid #1A1D25', borderRadius:10, overflow:'hidden' }}>
                    <img src={`${API.replace('/api','')}${eq.imageUrl}`} alt="Question diagram" style={{ maxWidth:'100%', display:'block' }}
                      onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='block'; }}/>
                    <div style={{ display:'none', padding:'10px', fontSize:12, color:'#FF8888' }}>Failed to load image</div>
                  </div>
                )}
              </>}
            </Section>

            {/* Multiple Choice Options */}
            {eq.type === 'multiple-choice' && (
              <Section title="Answer Options" accent="#00FF7F">
                <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:12 }}>
                  {eq.options.map((opt, i) => (
                    <div key={i} style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <span style={{ width:28, height:28, borderRadius:7, background:'#1A1D25', border:'1px solid #2A2D35', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontFamily:"'Space Mono',monospace", color:'#5A5D65', flexShrink:0 }}>
                        {String.fromCharCode(65+i)}
                      </span>
                      <div style={{ flex:1 }}>
                        <Input value={opt} onChange={e => handleOptionChange(i, e.target.value)} placeholder={`Option ${String.fromCharCode(65+i)}`}/>
                      </div>
                      <RemoveBtn onClick={() => removeOption(i)}/>
                    </div>
                  ))}
                </div>
                {eq.options.length === 0 && (
                  <p style={{ fontSize:12, color:'#4A4D55', marginBottom:10 }}>No options yet. Use Generate Details or add manually.</p>
                )}
                <AddBtn onClick={addOption} label="Add Option"/>
              </Section>
            )}

            {/* Sub-questions */}
            {(eq.type === 'structured' || eq.type === 'essay') && (
              <Section title={eq.type === 'structured' ? 'Sub-questions' : 'Parts'} accent="#FF9B3B">
                <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:12 }}>
                  {eq.subQuestions.map((subQ, i) => (
                    <div key={i} style={{ background:'#080A0F', border:'1px solid #1A1D25', borderRadius:10, padding:'12px 14px' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
                        <span style={{ fontSize:11, fontFamily:"'Space Mono',monospace", color:'#FF9B3B', background:'#FF9B3B15', border:'1px solid #FF9B3B25', borderRadius:6, padding:'2px 8px' }}>{subQ.part}</span>
                        <div style={{ width:70 }}>
                          <Input type="number" min={1} max={20} value={subQ.marks} onChange={e => updSubQ(i,'marks',parseInt(e.target.value)||1)} placeholder="Marks"/>
                        </div>
                        <div style={{ marginLeft:'auto' }}><RemoveBtn onClick={() => removeSubQ(i)}/></div>
                      </div>
                      <div style={{ marginBottom:8 }}>
                        <Textarea value={subQ.question} onChange={e => updSubQ(i,'question',e.target.value)} placeholder="Sub-question text…" rows={2}/>
                      </div>
                      <Input value={subQ.expectedAnswer||''} onChange={e => updSubQ(i,'expectedAnswer',e.target.value)} placeholder="Expected answer…"/>
                    </div>
                  ))}
                </div>
                {eq.subQuestions.length === 0 && (
                  <p style={{ fontSize:12, color:'#4A4D55', marginBottom:10 }}>No sub-questions yet. Use Generate Details or add manually.</p>
                )}
                <AddBtn onClick={addSubQ} label={`Add ${eq.type === 'structured' ? 'Sub-question' : 'Part'}`}/>
              </Section>
            )}

            {/* Marking Scheme */}
            {eq.type === 'structured' && (
              <Section title="Marking Scheme" accent="#00C8FF">
                <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:12 }}>
                  {eq.markingScheme.map((item, i) => (
                    <div key={i} style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <div style={{ flex:1 }}>
                        <Input value={typeof item==='string'?item:item.step||''} onChange={e => updMS(i,e.target.value)} placeholder={`Marking point ${i+1}`}/>
                      </div>
                      {typeof item === 'object' && item.marks !== undefined && (
                        <div style={{ width:70 }}>
                          <Input type="number" value={item.marks} onChange={e => updMSMarks(i,parseInt(e.target.value)||0)} placeholder="Marks"/>
                        </div>
                      )}
                      <RemoveBtn onClick={() => removeMSPoint(i)}/>
                    </div>
                  ))}
                </div>
                {eq.markingScheme.length === 0 && (
                  <p style={{ fontSize:12, color:'#4A4D55', marginBottom:10 }}>No marking points yet. Use Generate Details or add manually.</p>
                )}
                <AddBtn onClick={addMSPoint} label="Add Point"/>
              </Section>
            )}

            {/* Correct / Expected Answer */}
            <Field>
              <Label required>{eq.type === 'multiple-choice' ? 'Correct Answer' : 'Expected Answer'}</Label>
              {eq.type === 'multiple-choice' ? (
                <Select value={eq.correctAnswer} onChange={e => { upd('correctAnswer',e.target.value); upd('expectedAnswer',e.target.value); }}>
                  <option value="">Select correct answer</option>
                  {eq.options.map((opt,i) => <option key={i} value={opt}>{String.fromCharCode(65+i)}: {opt}</option>)}
                </Select>
              ) : (
                <Textarea value={eq.correctAnswer||eq.expectedAnswer} onChange={e => { upd('correctAnswer',e.target.value); upd('expectedAnswer',e.target.value); }} placeholder="Expected answer or marking guide…" rows={3}/>
              )}
            </Field>

            {/* Explanation */}
            <Field style={{ marginBottom:0 }}>
              <Label>Explanation (optional)</Label>
              <Textarea value={eq.explanation} onChange={e => upd('explanation',e.target.value)} placeholder="Additional explanation or teaching notes…" rows={2}/>
            </Field>
          </div>

          {/* ── FOOTER ── */}
          <div style={{ display:'flex', justifyContent:'flex-end', gap:10, padding:'16px 24px', borderTop:'1px solid #1A1D25', background:'#080A0F', flexShrink:0 }}>
            <button
              type="button" onClick={handleClose}
              style={{ padding:'10px 22px', background:'transparent', border:'1px solid #1A1D25', borderRadius:100, color:'#6A6A62', fontSize:13, cursor:'pointer', fontFamily:"'DM Sans',sans-serif", transition:'all .2s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor='#2A2D35'; e.currentTarget.style.color='#E8E8E0'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor='#1A1D25'; e.currentTarget.style.color='#6A6A62'; }}
            >
              Cancel
            </button>
            <button
              type="button" onClick={handleSave} disabled={isSaving}
              style={{ display:'flex', alignItems:'center', gap:7, padding:'10px 26px', background: isSaving ? '#1A1D25' : '#00FF7F', border:'none', borderRadius:100, color: isSaving ? '#3A3D45' : '#080A0F', fontSize:13, fontWeight:700, cursor: isSaving ? 'not-allowed' : 'pointer', fontFamily:"'DM Sans',sans-serif", transition:'all .2s', boxShadow: isSaving ? 'none' : '0 4px 20px #00FF7F20' }}
              onMouseEnter={e => { if (!isSaving) e.currentTarget.style.background='#33FF99'; }}
              onMouseLeave={e => { if (!isSaving) e.currentTarget.style.background='#00FF7F'; }}
            >
              {isSaving
                ? <><div style={{ width:13, height:13, border:'2px solid #3A3D45', borderTopColor:'#9A9A90', borderRadius:'50%', animation:'eqSpin .8s linear infinite' }}/> Saving…</>
                : 'Save Changes'
              }
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditQuestionModal;