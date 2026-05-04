import React, { useState } from 'react';
import { Search } from 'lucide-react';

const Sel = ({ value, onChange, children }) => {
  const [f, setF] = useState(false);
  return (
    <select
      value={value} onChange={onChange}
      onFocus={() => setF(true)} onBlur={() => setF(false)}
      style={{ width:'100%', padding:'10px 12px', background:'#0D0F16', border:`1px solid ${f ? '#00FF7F50' : '#1A1D25'}`, borderRadius:10, color:'#E8E8E0', fontSize:13, fontFamily:"'DM Sans',sans-serif", outline:'none', cursor:'pointer', appearance:'none', transition:'all .2s', boxShadow: f ? '0 0 0 3px #00FF7F0D' : 'none' }}
    >
      {children}
    </select>
  );
};

const ExamFilters = ({
  searchTerm, setSearchTerm,
  filterStatus, setFilterStatus,
  filterSubject, setFilterSubject,
  filterCurriculum, setFilterCurriculum,
  sortBy, setSortBy,
  uniqueSubjects, uniqueCurricula,
}) => {
  const [searchFocused, setSearchFocused] = useState(false);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Space+Mono&display=swap');
        select option { background:#0D0F16; color:#E8E8E0; }
        .ef-input::placeholder { color:#3A3D45; }
      `}</style>

      <div style={{ background:'#0D0F16', border:'1px solid #1A1D25', borderRadius:14, padding:'18px 20px', marginBottom:20 }}>
        <div style={{ display:'grid', gridTemplateColumns:'2fr repeat(4, 1fr)', gap:12, flexWrap:'wrap' }}>

          {/* search — spans 2 cols on wide, full on mobile via grid */}
          <div style={{ position:'relative' }}>
            <Search size={13} color="#3A3D45" style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }}/>
            <input
              type="text"
              className="ef-input"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search by title, subject or topic…"
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              style={{ width:'100%', padding:'10px 12px 10px 34px', background:'#0D0F16', border:`1px solid ${searchFocused ? '#00FF7F50' : '#1A1D25'}`, borderRadius:10, color:'#E8E8E0', fontSize:13, fontFamily:"'DM Sans',sans-serif", outline:'none', transition:'all .2s', boxShadow: searchFocused ? '0 0 0 3px #00FF7F0D' : 'none', boxSizing:'border-box' }}
            />
          </div>

          <Sel value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="completed">Completed</option>
            <option value="published">Published</option>
          </Sel>

          <Sel value={filterSubject} onChange={e => setFilterSubject(e.target.value)}>
            <option value="all">All Subjects</option>
            {uniqueSubjects.map(s => <option key={s} value={s}>{s}</option>)}
          </Sel>

          <Sel value={filterCurriculum} onChange={e => setFilterCurriculum(e.target.value)}>
            <option value="all">All Levels</option>
            {uniqueCurricula.map(c => <option key={c} value={c}>{c}</option>)}
          </Sel>

          <Sel value={sortBy} onChange={e => setSortBy(e.target.value)}>
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="title">Title A–Z</option>
            <option value="subject">Subject A–Z</option>
            <option value="questions">Most Questions</option>
          </Sel>
        </div>
      </div>

      {/* responsive fallback */}
      <style>{`
        @media (max-width: 900px) {
          .ef-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 560px) {
          .ef-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  );
};

export default ExamFilters;