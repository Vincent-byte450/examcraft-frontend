import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  Edit3, Trash2, ArrowLeft, Sparkles, Loader2,
  FileText, Clock, Target, BookOpen, AlertTriangle, BarChart3,
} from "lucide-react";
import { useGlobals } from "./Globals";
import EditQuestionModal from "./EditQuestionModal";
import useExamAPI from "./../hooks/useExamAPI";
import AdBanner from "./AdBanner";

/* ─── accents ────────────────────────────────────────────── */
const DIFF  = { easy:'#00FF7F', medium:'#FF9B3B', hard:'#FF4444' };
const QTYPE = { 'multiple-choice':'#00C8FF','short-answer':'#9B6BFF',structured:'#FF9B3B',essay:'#FF9B3B' };

const Pill = ({ label, color }) => (
  <span style={{ fontSize:10, fontFamily:"'Space Mono',monospace", textTransform:'uppercase', letterSpacing:'0.06em', padding:'3px 9px', background:`${color}15`, border:`1px solid ${color}28`, borderRadius:100, color, whiteSpace:'nowrap' }}>
    {label}
  </span>
);

const ActionBtn = ({ onClick, title, accent, children }) => (
  <button onClick={onClick} title={title}
    style={{ width:32, height:32, display:'flex', alignItems:'center', justifyContent:'center', background:'none', border:'1px solid transparent', borderRadius:8, color:'#4A4D55', cursor:'pointer', transition:'all .18s', flexShrink:0 }}
    onMouseEnter={e=>{ e.currentTarget.style.background=`${accent}15`; e.currentTarget.style.borderColor=`${accent}30`; e.currentTarget.style.color=accent; }}
    onMouseLeave={e=>{ e.currentTarget.style.background='none'; e.currentTarget.style.borderColor='transparent'; e.currentTarget.style.color='#4A4D55'; }}>
    {children}
  </button>
);

const STAT_CONFIG = [
  { label:'Subject',     icon:BookOpen, accent:'#00C8FF', get:(e)=>e.subject },
  { label:'Questions',   icon:FileText, accent:'#00FF7F', get:(e)=>e.questions?.length ?? 0 },
  { label:'Total Marks', icon:Target,   accent:'#9B6BFF', get:(e)=>e.totalMarks||'N/A' },
  { label:'Duration',    icon:Clock,    accent:'#FF9B3B', get:(e)=>e.duration?`${e.duration} min`:'N/A' },
];

/* ─── Fixed-position modal portal ───────────────────────────
 *  Uses createPortal → document.body so the modal always sits
 *  centred on the *viewport*, independent of scroll position.
 *  Clicking edit on question 1 no longer requires scrolling
 *  to the bottom of the page.
 * ────────────────────────────────────────────────────────── */
const ModalPortal = ({ question, onSave, onCancel }) => {
  /* lock page scroll while modal is open */
  useEffect(() => {
    const orig = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = orig; };
  }, []);

  /* Escape key closes */
  useEffect(() => {
    const fn = (e) => { if (e.key === 'Escape') onCancel(); };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [onCancel]);

  return createPortal(
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
      style={{
        position:'fixed', inset:0, zIndex:9999,
        background:'rgba(4,5,8,.84)',
        backdropFilter:'blur(5px)',
        display:'flex', alignItems:'center', justifyContent:'center',
        padding:'20px',
        animation:'reBackdrop .22s ease forwards',
      }}
    >
      {/* scroll wrapper — caps the modal at viewport height with internal scroll */}
      <div style={{
        width:'100%', maxWidth:760,
        maxHeight:'calc(100vh - 40px)',
        overflowY:'auto',
        borderRadius:16,
        scrollbarWidth:'thin',
        scrollbarColor:'#00FF7F30 #080A0F',
      }}>
        <EditQuestionModal
          question={question}
          onSave={onSave}
          onCancel={onCancel}
        />
      </div>
    </div>,
    document.body
  );
};

/* ═══════════════════════════════════════════════════════════ */
const ReviewExam = () => {
  const { setCurrentView, currentExam, updateExam, apiRequest, showNotification } = useGlobals();
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [examData, setExamData]               = useState(null);
  const [isBatching, setIsBatching]           = useState(false);
  const [batchProgress, setBatchProgress]     = useState({ current:0, total:0, status:'' });
  const { downloadExam } = useExamAPI();

  useEffect(() => { if (currentExam) setExamData(currentExam); }, [currentExam]);

  /* stable callbacks so ModalPortal doesn't re-render on every keystroke */
  const handleSave = useCallback(async (updated) => {
    const qs = examData.questions.map(q => q._id === updated._id ? updated : q);
    const updatedExam = { ...examData, questions: qs };
    setExamData(updatedExam);
    await updateExam(examData.id, updatedExam);
    setEditingQuestion(null);
    showNotification('Question updated', 'success');
  }, [examData, updateExam, showNotification]);

  const handleCancel = useCallback(() => setEditingQuestion(null), []);

  if (!examData) return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Syne:wght@700;800&family=Space+Mono&display=swap');`}</style>
      <div style={{ maxWidth:900, margin:'0 auto', fontFamily:"'DM Sans',sans-serif" }}>
        <div style={{ background:'#0D0F16', border:'1px solid #1A1D25', borderRadius:16, padding:'64px 32px', textAlign:'center' }}>
          <div style={{ width:64, height:64, borderRadius:'50%', background:'#1A1D25', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 18px' }}>
            <FileText size={28} color="#3A3D45"/>
          </div>
          <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:22, color:'#E8E8E0', marginBottom:8 }}>No Exam Selected</div>
          <p style={{ fontSize:13, color:'#5A5D65', marginBottom:24 }}>Select an exam from your exams list to review</p>
          <button onClick={() => setCurrentView('my-exams')}
            style={{ padding:'11px 28px', background:'#00FF7F', border:'none', borderRadius:100, color:'#080A0F', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:"'DM Sans',sans-serif" }}>
            Go to My Exams
          </button>
        </div>
      </div>
    </>
  );

  const removeQuestion = (id) => {
    if (!confirm('Remove this question?')) return;
    const qs = examData.questionsData.filter(q => q._id !== id);
    const updated = { ...examData, questionsData:qs, totalMarks:qs.reduce((s,q) => s+(q.marks||0), 0) };
    setExamData(updated);
    updateExam(examData.id, updated);
    showNotification('Question removed', 'success');
  };

  const handleBatchGenerate = async () => {
    if (!examData.questionsData?.length) { showNotification('No questions to process', 'warning'); return; }
    const total = examData.questionsData.length;
    setBatchProgress({ current:0, total, status:'Starting batch generation…' });
    setIsBatching(true);
    try {
      showNotification('Enhancing exam questions with AI…', 'info');
      const enhanced = [];
      for (let i=0; i<total; i++) {
        const q = examData.questionsData[i];
        setBatchProgress({ current:i+1, total, status:`Processing question ${i+1} of ${total}…` });
        try {
          const res = await apiRequest('/api/groq/generate-details', { method:'POST', body:JSON.stringify({ question:q.question, type:q.type, topic:q.topic, existingData:q }) });
          const merged = res.success && res.data ? { ...q, ...res.data } : q;
          if (!merged.question?.trim()) merged.question = q.question || '(Untitled Question)';
          if (Array.isArray(merged.subQuestions)) merged.subQuestions = merged.subQuestions.filter(s => s?.question?.trim());
          if (Array.isArray(merged.parts))        merged.parts        = merged.parts.filter(p => p?.question?.trim());
          enhanced.push(merged);
        } catch { enhanced.push(q); }
        await new Promise(r => setTimeout(r, 300));
      }
      const clean = enhanced.filter(q => q?.question?.trim());
      setBatchProgress({ current:total, total, status:'Finalizing…' });
      const updatedExam = { ...examData, questionsData:clean, updatedAt:new Date() };
      setExamData(updatedExam);
      const save = await updateExam(examData.id, updatedExam);
      showNotification(save.success ? 'Exam enhanced and saved' : 'Enhanced locally, save failed', save.success ? 'success' : 'warning');
    } catch(err) { showNotification(`Batch failed: ${err.message}`, 'error'); }
    finally { setIsBatching(false); setBatchProgress({ current:0, total:0, status:'' }); }
  };

  const pct = batchProgress.total ? Math.round((batchProgress.current / batchProgress.total) * 100) : 0;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Syne:wght@700;800&family=Space+Mono&display=swap');
        *,*::before,*::after { box-sizing:border-box; }
        @keyframes reUp      { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes reSpin    { to { transform:rotate(360deg); } }
        @keyframes reSlide   { from{opacity:0;transform:translateX(20px)} to{opacity:1;transform:translateX(0)} }
        @keyframes reBackdrop{ from{opacity:0} to{opacity:1} }
      `}</style>

      <div style={{ maxWidth:1100, margin:'0 auto', fontFamily:"'DM Sans','Helvetica Neue',sans-serif", color:'#E8E8E0', animation:'reUp .4s ease forwards', position:'relative', paddingBottom:40 }}>

        {/* batch progress float */}
        {isBatching && (
          <div style={{ position:'fixed', top:24, right:24, width:296, background:'#0D0F16', border:'1px solid #9B6BFF40', borderRadius:16, padding:'18px 20px', boxShadow:'0 20px 60px rgba(0,0,0,.7)', zIndex:998, animation:'reSlide .3s ease forwards' }}>
            <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:12 }}>
              <div style={{ width:36, height:36, borderRadius:10, background:'#9B6BFF20', border:'1px solid #9B6BFF30', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <Loader2 size={16} color="#9B6BFF" style={{ animation:'reSpin .8s linear infinite' }}/>
              </div>
              <div>
                <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:13, color:'#E8E8E0' }}>AI Enhancement</div>
                <div style={{ fontSize:10, fontFamily:"'Space Mono',monospace", color:'#9B6BFF', textTransform:'uppercase', letterSpacing:'0.07em' }}>In Progress</div>
              </div>
            </div>
            <p style={{ fontSize:12, color:'#6A6A62', marginBottom:10, lineHeight:1.5 }}>{batchProgress.status}</p>
            <div style={{ height:4, background:'#1A1D25', borderRadius:4, overflow:'hidden', marginBottom:6 }}>
              <div style={{ height:'100%', width:`${pct}%`, background:'linear-gradient(90deg,#9B6BFF,#FF9B3B)', borderRadius:4, transition:'width .3s ease' }}/>
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:10, fontFamily:"'Space Mono',monospace", color:'#4A4D55' }}>
              <span>{pct}%</span><span>{batchProgress.current} / {batchProgress.total}</span>
            </div>
          </div>
        )}

        {/* header */}
        <div style={{ position:'relative', background:'#0D0F16', border:'1px solid #1A1D25', borderRadius:16, padding:'28px 32px', marginBottom:16, overflow:'hidden' }}>
          <div style={{ position:'absolute', inset:0, backgroundImage:'radial-gradient(circle,#1A1D25 1px,transparent 1px)', backgroundSize:'28px 28px', opacity:.5, pointerEvents:'none' }}/>
          <div style={{ position:'absolute', top:-60, right:-60, width:220, height:220, borderRadius:'50%', background:'radial-gradient(circle,#00FF7F08 0%,transparent 70%)', pointerEvents:'none' }}/>
          <div style={{ position:'relative', display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexWrap:'wrap', gap:16 }}>
            <div>
              <div style={{ fontSize:10, fontFamily:"'Space Mono',monospace", textTransform:'uppercase', letterSpacing:'0.12em', color:'#00FF7F', marginBottom:8 }}>Review Exam</div>
              <h1 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:'clamp(20px,3vw,28px)', letterSpacing:'-0.03em', color:'#E8E8E0', marginBottom:6, lineHeight:1.05 }}>
                {examData.title}
              </h1>
              <div style={{ fontSize:13, color:'#6A6A62' }}>
                {examData.subject}{examData.curriculum && ` · ${examData.curriculum}`}{examData.classLevel && ` · ${examData.classLevel}`}
              </div>
            </div>
            <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
              <button onClick={() => setCurrentView('my-exams')}
                style={{ display:'flex', alignItems:'center', gap:7, padding:'10px 18px', background:'transparent', border:'1px solid #1A1D25', borderRadius:100, color:'#6A6A62', fontSize:13, cursor:'pointer', fontFamily:"'DM Sans',sans-serif", transition:'all .2s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor='#2A2D35'; e.currentTarget.style.color='#E8E8E0'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor='#1A1D25'; e.currentTarget.style.color='#6A6A62'; }}>
                <ArrowLeft size={13}/> Back
              </button>
              {/* <button onClick={handleBatchGenerate} disabled={isBatching}
                style={{ display:'flex', alignItems:'center', gap:7, padding:'10px 20px', background:isBatching?'#1A1D25':'#9B6BFF20', border:`1px solid ${isBatching?'#1A1D25':'#9B6BFF40'}`, borderRadius:100, color:isBatching?'#3A3D45':'#9B6BFF', fontSize:13, fontWeight:600, cursor:isBatching?'not-allowed':'pointer', fontFamily:"'DM Sans',sans-serif", transition:'all .2s' }}
                onMouseEnter={e => { if(!isBatching){ e.currentTarget.style.background='#9B6BFF30'; e.currentTarget.style.borderColor='#9B6BFF60'; }}}
                onMouseLeave={e => { if(!isBatching){ e.currentTarget.style.background='#9B6BFF20'; e.currentTarget.style.borderColor='#9B6BFF40'; }}}>
                {isBatching
                  ? <><Loader2 size={13} style={{ animation:'reSpin .8s linear infinite' }}/> Enhancing…</>
                  : <><Sparkles size={13}/> Enhance All</>
                }
              </button> */}
            </div>
          </div>
        </div>

        {/* stat cards */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:12, marginBottom:16 }}>
          {STAT_CONFIG.map(({ label, icon:Icon, accent, get }) => (
            <div key={label}
              style={{ background:'#0D0F16', border:'1px solid #1A1D25', borderRadius:12, padding:'16px 18px', position:'relative', overflow:'hidden', transition:'all .2s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor=`${accent}40`; e.currentTarget.style.boxShadow=`0 0 24px ${accent}08`; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor='#1A1D25'; e.currentTarget.style.boxShadow='none'; }}>
              <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:`linear-gradient(90deg,${accent}70,transparent)` }}/>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <div style={{ width:32, height:32, borderRadius:8, background:`${accent}15`, border:`1px solid ${accent}25`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <Icon size={14} color={accent}/>
                </div>
                <div>
                  <div style={{ fontSize:10, fontFamily:"'Space Mono',monospace", textTransform:'uppercase', letterSpacing:'0.08em', color:'#4A4D55', marginBottom:2 }}>{label}</div>
                  <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:16, color:'#E8E8E0' }}>{get(examData)}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <AdBanner/>

        {/* questions list */}
        {examData.questionsData?.length > 0 ? (
          <div style={{ background:'#0D0F16', border:'1px solid #1A1D25', borderRadius:14, overflow:'hidden', marginTop:16 }}>
            <div style={{ padding:'16px 24px', borderBottom:'1px solid #1A1D25', display:'flex', alignItems:'center', gap:12 }}>
              <div style={{ width:34, height:34, borderRadius:9, background:'#00FF7F15', border:'1px solid #00FF7F25', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <BarChart3 size={15} color="#00FF7F"/>
              </div>
              <div>
                <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:15, color:'#E8E8E0' }}>Exam Questions</div>
                <div style={{ fontSize:11, fontFamily:"'Space Mono',monospace", color:'#4A4D55' }}>{examData.questionsData.length} questions · review and edit as needed</div>
              </div>
            </div>

            {examData.questionsData.map((q, i) => (
              <div key={q._id || i}
                style={{ padding:'18px 24px', borderBottom:'1px solid #1A1D25', transition:'background .2s' }}
                onMouseEnter={e => e.currentTarget.style.background='#0A0C11'}
                onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                <div style={{ display:'flex', alignItems:'flex-start', gap:16 }}>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:10 }}>
                      <span style={{ fontSize:11, fontFamily:"'Space Mono',monospace", padding:'3px 10px', background:'#00FF7F20', border:'1px solid #00FF7F35', borderRadius:100, color:'#00FF7F', fontWeight:700 }}>Q{i+1}</span>
                      {q.type       && <Pill label={q.type.replace(/-/g,' ')} color={QTYPE[q.type]||'#6A6A62'}/>}
                      {q.marks      && <Pill label={`${q.marks} mark${q.marks!==1?'s':''}`} color="#00FF7F"/>}
                      {q.difficulty && <Pill label={q.difficulty} color={DIFF[q.difficulty]||'#6A6A62'}/>}
                      {q.topic      && <Pill label={q.topic} color="#5A5D65"/>}
                    </div>
                    <p style={{ fontSize:13, color:'#C8C8C0', lineHeight:1.75, marginBottom:10, whiteSpace:'pre-wrap', fontWeight:500 }}>{q.question}</p>
                    {q.options?.length > 0 && (
                      <div style={{ paddingLeft:14, display:'flex', flexDirection:'column', gap:4, marginBottom:10 }}>
                        {q.options.map((opt,oi) => <div key={oi} style={{ fontSize:12, color:'#6A6A62' }}>{String.fromCharCode(65+oi)}. {opt}</div>)}
                      </div>
                    )}
                    {q.subQuestions?.length > 0 && (
                      <div style={{ display:'flex', flexDirection:'column', gap:6, marginBottom:10 }}>
                        {q.subQuestions.map((sq,si) => (
                          <div key={si} style={{ background:'#080A0F', border:'1px solid #1A1D25', borderRadius:8, padding:'9px 12px' }}>
                            <span style={{ fontSize:11, fontFamily:"'Space Mono',monospace", color:'#FF9B3B', marginRight:8 }}>{sq.part}</span>
                            <span style={{ fontSize:12, color:'#9A9A90' }}>{sq.question}</span>
                            {sq.marks && <span style={{ fontSize:10, color:'#4A4D55', marginLeft:8 }}>({sq.marks} marks)</span>}
                          </div>
                        ))}
                      </div>
                    )}
                    {q.correctAnswer && (
                      <div style={{ background:'#00FF7F08', border:'1px solid #00FF7F25', borderRadius:8, padding:'8px 12px', marginBottom:6 }}>
                        <span style={{ fontSize:11, fontFamily:"'Space Mono',monospace", color:'#00FF7F', marginRight:8 }}>ANSWER</span>
                        <span style={{ fontSize:12, color:'#A0E8C0' }}>{q.correctAnswer}</span>
                      </div>
                    )}
                    {q.explanation && (
                      <div style={{ background:'#00C8FF08', border:'1px solid #00C8FF20', borderRadius:8, padding:'8px 12px' }}>
                        <span style={{ fontSize:11, fontFamily:"'Space Mono',monospace", color:'#00C8FF', marginRight:8 }}>EXPLANATION</span>
                        <span style={{ fontSize:12, color:'#9A9A90' }}>{q.explanation}</span>
                      </div>
                    )}
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', gap:4, flexShrink:0 }}>
                    <ActionBtn onClick={() => setEditingQuestion(q)} title="Edit" accent="#00C8FF"><Edit3 size={13}/></ActionBtn>
                    <ActionBtn onClick={() => removeQuestion(q._id)} title="Remove" accent="#FF4444"><Trash2 size={13}/></ActionBtn>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ background:'#0D0F16', border:'1px solid #1A1D25', borderRadius:14, padding:'56px 32px', textAlign:'center', marginTop:16 }}>
            <div style={{ width:56, height:56, borderRadius:'50%', background:'#1A1D25', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px' }}>
              <AlertTriangle size={24} color="#3A3D45"/>
            </div>
            <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:17, color:'#E8E8E0', marginBottom:6 }}>No Questions Available</div>
            <p style={{ fontSize:13, color:'#5A5D65' }}>This exam doesn't have any questions yet</p>
          </div>
        )}
      </div>

      {/* ── Portal modal: renders into document.body, always viewport-centred ── */}
      {editingQuestion && (
        <ModalPortal
          question={editingQuestion}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}
    </>
  );
};

export default ReviewExam;