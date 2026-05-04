import React, { useRef, useState } from "react";
import {
  FileDown, Eye, EyeOff, Loader2, ChevronDown,
  Printer, ZoomIn, ZoomOut,
} from "lucide-react";
import { saveAs } from "file-saver";
import { useGlobals } from "./../Globals";

const DOWNLOAD_OPTIONS = [
  { format:'pdf',         label:'Exam PDF',            icon:'📄' },
  { format:'docx',        label:'Exam DOCX (Word)',     icon:'📝' },
  { format:'pdf-scheme',  label:'Marking Scheme PDF',   icon:'✅' },
  { format:'docx-scheme', label:'Marking Scheme DOCX',  icon:'📋' },
  { format:'json',        label:'JSON Export',          icon:'{ }' },
];

const ZOOM_STEPS = [0.55, 0.7, 0.85, 1.0, 1.15, 1.3];

const ExamPreview = ({ exam }) => {
  const previewRef = useRef(null);
  const [showMarkingScheme, setShowMarkingScheme] = useState(false);
  const [isLoading,         setIsLoading]         = useState(false);
  const [dropdownOpen,      setDropdownOpen]      = useState(false);
  const [zoomIdx,           setZoomIdx]           = useState(3);

  const globals          = useGlobals();
  const API_BASE         = globals?.API_BASE         || "http://localhost:5000";
  const authToken        = globals?.authToken        || null;
  const showNotification = globals?.showNotification || ((msg, t) => console.log(`${t}: ${msg}`));

  if (!exam) return null;

  const {
    schoolLogo, schoolName, title, subject, classLevel, term,
    paperType, curriculum, examiner, date, duration, totalMarks,
    instructions, sections = {}, questions = [],
  } = exam;

  const sanitizedQs = questions.map(q => ({
    ...q,
    options: Array.isArray(q.options)
      ? q.options.filter(o => typeof o === 'string' && o.trim() !== '' && o.trim() !== '0')
      : [],
  }));

  const orderedSections = Object.entries(sections).sort(([a],[b]) => a.localeCompare(b));
  let qNum = 1;
  const zoom = ZOOM_STEPS[zoomIdx];

  const handleDownload = async (fmt) => {
    if (!exam) { showNotification("No exam data available","error"); return; }
    try {
      setIsLoading(true); setDropdownOpen(false);
      if (fmt === 'json') {
        saveAs(new Blob([JSON.stringify(exam,null,2)],{type:'application/json'}),`${exam.title||'exam'}.json`);
        showNotification("JSON exported","success"); return;
      }
      const res = await fetch(`${API_BASE}/api/exams/${exam._id||'preview'}/download`,{
        method:'POST',
        headers:{'Content-Type':'application/json',Authorization:`Bearer ${authToken}`},
        body:JSON.stringify({format:fmt,examData:exam}),
      });
      if (!res.ok){const e=await res.json().catch(()=>({}));throw new Error(e.error||`Download failed: ${res.status}`);}
      const blob = await res.blob();
      const isScheme = fmt.includes('scheme');
      const ext      = fmt.includes('pdf')?'pdf':'docx';
      const base     = exam.title?.replace(/[^a-z0-9]/gi,'_')||'exam';
      saveAs(blob,`${base}${isScheme?'_marking_scheme':''}.${ext}`);
      showNotification(`${exam.title} downloaded`,"success");
    } catch(err){ showNotification(`Download failed: ${err.message}`,"error"); }
    finally { setIsLoading(false); }
  };

  /* ── answer lines ── */
  const AnswerLines = ({ marks=2 }) => (
    <div style={{marginTop:8,marginBottom:4}}>
      {[...Array(Math.max(2,Math.ceil(marks/1.5)))].map((_,i)=>(
        <div key={i} style={{borderBottom:'1px solid #c8c8c8',height:26,marginBottom:3}}/>
      ))}
    </div>
  );

  /* ── marking scheme block ── */
  const MarkingBlock = ({ q }) => {
    const m = q.answer||q.correctAnswer||q.answers||q.expectedAnswer||q.markingScheme
      ||(Array.isArray(q.solutions)?q.solutions.join(', '):q.solution);
    if (!m) return null;
    return (
      <div style={{margin:'10px 0 4px',padding:'10px 14px',background:'#f0fff4',border:'1px solid #bbf7d0',borderLeft:'4px solid #16a34a',borderRadius:'0 5px 5px 0',fontSize:12.5,color:'#14532d',lineHeight:1.65}}>
        <div style={{fontWeight:700,fontSize:10,textTransform:'uppercase',letterSpacing:'.06em',color:'#16a34a',marginBottom:5,fontFamily:'Georgia,serif'}}>Marking Scheme</div>
        <div style={{whiteSpace:'pre-line',fontFamily:'Georgia,serif'}}>{m}</div>
      </div>
    );
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Syne:wght@700;800&family=Space+Mono&family=Crimson+Pro:ital,wght@0,400;0,600;0,700;1,400;1,600&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        @keyframes epSpin   {to{transform:rotate(360deg)}}
        @keyframes epFadeIn {from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}
        @media print{
          .ep-chrome{display:none!important;}
          .ep-shell{background:none!important;padding:0!important;border-radius:0!important;}
          .ep-paper{transform:none!important;box-shadow:none!important;}
        }
      `}</style>

      <div style={{maxWidth:1100,margin:'0 auto',fontFamily:"'DM Sans','Helvetica Neue',sans-serif"}}>

        {/* ══ CHROME TOOLBAR ══════════════════════════════════════ */}
        <div className="ep-chrome" style={{
          display:'flex',alignItems:'center',justifyContent:'space-between',
          padding:'12px 16px',marginBottom:16,
          background:'#0D0F16',border:'1px solid #1A1D25',borderRadius:14,
          flexWrap:'wrap',gap:10,
        }}>
          {/* zoom */}
          <div style={{display:'flex',alignItems:'center',gap:6}}>
            <span style={{fontSize:10,fontFamily:"'Space Mono',monospace",textTransform:'uppercase',letterSpacing:'0.1em',color:'#3A3D45',marginRight:4}}>Zoom</span>
            <button onClick={()=>setZoomIdx(i=>Math.max(0,i-1))} disabled={zoomIdx===0}
              style={{width:28,height:28,display:'flex',alignItems:'center',justifyContent:'center',background:'#1A1D25',border:'1px solid #2A2D35',borderRadius:7,color:zoomIdx===0?'#2A2D35':'#9A9A90',cursor:zoomIdx===0?'not-allowed':'pointer',transition:'all .15s'}}
              onMouseEnter={e=>{if(zoomIdx>0)e.currentTarget.style.background='#2A2D35';}}
              onMouseLeave={e=>e.currentTarget.style.background='#1A1D25'}>
              <ZoomOut size={12}/>
            </button>
            <div style={{minWidth:42,textAlign:'center',fontSize:12,fontFamily:"'Space Mono',monospace",color:'#00FF7F'}}>{Math.round(zoom*100)}%</div>
            <button onClick={()=>setZoomIdx(i=>Math.min(ZOOM_STEPS.length-1,i+1))} disabled={zoomIdx===ZOOM_STEPS.length-1}
              style={{width:28,height:28,display:'flex',alignItems:'center',justifyContent:'center',background:'#1A1D25',border:'1px solid #2A2D35',borderRadius:7,color:zoomIdx===ZOOM_STEPS.length-1?'#2A2D35':'#9A9A90',cursor:zoomIdx===ZOOM_STEPS.length-1?'not-allowed':'pointer',transition:'all .15s'}}
              onMouseEnter={e=>{if(zoomIdx<ZOOM_STEPS.length-1)e.currentTarget.style.background='#2A2D35';}}
              onMouseLeave={e=>e.currentTarget.style.background='#1A1D25'}>
              <ZoomIn size={12}/>
            </button>
            <button onClick={()=>setZoomIdx(3)}
              style={{padding:'4px 10px',background:'transparent',border:'1px solid #1A1D25',borderRadius:7,color:'#4A4D55',cursor:'pointer',fontSize:11,fontFamily:"'Space Mono',monospace",transition:'all .15s'}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor='#2A2D35';e.currentTarget.style.color='#9A9A90';}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor='#1A1D25';e.currentTarget.style.color='#4A4D55';}}>
              1:1
            </button>
          </div>

          {/* center chip */}
          <div style={{display:'flex',alignItems:'center',gap:8,fontSize:11,color:'#5A5D65',fontFamily:"'Space Mono',monospace"}}>
            <div style={{width:6,height:6,borderRadius:'50%',background:'#00FF7F'}}/>
            {subject||'Preview'}{paperType&&` · ${paperType}`}
            {questions.length>0&&(
              <span style={{padding:'2px 8px',background:'#00FF7F15',border:'1px solid #00FF7F25',borderRadius:100,fontSize:10,color:'#00FF7F'}}>{questions.length} Q</span>
            )}
          </div>

          {/* actions */}
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <button onClick={()=>setShowMarkingScheme(p=>!p)}
              style={{
                display:'flex',alignItems:'center',gap:6,padding:'7px 13px',
                background:showMarkingScheme?'#00FF7F15':'transparent',
                border:`1px solid ${showMarkingScheme?'#00FF7F40':'#1A1D25'}`,
                borderRadius:100,color:showMarkingScheme?'#00FF7F':'#6A6A62',
                fontSize:12,cursor:'pointer',fontFamily:"'DM Sans',sans-serif",transition:'all .2s',
              }}
              onMouseEnter={e=>{if(!showMarkingScheme){e.currentTarget.style.borderColor='#2A2D35';e.currentTarget.style.color='#E8E8E0';}}}
              onMouseLeave={e=>{if(!showMarkingScheme){e.currentTarget.style.borderColor='#1A1D25';e.currentTarget.style.color='#6A6A62';}}}>
              {showMarkingScheme?<><EyeOff size={12}/> Hide Scheme</>:<><Eye size={12}/> Show Scheme</>}
            </button>

            <button onClick={()=>window.print()}
              style={{display:'flex',alignItems:'center',gap:6,padding:'7px 13px',background:'transparent',border:'1px solid #1A1D25',borderRadius:100,color:'#6A6A62',fontSize:12,cursor:'pointer',fontFamily:"'DM Sans',sans-serif",transition:'all .2s'}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor='#2A2D35';e.currentTarget.style.color='#E8E8E0';}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor='#1A1D25';e.currentTarget.style.color='#6A6A62';}}>
              <Printer size={12}/> Print
            </button>

            <div style={{position:'relative'}}>
              <button onClick={()=>setDropdownOpen(p=>!p)} disabled={isLoading}
                style={{
                  display:'flex',alignItems:'center',gap:7,padding:'7px 18px',
                  background:'#00FF7F',border:'none',borderRadius:100,
                  color:'#080A0F',fontSize:12,fontWeight:700,cursor:isLoading?'not-allowed':'pointer',
                  fontFamily:"'DM Sans',sans-serif",boxShadow:'0 4px 14px #00FF7F20',transition:'all .2s',opacity:isLoading?.7:1,
                }}
                onMouseEnter={e=>{if(!isLoading){e.currentTarget.style.background='#33FF99';e.currentTarget.style.transform='translateY(-1px)';}}}
                onMouseLeave={e=>{if(!isLoading){e.currentTarget.style.background='#00FF7F';e.currentTarget.style.transform='translateY(0)';}}}
              >
                {isLoading
                  ? <><Loader2 size={12} style={{animation:'epSpin .8s linear infinite'}}/> Downloading…</>
                  : <><FileDown size={12}/> Download <ChevronDown size={10}/></>
                }
              </button>
              {dropdownOpen&&!isLoading&&(
                <div style={{position:'absolute',right:0,top:'calc(100% + 8px)',minWidth:230,background:'#0D0F16',border:'1px solid #2A2D35',borderRadius:12,overflow:'hidden',boxShadow:'0 16px 48px rgba(0,0,0,.8)',zIndex:50,animation:'epFadeIn .15s ease forwards'}}>
                  {DOWNLOAD_OPTIONS.map((o,i)=>(
                    <button key={o.format} onClick={()=>handleDownload(o.format)}
                      style={{display:'flex',alignItems:'center',gap:10,width:'100%',padding:'11px 16px',background:'transparent',border:'none',borderBottom:i<DOWNLOAD_OPTIONS.length-1?'1px solid #1A1D25':'none',color:'#B8B8B0',fontSize:13,textAlign:'left',cursor:'pointer',fontFamily:"'DM Sans',sans-serif",transition:'all .15s'}}
                      onMouseEnter={e=>{e.currentTarget.style.background='#1A1D25';e.currentTarget.style.color='#E8E8E0';}}
                      onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.color='#B8B8B0';}}>
                      <span style={{fontSize:14}}>{o.icon}</span>{o.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ══ PAPER SHELL ════════════════════════════════════════ */}
        <div className="ep-shell" style={{
          background:'#161A22',
          borderRadius:14,
          padding:'28px 28px 40px',
          overflowX:'auto',
          border:'1px solid #1A1D25',
        }}>
          {/* A4 paper */}
          <div ref={previewRef} className="ep-paper" style={{
            width:794,
            minWidth:794,
            margin:'0 auto',
            transform:`scale(${zoom})`,
            transformOrigin:'top center',
            marginBottom:`${(zoom-1)*794*1.42}px`,
            background:'#ffffff',
            boxShadow:'0 12px 60px rgba(0,0,0,.55),0 2px 8px rgba(0,0,0,.3)',
            borderRadius:2,
            padding:'60px 68px 72px',
            color:'#111',
            fontSize:13.5,
            lineHeight:1.78,
            fontFamily:"'Crimson Pro',Georgia,'Times New Roman',serif",
            position:'relative',
          }}>

            {/* ── COVER ────────────────────────────────────────── */}
            <div style={{textAlign:'center',paddingBottom:26,marginBottom:26,borderBottom:'2.5px solid #111'}}>

              {/* twin rules at top */}
              <div style={{height:4,background:'#111',marginBottom:4,borderRadius:2}}/>
              <div style={{height:1,background:'#555',marginBottom:18}}/>

              {/* school logo */}
              {schoolLogo && (
                <img src={schoolLogo} alt="School Logo"
                  style={{height:80,objectFit:'contain',display:'block',margin:'0 auto 10px'}}/>
              )}

              {/* school name */}
              {schoolName && (
                <div style={{fontFamily:"'Crimson Pro',Georgia,serif",fontWeight:700,fontSize:19,letterSpacing:'.1em',textTransform:'uppercase',marginBottom:6,color:'#111'}}>
                  {schoolName}
                </div>
              )}

              {/* thin rule */}
              <div style={{width:100,height:1,background:'#444',margin:'8px auto 12px'}}/>

              {/* exam title */}
              <div style={{fontFamily:"'Crimson Pro',Georgia,serif",fontWeight:700,fontSize:21,textTransform:'uppercase',letterSpacing:'.05em',marginBottom:4,color:'#111'}}>
                {title}
              </div>

              {/* subject + paper */}
              {subject && (
                <div style={{fontFamily:"'Crimson Pro',Georgia,serif",fontSize:15,color:'#333',marginBottom:2}}>
                  {subject}{paperType&&` — ${paperType}`}
                </div>
              )}
              {curriculum && (
                <div style={{fontSize:12,color:'#666',fontStyle:'italic',marginBottom:14}}>
                  {curriculum==='JSS'?'Junior Secondary School (CBC)':'Secondary School (8-4-4 / KCSE)'}
                </div>
              )}

              {/* meta grid */}
              {[['Term',term],['Class',classLevel],['Duration',duration?`${duration} minutes`:null],['Total Marks',totalMarks!=null?String(totalMarks):'—']].filter(([,v])=>v).length > 0 && (
                <div style={{
                  display:'grid',
                  gridTemplateColumns:`repeat(${[['Term',term],['Class',classLevel],['Duration',duration?`${duration} minutes`:null],['Total Marks',totalMarks!=null?String(totalMarks):'—']].filter(([,v])=>v).length},1fr)`,
                  border:'1.5px solid #222',borderRadius:3,overflow:'hidden',marginTop:14,
                }}>
                  {[['Term',term],['Class',classLevel],['Duration',duration?`${duration} minutes`:null],['Total Marks',totalMarks!=null?String(totalMarks):'—']]
                    .filter(([,v])=>v)
                    .map(([k,v],idx,arr)=>(
                      <div key={k} style={{
                        padding:'10px 10px',
                        borderRight:idx<arr.length-1?'1px solid #ddd':'none',
                        background:idx%2===0?'#f7f7f7':'#fff',
                        textAlign:'center',
                      }}>
                        <div style={{fontSize:9.5,fontWeight:700,textTransform:'uppercase',letterSpacing:'.07em',color:'#666',marginBottom:3}}>{k}</div>
                        <div style={{fontFamily:"'Crimson Pro',Georgia,serif",fontSize:14,fontWeight:600,color:'#111'}}>{v}</div>
                      </div>
                    ))
                  }
                </div>
              )}

              {/* student details */}
              <div style={{border:'1.5px solid #ccc',borderRadius:3,padding:'14px 18px',marginTop:14,textAlign:'left'}}>
                <div style={{fontSize:10.5,fontWeight:700,textTransform:'uppercase',letterSpacing:'.07em',color:'#333',marginBottom:10,paddingBottom:7,borderBottom:'1px solid #e0e0e0'}}>Student Details</div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px 40px'}}>
                  {['Student Name','Admission / Index Number','Class / Stream',"Candidate's Signature"].map(lbl=>(
                    <div key={lbl}>
                      <div style={{fontSize:11,color:'#777',marginBottom:3}}>{lbl}:</div>
                      <div style={{borderBottom:'1px solid #bbb',height:22}}/>
                    </div>
                  ))}
                </div>
              </div>

              {/* examiner / date */}
              {(examiner||date)&&(
                <div style={{marginTop:10,fontSize:12,fontStyle:'italic',color:'#666',textAlign:'right'}}>
                  {examiner&&<span>Examiner: <strong style={{fontStyle:'normal'}}>{examiner}</strong></span>}
                  {examiner&&date&&<span style={{margin:'0 10px'}}>·</span>}
                  {date&&<span>Date: <strong style={{fontStyle:'normal'}}>{new Date(date).toLocaleDateString('en-KE',{year:'numeric',month:'long',day:'numeric'})}</strong></span>}
                </div>
              )}

              {/* closing rules */}
              <div style={{height:1,background:'#555',marginTop:18,marginBottom:4}}/>
              <div style={{height:4,background:'#111',borderRadius:2}}/>
            </div>

            {/* ── INSTRUCTIONS ─────────────────────────────────── */}
            {instructions&&(
              <div style={{marginBottom:24,padding:'12px 16px',background:'#f9f9f9',border:'1px solid #e4e4e4',borderLeft:'4px solid #333',borderRadius:'0 4px 4px 0',fontStyle:'italic',fontSize:13,color:'#333',lineHeight:1.72}}>
                {instructions}
              </div>
            )}

            {/* ── QUESTIONS (sectioned OR flat) ─────────────────── */}
            {orderedSections.length > 0 ? (
              orderedSections.map(([key,section])=>{
                const sQs = sanitizedQs.filter(q=>
                  q.section?.toUpperCase()===key.slice(-1).toUpperCase()||q.section===section.title
                );
                if(!sQs.length) return null;
                const sMks = section.marks||sQs.reduce((s,q)=>s+(q.marks||0),0);
                return (
                  <div key={key} style={{marginTop:30,breakInside:'avoid-page'}}>
                    {/* section header */}
                    <div style={{borderTop:'2px solid #111',borderBottom:'1px solid #444',padding:'7px 0 5px',marginBottom:14,display:'flex',justifyContent:'space-between',alignItems:'baseline'}}>
                      <div style={{fontWeight:700,fontSize:15,textTransform:'uppercase',letterSpacing:'.06em'}}>{section.title||`Section ${key.slice(-1).toUpperCase()}`}</div>
                      <div style={{fontSize:12.5,color:'#444'}}>({sMks} marks)</div>
                    </div>
                    {section.instructions&&<p style={{fontStyle:'italic',color:'#555',marginBottom:12,fontSize:13}}>{section.instructions}</p>}
                    <QuestionList qs={sQs} getQNum={()=>qNum++} AnswerLines={AnswerLines} MarkingBlock={MarkingBlock} showMarkingScheme={showMarkingScheme}/>
                  </div>
                );
              })
            ):(
              <QuestionList qs={sanitizedQs} getQNum={()=>qNum++} AnswerLines={AnswerLines} MarkingBlock={MarkingBlock} showMarkingScheme={showMarkingScheme}/>
            )}

            {/* ── FOOTER ───────────────────────────────────────── */}
            <div style={{marginTop:44,paddingTop:12,borderTop:'1.5px solid #333',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div style={{fontSize:11,color:'#888',fontStyle:'italic'}}>{schoolName&&`${schoolName} · `}{subject&&`${subject} · `}{term}</div>
              <div style={{fontSize:12,color:'#444',fontWeight:600,letterSpacing:'.05em'}}>— End of Paper —</div>
              <div style={{fontSize:11,color:'#888',fontStyle:'italic'}}>{totalMarks&&`Total: ${totalMarks} marks`}</div>
            </div>

          </div>{/* end .ep-paper */}
        </div>{/* end .ep-shell */}
      </div>
    </>
  );
};

/* ─── question list (used for both sectioned & flat) ─────── */
const QuestionList = ({ qs, getQNum, AnswerLines, MarkingBlock, showMarkingScheme }) => (
  <div>
    {qs.map((q,qi)=>{
      const num    = getQNum();
      const hasSub = (q.subQuestions?.length||0)+(q.parts?.length||0)>0;
      return (
        <div key={q._id||qi} style={{marginBottom:20,paddingBottom:16,borderBottom:'1px solid #e8e8e8',breakInside:'avoid'}}>

          {/* passage */}
          {q.hasPassage&&q.passageText&&(
            <div style={{padding:'10px 14px',background:'#fafafa',border:'1px solid #e0e0e0',borderLeft:'3px solid #888',borderRadius:'0 4px 4px 0',marginBottom:10,fontStyle:'italic',fontSize:13,color:'#333',lineHeight:1.75}}>
              <div style={{fontSize:10,fontWeight:700,textTransform:'uppercase',letterSpacing:'.06em',color:'#888',marginBottom:5,fontStyle:'normal'}}>Read the passage and answer the questions:</div>
              {q.passageText}
            </div>
          )}

          {/* image */}
          {(q.hasImage||q.imageUrl)&&(
            <div style={{margin:'8px 0',textAlign:'center'}}>
              <img src={q.imageUrl||'https://via.placeholder.com/300x180?text=Figure'} alt="Figure"
                style={{maxWidth:'65%',maxHeight:180,objectFit:'contain',border:'1px solid #ccc',borderRadius:4}}/>
              {q.imageDescription&&<div style={{fontSize:11.5,fontStyle:'italic',color:'#666',marginTop:4}}>{q.imageDescription}</div>}
            </div>
          )}

          {/* main question row */}
          <div style={{display:'flex',alignItems:'flex-start'}}>
            <span style={{fontWeight:700,marginRight:8,minWidth:26,flexShrink:0,fontSize:14}}>{num}.</span>
            <div style={{flex:1}}>
              <div style={{display:'flex',justifyContent:'space-between',gap:12,alignItems:'flex-start'}}>
                <div style={{flex:1,fontSize:14,lineHeight:1.75}}>{q.question}</div>
                {q.marks&&!hasSub&&(
                  <div style={{fontSize:12,color:'#555',whiteSpace:'nowrap',flexShrink:0,marginTop:2}}>({q.marks} mark{q.marks!==1?'s':''})</div>
                )}
              </div>

              {/* MCQ options — 2-col when 4+ options */}
              {q.options?.length>0&&(
                <div style={{paddingLeft:8,marginTop:6,display:'grid',gridTemplateColumns:q.options.length>=4?'1fr 1fr':'1fr',gap:'3px 20px'}}>
                  {q.options.map((opt,oi)=>(
                    <div key={oi} style={{display:'flex',gap:8,alignItems:'flex-start',fontSize:13.5}}>
                      <span style={{fontWeight:700,minWidth:20,flexShrink:0}}>{String.fromCharCode(65+oi)}.</span>
                      <span>{opt}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* sub-questions */}
              {hasSub&&(q.subQuestions||q.parts||[]).map((sq,si)=>{
                const lbl = typeof sq.part==='string'&&sq.part.trim()?sq.part:`(${String.fromCharCode(97+si)})`;
                return (
                  <div key={si} style={{paddingLeft:18,marginTop:10,marginBottom:8}}>
                    <div style={{display:'flex',justifyContent:'space-between',gap:12}}>
                      <div style={{display:'flex',gap:8,flex:1}}>
                        <span style={{fontWeight:600,minWidth:26,flexShrink:0,fontSize:13.5}}>{lbl}</span>
                        <span style={{fontSize:13.5,lineHeight:1.72}}>{sq.question}</span>
                      </div>
                      {sq.marks&&<div style={{fontSize:12,color:'#555',flexShrink:0}}>({sq.marks} mark{sq.marks!==1?'s':''})</div>}
                    </div>
                    <AnswerLines marks={sq.marks}/>
                  </div>
                );
              })}

              {!hasSub&&!q.options?.length&&<AnswerLines marks={q.marks}/>}
              {showMarkingScheme&&<MarkingBlock q={q}/>}
            </div>
          </div>
        </div>
      );
    })}
  </div>
);

export default ExamPreview;