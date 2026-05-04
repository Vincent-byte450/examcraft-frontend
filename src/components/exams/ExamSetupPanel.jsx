import React, { useRef, useState } from "react";
import { Upload, Image as ImageIcon, Trash2 } from "lucide-react";

const LABEL = { display:'block', fontSize:10, fontFamily:"'Space Mono',monospace", textTransform:'uppercase', letterSpacing:'0.08em', color:'#4A4D55', marginBottom:7 };

const FInput = ({ value, onChange, placeholder, type='text' }) => {
  const [f, setF] = useState(false);
  return (
    <input type={type} value={value||''} onChange={onChange} placeholder={placeholder}
      onFocus={() => setF(true)} onBlur={() => setF(false)}
      style={{ width:'100%', padding:'10px 12px', background: f?'#0F1410':'#080A0F', border:`1px solid ${f?'#00FF7F50':'#1A1D25'}`, borderRadius:10, color:'#E8E8E0', fontSize:13, fontFamily:"'DM Sans',sans-serif", outline:'none', transition:'all .2s', boxSizing:'border-box', boxShadow: f?'0 0 0 3px #00FF7F0D':'none' }}
    />
  );
};

const FSelect = ({ value, onChange, children }) => {
  const [f, setF] = useState(false);
  return (
    <select value={value||''} onChange={onChange} onFocus={() => setF(true)} onBlur={() => setF(false)}
      style={{ width:'100%', padding:'10px 12px', background: f?'#0F1410':'#080A0F', border:`1px solid ${f?'#00FF7F50':'#1A1D25'}`, borderRadius:10, color: value?'#E8E8E0':'#3A3D45', fontSize:13, fontFamily:"'DM Sans',sans-serif", outline:'none', cursor:'pointer', appearance:'none', transition:'all .2s', boxSizing:'border-box', boxShadow: f?'0 0 0 3px #00FF7F0D':'none' }}
    >
      {children}
    </select>
  );
};

const FTextarea = ({ value, onChange, placeholder, rows=3 }) => {
  const [f, setF] = useState(false);
  return (
    <textarea rows={rows} value={value||''} onChange={onChange} placeholder={placeholder}
      onFocus={() => setF(true)} onBlur={() => setF(false)}
      style={{ width:'100%', padding:'10px 12px', background: f?'#0F1410':'#080A0F', border:`1px solid ${f?'#00FF7F50':'#1A1D25'}`, borderRadius:10, color:'#E8E8E0', fontSize:13, fontFamily:"'DM Sans',sans-serif", outline:'none', resize:'vertical', lineHeight:1.65, transition:'all .2s', boxSizing:'border-box', boxShadow: f?'0 0 0 3px #00FF7F0D':'none' }}
    />
  );
};

const Row = ({ children, cols=2 }) => (
  <div style={{ display:'grid', gridTemplateColumns:`repeat(${cols},1fr)`, gap:16, marginBottom:18 }}>
    {children}
  </div>
);

const Field = ({ label, children }) => (
  <div>
    <label style={LABEL}>{label}</label>
    {children}
  </div>
);

const ExamSetupPanel = ({ exam={}, onChange }) => {
  const fileInputRef = useRef(null);

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => onChange("schoolLogo", reader.result);
    reader.readAsDataURL(file);
  };

  const removeLogo = () => {
    onChange("schoolLogo", "");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Syne:wght@700;800&family=Space+Mono&display=swap');
        * { box-sizing:border-box; }
        select option { background:#0D0F16; color:#E8E8E0; }
        input::placeholder, textarea::placeholder { color:#3A3D45; }
        @media (max-width:600px) { .esp-row { grid-template-columns: 1fr !important; } }
      `}</style>

      <div style={{ maxWidth:720, margin:'0 auto', fontFamily:"'DM Sans','Helvetica Neue',sans-serif", color:'#E8E8E0' }}>

        {/* section heading */}
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:24, paddingBottom:18, borderBottom:'1px solid #1A1D25' }}>
          <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:18, letterSpacing:'-0.02em', color:'#E8E8E0' }}>Exam Information</div>
        </div>

        {/* school logo upload */}
        <div style={{ marginBottom:24, padding:'18px 20px', background:'#080A0F', border:'1px solid #1A1D25', borderRadius:12 }}>
          <label style={{ ...LABEL, marginBottom:12 }}>School Logo (optional)</label>
          {exam.schoolLogo ? (
            <div style={{ display:'flex', alignItems:'center', gap:14 }}>
              <img src={exam.schoolLogo} alt="School logo" style={{ height:56, borderRadius:8, border:'1px solid #2A2D35', objectFit:'contain', background:'#fff' }}/>
              <button onClick={removeLogo} style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 14px', background:'#FF444415', border:'1px solid #FF444430', borderRadius:100, color:'#FF6666', fontSize:12, cursor:'pointer', fontFamily:"'DM Sans',sans-serif" }}>
                <Trash2 size={12}/> Remove
              </button>
            </div>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'9px 18px', background:'transparent', border:'1px dashed #2A2D35', borderRadius:10, color:'#5A5D65', fontSize:13, cursor:'pointer', fontFamily:"'DM Sans',sans-serif", transition:'all .2s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor='#00FF7F40'; e.currentTarget.style.color='#00FF7F'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor='#2A2D35'; e.currentTarget.style.color='#5A5D65'; }}
            >
              <Upload size={14}/> Upload Logo
            </button>
          )}
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleLogoUpload} style={{ display:'none' }}/>
        </div>

        {/* basic info */}
        <div className="esp-row" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:18 }}>
          <Field label="School Name"><FInput value={exam.schoolName} onChange={e => onChange("schoolName", e.target.value)} placeholder="e.g. Prestige Academy"/></Field>
          <Field label="Exam Title"><FInput value={exam.title} onChange={e => onChange("title", e.target.value)} placeholder="e.g. Mid-Term Mathematics"/></Field>
        </div>

        <div className="esp-row" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:18 }}>
          <Field label="Subject"><FInput value={exam.subject} onChange={e => onChange("subject", e.target.value)} placeholder="e.g. Business Studies"/></Field>
          <Field label="Class / Grade"><FInput value={exam.classLevel} onChange={e => onChange("classLevel", e.target.value)} placeholder="e.g. Form 4"/></Field>
        </div>

        <div className="esp-row" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:18 }}>
          <Field label="Term">
            <FSelect value={exam.term} onChange={e => onChange("term", e.target.value)}>
              <option value="">Select Term</option>
              <option value="Term I">Term I</option>
              <option value="Term II">Term II</option>
              <option value="Term III">Term III</option>
            </FSelect>
          </Field>
          <Field label="Paper Type">
            <FSelect value={exam.paperType} onChange={e => onChange("paperType", e.target.value)}>
              <option value="">Select Paper</option>
              <option value="Single">Single</option>
              <option value="Paper 1">Paper 1</option>
              <option value="Paper 2">Paper 2</option>
              <option value="Paper 3">Paper 3</option>
            </FSelect>
          </Field>
        </div>

        <div className="esp-row" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:18 }}>
          <Field label="Duration (minutes)"><FInput type="number" value={exam.duration} onChange={e => onChange("duration", Number(e.target.value))} placeholder="e.g. 90"/></Field>
          <Field label="Curriculum">
            <FSelect value={exam.curriculum} onChange={e => onChange("curriculum", e.target.value)}>
              <option value="">Select Curriculum</option>
              <option value="JSS">Junior Secondary School</option>
              <option value="Secondary">Secondary School</option>
            </FSelect>
          </Field>
        </div>

        <div style={{ marginBottom:18 }}>
          <Field label="Examiner / Teacher"><FInput value={exam.examiner} onChange={e => onChange("examiner", e.target.value)} placeholder="e.g. Mr. Kiptoo"/></Field>
        </div>

        <div style={{ marginBottom:0 }}>
          <Field label="Exam Instructions"><FTextarea rows={3} value={exam.instructions} onChange={e => onChange("instructions", e.target.value)} placeholder="e.g. Answer ALL questions in the spaces provided…"/></Field>
        </div>
      </div>
    </>
  );
};

export default ExamSetupPanel;