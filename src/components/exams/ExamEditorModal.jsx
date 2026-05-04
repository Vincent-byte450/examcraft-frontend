import React, { useState, useMemo } from "react";
import { X, Layers, ListChecks, PlusCircle, ChevronDown, ChevronRight, Trash2, Copy, Save, Loader2, Plus } from "lucide-react";
import toast from "react-hot-toast";

/* ─── shared input styles ────────────────────────────────── */
const IS = (f) => ({ width:'100%', padding:'9px 11px', background: f?'#0F1410':'#080A0F', border:`1px solid ${f?'#00FF7F50':'#1A1D25'}`, borderRadius:9, color:'#E8E8E0', fontSize:13, fontFamily:"'DM Sans',sans-serif", outline:'none', transition:'all .2s', boxSizing:'border-box', boxShadow: f?'0 0 0 3px #00FF7F0D':'none' });

const FInput = ({ value, onChange, placeholder, type='text', style={} }) => {
  const [f,setF]=useState(false);
  return <input type={type} value={value||''} onChange={onChange} placeholder={placeholder} onFocus={()=>setF(true)} onBlur={()=>setF(false)} style={{...IS(f),...style}}/>;
};
const FTextarea = ({ value, onChange, placeholder, rows=2 }) => {
  const [f,setF]=useState(false);
  return <textarea rows={rows} value={value||''} onChange={onChange} placeholder={placeholder} onFocus={()=>setF(true)} onBlur={()=>setF(false)} style={{...IS(f),resize:'vertical',lineHeight:1.65}}/>;
};
const FSelect = ({ value, onChange, children }) => {
  const [f,setF]=useState(false);
  return <select value={value||''} onChange={onChange} onFocus={()=>setF(true)} onBlur={()=>setF(false)} style={{...IS(f),appearance:'none',cursor:'pointer'}}>{children}</select>;
};

const LABEL = { display:'block', fontSize:10, fontFamily:"'Space Mono',monospace", textTransform:'uppercase', letterSpacing:'0.08em', color:'#4A4D55', marginBottom:6 };

const AddBtn = ({ onClick, label, disabled }) => (
  <button type="button" onClick={onClick} disabled={disabled}
    style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'7px 14px', background:'transparent', border:'1px dashed #2A2D35', borderRadius:8, color:'#4A4D55', fontSize:12, cursor: disabled?'not-allowed':'pointer', fontFamily:"'DM Sans',sans-serif", transition:'all .18s', opacity: disabled?.6:1 }}
    onMouseEnter={e=>{ if(!disabled){e.currentTarget.style.borderColor='#00FF7F40';e.currentTarget.style.color='#00FF7F';}}}
    onMouseLeave={e=>{ e.currentTarget.style.borderColor='#2A2D35';e.currentTarget.style.color='#4A4D55'; }}>
    <Plus size={11}/> {label}
  </button>
);

const RemBtn = ({ onClick, color='#FF4444' }) => (
  <button type="button" onClick={onClick}
    style={{ width:28,height:28,display:'flex',alignItems:'center',justifyContent:'center',background:'none',border:'1px solid transparent',borderRadius:7,color:'#4A4D55',cursor:'pointer',transition:'all .18s',flexShrink:0 }}
    onMouseEnter={e=>{ e.currentTarget.style.background=`${color}15`;e.currentTarget.style.borderColor=`${color}30`;e.currentTarget.style.color=color; }}
    onMouseLeave={e=>{ e.currentTarget.style.background='none';e.currentTarget.style.borderColor='transparent';e.currentTarget.style.color='#4A4D55'; }}>
    <Trash2 size={12}/>
  </button>
);

/* ─── inline question editor (slide-over) ───────────────── */
const InlineEditQuestionModal = ({ question, onClose, onSave }) => {
  const [form, setForm] = useState({ ...question, options:question.options||[], subQuestions:question.subQuestions||[], markingScheme:question.markingScheme||[], hasImage:question.hasImage||false, imageDescription:question.imageDescription||'', imageUrl:question.imageUrl||'', hasPassage:question.hasPassage||false, passageText:question.passageText||'', passageDescription:question.passageDescription||'' });
  const upd = (f,v) => setForm(p=>({...p,[f]:v}));
  const addOpt = () => upd('options',[...form.options,'']);
  const updOpt = (i,v) => { const o=[...form.options];o[i]=v;upd('options',o); };
  const remOpt = (i) => upd('options',form.options.filter((_,j)=>j!==i));
  const addSubQ = () => upd('subQuestions',[...form.subQuestions,{part:`${String.fromCharCode(97+form.subQuestions.length)})`,question:'',marks:1,expectedAnswer:''}]);
  const updSubQ = (i,f2,v) => { const s=[...form.subQuestions];s[i]={...s[i],[f2]:v};upd('subQuestions',s); };
  const remSubQ = (i) => { const s=form.subQuestions.filter((_,j)=>j!==i).map((x,j)=>({...x,part:`${String.fromCharCode(97+j)})`}));upd('subQuestions',s); };
  const addMP = () => upd('markingScheme',[...form.markingScheme,{step:'',marks:1}]);
  const updMP = (i,f2,v) => { const m=[...form.markingScheme];m[i]={...m[i],[f2]:v};upd('markingScheme',m); };
  const remMP = (i) => upd('markingScheme',form.markingScheme.filter((_,j)=>j!==i));

  return (
    <>
      <style>{`@keyframes iqSlide{from{transform:translateX(100%)}to{transform:translateX(0)}}`}</style>
      <div style={{ position:'absolute',inset:0,display:'flex',justifyContent:'flex-end',background:'rgba(4,5,8,.75)',backdropFilter:'blur(4px)',zIndex:60 }}>
        <div style={{ width:'100%',maxWidth:580,background:'#080A0F',borderLeft:'1px solid #1A1D25',display:'flex',flexDirection:'column',overflowY:'auto',animation:'iqSlide .3s cubic-bezier(.16,1,.3,1) forwards' }}>
          {/* header */}
          <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',padding:'16px 22px',borderBottom:'1px solid #1A1D25',background:'#0D0F16',flexShrink:0 }}>
            <div>
              <div style={{ fontSize:10,fontFamily:"'Space Mono',monospace",textTransform:'uppercase',letterSpacing:'0.1em',color:'#00FF7F',marginBottom:3 }}>Question Editor</div>
              <div style={{ fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:16,color:'#E8E8E0',letterSpacing:'-0.01em' }}>Edit Question</div>
            </div>
            <button onClick={onClose} style={{ width:30,height:30,display:'flex',alignItems:'center',justifyContent:'center',background:'none',border:'1px solid #1A1D25',borderRadius:8,color:'#4A4D55',cursor:'pointer',transition:'all .18s' }}
              onMouseEnter={e=>{e.currentTarget.style.background='#FF444415';e.currentTarget.style.color='#FF6666';}}
              onMouseLeave={e=>{e.currentTarget.style.background='none';e.currentTarget.style.color='#4A4D55';}}><X size={13}/></button>
          </div>

          {/* body */}
          <div style={{ flex:1,overflowY:'auto',padding:'18px 22px',display:'flex',flexDirection:'column',gap:14 }}>
            <div><label style={LABEL}>Question Text *</label><FTextarea rows={3} value={form.question} onChange={e=>upd('question',e.target.value)} placeholder="Enter question text…"/></div>

            <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr 1fr 1fr',gap:10 }}>
              <div><label style={LABEL}>Type</label>
                <FSelect value={form.type} onChange={e=>upd('type',e.target.value)}>
                  <option value="short-answer">Short Answer</option>
                  <option value="structured">Structured</option>
                  <option value="essay">Essay</option>
                  <option value="multiple-choice">Multiple Choice</option>
                  <option value="true-false">True/False</option>
                </FSelect>
              </div>
              <div><label style={LABEL}>Marks</label><FInput type="number" value={form.marks} onChange={e=>upd('marks',Number(e.target.value))} placeholder="Marks"/></div>
              <div><label style={LABEL}>Difficulty</label>
                <FSelect value={form.difficulty} onChange={e=>upd('difficulty',e.target.value)}>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </FSelect>
              </div>
              <div><label style={LABEL}>Topic</label><FInput value={form.topic} onChange={e=>upd('topic',e.target.value)} placeholder="Topic"/></div>
            </div>

            {/* passage */}
            {form.hasPassage && (
              <div style={{ background:'#080A0F',border:'1px solid #00C8FF25',borderRadius:10,padding:'14px 16px' }}>
                <div style={{ fontSize:11,fontFamily:"'Space Mono',monospace",textTransform:'uppercase',letterSpacing:'0.08em',color:'#00C8FF',marginBottom:10 }}>Passage</div>
                <FTextarea rows={3} value={form.passageText} onChange={e=>upd('passageText',e.target.value)} placeholder="Passage text…"/>
              </div>
            )}

            {/* image */}
            {form.hasImage && (
              <div style={{ background:'#080A0F',border:'1px solid #9B6BFF25',borderRadius:10,padding:'14px 16px' }}>
                <div style={{ fontSize:11,fontFamily:"'Space Mono',monospace",textTransform:'uppercase',letterSpacing:'0.08em',color:'#9B6BFF',marginBottom:10 }}>Image / Diagram</div>
                <FInput value={form.imageUrl} onChange={e=>upd('imageUrl',e.target.value)} placeholder="Image URL"/>
                {form.imageUrl && <img src={form.imageUrl} alt="Preview" style={{ maxWidth:'100%',marginTop:10,borderRadius:8,border:'1px solid #1A1D25' }}/>}
              </div>
            )}

            {/* multiple choice */}
            {form.type==='multiple-choice' && (
              <div>
                <div style={{ fontSize:11,fontFamily:"'Space Mono',monospace",textTransform:'uppercase',letterSpacing:'0.08em',color:'#00FF7F',marginBottom:10 }}>Options</div>
                <div style={{ display:'flex',flexDirection:'column',gap:7,marginBottom:10 }}>
                  {form.options.map((opt,i)=>(
                    <div key={i} style={{ display:'flex',alignItems:'center',gap:8 }}>
                      <span style={{ width:24,height:24,borderRadius:6,background:'#1A1D25',border:'1px solid #2A2D35',display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontFamily:"'Space Mono',monospace",color:'#5A5D65',flexShrink:0 }}>{String.fromCharCode(65+i)}</span>
                      <div style={{ flex:1 }}><FInput value={opt} onChange={e=>updOpt(i,e.target.value)} placeholder={`Option ${String.fromCharCode(65+i)}`}/></div>
                      <RemBtn onClick={()=>remOpt(i)}/>
                    </div>
                  ))}
                </div>
                <AddBtn onClick={addOpt} label="Add Option"/>
              </div>
            )}

            {/* sub-questions */}
            {(form.type==='structured'||form.type==='essay') && (
              <div>
                <div style={{ fontSize:11,fontFamily:"'Space Mono',monospace",textTransform:'uppercase',letterSpacing:'0.08em',color:'#FF9B3B',marginBottom:10 }}>Sub-questions</div>
                <div style={{ display:'flex',flexDirection:'column',gap:8,marginBottom:10 }}>
                  {form.subQuestions.map((sq,i)=>(
                    <div key={i} style={{ background:'#080A0F',border:'1px solid #1A1D25',borderRadius:9,padding:'10px 12px' }}>
                      <div style={{ display:'flex',alignItems:'center',gap:8,marginBottom:8 }}>
                        <span style={{ fontSize:11,fontFamily:"'Space Mono',monospace",color:'#FF9B3B',background:'#FF9B3B15',border:'1px solid #FF9B3B25',borderRadius:6,padding:'2px 8px' }}>{sq.part}</span>
                        <div style={{ width:64 }}><FInput type="number" value={sq.marks} onChange={e=>updSubQ(i,'marks',Number(e.target.value))}/></div>
                        <div style={{ marginLeft:'auto' }}><RemBtn onClick={()=>remSubQ(i)}/></div>
                      </div>
                      <FTextarea rows={2} value={sq.question} onChange={e=>updSubQ(i,'question',e.target.value)} placeholder="Sub-question text…"/>
                    </div>
                  ))}
                </div>
                <AddBtn onClick={addSubQ} label="Add Sub-question"/>
              </div>
            )}

            {/* marking scheme */}
            {form.type==='structured' && (
              <div>
                <div style={{ fontSize:11,fontFamily:"'Space Mono',monospace",textTransform:'uppercase',letterSpacing:'0.08em',color:'#00C8FF',marginBottom:10 }}>Marking Scheme</div>
                <div style={{ display:'flex',flexDirection:'column',gap:7,marginBottom:10 }}>
                  {form.markingScheme.map((m,i)=>(
                    <div key={i} style={{ display:'flex',gap:8,alignItems:'center' }}>
                      <div style={{ flex:1 }}><FInput value={m.step||''} onChange={e=>updMP(i,'step',e.target.value)} placeholder={`Step ${i+1}`}/></div>
                      <div style={{ width:64 }}><FInput type="number" value={m.marks||''} onChange={e=>updMP(i,'marks',Number(e.target.value))} placeholder="Mks"/></div>
                      <RemBtn onClick={()=>remMP(i)}/>
                    </div>
                  ))}
                </div>
                <AddBtn onClick={addMP} label="Add Point"/>
              </div>
            )}

            <div><label style={LABEL}>Expected Answer</label><FTextarea rows={2} value={form.expectedAnswer} onChange={e=>upd('expectedAnswer',e.target.value)} placeholder="Expected answer…"/></div>
            <div><label style={LABEL}>Explanation / Notes</label><FTextarea rows={2} value={form.explanation} onChange={e=>upd('explanation',e.target.value)} placeholder="Teaching notes…"/></div>
          </div>

          {/* footer */}
          <div style={{ display:'flex',justifyContent:'flex-end',gap:10,padding:'14px 22px',borderTop:'1px solid #1A1D25',background:'#0D0F16',flexShrink:0 }}>
            <button onClick={onClose} style={{ padding:'9px 20px',background:'transparent',border:'1px solid #1A1D25',borderRadius:100,color:'#6A6A62',fontSize:13,cursor:'pointer',fontFamily:"'DM Sans',sans-serif",transition:'all .2s' }}
              onMouseEnter={e=>{e.currentTarget.style.borderColor='#2A2D35';e.currentTarget.style.color='#E8E8E0';}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor='#1A1D25';e.currentTarget.style.color='#6A6A62';}}>Cancel</button>
            <button onClick={()=>{onSave(form);onClose();}} style={{ padding:'9px 22px',background:'#00FF7F',border:'none',borderRadius:100,color:'#080A0F',fontSize:13,fontWeight:700,cursor:'pointer',fontFamily:"'DM Sans',sans-serif",boxShadow:'0 4px 16px #00FF7F20',transition:'all .2s' }}
              onMouseEnter={e=>e.currentTarget.style.background='#33FF99'}
              onMouseLeave={e=>e.currentTarget.style.background='#00FF7F'}>Save</button>
          </div>
        </div>
      </div>
    </>
  );
};

/* ─── MAIN ExamEditorModal ───────────────────────────────── */
const ExamEditorModal = ({ open, onClose, exam, onChange }) => {
  const [activeTab, setActiveTab] = useState("sections");
  const [expandedSections, setExpandedSections] = useState({});
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [data, setData] = useState(() => ({ ...exam }));

  if (!open) return null;

  const sections  = data.sections  || {};
  const questions = data.questions || [];

  const toggleSection = (key) => setExpandedSections(p => ({ ...p, [key]: !p[key] }));

  const updateExamField = (field, value) => {
    const updated = { ...data, [field]: value };
    setData(updated);
    onChange(field, value);
  };

  const addSection = () => {
    const newKey = `section${String.fromCharCode(65+Object.keys(sections).length)}`;
    updateExamField("sections", { ...sections, [newKey]: { title:'', instructions:'', marks:0 } });
    toast.success("Section added");
  };
  const removeSection = (key) => {
    const updated = { ...sections }; delete updated[key];
    updateExamField("sections", updated);
    toast.success("Section removed");
  };
  const updateSection = (key, field, value) =>
    updateExamField("sections", { ...sections, [key]: { ...sections[key], [field]: value } });

  const handleAddQuestion = (sectionKey) => {
    setIsProcessing(true);
    updateExamField("questions", [...questions, { _id:Math.random().toString(36).substring(2,10), question:'', type:'short-answer', marks:1, difficulty:'easy', topic:'', section:sectionKey, expectedAnswer:'' }]);
    setIsProcessing(false);
    toast.success("Question added");
  };
  const handleDeleteQuestion = (id) => {
    if (!confirm("Delete this question?")) return;
    updateExamField("questions", questions.filter(q=>q._id!==id));
    toast.success("Question deleted");
  };
  const handleCloneQuestion = (q) => {
    updateExamField("questions", [...questions, { ...q, _id:Math.random().toString(36).substring(2,10), question:q.question+" (Copy)" }]);
    toast.success("Question duplicated");
  };
  const handleSaveQuestion = (updated) => {
    updateExamField("questions", questions.map(q=>q._id===updated._id?updated:q));
    setShowModal(false);
    toast.success("Question updated");
  };

  const grouped = useMemo(() => questions.reduce((acc,q) => { const s=q.section||"A"; acc[s]=acc[s]||[]; acc[s].push(q); return acc; }, {}), [questions]);

  const TABS = [
    { key:"sections",  label:"Sections",  icon:Layers },
    { key:"questions", label:"Questions", icon:ListChecks },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Syne:wght@700;800&family=Space+Mono&display=swap');
        * { box-sizing:border-box; }
        select option { background:#0D0F16; color:#E8E8E0; }
        input::placeholder, textarea::placeholder { color:#3A3D45; }
        ::-webkit-scrollbar{width:4px;} ::-webkit-scrollbar-track{background:#080A0F;} ::-webkit-scrollbar-thumb{background:#00FF7F30;border-radius:4px;}
      `}</style>

      <div style={{ position:'relative', fontFamily:"'DM Sans','Helvetica Neue',sans-serif", color:'#E8E8E0', height:'100%', display:'flex', flexDirection:'column' }}>

        {/* tab bar */}
        <div style={{ display:'flex', gap:4, borderBottom:'1px solid #1A1D25', marginBottom:20, paddingBottom:0 }}>
          {TABS.map(({ key, label, icon:Icon }) => {
            const active = activeTab === key;
            return (
              <button key={key} onClick={() => setActiveTab(key)}
                style={{ display:'flex',alignItems:'center',gap:7,padding:'10px 18px',background:'none',border:'none',borderBottom:`2px solid ${active?'#00FF7F':'transparent'}`,color:active?'#00FF7F':'#4A4D55',fontSize:13,fontWeight:active?600:400,cursor:'pointer',fontFamily:"'DM Sans',sans-serif",transition:'all .18s',marginBottom:-1 }}>
                <Icon size={14}/> {label}
              </button>
            );
          })}
        </div>

        {/* SECTIONS TAB */}
        {activeTab === "sections" && (
          <div style={{ display:'flex',flexDirection:'column',gap:14 }}>
            {Object.entries(sections).map(([key, section]) => (
              <div key={key} style={{ background:'#080A0F',border:'1px solid #1A1D25',borderRadius:12,padding:'16px 18px' }}>
                <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14 }}>
                  <div style={{ fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:14,color:'#E8E8E0' }}>{section.title||key.toUpperCase()}</div>
                  <button onClick={()=>removeSection(key)} style={{ width:28,height:28,display:'flex',alignItems:'center',justifyContent:'center',background:'none',border:'1px solid transparent',borderRadius:7,color:'#4A4D55',cursor:'pointer',transition:'all .18s' }}
                    onMouseEnter={e=>{e.currentTarget.style.background='#FF444415';e.currentTarget.style.borderColor='#FF444430';e.currentTarget.style.color='#FF6666';}}
                    onMouseLeave={e=>{e.currentTarget.style.background='none';e.currentTarget.style.borderColor='transparent';e.currentTarget.style.color='#4A4D55';}}>
                    <Trash2 size={12}/>
                  </button>
                </div>
                <div style={{ display:'grid',gridTemplateColumns:'1fr 100px',gap:10,marginBottom:10 }}>
                  <FInput value={section.title} onChange={e=>updateSection(key,"title",e.target.value)} placeholder="Section Title"/>
                  <FInput type="number" value={section.marks} onChange={e=>updateSection(key,"marks",Number(e.target.value))} placeholder="Marks"/>
                </div>
                <FTextarea value={section.instructions} onChange={e=>updateSection(key,"instructions",e.target.value)} placeholder="Section instructions…" rows={2}/>
              </div>
            ))}
            <div><AddBtn onClick={addSection} label="Add Section"/></div>
          </div>
        )}

        {/* QUESTIONS TAB */}
        {activeTab === "questions" && (
          <div style={{ display:'flex',flexDirection:'column',gap:12,position:'relative' }}>
            {Object.keys(grouped).map((sec) => {
              const isOpen = !!expandedSections[sec];
              return (
                <div key={sec} style={{ background:'#080A0F',border:'1px solid #1A1D25',borderRadius:12,overflow:'hidden' }}>
                  {/* section header */}
                  <div onClick={()=>toggleSection(sec)}
                    style={{ display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px 18px',cursor:'pointer',background: isOpen?'#0D1410':'transparent',transition:'background .2s' }}>
                    <div style={{ display:'flex',alignItems:'center',gap:10 }}>
                      <div style={{ fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:14,color: isOpen?'#00FF7F':'#B8B8B0' }}>
                        {sections[`section${sec}`]?.title || `SECTION ${sec}`}
                      </div>
                      <span style={{ fontSize:10,fontFamily:"'Space Mono',monospace",padding:'2px 8px',background:'#1A1D25',border:'1px solid #2A2D35',borderRadius:100,color:'#5A5D65' }}>
                        {grouped[sec].length} question{grouped[sec].length!==1?'s':''}
                      </span>
                    </div>
                    {isOpen ? <ChevronDown size={14} color="#00FF7F"/> : <ChevronRight size={14} color="#4A4D55"/>}
                  </div>

                  {isOpen && (
                    <div style={{ padding:'12px 16px 16px',display:'flex',flexDirection:'column',gap:10 }}>
                      {grouped[sec].map((q,i) => (
                        <div key={q.id||i} style={{ background:'#0D0F16',border:'1px solid #1A1D25',borderRadius:10,padding:'12px 14px' }}>
                          <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:8 }}>
                            <div style={{ fontSize:11,fontFamily:"'Space Mono',monospace",color:'#00C8FF',textTransform:'uppercase',letterSpacing:'0.06em' }}>
                              Q{i+1} · {q.type?.replace(/-/g,' ')}
                            </div>
                            <div style={{ display:'flex',gap:4 }}>
                              <button onClick={()=>{setSelectedQuestion(q);setShowModal(true);}}
                                style={{ padding:'5px 12px',background:'#00C8FF15',border:'1px solid #00C8FF30',borderRadius:7,color:'#00C8FF',fontSize:11,fontWeight:600,cursor:'pointer',fontFamily:"'DM Sans',sans-serif",transition:'all .18s' }}
                                onMouseEnter={e=>e.currentTarget.style.background='#00C8FF25'}
                                onMouseLeave={e=>e.currentTarget.style.background='#00C8FF15'}>Edit</button>
                              <button onClick={()=>handleCloneQuestion(q)} title="Duplicate"
                                style={{ width:28,height:28,display:'flex',alignItems:'center',justifyContent:'center',background:'none',border:'1px solid transparent',borderRadius:7,color:'#4A4D55',cursor:'pointer',transition:'all .18s' }}
                                onMouseEnter={e=>{e.currentTarget.style.background='#00FF7F15';e.currentTarget.style.borderColor='#00FF7F30';e.currentTarget.style.color='#00FF7F';}}
                                onMouseLeave={e=>{e.currentTarget.style.background='none';e.currentTarget.style.borderColor='transparent';e.currentTarget.style.color='#4A4D55';}}><Copy size={12}/></button>
                              <button onClick={()=>handleDeleteQuestion(q._id)} title="Delete"
                                style={{ width:28,height:28,display:'flex',alignItems:'center',justifyContent:'center',background:'none',border:'1px solid transparent',borderRadius:7,color:'#4A4D55',cursor:'pointer',transition:'all .18s' }}
                                onMouseEnter={e=>{e.currentTarget.style.background='#FF444415';e.currentTarget.style.borderColor='#FF444430';e.currentTarget.style.color='#FF6666';}}
                                onMouseLeave={e=>{e.currentTarget.style.background='none';e.currentTarget.style.borderColor='transparent';e.currentTarget.style.color='#4A4D55';}}><Trash2 size={12}/></button>
                            </div>
                          </div>
                          <p style={{ fontSize:13,color:'#C8C8C0',lineHeight:1.65,marginBottom:8 }}>
                            {q.question || <em style={{ color:'#3A3D45' }}>No question text</em>}
                          </p>
                          <div style={{ display:'flex',gap:14,flexWrap:'wrap' }}>
                            {[['Marks',q.marks],['Difficulty',q.difficulty],['Topic',q.topic||'—']].map(([lbl,val])=>(
                              <span key={lbl} style={{ fontSize:11,color:'#4A4D55',fontFamily:"'Space Mono',monospace" }}>
                                <span style={{ color:'#3A3D45' }}>{lbl}: </span>{val}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}

                      <div style={{ paddingTop:4 }}>
                        <AddBtn onClick={()=>handleAddQuestion(sec)} label="Add Question" disabled={isProcessing}/>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {showModal && selectedQuestion && (
              <InlineEditQuestionModal question={selectedQuestion} onClose={()=>setShowModal(false)} onSave={handleSaveQuestion}/>
            )}
          </div>
        )}

        {/* footer */}
        <div style={{ marginTop:24,paddingTop:16,borderTop:'1px solid #1A1D25',display:'flex',justifyContent:'flex-end' }}>
          <button onClick={()=>onClose("preview")}
            style={{ display:'flex',alignItems:'center',gap:7,padding:'10px 22px',background:'#00FF7F',border:'none',borderRadius:100,color:'#080A0F',fontSize:13,fontWeight:700,cursor:'pointer',fontFamily:"'DM Sans',sans-serif",boxShadow:'0 4px 16px #00FF7F20',transition:'all .2s' }}
            onMouseEnter={e=>e.currentTarget.style.background='#33FF99'}
            onMouseLeave={e=>e.currentTarget.style.background='#00FF7F'}>
            <Save size={14}/> Done
          </button>
        </div>
      </div>
    </>
  );
};

export default ExamEditorModal;