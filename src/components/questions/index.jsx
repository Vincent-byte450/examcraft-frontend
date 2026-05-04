import { useState, useEffect, useCallback } from 'react';
import { createPortal } from "react-dom";
import { useGlobals } from "./../Globals";
import { BookOpen, Plus, Database } from 'lucide-react';
import QuestionBankFilters from './QuestionBankFilters';
import QuestionItem from './QuestionItem';
import Pagination from './../common/Pagination';
import useQuestionAPI from './../../hooks/useQuestionAPI';
import EditQuestionModal from './../EditQuestionModal';
import AdBanner from './../AdBanner';
import { SectionLoading, EmptyState, ErrorState } from './../common/FeedbackPatterns';

const Pill = ({ label, color }) => (
  <span style={{ fontSize:10, fontFamily:"'Space Mono',monospace", textTransform:'uppercase', letterSpacing:'0.06em', padding:'3px 10px', background:`${color}15`, border:`1px solid ${color}30`, borderRadius:100, color }}>
    {label}
  </span>
);

const ModalPortal = ({ question, onSave, onCancel }) => {
  useEffect(() => {
    const orig = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = orig; };
  }, []);

  useEffect(() => {
    const fn = (e) => { if (e.key === 'Escape') onCancel(); };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [onCancel]);

  return createPortal(
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(4,5,8,.84)',
        backdropFilter: 'blur(5px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px',
        animation: 'mpBackdrop .22s ease forwards',
      }}
    >
      <style>{`@keyframes mpBackdrop { from{opacity:0} to{opacity:1} }`}</style>
      <div style={{
        width: '100%', maxWidth: 760,
        maxHeight: 'calc(100vh - 40px)',
        overflowY: 'auto',
        borderRadius: 16,
        scrollbarWidth: 'thin',
        scrollbarColor: '#00FF7F30 #080A0F',
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

const QuestionBank = () => {
  const { user, authToken, updateQuestion, createQuestion } = useGlobals();
  const { loading, error, setError, fetchQuestions, fetchSubjects, fetchTopics, deleteQuestion } = useQuestionAPI(authToken);

  const [questions, setQuestions]           = useState([]);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [selectedCurriculum, setSelectedCurriculum] = useState('JSS');
  const [selectedSubject, setSelectedSubject]       = useState('');
  const [selectedTopic, setSelectedTopic]           = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [searchTerm, setSearchTerm]                 = useState('');
  const [availableSubjects, setAvailableSubjects]   = useState([]);
  const [availableTopics, setAvailableTopics]       = useState([]);
  const [pagination, setPagination] = useState({ currentPage:1, totalPages:1, total:0 });

  const loadQuestions = async (page = 1, limit = 10) => {
    const params = { page: page.toString(), limit: limit.toString(), curriculum: selectedCurriculum, createdBy: user.id };
    if (selectedSubject)    params.subject    = selectedSubject;
    if (selectedTopic)      params.topic      = selectedTopic;
    if (selectedDifficulty) params.difficulty = selectedDifficulty;
    if (searchTerm)         params.search     = searchTerm;
    try {
      const data = await fetchQuestions(params);
      setQuestions(data.questions || []);
      setPagination({ currentPage: parseInt(data.currentPage), totalPages: data.totalPages, total: data.total });
    } catch {
      setQuestions([]);
      setPagination({ currentPage:1, totalPages:1, total:0 });
    }
  };

  const loadSubjects = async () => {
    try { setAvailableSubjects(await fetchSubjects(selectedCurriculum)); }
    catch { setAvailableSubjects([]); }
  };

  const loadTopics = async () => {
    if (!selectedSubject) { setAvailableTopics([]); return; }
    try { setAvailableTopics(await fetchTopics(selectedCurriculum, selectedSubject)); }
    catch { setAvailableTopics([]); }
  };

  // const addQuestion = () => {
  //   const questionData = { question:'', options:[], correctAnswer:'', explanation:'', subject: selectedSubject||'', topic: selectedTopic||'', curriculum: selectedCurriculum||'JSS', difficulty: selectedDifficulty||'medium', type:'short-answer', section:null, questionFormat:null, subQuestions:[], hasImage:false, imageDescription:'', hasPassage:false, passageText:'' };
  //   const response = createQuestion(questionData);
  //   const q = questions.find(q => q.id === response?.question?.id);
  //   if (q) setEditingQuestion(q);
  // };

  const handleDeleteQuestion = async (questionId) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      try { await deleteQuestion(questionId); setQuestions(p => p.filter(q => q.id !== questionId)); } catch {}
    }
  };

  const hasActiveFilters = searchTerm || selectedSubject || selectedTopic || selectedDifficulty;

  useEffect(() => { if (authToken) loadSubjects(); }, [authToken, selectedCurriculum]);
  useEffect(() => { if (authToken) loadTopics(); }, [authToken, selectedCurriculum, selectedSubject]);
  useEffect(() => { if (authToken) loadQuestions(); }, [authToken, selectedCurriculum, selectedSubject, selectedTopic, selectedDifficulty]);

  const spin = '@keyframes qbSpin{to{transform:rotate(360deg)}} @keyframes qbUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}';

  if (loading && questions.length === 0) return <SectionLoading message="Loading questions…" minHeight={240} />;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Syne:wght@700;800&family=Space+Mono&display=swap');
        ${spin}
      `}</style>
      <div style={{ fontFamily:"'DM Sans','Helvetica Neue',sans-serif", color:'#E8E8E0', animation:'qbUp .45s ease forwards' }}>

        {error && <ErrorState title="Unable to load question bank" description={error} onRetry={() => { setError(null); loadQuestions(); }} />}

        {/* header */}
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:24, flexWrap:'wrap', gap:16 }}>
          <div>
            <div style={{ fontSize:11, fontFamily:"'Space Mono',monospace", textTransform:'uppercase', letterSpacing:'0.12em', color:'#00FF7F', marginBottom:6 }}>Library</div>
            <h1 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:'clamp(22px,3vw,32px)', letterSpacing:'-0.03em', lineHeight:1.05, color:'#E8E8E0', marginBottom:4 }}>Question Bank</h1>
            <p style={{ fontSize:14, color:'#6A6A62' }}>Browse and manage curriculum-aligned questions</p>
          </div>
          {/* <button
            onClick={addQuestion}
            style={{ display:'flex', alignItems:'center', gap:8, padding:'11px 22px', background:'#00FF7F', border:'none', borderRadius:100, color:'#080A0F', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:"'DM Sans',sans-serif", boxShadow:'0 4px 20px #00FF7F20', transition:'all .2s' }}
            onMouseEnter={e => { e.currentTarget.style.background='#33FF99'; e.currentTarget.style.transform='translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.background='#00FF7F'; e.currentTarget.style.transform='translateY(0)'; }}
          >
            <Plus size={14}/> Add Question
          </button> */}
        </div>

        {/* filters */}
        <QuestionBankFilters
          selectedCurriculum={selectedCurriculum}
          setSelectedCurriculum={c => { setSelectedCurriculum(c); setSelectedSubject(''); setSelectedTopic(''); setAvailableTopics([]); }}
          selectedSubject={selectedSubject}
          setSelectedSubject={s => { setSelectedSubject(s); setSelectedTopic(''); }}
          selectedTopic={selectedTopic}
          setSelectedTopic={setSelectedTopic}
          selectedDifficulty={selectedDifficulty}
          setSelectedDifficulty={setSelectedDifficulty}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          availableSubjects={availableSubjects}
          availableTopics={availableTopics}
          onSearch={() => loadQuestions(1)}
          onClear={() => { setSelectedSubject(''); setSelectedTopic(''); setSelectedDifficulty(''); setSearchTerm(''); }}
          onRefresh={() => loadQuestions(pagination.currentPage)}
        />

        <div style={{ margin:'20px 0' }}><AdBanner /></div>
        <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            total={pagination.total}
            limit={10}
            onPageChange={p => loadQuestions(p)}
          />
        {/* questions card */}
        <div style={{ background:'#0D0F16', border:'1px solid #1A1D25', borderRadius:16, overflow:'hidden' }}>

          {/* card header */}
          <div style={{ padding:'16px 24px', borderBottom:'1px solid #1A1D25', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <div style={{ width:34, height:34, borderRadius:9, background:'#00FF7F15', border:'1px solid #00FF7F25', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <Database size={14} color="#00FF7F"/>
              </div>
              <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:15, color:'#E8E8E0' }}>
                Questions
                <span style={{ marginLeft:8, fontSize:12, fontFamily:"'Space Mono',monospace", color:'#00FF7F' }}>({pagination.total})</span>
              </div>
            </div>
            {(selectedSubject || selectedTopic || selectedDifficulty) && (
              <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                {selectedSubject    && <Pill label={selectedSubject}    color="#00C8FF"/>}
                {selectedTopic      && <Pill label={selectedTopic}      color="#9B6BFF"/>}
                {selectedDifficulty && <Pill label={selectedDifficulty} color="#FF9B3B"/>}
              </div>
            )}
          </div>

          {/* question rows */}
          <div style={{ borderBottom:'1px solid #1A1D25' }}>
            {loading ? (
              <div style={{ display:'flex', justifyContent:'center', padding:'40px 0' }}>
                <div style={{ width:18, height:18, border:'2px solid #1A1D25', borderTopColor:'#00FF7F', borderRadius:'50%', animation:'qbSpin .8s linear infinite' }}/>
              </div>
            ) : questions.length === 0 ? (
              <EmptyState icon={BookOpen} title={hasActiveFilters ? 'No questions match your filters' : 'No questions available'} description={hasActiveFilters ? 'Try adjusting your filters or search terms.' : 'Questions will appear here after you add or generate them.'} />
            ) : (
              questions.map((question, index) => (
                <QuestionItem
                  key={question.id}
                  question={question}
                  index={index}
                  onEdit={id => { const q = questions.find(q => q._id === id); if (q) setEditingQuestion(q); }}
                  onDelete={handleDeleteQuestion}
                />
              ))
            )}
          </div>
        </div>

        {editingQuestion && (
          <ModalPortal
            question={editingQuestion}
            onSave={(updated) => {
              setQuestions(p => p.map(q => q.id === updated.id ? updated : q));
              updateQuestion(updated.id, updated);
              setEditingQuestion(null);
              loadQuestions(pagination.currentPage);
            }}
            onCancel={() => setEditingQuestion(null)}
          />
        )}
      </div>
    </>
  );
};

export default QuestionBank;