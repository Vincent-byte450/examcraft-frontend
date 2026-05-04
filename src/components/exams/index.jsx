import React, { useState, useEffect } from 'react';
import { useUI } from "../../context/UIContext";
import { useAuth } from "../../context/AuthContext";
import { Plus, RefreshCw, FileText } from 'lucide-react';
import ExamStatsCards from './ExamStatsCards';
import ExamFilters from './ExamFilters';
import ExamListItem from './ExamListItem';
import Pagination from './../common/Pagination';
import ErrorMessage from './../common/ErrorMessage';
import useExamAPI from './../../hooks/useExamAPI';
import AdBanner from './../AdBanner';

const MyExams = () => {
  const { setCurrentView, setCurrentExam } = useUI();
  const { authToken } = useAuth();
  const { loading, error, setError, fetchExams, fetchExamStats, fetchExamDetails, deleteExam, downloadExam } = useExamAPI(authToken);

  const [exams, setExams]           = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [stats, setStats]           = useState({ totalExams:0, thisMonth:0, subjects:0, questionBank:0, subscription:{} });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus]       = useState('all');
  const [filterSubject, setFilterSubject]     = useState('all');
  const [filterCurriculum, setFilterCurriculum] = useState('all');
  const [sortBy, setSortBy]         = useState('newest');
  const [pagination, setPagination] = useState({ currentPage:1, totalPages:1, total:0, limit:10 });

  const uniqueSubjects  = [...new Set(exams.map(e => e.subject))];
  const uniqueCurricula = [...new Set(exams.map(e => e.curriculum))];

  const loadExams = async (page=1, limit=10, refresh=false) => {
    try {
      if (refresh) setIsRefreshing(true);
      const params = { page:page.toString(), limit:limit.toString() };
      if (searchTerm)              params.search     = searchTerm;
      if (filterStatus !== 'all')  params.status     = filterStatus;
      if (filterSubject !== 'all') params.subject    = filterSubject;
      if (filterCurriculum !== 'all') params.curriculum = filterCurriculum;
      if (sortBy)                  params.sort       = sortBy;
      const data = await fetchExams(params);
      setExams(data.exams || []);
      setPagination({ currentPage: parseInt(data.pagination.currentPage)||1, totalPages: data.pagination.totalPages||1, total: data.pagination.total||0, limit });
    } catch { setExams([]); setPagination({ currentPage:1, totalPages:1, total:0, limit:10 }); }
    finally   { setIsRefreshing(false); }
  };

  const loadStats = async () => {
    try { const d = await fetchExamStats(); setStats(d.stats); } catch {}
  };

  const handleDeleteExam = async (examId, examTitle) => {
    if (!window.confirm(`Delete "${examTitle}"? This cannot be undone.`)) return;
    try {
      await deleteExam(examId);
      setExams(p => p.filter(e => e._id !== examId));
      setPagination(p => ({ ...p, total: p.total - 1 }));
    } catch {}
  };

  const handleDownloadExam = async (examId, examTitle, format='pdf') => {
    try {
      setExams(p => p.map(e => e._id === examId ? { ...e, isDownloading:true } : e));
      const blob = await downloadExam(examId, format);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `${examTitle.replace(/[^a-z0-9]/gi,'_').toLowerCase()}.${format}`;
      document.body.appendChild(a); a.click();
      window.URL.revokeObjectURL(url); document.body.removeChild(a);
      setExams(p => p.map(e => e._id === examId ? { ...e, downloads:(e.downloads||0)+1 } : e));
    } catch (err) { if (err.message.includes('Payment required')) alert(err.message); }
    finally { setExams(p => p.map(e => e._id === examId ? { ...e, isDownloading:false } : e)); }
  };

  const handleViewExam = async (examId) => {
    try { const d = await fetchExamDetails(examId); setCurrentExam(d); setCurrentView('review-exam'); } catch {}
  };
  const handleEditExam = async (examId) => {
    try { const d = await fetchExamDetails(examId); setCurrentExam(d); setCurrentView('edit-exam'); } catch {}
  };

  const hasActiveFilters = searchTerm || filterStatus!=='all' || filterSubject!=='all' || filterCurriculum!=='all';

  useEffect(() => {
    const t = setTimeout(() => { if (authToken) loadExams(1, pagination.limit); }, 300);
    return () => clearTimeout(t);
  }, [searchTerm, filterStatus, filterSubject, filterCurriculum, sortBy, authToken]);

  useEffect(() => { if (authToken) { loadExams(); loadStats(); } }, [authToken]);

  const spin = '@keyframes meSpin{to{transform:rotate(360deg)}} @keyframes meUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}';

  if (loading && !isRefreshing) return (
    <>
      <style>{spin}</style>
      <div style={{ display:'flex', justifyContent:'center', alignItems:'center', height:240, flexDirection:'column', gap:14 }}>
        <div style={{ width:20, height:20, border:'2px solid #1A1D25', borderTopColor:'#00FF7F', borderRadius:'50%', animation:'meSpin .8s linear infinite' }}/>
        <span style={{ fontSize:13, color:'#5A5D65', fontFamily:"'DM Sans',sans-serif" }}>Loading your exams…</span>
      </div>
    </>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Syne:wght@700;800&family=Space+Mono&display=swap');
        ${spin}
      `}</style>
      <div style={{ fontFamily:"'DM Sans','Helvetica Neue',sans-serif", color:'#E8E8E0', animation:'meUp .45s ease forwards' }}>

        <ErrorMessage error={error} onClose={() => setError(null)}/>

        {/* stats */}
        <ExamStatsCards stats={stats}/>

        {/* page header */}
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', margin:'24px 0', flexWrap:'wrap', gap:16 }}>
          <div>
            <div style={{ fontSize:11, fontFamily:"'Space Mono',monospace", textTransform:'uppercase', letterSpacing:'0.12em', color:'#00FF7F', marginBottom:6 }}>Exams</div>
            <h1 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:'clamp(22px,3vw,32px)', letterSpacing:'-0.03em', lineHeight:1.05, color:'#E8E8E0', marginBottom:4 }}>My Exams</h1>
            <p style={{ fontSize:14, color:'#6A6A62' }}>Manage and download your AI-generated exams</p>
          </div>
          <div style={{ display:'flex', gap:10 }}>
            <button
              onClick={() => loadExams(pagination.currentPage, pagination.limit, true)}
              disabled={isRefreshing}
              style={{ display:'flex', alignItems:'center', gap:7, padding:'10px 18px', background:'transparent', border:'1px solid #1A1D25', borderRadius:100, color:'#6A6A62', fontSize:13, cursor: isRefreshing ? 'not-allowed' : 'pointer', fontFamily:"'DM Sans',sans-serif", transition:'all .2s' }}
              onMouseEnter={e => { if (!isRefreshing) { e.currentTarget.style.borderColor='#2A2D35'; e.currentTarget.style.color='#E8E8E0'; }}}
              onMouseLeave={e => { e.currentTarget.style.borderColor='#1A1D25'; e.currentTarget.style.color='#6A6A62'; }}
            >
              <RefreshCw size={13} style={{ animation: isRefreshing ? 'meSpin .8s linear infinite' : 'none' }}/> Refresh
            </button>
            <button
              onClick={() => setCurrentView('create-exam')}
              style={{ display:'flex', alignItems:'center', gap:7, padding:'10px 22px', background:'#00FF7F', border:'none', borderRadius:100, color:'#080A0F', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:"'DM Sans',sans-serif", boxShadow:'0 4px 20px #00FF7F20', transition:'all .2s' }}
              onMouseEnter={e => { e.currentTarget.style.background='#33FF99'; e.currentTarget.style.transform='translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.background='#00FF7F'; e.currentTarget.style.transform='translateY(0)'; }}
            >
              <Plus size={14}/> Create New Exam
            </button>
          </div>
        </div>

        {/* filters */}
        <ExamFilters
          searchTerm={searchTerm} setSearchTerm={setSearchTerm}
          filterStatus={filterStatus} setFilterStatus={setFilterStatus}
          filterSubject={filterSubject} setFilterSubject={setFilterSubject}
          filterCurriculum={filterCurriculum} setFilterCurriculum={setFilterCurriculum}
          sortBy={sortBy} setSortBy={setSortBy}
          uniqueSubjects={uniqueSubjects} uniqueCurricula={uniqueCurricula}
        />

        {/* ad */}
        <div style={{ margin:'20px 0' }}><AdBanner/></div>

        {/* exams card */}
        <div style={{ background:'#0D0F16', border:'1px solid #1A1D25', borderRadius:16, overflow:'hidden' }}>

          {/* card header */}
          <div style={{ padding:'16px 24px', borderBottom:'1px solid #1A1D25', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:10 }}>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <div style={{ width:34, height:34, borderRadius:9, background:'#00FF7F15', border:'1px solid #00FF7F25', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <FileText size={14} color="#00FF7F"/>
              </div>
              <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:15, color:'#E8E8E0' }}>
                Exams <span style={{ fontSize:12, fontFamily:"'Space Mono',monospace", color:'#00FF7F' }}>({pagination.total})</span>
              </div>
            </div>
            {pagination.total > 0 && (
              <div style={{ fontSize:11, fontFamily:"'Space Mono',monospace", color:'#3A3D45' }}>
                Showing <span style={{ color:'#00FF7F' }}>{((pagination.currentPage-1)*pagination.limit)+1}–{Math.min(pagination.currentPage*pagination.limit, pagination.total)}</span> of {pagination.total}
              </div>
            )}
          </div>

          {/* list */}
          <div>
            {exams.length === 0 ? (
              <div style={{ padding:'52px 24px', textAlign:'center' }}>
                <div style={{ width:60, height:60, borderRadius:'50%', background:'#1A1D25', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px' }}>
                  <FileText size={24} color="#3A3D45"/>
                </div>
                <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:17, color:'#E8E8E0', marginBottom:8 }}>
                  {hasActiveFilters ? 'No exams match your filters' : 'No exams created yet'}
                </div>
                <p style={{ fontSize:13, color:'#5A5D65', maxWidth:300, margin:'0 auto 24px', lineHeight:1.7 }}>
                  {hasActiveFilters ? 'Try adjusting your search or filters.' : 'Create your first AI-generated exam to get started.'}
                </p>
                {!hasActiveFilters && (
                  <button
                    onClick={() => setCurrentView('create-exam')}
                    style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'11px 24px', background:'#00FF7F', border:'none', borderRadius:100, color:'#080A0F', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:"'DM Sans',sans-serif" }}
                  >
                    <Plus size={14}/> Create Your First Exam
                  </button>
                )}
              </div>
            ) : (
              [...exams]
              .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)) // latest on top
              .map(exam => (
                <ExamListItem
                  key={exam.id}
                  exam={exam}
                  onView={handleViewExam}
                  onEdit={handleEditExam}
                  onDelete={handleDeleteExam}
                  onDownload={handleDownloadExam}
                />
              ))
            )}
          </div>

          <Pagination
            currentPage={pagination.currentPage} totalPages={pagination.totalPages}
            total={pagination.total} limit={pagination.limit}
            onPageChange={p => { if (p >= 1 && p <= pagination.totalPages) loadExams(p, pagination.limit); }}
          />
        </div>
      </div>
    </>
  );
};

export default MyExams;