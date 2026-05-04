import React, { useState } from 'react';
import { Edit3, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

const DIFFICULTY = {
  easy:   { color:'#00FF7F', label:'Easy'   },
  medium: { color:'#FF9B3B', label:'Medium' },
  hard:   { color:'#FF4444', label:'Hard'   },
};

const Tag = ({ label, color }) => (
  <span style={{ fontSize:10, fontFamily:"'Space Mono',monospace", textTransform:'uppercase', letterSpacing:'0.06em', padding:'3px 9px', background:`${color}15`, border:`1px solid ${color}28`, borderRadius:100, color, whiteSpace:'nowrap' }}>
    {label}
  </span>
);

const QuestionItem = ({ question, index, onEdit, onDelete }) => {
  const [expanded, setExpanded] = useState(false);
  const diff = DIFFICULTY[question.difficulty] || { color:'#5A5D65', label: question.difficulty || 'unknown' };
  const hasExtra = question.options?.length > 0 || question.correctAnswer || question.explanation;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Syne:wght@700;800&family=Space+Mono&display=swap');
        @keyframes qiExpand { from{opacity:0;transform:translateY(-4px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      <div
        style={{ borderBottom:'1px solid #1A1D25', padding:'16px 22px', transition:'background .2s' }}
        onMouseEnter={e => { e.currentTarget.style.background='#0A0C11'; }}
        onMouseLeave={e => { e.currentTarget.style.background='transparent'; }}
      >
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:14 }}>

          {/* left */}
          <div style={{ flex:1, minWidth:0 }}>
            {/* tags */}
            <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:10 }}>
              {question.subject && <Tag label={question.subject} color="#00C8FF"/>}
              {question.topic   && <Tag label={question.topic}   color="#9B6BFF"/>}
              {question.marks   && <Tag label={`${question.marks} mk${question.marks !== 1 ? 's' : ''}`} color="#00FF7F"/>}
              <Tag label={diff.label} color={diff.color}/>
            </div>

            {/* question text */}
            <p style={{ fontSize:14, color:'#C8C8C0', lineHeight:1.7, marginBottom: hasExtra ? 10 : 0 }}>
              {question.question}
            </p>

            {/* expandable details */}
            {hasExtra && (
              <>
                <button
                  onClick={() => setExpanded(p => !p)}
                  style={{ display:'inline-flex', alignItems:'center', gap:5, background:'none', border:'none', color:'#4A4D55', fontSize:12, fontFamily:"'DM Sans',sans-serif", cursor:'pointer', padding:0, transition:'color .2s' }}
                  onMouseEnter={e => e.currentTarget.style.color='#9A9A90'}
                  onMouseLeave={e => e.currentTarget.style.color='#4A4D55'}
                >
                  {expanded ? <ChevronUp size={12}/> : <ChevronDown size={12}/>}
                  {expanded ? 'Hide details' : 'Show details'}
                </button>

                {expanded && (
                  <div style={{ marginTop:12, animation:'qiExpand .2s ease forwards' }}>
                    {/* options */}
                    {question.options?.length > 0 && (
                      <div style={{ marginBottom:10 }}>
                        {question.options.map((opt, i) => (
                          <div key={i} style={{ display:'flex', alignItems:'center', gap:8, padding:'5px 0', fontSize:13, color:'#7A7A70' }}>
                            <span style={{ width:20, height:20, borderRadius:6, background:'#1A1D25', border:'1px solid #2A2D35', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontFamily:"'Space Mono',monospace", color:'#5A5D65', flexShrink:0 }}>
                              {String.fromCharCode(65 + i)}
                            </span>
                            {opt}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* answer */}
                    {question.correctAnswer && (
                      <p style={{ fontSize:12, color:'#6A6A62', lineHeight:1.65, marginBottom:4 }}>
                        <span style={{ color:'#00FF7F', fontWeight:600 }}>Answer: </span>{question.correctAnswer}
                      </p>
                    )}

                    {/* explanation */}
                    {question.explanation && (
                      <p style={{ fontSize:12, color:'#6A6A62', lineHeight:1.65 }}>
                        <span style={{ color:'#9A9A90', fontWeight:600 }}>Explanation: </span>{question.explanation}
                      </p>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          {/* action buttons */}
          <div style={{ display:'flex', gap:4, flexShrink:0 }}>
            <button
              onClick={() => onEdit(question._id)}
              title="Edit Question"
              style={{ width:32, height:32, borderRadius:8, background:'none', border:'1px solid transparent', color:'#4A4D55', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', transition:'all .2s' }}
              onMouseEnter={e => { e.currentTarget.style.background='#00C8FF15'; e.currentTarget.style.borderColor='#00C8FF30'; e.currentTarget.style.color='#00C8FF'; }}
              onMouseLeave={e => { e.currentTarget.style.background='none'; e.currentTarget.style.borderColor='transparent'; e.currentTarget.style.color='#4A4D55'; }}
            >
              <Edit3 size={14}/>
            </button>
            <button
              onClick={() => onDelete(question._id)}
              title="Delete Question"
              style={{ width:32, height:32, borderRadius:8, background:'none', border:'1px solid transparent', color:'#4A4D55', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', transition:'all .2s' }}
              onMouseEnter={e => { e.currentTarget.style.background='#FF444415'; e.currentTarget.style.borderColor='#FF444430'; e.currentTarget.style.color='#FF6666'; }}
              onMouseLeave={e => { e.currentTarget.style.background='none'; e.currentTarget.style.borderColor='transparent'; e.currentTarget.style.color='#4A4D55'; }}
            >
              <Trash2 size={14}/>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default QuestionItem;