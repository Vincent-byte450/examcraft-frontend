import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X, FileText, Eye, Edit3, Save, ChevronRight } from "lucide-react";
import { useGlobals } from "./../Globals";
import ExamSetupPanel from "./ExamSetupPanel";
import ExamEditorModal from "./ExamEditorModal";
import ExamPreview from "./ExamPreview";
import AdBanner from "./../AdBanner";

const TABS = [
  { key:"overview",  label:"Setup",     icon:Edit3   },
  { key:"questions", label:"Questions", icon:FileText },
  { key:"preview",   label:"Preview",   icon:Eye     },
];

const ExamDownloadModal = ({ open, onClose, exam }) => {
  const { updateExam, showNotification } = useGlobals();
  const [tab,      setTab]      = useState("overview");
  const [data,     setData]     = useState(() => ({ ...exam }));
  const [isSaving, setIsSaving] = useState(false);
  const [visible,  setVisible]  = useState(false);
  const backdropRef = useRef(null);

  // data sanitization helper
  const buildSections = (questions = []) => {
    const sectionMeta = {
      A: { title: 'SECTION A', instructions: 'Answer ALL questions in this section' },
      B: { title: 'SECTION B', instructions: 'Answer ALL questions in this section' },
      C: { title: 'SECTION C', instructions: 'Answer ALL questions in this section' },
      D: { title: 'SECTION D', instructions: 'Answer ALL questions in this section' },
    };

    const sectionMap = {};
    questions.forEach(q => {
      if (!q?.section) return;
      const key = `section${q.section}`;
      if (!sectionMap[key]) sectionMap[key] = { questions: 0, marks: 0 };
      sectionMap[key].questions += 1;
      sectionMap[key].marks += q.marks || 0;
    });

    // Only build entries that actually have questions — no nulls, no empty sections
    return Object.fromEntries(
      Object.entries(sectionMap)
        .filter(([, val]) => val.questions > 0)
        .map(([key, val]) => {
          const letter = key.replace('section', '');
          const meta = sectionMeta[letter] || { title: `SECTION ${letter}`, instructions: '' };
          return [key, {
            title:        `${meta.title} (${val.marks} MARKS)`,
            instructions: meta.instructions,
            questions:    val.questions,
            marks:        val.marks,
          }];
        })
    );
  };

  // Replace the existing: useEffect(() => { if (exam) setData({ ...exam }); }, [exam]);
  useEffect(() => {
    if (!exam) return;
    const patched = { ...exam };
    patched.questions = patched.questionsData || [];
    if (!patched.sections && Array.isArray(patched.questionsData) && patched.questionsData.length > 0) {
      patched.questions = patched.questionsData || [];
      patched.sections = buildSections(patched.questionsData);
    }
    patched.sections = Object.fromEntries(Object.entries(patched.sections).filter(([, v]) => v !== null));
    setData(patched);
  }, [exam]);

  /* animate in/out */
  useEffect(() => {
    if (open) {
      const t = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(t);
    } else {
      setVisible(false);
    }
  }, [open]);

  /* body scroll lock */
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  /* Escape key */
  useEffect(() => {
    if (!open) return;
    const fn = (e) => { if (e.key === 'Escape') handleClose(); };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [open]);

  if (!open) return null;

  const handleUpdate = (field, value) => setData(p => ({ ...p, [field]: value }));

  const sanitize = (d) => {
    const c = { ...d };
    if (Array.isArray(c.questions)) {
      c.questions = c.questions
        .filter(q => q?.question?.trim())
        .map(q => ({
          ...q,
          question:       q.question.trim(),
          expectedAnswer: q.expectedAnswer || '',
          marks:          q.marks          || 1,
          type:           q.type           || 'short-answer',
        }));
    }
    Object.keys(c).forEach(k => {
      if (c[k] === undefined || c[k] === null || c[k] === '') delete c[k];
    });
    return c;
  };

  const handleSave = async () => {
    if (!data._id) return showNotification("No exam selected.", "warning");
    setIsSaving(true);
    const res = await updateExam(data._id, sanitize(data));
    showNotification(
      res.success ? "Exam saved successfully" : "Failed to save exam",
      res.success ? "success" : "error"
    );
    setIsSaving(false);
  };

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 220);
  };

  

  return createPortal(
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Syne:wght@700;800&family=Space+Mono&display=swap');
        @keyframes edmSlide { from{opacity:0;transform:translateY(22px) scale(.97)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes edmSpin  { to{transform:rotate(360deg)} }
        .edm-scroll::-webkit-scrollbar        { width:4px; }
        .edm-scroll::-webkit-scrollbar-track  { background:#080A0F; }
        .edm-scroll::-webkit-scrollbar-thumb  { background:#00FF7F30; border-radius:4px; }
        *, *::before, *::after { box-sizing:border-box; }
      `}</style>

      {/* backdrop */}
      <div
        ref={backdropRef}
        onClick={e => { if (e.target === backdropRef.current) handleClose(); }}
        style={{
          position:       'fixed',
          inset:          0,
          zIndex:         9999,
          background:     'rgba(4,5,8,.88)',
          backdropFilter: 'blur(6px)',
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          padding:        20,
          opacity:        visible ? 1 : 0,
          transition:     'opacity .22s ease',
          pointerEvents:  visible ? 'auto' : 'none',
        }}
      >
        {/* modal card */}
        <div style={{
          width:         '100%',
          maxWidth:      1080,
          height:        '90vh',
          display:       'flex',
          flexDirection: 'column',
          background:    '#0D0F16',
          border:        '1px solid #2A2D35',
          borderRadius:  20,
          boxShadow:     '0 40px 120px rgba(0,0,0,.85), 0 0 0 1px #00FF7F08',
          overflow:      'hidden',
          fontFamily:    "'DM Sans','Helvetica Neue',sans-serif",
          color:         '#E8E8E0',
          animation:     visible ? 'edmSlide .28s cubic-bezier(.16,1,.3,1) forwards' : 'none',
        }}>

          {/* header */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 26px', borderBottom:'1px solid #1A1D25', background:'#080A0F', flexShrink:0 }}>
            <div>
              <div style={{ fontSize:10, fontFamily:"'Space Mono',monospace", textTransform:'uppercase', letterSpacing:'0.1em', color:'#00FF7F', marginBottom:3 }}>Exam Manager</div>
              <h2 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:18, letterSpacing:'-0.02em', color:'#E8E8E0', lineHeight:1 }}>
                {data.title || 'Exam Editor & Downloader'}
              </h2>
            </div>
            <button onClick={handleClose}
              style={{ width:32, height:32, display:'flex', alignItems:'center', justifyContent:'center', background:'none', border:'1px solid #1A1D25', borderRadius:9, color:'#4A4D55', cursor:'pointer', transition:'all .18s' }}
              onMouseEnter={e=>{ e.currentTarget.style.background='#FF444415'; e.currentTarget.style.borderColor='#FF444430'; e.currentTarget.style.color='#FF6666'; }}
              onMouseLeave={e=>{ e.currentTarget.style.background='none'; e.currentTarget.style.borderColor='#1A1D25'; e.currentTarget.style.color='#4A4D55'; }}>
              <X size={14}/>
            </button>
          </div>

          {/* tab bar */}
          <div style={{ display:'flex', borderBottom:'1px solid #1A1D25', background:'#080A0F', flexShrink:0 }}>
            {TABS.map(({ key, label, icon:Icon }) => {
              const active = tab === key;
              return (
                <button key={key} onClick={() => setTab(key)}
                  style={{ display:'flex', alignItems:'center', gap:7, padding:'12px 24px', background:'none', border:'none', borderBottom:`2px solid ${active?'#00FF7F':'transparent'}`, color:active?'#00FF7F':'#4A4D55', fontSize:13, fontWeight:active?600:400, cursor:'pointer', fontFamily:"'DM Sans',sans-serif", transition:'all .18s', marginBottom:-1 }}
                  onMouseEnter={e=>{ if(!active) e.currentTarget.style.color='#9A9A90'; }}
                  onMouseLeave={e=>{ if(!active) e.currentTarget.style.color='#4A4D55'; }}>
                  <Icon size={13}/> {label}
                  {active && key==='preview' && <ChevronRight size={12} color="#00FF7F"/>}
                </button>
              );
            })}
          </div>

          {/* ad */}
          <div style={{ padding:'10px 26px 0', background:'#080A0F', flexShrink:0 }}>
            <AdBanner/>
          </div>

          {/* content */}
          <div className="edm-scroll" style={{ flex:1, overflowY:'auto', padding:'24px 26px' }}>
            {tab === "overview"  && <ExamSetupPanel exam={data} onChange={handleUpdate}/>}
            {tab === "questions" && (
              <ExamEditorModal
                open={true}
                exam={data}
                onChange={handleUpdate}
                onClose={mode => setTab(mode === "preview" ? "preview" : "overview")}
              />
            )}
            {tab === "preview"   && <ExamPreview exam={data}/>}
          </div>

          {/* footer */}
          <div style={{ display:'flex', justifyContent:'flex-end', gap:10, padding:'14px 26px', borderTop:'1px solid #1A1D25', background:'#080A0F', flexShrink:0 }}>
            <button onClick={handleClose}
              style={{ padding:'10px 20px', background:'transparent', border:'1px solid #1A1D25', borderRadius:100, color:'#6A6A62', fontSize:13, cursor:'pointer', fontFamily:"'DM Sans',sans-serif", transition:'all .2s' }}
              onMouseEnter={e=>{ e.currentTarget.style.borderColor='#2A2D35'; e.currentTarget.style.color='#E8E8E0'; }}
              onMouseLeave={e=>{ e.currentTarget.style.borderColor='#1A1D25'; e.currentTarget.style.color='#6A6A62'; }}>
              Close
            </button>
            <button onClick={handleSave} disabled={isSaving}
              style={{ display:'flex', alignItems:'center', gap:7, padding:'10px 24px', background:isSaving?'#1A1D25':'#00FF7F', border:'none', borderRadius:100, color:isSaving?'#3A3D45':'#080A0F', fontSize:13, fontWeight:700, cursor:isSaving?'not-allowed':'pointer', fontFamily:"'DM Sans',sans-serif", boxShadow:isSaving?'none':'0 4px 16px #00FF7F20', transition:'all .2s' }}
              onMouseEnter={e=>{ if(!isSaving) e.currentTarget.style.background='#33FF99'; }}
              onMouseLeave={e=>{ if(!isSaving) e.currentTarget.style.background='#00FF7F'; }}>
              {isSaving
                ? <><div style={{ width:13, height:13, border:'2px solid #3A3D45', borderTopColor:'#9A9A90', borderRadius:'50%', animation:'edmSpin .8s linear infinite' }}/> Saving…</>
                : <><Save size={13}/> Save Changes</>
              }
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
};

export default ExamDownloadModal;