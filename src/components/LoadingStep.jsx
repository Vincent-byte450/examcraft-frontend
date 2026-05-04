import React from 'react';
import { Wand2, BookOpen, CheckCircle, FileText, Sparkles } from 'lucide-react';

const STEPS = [
  { threshold: 0,  icon: Wand2,        label: 'Generating questions',           accent: '#00FF7F' },
  { threshold: 30, icon: BookOpen,      label: 'Analysing curriculum',           accent: '#00C8FF' },
  { threshold: 60, icon: FileText,      label: 'Creating marking schemes',       accent: '#9B6BFF' },
  { threshold: 90, icon: CheckCircle,   label: 'Finalising exam',                accent: '#FF9B3B' },
];

const LoadingStep = ({ examData, generationProgress = 0 }) => {
  const pct      = Math.min(100, Math.max(0, generationProgress));
  const stepIdx  = STEPS.reduce((acc, s, i) => (pct >= s.threshold ? i : acc), 0);
  const step     = STEPS[stepIdx];
  const Icon     = step.icon;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Syne:wght@700;800&family=Space+Mono&display=swap');
        *,*::before,*::after{box-sizing:border-box;}
        @keyframes lsSpin  { to{transform:rotate(360deg)} }
        @keyframes lsPulse { 0%,100%{opacity:.3;transform:scale(.85)} 50%{opacity:1;transform:scale(1)} }
        @keyframes lsFadeUp{ from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes lsDot   { 0%,80%,100%{transform:scale(0);opacity:0} 40%{transform:scale(1);opacity:1} }
        @keyframes lsSweep { from{left:-40%} to{left:140%} }
      `}</style>

      <div style={{ maxWidth: 560, margin: '0 auto', fontFamily: "'DM Sans','Helvetica Neue',sans-serif", animation: 'lsFadeUp .4s ease forwards' }}>
        <div style={{ background: '#0D0F16', border: '1px solid #1A1D25', borderRadius: 20, padding: '44px 40px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>

          {/* dot grid bg */}
          <div style={{ position:'absolute',inset:0,backgroundImage:'radial-gradient(circle,#1A1D25 1px,transparent 1px)',backgroundSize:'28px 28px',opacity:.5,pointerEvents:'none' }}/>

          {/* ambient glow behind spinner */}
          <div style={{ position:'absolute',top:'15%',left:'50%',transform:'translateX(-50%)',width:200,height:200,borderRadius:'50%',background:`radial-gradient(circle,${step.accent}10 0%,transparent 70%)`,pointerEvents:'none',transition:'background .6s ease' }}/>

          {/* ── spinner ── */}
          <div style={{ position:'relative',width:80,height:80,margin:'0 auto 28px' }}>
            {/* outer ring */}
            <div style={{ position:'absolute',inset:0,borderRadius:'50%',border:`2px solid ${step.accent}20` }}/>
            {/* spinning arc */}
            <div style={{ position:'absolute',inset:0,borderRadius:'50%',border:`2px solid transparent`,borderTopColor:step.accent,animation:'lsSpin .9s linear infinite',transition:'border-top-color .4s ease' }}/>
            {/* inner ring counter-spin */}
            <div style={{ position:'absolute',inset:10,borderRadius:'50%',border:`1px solid ${step.accent}15`,borderBottomColor:step.accent,animation:'lsSpin 1.4s linear infinite reverse' }}/>
            {/* center icon */}
            <div style={{ position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center' }}>
              <Icon size={22} color={step.accent} style={{ animation:'lsPulse 2s ease infinite',transition:'color .4s ease' }}/>
            </div>
          </div>

          {/* ── heading ── */}
          <div style={{ fontSize:10,fontFamily:"'Space Mono',monospace",textTransform:'uppercase',letterSpacing:'0.12em',color:step.accent,marginBottom:10,transition:'color .4s ease' }}>
            AI-Powered Generation
          </div>
          <h2 style={{ fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:'clamp(20px,3vw,26px)',letterSpacing:'-0.02em',color:'#E8E8E0',marginBottom:8,lineHeight:1.1 }}>
            Generating Your Exam
          </h2>
          <p style={{ fontSize:13,color:'#6A6A62',marginBottom:28,lineHeight:1.65 }}>
            AI is crafting <span style={{ color:'#E8E8E0',fontWeight:600 }}>{examData?.numQuestions || '…'}</span> curriculum-aligned questions
            {examData?.subject && <> for <span style={{ color:'#E8E8E0',fontWeight:600 }}>{examData.subject}</span></>}…
          </p>

          {/* ── progress bar ── */}
          <div style={{ marginBottom:20 }}>
            <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:7 }}>
              <span style={{ fontSize:11,fontFamily:"'Space Mono',monospace",color:'#4A4D55',textTransform:'uppercase',letterSpacing:'0.08em' }}>Progress</span>
              <span style={{ fontSize:13,fontFamily:"'Space Mono',monospace",color:step.accent,fontWeight:700,transition:'color .4s ease' }}>{pct}%</span>
            </div>
            <div style={{ width:'100%',height:5,background:'#1A1D25',borderRadius:3,overflow:'hidden',position:'relative' }}>
              <div style={{ height:'100%',width:`${pct}%`,background:`linear-gradient(90deg,${step.accent}90,${step.accent})`,borderRadius:3,transition:'width .4s cubic-bezier(.16,1,.3,1),background .4s ease',position:'relative' }}>
                {/* shimmer sweep */}
                <div style={{ position:'absolute',top:0,bottom:0,width:'40%',background:'linear-gradient(90deg,transparent,rgba(255,255,255,.25),transparent)',animation:'lsSweep 1.6s linear infinite' }}/>
              </div>
            </div>
          </div>

          {/* ── step indicators ── */}
          <div style={{ display:'flex',alignItems:'center',justifyContent:'center',gap:6,marginBottom:22 }}>
            {STEPS.map((s, i) => {
              const done   = pct >= (STEPS[i+1]?.threshold ?? 100);
              const active = i === stepIdx;
              const SIcon  = s.icon;
              return (
                <div key={i} style={{ display:'flex',alignItems:'center',gap:6 }}>
                  <div style={{ width:28,height:28,borderRadius:'50%',background:done?`${s.accent}20`:active?`${s.accent}15`:'#1A1D25',border:`1px solid ${done||active?`${s.accent}40`:'#2A2D35'}`,display:'flex',alignItems:'center',justifyContent:'center',transition:'all .4s ease' }}>
                    <SIcon size={11} color={done||active?s.accent:'#3A3D45'}/>
                  </div>
                  {i < STEPS.length-1 && (
                    <div style={{ width:20,height:1,background:done?`${s.accent}50`:'#1A1D25',transition:'background .4s ease' }}/>
                  )}
                </div>
              );
            })}
          </div>

          {/* ── current step label ── */}
          <div style={{ display:'inline-flex',alignItems:'center',gap:8,padding:'9px 18px',background:'#080A0F',border:`1px solid ${step.accent}25`,borderRadius:100,fontSize:12,color:'#9A9A90',fontFamily:"'DM Sans',sans-serif",transition:'border-color .4s ease' }}>
            <div style={{ display:'flex',gap:4 }}>
              {[0,1,2].map(i=>(
                <div key={i} style={{ width:5,height:5,borderRadius:'50%',background:step.accent,animation:`lsDot 1.2s ease ${i*.2}s infinite`,transition:'background .4s ease' }}/>
              ))}
            </div>
            {step.label}
          </div>

          {/* ── tips ── */}
          <div style={{ marginTop:24,padding:'12px 16px',background:'#080A0F',border:'1px solid #1A1D25',borderRadius:10,textAlign:'left' }}>
            <div style={{ fontSize:10,fontFamily:"'Space Mono',monospace",textTransform:'uppercase',letterSpacing:'0.08em',color:'#3A3D45',marginBottom:6,display:'flex',alignItems:'center',gap:5 }}>
              <Sparkles size={10} color="#3A3D45"/> Did you know?
            </div>
            <p style={{ fontSize:12,color:'#5A5D65',lineHeight:1.65,margin:0 }}>
              Each question is tailored to the Kenyan curriculum and includes a marking scheme with expected answers and difficulty grading.
            </p>
          </div>

        </div>
      </div>
    </>
  );
};

export default LoadingStep;