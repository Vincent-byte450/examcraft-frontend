import { useState } from 'react';
import { BookOpen, FileText, Clock, Calendar, Download, Eye, Edit3, Trash2, Loader } from 'lucide-react';
import ExamDownloadModal from './ExamDownloadModal';

const STATUS_STYLE = {
  completed: { color:'#00FF7F', bg:'#00FF7F15', border:'#00FF7F30' },
  published:  { color:'#00C8FF', bg:'#00C8FF15', border:'#00C8FF30' },
  draft:      { color:'#FF9B3B', bg:'#FF9B3B15', border:'#FF9B3B30' },
};

const isNew = (d) => d && new Date(d) > new Date(Date.now() - 7*24*60*60*1000);

const MetaRow = ({ icon: Icon, text }) => (
  <div style={{ display:'flex', alignItems:'center', gap:7, fontSize:12, color:'#6A6A62' }}>
    <Icon size={12} color="#4A4D55"/>{text}
  </div>
);

const ActionBtn = ({ onClick, title, hoverColor, disabled, children }) => (
  <button
    onClick={onClick} title={title} disabled={disabled}
    style={{ width:32, height:32, display:'flex', alignItems:'center', justifyContent:'center', background:'none', border:'1px solid transparent', borderRadius:8, color:'#4A4D55', cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? .5 : 1, transition:'all .18s' }}
    onMouseEnter={e => { if (!disabled) { e.currentTarget.style.background=`${hoverColor}15`; e.currentTarget.style.borderColor=`${hoverColor}30`; e.currentTarget.style.color=hoverColor; }}}
    onMouseLeave={e => { e.currentTarget.style.background='none'; e.currentTarget.style.borderColor='transparent'; e.currentTarget.style.color='#4A4D55'; }}
  >
    {children}
  </button>
);

const ExamListItem = ({ exam, onView, onEdit, onDelete, onDownload }) => {
  const [showModal, setShowModal] = useState(false);
  const [hovered, setHovered]     = useState(false);

  const status   = STATUS_STYLE[exam.status] || STATUS_STYLE.draft;
  const dateStr  = exam.createdAt ? new Date(exam.createdAt).toLocaleDateString('en-KE', { year:'numeric', month:'short', day:'numeric' }) : '—';

  return (
    <>
      <ExamDownloadModal
        open={showModal}
        onClose={() => setShowModal(false)}
        exam={exam}
        onConfirm={cfg => { onDownload(exam._id, exam.title, cfg.format); setShowModal(false); }}
      />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Syne:wght@700;800&family=Space+Mono&display=swap');
        @keyframes eliSpin { to { transform: rotate(360deg); } }
      `}</style>

      <div
        style={{ padding:'18px 22px', borderBottom:'1px solid #1A1D25', transition:'background .2s', background: hovered ? '#0A0C11' : 'transparent' }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:16 }}>

          {/* left */}
          <div style={{ flex:1, minWidth:0 }}>

            {/* title + badges */}
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10, flexWrap:'wrap' }}>
              <h3 style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:15, color:'#E8E8E0', letterSpacing:'-0.01em', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', maxWidth:420 }}>
                {exam.title}
              </h3>
              <span style={{ fontSize:10, fontFamily:"'Space Mono',monospace", textTransform:'uppercase', letterSpacing:'0.06em', padding:'3px 9px', background:status.bg, border:`1px solid ${status.border}`, borderRadius:100, color:status.color, whiteSpace:'nowrap' }}>
                {exam.status}
              </span>
              {isNew(exam.createdAt) && (
                <span style={{ fontSize:10, fontFamily:"'Space Mono',monospace", textTransform:'uppercase', letterSpacing:'0.06em', padding:'3px 9px', background:'#9B6BFF15', border:'1px solid #9B6BFF30', borderRadius:100, color:'#9B6BFF' }}>New</span>
              )}
            </div>

            {/* meta grid */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:'6px 28px', marginBottom: exam.topics?.length || exam.instructions ? 10 : 0 }}>
              <MetaRow icon={BookOpen} text={`${exam.subject} · ${exam.curriculum}`}/>
              <MetaRow icon={FileText} text={`${exam.totalQuestions||0} questions · ${exam.totalMarks||0} marks`}/>
              <MetaRow icon={Clock}    text={`${exam.duration} minutes`}/>
              <MetaRow icon={Calendar} text={`Created ${dateStr}`}/>
              <MetaRow icon={Download} text={`${exam.downloads||0} downloads`}/>
            </div>

            {/* topics */}
            {exam.topics?.length > 0 && (
              <div style={{ display:'flex', alignItems:'center', gap:6, flexWrap:'wrap', marginBottom: exam.instructions ? 8 : 0 }}>
                <span style={{ fontSize:10, color:'#3A3D45', fontFamily:"'Space Mono',monospace", textTransform:'uppercase', letterSpacing:'0.06em' }}>Topics:</span>
                {exam.topics.slice(0,3).map((t,i) => (
                  <span key={i} style={{ fontSize:11, padding:'2px 8px', background:'#1A1D25', border:'1px solid #2A2D35', borderRadius:100, color:'#6A6A62' }}>{t}</span>
                ))}
                {exam.topics.length > 3 && <span style={{ fontSize:11, color:'#4A4D55' }}>+{exam.topics.length-3} more</span>}
              </div>
            )}

            {/* instructions snippet */}
            {exam.instructions && (
              <div style={{ fontSize:12, color:'#5A5D65', background:'#080A0F', border:'1px solid #1A1D25', borderRadius:8, padding:'8px 12px', marginTop:8, lineHeight:1.65 }}>
                <span style={{ color:'#4A4D55', fontWeight:600 }}>Instructions: </span>
                {exam.instructions.substring(0,150)}{exam.instructions.length > 150 ? '…' : ''}
              </div>
            )}
          </div>

          {/* action buttons */}
          <div style={{ display:'flex', flexDirection:'column', gap:4, flexShrink:0 }}>
            {/* <ActionBtn onClick={() => onView(exam._id)} title="View Exam" hoverColor="#00C8FF"><Eye size={14}/></ActionBtn> */}
            <ActionBtn onClick={() => onEdit(exam.id)} title="Edit Exam"  hoverColor="#00FF7F"><Edit3 size={14}/></ActionBtn>
            <ActionBtn onClick={() => setShowModal(true)} title="Download"  hoverColor="#9B6BFF" disabled={exam.isDownloading}>
              {exam.isDownloading
                ? <Loader size={14} style={{ animation:'eliSpin .8s linear infinite' }}/>
                : <Download size={14}/>
              }
            </ActionBtn>
            <ActionBtn onClick={() => onDelete(exam.id, exam.title)} title="Delete Exam" hoverColor="#FF4444"><Trash2 size={14}/></ActionBtn>
          </div>
        </div>
      </div>
    </>
  );
};

export default ExamListItem;