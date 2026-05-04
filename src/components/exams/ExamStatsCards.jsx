import React from 'react';
import { FileText, TrendingUp, BookOpen, Award } from 'lucide-react';

const CARDS = [
  { key:'totalExams',  label:'Total Exams',  icon:FileText,   accent:'#00FF7F' },
  { key:'thisMonth',   label:'This Month',   icon:TrendingUp, accent:'#00C8FF' },
  { key:'subjects',    label:'Subjects',     icon:BookOpen,   accent:'#9B6BFF' },
  { key:'_remaining', label:'Remaining',    icon:Award,      accent:'#FF9B3B' },
];

const ExamStatsCards = ({ stats = {} }) => (
  <>
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Syne:wght@700;800&family=Space+Mono&display=swap');
      @keyframes escFadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
    `}</style>
    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:14, marginBottom:24 }}>
      {CARDS.map(({ key, label, icon:Icon, accent }, i) => {
        const value = key === '_remaining'
          ? (stats.subscription?.examsRemaining ?? 0)
          : (stats[key] ?? 0);
        return (
          <div
            key={key}
            style={{ background:'#0D0F16', border:'1px solid #1A1D25', borderRadius:14, padding:'18px 20px', position:'relative', overflow:'hidden', transition:'all .25s', animation:`escFadeUp .4s ease ${i*70}ms both` }}
            onMouseEnter={e => { e.currentTarget.style.borderColor=`${accent}40`; e.currentTarget.style.boxShadow=`0 0 28px ${accent}0C`; e.currentTarget.style.transform='translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor='#1A1D25'; e.currentTarget.style.boxShadow='none'; e.currentTarget.style.transform='translateY(0)'; }}
          >
            {/* top accent strip */}
            <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:`linear-gradient(90deg,${accent}80,transparent)` }}/>

            <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:12 }}>
              <div style={{ width:36, height:36, borderRadius:10, background:`${accent}15`, border:`1px solid ${accent}25`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                <Icon size={16} color={accent}/>
              </div>
            </div>

            <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:32, letterSpacing:'-0.03em', color:'#E8E8E0', lineHeight:1, marginBottom:4 }}>
              {value.toLocaleString()}
            </div>
            <div style={{ fontSize:11, fontFamily:"'Space Mono',monospace", textTransform:'uppercase', letterSpacing:'0.08em', color:'#4A4D55' }}>
              {label}
            </div>
          </div>
        );
      })}
    </div>
  </>
);

export default ExamStatsCards;