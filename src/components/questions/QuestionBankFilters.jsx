import React from 'react';
import { Search, Filter, RefreshCw } from 'lucide-react';

const LABEL_STYLE = { display:'block', fontSize:10, fontFamily:"'Space Mono',monospace", textTransform:'uppercase', letterSpacing:'0.08em', color:'#4A4D55', marginBottom:7 };

const Select = ({ value, onChange, disabled, children }) => (
  <select
    value={value}
    onChange={onChange}
    disabled={disabled}
    style={{ width:'100%', padding:'10px 12px', background: disabled ? '#0A0C11' : '#0D0F16', border:'1px solid #1A1D25', borderRadius:10, color: disabled ? '#3A3D45' : '#E8E8E0', fontSize:13, fontFamily:"'DM Sans',sans-serif", outline:'none', cursor: disabled ? 'not-allowed' : 'pointer', appearance:'none', transition:'border-color .2s' }}
    onFocus={e => { e.currentTarget.style.borderColor='#00FF7F50'; e.currentTarget.style.boxShadow='0 0 0 3px #00FF7F10'; }}
    onBlur={e =>  { e.currentTarget.style.borderColor='#1A1D25';   e.currentTarget.style.boxShadow='none'; }}
  >
    {children}
  </select>
);

const QuestionBankFilters = ({
  selectedCurriculum, setSelectedCurriculum,
  selectedSubject,    setSelectedSubject,
  selectedTopic,      setSelectedTopic,
  selectedDifficulty, setSelectedDifficulty,
  searchTerm,         setSearchTerm,
  availableSubjects,  availableTopics,
  onSearch, onClear, onRefresh,
}) => {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Space+Mono&display=swap');
        select option { background: #0D0F16; color: #E8E8E0; }
      `}</style>

      <div style={{ background:'#0D0F16', border:'1px solid #1A1D25', borderRadius:14, padding:'20px 22px', marginBottom:20 }}>

        {/* filter grid */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:14, marginBottom:16 }}>

          {/* curriculum */}
          <div>
            <label style={LABEL_STYLE}>Curriculum</label>
            <Select value={selectedCurriculum} onChange={e => setSelectedCurriculum(e.target.value)}>
              <option value="Lower Primary">Lower Primary</option>
              <option value="Upper Primary">Upper Primary</option>
              <option value="JSS">Junior Secondary</option>
              <option value="Senior School">Senior School</option>
              <option value="Secondary">Secondary</option>
            </Select>
          </div>

          {/* subject */}
          <div>
            <label style={LABEL_STYLE}>Subject</label>
            <Select value={selectedSubject} onChange={e => { setSelectedSubject(e.target.value); setSelectedTopic(''); }}>
              <option value="">All Subjects</option>
              {availableSubjects.map(s => <option key={s} value={s}>{s}</option>)}
            </Select>
          </div>

          {/* topic */}
          <div>
            <label style={LABEL_STYLE}>Topic</label>
            <Select value={selectedTopic} onChange={e => setSelectedTopic(e.target.value)} disabled={!selectedSubject}>
              <option value="">All Topics</option>
              {availableTopics.map(t => <option key={t} value={t}>{t}</option>)}
            </Select>
          </div>

          {/* difficulty */}
          <div>
            <label style={LABEL_STYLE}>Difficulty</label>
            <Select value={selectedDifficulty} onChange={e => setSelectedDifficulty(e.target.value)}>
              <option value="">All Levels</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </Select>
          </div>

          {/* search */}
          <div>
            <label style={LABEL_STYLE}>Search</label>
            <div style={{ position:'relative' }}>
              <Search size={13} color="#3A3D45" style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }}/>
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && onSearch()}
                placeholder="Search questions…"
                style={{ width:'100%', padding:'10px 12px 10px 34px', background:'#0D0F16', border:'1px solid #1A1D25', borderRadius:10, color:'#E8E8E0', fontSize:13, fontFamily:"'DM Sans',sans-serif", outline:'none', transition:'border-color .2s' }}
                onFocus={e => { e.currentTarget.style.borderColor='#00FF7F50'; e.currentTarget.style.boxShadow='0 0 0 3px #00FF7F10'; }}
                onBlur={e =>  { e.currentTarget.style.borderColor='#1A1D25';   e.currentTarget.style.boxShadow='none'; }}
              />
              <style>{`input::placeholder { color: #3A3D45; }`}</style>
            </div>
          </div>
        </div>

        {/* action row */}
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          <button
            onClick={onSearch}
            style={{ display:'flex', alignItems:'center', gap:7, padding:'9px 18px', background:'#00FF7F', border:'none', borderRadius:100, color:'#080A0F', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:"'DM Sans',sans-serif", transition:'all .2s' }}
            onMouseEnter={e => { e.currentTarget.style.background='#33FF99'; }}
            onMouseLeave={e => { e.currentTarget.style.background='#00FF7F'; }}
          >
            <Search size={13}/> Search
          </button>

          <button
            onClick={onClear}
            style={{ display:'flex', alignItems:'center', gap:7, padding:'9px 16px', background:'transparent', border:'1px solid #1A1D25', borderRadius:100, color:'#6A6A62', fontSize:13, cursor:'pointer', fontFamily:"'DM Sans',sans-serif", transition:'all .2s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor='#2A2D35'; e.currentTarget.style.color='#E8E8E0'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor='#1A1D25'; e.currentTarget.style.color='#6A6A62'; }}
          >
            <Filter size={13}/> Clear
          </button>

          <button
            onClick={onRefresh}
            style={{ display:'flex', alignItems:'center', gap:7, padding:'9px 16px', background:'transparent', border:'1px solid transparent', borderRadius:100, color:'#4A4D55', fontSize:13, cursor:'pointer', fontFamily:"'DM Sans',sans-serif", transition:'all .2s' }}
            onMouseEnter={e => { e.currentTarget.style.color='#00FF7F'; }}
            onMouseLeave={e => { e.currentTarget.style.color='#4A4D55'; }}
          >
            <RefreshCw size={13}/> Refresh
          </button>
        </div>
      </div>
    </>
  );
};

export default QuestionBankFilters;