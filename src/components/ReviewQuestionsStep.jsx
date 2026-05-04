import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { Download, RefreshCw, FileText, AlertCircle, ArrowLeft } from 'lucide-react';
import { useGlobals } from "./Globals";
import QuestionCard from './QuestionCard';
import EditQuestionModal from './EditQuestionModal';
import AdBanner from './AdBanner';

const StatCell = ({ label, value, color='#E8E8E0' }) => (
  <div>
    <div style={{ fontSize:10, fontFamily:"'Space Mono',monospace", textTransform:'uppercase', letterSpacing:'0.08em', color:'#4A4D55', marginBottom:4 }}>{label}</div>
    <div style={{ fontSize:14, fontWeight:600, color, fontFamily:"'Syne',sans-serif" }}>{value||'N/A'}</div>
  </div>
);

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

const ReviewQuestionsStep = ({
  examData,
  generatedQuestions,
  setGeneratedQuestions,
  onBackToSetup,
  onProceedToPayment,
  onRegenerateAll,
  onRegenerateQuestion,
}) => {
  const [editingQuestion, setEditingQuestion] = useState(null);
  const { updateExam } = useGlobals();

  const questionsArray = Array.isArray(generatedQuestions) ? generatedQuestions : [];
  const totalMarks = questionsArray.reduce((s, q) => s + (q?.marks || 0), 0);

  if (!examData) return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Syne:wght@700;800&family=Space+Mono&display=swap');`}</style>
      <div style={{ maxWidth:900, margin:'0 auto', fontFamily:"'DM Sans',sans-serif" }}>
        <div style={{ display:'flex',alignItems:'center',gap:10,padding:'14px 18px',background:'#FF44440A',border:'1px solid #FF444430',borderRadius:12,marginBottom:16 }}>
          <AlertCircle size={15} color="#FF6666"/>
          <div>
            <div style={{ fontSize:13,fontWeight:600,color:'#FF6666' }}>Error: Missing Exam Data</div>
            <div style={{ fontSize:12,color:'#5A5D65',marginTop:2 }}>Exam configuration data is not available.</div>
          </div>
        </div>
        <button onClick={onBackToSetup} style={{ fontSize:13,color:'#00C8FF',background:'none',border:'none',cursor:'pointer',fontFamily:"'DM Sans',sans-serif",textDecoration:'underline',textUnderlineOffset:3 }}>
          Back to Setup
        </button>
      </div>
    </>
  );

  const deleteQuestion = (questionId) => {
    if (!Array.isArray(generatedQuestions)) return;
    const next = generatedQuestions.filter(q => q.id !== questionId);
    setGeneratedQuestions(next);
    updateExam(examData._id, { ...examData, questions:next, updatedAt:new Date() });
  };

  const handleEditQuestion = useCallback(async (updatedQuestion) => {
    try {
      const updatedQs = examData.questions.map(q => q._id === updatedQuestion.id ? updatedQuestion : q);
      setGeneratedQuestions(updatedQs);
      const result = await updateExam(examData._id, { ...examData, questions:updatedQs, updatedAt:new Date() });
      if (!result.success) { setGeneratedQuestions(examData.questions); return; }
    } catch { setGeneratedQuestions(examData.questions); return; }
    setEditingQuestion(null);
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Syne:wght@700;800&family=Space+Mono&display=swap');
        *,*::before,*::after{box-sizing:border-box;}
        @keyframes rqsUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
      `}</style>

      <div style={{ maxWidth:1100, margin:'0 auto', fontFamily:"'DM Sans','Helvetica Neue',sans-serif", color:'#E8E8E0', animation:'rqsUp .4s ease forwards', paddingBottom:40 }}>

        <div style={{ position:'relative',background:'#0D0F16',border:'1px solid #1A1D25',borderRadius:16,padding:'28px 32px',marginBottom:16,overflow:'hidden' }}>
          <div style={{ position:'absolute',inset:0,backgroundImage:'radial-gradient(circle,#1A1D25 1px,transparent 1px)',backgroundSize:'28px 28px',opacity:.5,pointerEvents:'none' }}/>
          <div style={{ position:'absolute',top:-60,right:-60,width:220,height:220,borderRadius:'50%',background:'radial-gradient(circle,#00C8FF08 0%,transparent 70%)',pointerEvents:'none' }}/>
          <div style={{ position:'relative',display:'flex',alignItems:'flex-start',justifyContent:'space-between',flexWrap:'wrap',gap:16 }}>
            <div>
              <div style={{ fontSize:10,fontFamily:"'Space Mono',monospace",textTransform:'uppercase',letterSpacing:'0.12em',color:'#00C8FF',marginBottom:8 }}>Review Questions</div>
              <h1 style={{ fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:'clamp(20px,3vw,28px)',letterSpacing:'-0.03em',color:'#E8E8E0',marginBottom:6,lineHeight:1.05 }}>
                {examData.title||examData.subject||'Generated Exam'}
              </h1>
              <div style={{ fontSize:13,color:'#6A6A62' }}>
                {examData.subject}{examData.classLevel&&` \xB7 ${examData.classLevel}`}{examData.curriculum&&` \xB7 ${examData.curriculum}`}
              </div>
            </div>
            <div style={{ display:'flex',gap:10,flexWrap:'wrap' }}>
              <button onClick={onBackToSetup}
                style={{ display:'flex',alignItems:'center',gap:7,padding:'10px 18px',background:'transparent',border:'1px solid #1A1D25',borderRadius:100,color:'#6A6A62',fontSize:13,cursor:'pointer',fontFamily:"'DM Sans',sans-serif",transition:'all .2s' }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor='#2A2D35';e.currentTarget.style.color='#E8E8E0';}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor='#1A1D25';e.currentTarget.style.color='#6A6A62';}}>
                <ArrowLeft size={13}/> Back to Setup
              </button>
              {questionsArray.length > 0 && (
                <button onClick={onProceedToPayment}
                  style={{ display:'flex',alignItems:'center',gap:7,padding:'10px 22px',background:'#00FF7F',border:'none',borderRadius:100,color:'#080A0F',fontSize:13,fontWeight:700,cursor:'pointer',fontFamily:"'DM Sans',sans-serif",boxShadow:'0 4px 20px #00FF7F20',transition:'all .2s' }}
                  onMouseEnter={e=>{e.currentTarget.style.background='#33FF99';e.currentTarget.style.transform='translateY(-1px)';}}
                  onMouseLeave={e=>{e.currentTarget.style.background='#00FF7F';e.currentTarget.style.transform='translateY(0)';}}>
                  <Download size={13}/> Proceed to Payment
                </button>
              )}
            </div>
          </div>
        </div>

        <AdBanner/>

        <div style={{ background:'#0D0F16',border:'1px solid #1A1D25',borderRadius:14,padding:'20px 24px',marginBottom:16 }}>
          <div style={{ fontSize:10,fontFamily:"'Space Mono',monospace",textTransform:'uppercase',letterSpacing:'0.1em',color:'#00C8FF',marginBottom:16,paddingBottom:10,borderBottom:'1px solid #1A1D25' }}>Exam Summary</div>
          <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(130px,1fr))',gap:'12px 24px' }}>
            <StatCell label="Subject"    value={examData.subject}               color="#E8E8E0"/>
            <StatCell label="Questions"  value={questionsArray.length}          color="#00FF7F"/>
            <StatCell label="Total Marks"value={totalMarks}                     color="#9B6BFF"/>
            <StatCell label="Duration"   value={examData.duration?`${examData.duration} min`:null} color="#FF9B3B"/>
            <StatCell label="Topics"     value={Array.isArray(examData.topics)&&examData.topics.length>0?examData.topics.join(', '):null} color="#00C8FF"/>
          </div>
        </div>

        <div style={{ background:'#0D0F16',border:'1px solid #1A1D25',borderRadius:14,overflow:'hidden' }}>
          <div style={{ padding:'16px 24px',borderBottom:'1px solid #1A1D25',display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:12 }}>
            <div style={{ display:'flex',alignItems:'center',gap:12 }}>
              <div style={{ width:34,height:34,borderRadius:9,background:'#00C8FF15',border:'1px solid #00C8FF25',display:'flex',alignItems:'center',justifyContent:'center' }}>
                <FileText size={15} color="#00C8FF"/>
              </div>
              <div>
                <div style={{ fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:15,color:'#E8E8E0' }}>Generated Questions</div>
                <div style={{ fontSize:11,fontFamily:"'Space Mono',monospace",color:'#4A4D55' }}>{questionsArray.length} questions</div>
              </div>
            </div>
            {questionsArray.length > 0 && onRegenerateAll && (
              <button onClick={onRegenerateAll}
                style={{ display:'flex',alignItems:'center',gap:7,padding:'7px 14px',background:'transparent',border:'1px solid #1A1D25',borderRadius:100,color:'#6A6A62',fontSize:12,cursor:'pointer',fontFamily:"'DM Sans',sans-serif",transition:'all .2s' }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor='#2A2D35';e.currentTarget.style.color='#E8E8E0';}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor='#1A1D25';e.currentTarget.style.color='#6A6A62';}}>
                <RefreshCw size={12}/> Regenerate All
              </button>
            )}
          </div>

          {questionsArray.length > 0 ? (
            <div>
              {questionsArray.map((question, index) => (
                <QuestionCard
                  key={question?.id||index}
                  question={question}
                  index={index}
                  onRegenerate={onRegenerateQuestion}
                  onEdit={(questionId) => {
                    const found = questionsArray.find(q => q.id === questionId);
                    setEditingQuestion(found);
                  }}
                  onDelete={deleteQuestion}
                />
              ))}
            </div>
          ) : (
            <div style={{ padding:'56px 32px',textAlign:'center' }}>
              <div style={{ width:56,height:56,borderRadius:'50%',background:'#1A1D25',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 16px' }}>
                <FileText size={24} color="#3A3D45"/>
              </div>
              <div style={{ fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:17,color:'#E8E8E0',marginBottom:6 }}>No Questions Generated</div>
              <p style={{ fontSize:13,color:'#5A5D65',marginBottom:20 }}>
                {!Array.isArray(generatedQuestions)?'There was an error processing the generated questions.':'No questions have been generated yet.'}
              </p>
              <button onClick={onBackToSetup}
                style={{ fontSize:13,color:'#00C8FF',background:'none',border:'none',cursor:'pointer',fontFamily:"'DM Sans',sans-serif",textDecoration:'underline',textUnderlineOffset:3 }}>
                Back to Setup
              </button>
            </div>
          )}
        </div>

        {editingQuestion && (
          <ModalPortal
            question={editingQuestion}
            onSave={handleEditQuestion}
            onCancel={()=>setEditingQuestion(null)}
          />
        )}
      </div>
    </>
  );
};

export default ReviewQuestionsStep;