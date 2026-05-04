import React, { useState, useEffect } from "react";
import { useAIQuestionGeneration } from "../hooks/useAIQuestionGeneration";
import { SyllabusService } from "../services/syllabusService";
import { parseAIResponse, validateExamData } from "../utils/aiResponseParser";
import ExamSetupForm from "./ExamSetupForm";
import LoadingStep from "./LoadingStep";
import ReviewQuestionsStep from "./ReviewQuestionsStep";
import SyllabusUploadModal from "./SyllabusUploadModal";
import { useGlobals } from "./Globals";
import { API_API_BASE_URL } from "../config/env";
import {
  Sparkles, FileText, CheckCircle2,
  Clock, Target, Zap, ArrowRight
} from "lucide-react";

const API_BASE_URL = API_API_BASE_URL;
const getAuthToken = () =>
  localStorage.getItem("authToken") || sessionStorage.getItem("authToken");

/* ─── Success stats banner ───────────────────────────────── */
const SuccessStats = ({ stats }) => {
  if (!stats) return null;
  const items = [
    { icon: FileText, label: "Questions",    value: stats.questionsGenerated, color: "#00FF7F" },
    { icon: Target,   label: "Total Marks",  value: stats.totalMarks,         color: "#00C8FF" },
    { icon: Clock,    label: "Generated in", value: `${stats.duration}s`,     color: "#9B6BFF" },
  ];
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 16, padding: "20px 24px", background: "#0D1410", border: "1px solid #00FF7F30", borderRadius: 16, marginBottom: 24 }}>
      <div style={{ width: 40, height: 40, borderRadius: 11, background: "#00FF7F20", border: "1px solid #00FF7F30", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <CheckCircle2 size={18} color="#00FF7F" />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 15, color: "#00FF7F", marginBottom: 12 }}>
          Exam Generated Successfully
        </div>
        <div style={{ display: "flex", gap: 28, flexWrap: "wrap" }}>
          {items.map(({ icon: Icon, label, value, color }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Icon size={13} color={color} />
              <div>
                <div style={{ fontSize: 10, fontFamily: "'Space Mono',monospace", textTransform: "uppercase", letterSpacing: "0.06em", color: "#4A4D55" }}>{label}</div>
                <div style={{ fontSize: 16, fontWeight: 700, fontFamily: "'Syne',sans-serif", color: "#E8E8E0" }}>{value}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ─── Quick tip card ─────────────────────────────────────── */
const TipCard = ({ icon: Icon, title, desc, accent }) => (
  <div style={{ background: "#0D0F16", border: "1px solid #1A1D25", borderRadius: 13, padding: "18px 20px", transition: "all .25s" }}
    onMouseEnter={e => { e.currentTarget.style.borderColor = `${accent}40`; e.currentTarget.style.background = `${accent}08`; }}
    onMouseLeave={e => { e.currentTarget.style.borderColor = "#1A1D25"; e.currentTarget.style.background = "#0D0F16"; }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
      <div style={{ width: 34, height: 34, borderRadius: 9, background: `${accent}15`, border: `1px solid ${accent}25`, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon size={15} color={accent} />
      </div>
      <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 14, color: "#E8E8E0" }}>{title}</div>
    </div>
    <p style={{ fontSize: 13, color: "#5A5D65", lineHeight: 1.65 }}>{desc}</p>
  </div>
);

/* ─── MAIN ───────────────────────────────────────────────── */
const CreateExam = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [examData, setExamData] = useState({
    title: "", curriculum: "JSS", subject: "", term: "Term I",
    classLevel: "Grade 7", type: "Opener", topics: [],
    questionTypes: [], numQuestions: 20, duration: 120,
    instructions: "", difficulty: "mixed", paperType: "Paper 1",
    customPrompt: "", useSyllabus: false, selectedSyllabusId: null, syllabusContent: null,
  });
  const [generatedQuestions, setGeneratedQuestions] = useState([]);
  const [examMetadata, setExamMetadata]             = useState(null);
  const [availableSyllabi, setAvailableSyllabi]     = useState([]);
  const [showSyllabusModal, setShowSyllabusModal]   = useState(false);
  const [isLoadingSyllabi, setIsLoadingSyllabi]     = useState(false);
  const [examCreationResult, setExamCreationResult] = useState(null);
  const [generationStats, setGenerationStats]       = useState(null);
  const { showNotification } = useGlobals();

  const { isGenerating, generationProgress, setIsGenerating, setGenerationProgress, processGeneratedExam } =
    useAIQuestionGeneration(examData);

  const syllabusService = new SyllabusService();

  useEffect(() => {
    if (examData.curriculum || examData.subject) loadAvailableSyllabi();
  }, [examData.curriculum, examData.subject]);

  const loadAvailableSyllabi = async () => {
    setIsLoadingSyllabi(true);
    try {
      const r = await syllabusService.getSyllabi({ curriculum: examData.curriculum, subject: examData.subject });
      if (r.syllabi) setAvailableSyllabi(r.syllabi);
    } catch {}
    finally { setIsLoadingSyllabi(false); }
  };

  const handleSyllabusSelect = async (syllabusId) => {
    if (!syllabusId) {
      setExamData(p => ({ ...p, useSyllabus: false, selectedSyllabusId: null, syllabusContent: null }));
      return;
    }
    try {
      const d = await syllabusService.getSyllabusById(syllabusId);
      if (d) setExamData(p => ({ ...p, useSyllabus: true, selectedSyllabusId: syllabusId, syllabusContent: d }));
      else alert("Failed to load syllabus content. Please try another.");
    } catch { alert("Error loading syllabus content. Please try again."); }
  };

  const handleSyllabusUpload = async (uploadData) => {
    try {
      const r = await syllabusService.uploadSyllabus(uploadData);
      if (r.success) {
        await loadAvailableSyllabi();
        await handleSyllabusSelect(r.syllabus.id);
        setShowSyllabusModal(false);
        alert("Syllabus uploaded and selected successfully!");
      } else { alert(`Upload failed: ${r.message}`); }
    } catch { alert("Upload failed. Please try again."); }
  };

  const generateQuestionsWithAI = async () => {
    const startTime = Date.now();
    setIsGenerating(true);
    setGenerationProgress(0);
    try {
      setGenerationProgress(20);
      const token = getAuthToken();
      const res = await fetch(`${API_BASE_URL}/ai/generate-questions/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ examData: { ...examData, source: "ai" } }),
      });
      if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.error || `API error: ${res.status}`); }
      const result = await res.json();
      if (!result.success) throw new Error(result.error || "Failed to generate questions");

      setGenerationProgress(50);
      
      const parsed = parseAIResponse(result.questions, examData);
      if (!parsed.success) throw new Error(`Parse failed: ${parsed.error}`);
      console.log("Parsed AI response:", parsed);
      const validation = validateExamData(parsed);
      if (!validation.isValid && validation.errors.length > 0) throw new Error(`Validation: ${validation.errors.join(", ")}`);

      setGenerationProgress(70);
      const proc = await processGeneratedExam(parsed);
      if (!proc.success) throw new Error(proc.error || "Failed to process exam");

      const duration = ((Date.now() - startTime) / 1000).toFixed(1);
      setGenerationStats({ duration, questionsGenerated: parsed.questions.length, totalMarks: parsed.totalMarks, timestamp: new Date().toISOString() });
      setGeneratedQuestions(parsed.questions);
      setExamMetadata({ examTitle: parsed.examTitle, paperType: parsed.paperType, curriculum: parsed.curriculum, subject: parsed.subject, duration: parsed.duration, totalMarks: parsed.totalMarks, instructions: parsed.instructions, sections: parsed.sections });
      setExamCreationResult(proc);
      setExamData(p => ({ ...p, backendId: proc.exam?._id, title: parsed.examTitle }));
      setCurrentStep(2);
      setGenerationProgress(100);
    } catch (err) {
      console.error("Generation error:", err);
      showNotification(`Failed to generate questions: ${err.message}. Using fallback questions.`, 'error');
      generateFallbackQuestions();
    } finally { setIsGenerating(false); setGenerationProgress(0); }
  };

  const generateFallbackQuestions = () => {
    const qs = [
      { id: 1, question: `State three main concepts in ${examData.subject || "this subject"}. (2mks)`, type: "short-answer", marks: 2, difficulty: "easy", topic: examData.topics[0] || examData.subject || "General", section: "A", expectedAnswer: "Three main concepts to be provided", questionFormat: "state", correctAnswer: "Three main concepts to be provided" },
      { id: 2, question: `Explain the importance of ${examData.subject || "this subject"} in daily life. (10mks)`, type: "structured", marks: 10, difficulty: "medium", topic: examData.topics[0] || examData.subject || "General", section: "B", subQuestions: [{ part: "a)", question: `Define ${examData.subject || "this subject"}. (3mks)`, marks: 3, expectedAnswer: "Definition to be provided" }, { part: "b)", question: "Give four practical applications. (4mks)", marks: 4, expectedAnswer: "Four applications to be provided" }, { part: "c)", question: "State three benefits. (3mks)", marks: 3, expectedAnswer: "Three benefits to be provided" }], hasImage: false, imageDescription: "", explanation: "This question tests understanding of subject relevance." },
    ];
    setGeneratedQuestions(qs);
    setExamMetadata({ examTitle: `${examData.subject || "Subject"} ${examData.paperType || "Paper 1"}`, paperType: examData.paperType || "Paper 1", curriculum: examData.curriculum, subject: examData.subject, duration: examData.duration || 120, totalMarks: qs.reduce((s, q) => s + q.marks, 0), instructions: "Answer all questions as instructed.", sections: { sectionA: { title: "SECTION A", instructions: "Answer ALL questions", questions: qs.filter(q => q.section === "A") }, sectionB: { title: "SECTION B", instructions: "Answer ALL questions", questions: qs.filter(q => q.section === "B") } } });
    setCurrentStep(2);
  };

  const regenerateQuestion = async (questionId) => {
    const q = generatedQuestions.find(q => q.id === questionId);
    if (!q) return;
    setGeneratedQuestions(p => p.map(x => x.id === questionId ? { ...x, isRegenerating: true } : x));
    try {
      const token = getAuthToken();
      const res = await fetch(`${API_BASE_URL}/ai/regenerate-question/`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ questionData: q, examData }) });
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const result = await res.json();
      if (!result.success) throw new Error(result.error || "Failed to regenerate");
      const updated = { ...result.question, id: questionId, isRegenerating: false };
      if (q.backendId) {
        try { await fetch(`${API_BASE_URL}/questions/${q.backendId}`, { method: "PUT", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(updated) }); updated.backendId = q.backendId; } catch {}
      }
      setGeneratedQuestions(p => p.map(x => x.id === questionId ? updated : x));
    } catch (err) { alert("Failed to regenerate question. Please try again."); setGeneratedQuestions(p => p.map(x => x.id === questionId ? { ...x, isRegenerating: false } : x)); }
  };

  const saveExamWithQuestions = async (questions) => {
    const token = getAuthToken();
    const res = await fetch(`${API_BASE_URL}/exams/`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ title: examData.title || examMetadata?.examTitle, examTitle: examData.title || examMetadata?.examTitle, curriculum: examData.curriculum, term: examData.term, classLevel: examData.classLevel, type: examData.type, subject: examData.subject, paperType: examData.paperType, topics: examData.topics, duration: examData.duration, instructions: examData.instructions, difficulty: examData.difficulty, numQuestions: questions.length, totalQuestions: questions.length, totalMarks: examMetadata?.totalMarks || questions.reduce((s, q) => s + (q.marks || 0), 0), customPrompt: examData.customPrompt, useSyllabus: examData.useSyllabus, selectedSyllabusId: examData.selectedSyllabusId, source: "ai", status: "completed", questions, sections: examMetadata?.sections || {} }),
    });
    if (!res.ok) { const e = await res.json(); throw new Error(e.message || `Save failed (${res.status})`); }
    return (await res.json()).exam;
  };

  const proceedToPayment = async () => {
    if (!examData.backendId && generatedQuestions.length > 0) {
      try {
        const saved = await saveExamWithQuestions(generatedQuestions);
        setExamData(p => ({ ...p, backendId: saved._id }));
        alert(`Exam "${examData.title || examMetadata?.examTitle}" saved! Download it from your exams list.`);
      } catch { alert("Failed to save exam. Please try again."); }
    } else if (examData.backendId) {
      alert(`Exam "${examData.title}" is ready! Download it from your exams list.`);
    } else {
      alert("No questions available. Please generate questions first.");
    }
  };

  const handleBackToSetup = () => {
    setCurrentStep(1);
    setGeneratedQuestions([]);
    setExamCreationResult(null);
    setGenerationStats(null);
  };

  /* ── Loading state ── */
  if (isGenerating) return <LoadingStep examData={examData} generationProgress={generationProgress} />;

  /* ── Step 1 ── */
  if (currentStep === 1) return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Syne:wght@700;800&family=Space+Mono&display=swap');`}</style>
      <div style={{argin: "0 auto", fontFamily: "'DM Sans','Helvetica Neue',sans-serif", color: "#E8E8E0" }}>

        {/* Hero header */}
        <div style={{ position: "relative", borderRadius: 18, overflow: "hidden", marginBottom: 24, padding: "32px 36px", background: "linear-gradient(135deg,#0D1A10 0%,#080F14 60%,#0A0D1A 100%)", border: "1px solid #1A1D25" }}>
          <div style={{ position: "absolute", top: "-30%", left: "-5%", width: 360, height: 360, borderRadius: "50%", background: "radial-gradient(circle,#00FF7F10 0%,transparent 70%)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(#1A1D2508 1px,transparent 1px),linear-gradient(90deg,#1A1D2508 1px,transparent 1px)", backgroundSize: "40px 40px", pointerEvents: "none" }} />
          <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: "#00FF7F20", border: "1px solid #00FF7F30", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Sparkles size={24} color="#00FF7F" />
            </div>
            <div>
              <div style={{ fontSize: 10, fontFamily: "'Space Mono',monospace", textTransform: "uppercase", letterSpacing: "0.12em", color: "#00FF7F", marginBottom: 4 }}>Create Exam</div>
              {/* <h1 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: "clamp(22px,3vw,32px)", letterSpacing: "-0.03em", lineHeight: 1.05, color: "#E8E8E0", marginBottom: 4 }}>
                Create Exam
              </h1> */}
              <p style={{ fontSize: 14, color: "#6A6A62" }}>Curriculum-aligned exam generated in minutes with AI assistance</p>
            </div>
          </div>
        </div>

        {/* Quick tips */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 14, marginBottom: 28 }}>
          <TipCard icon={Zap}         title="Fast Generation"     desc="Complete exams generated in seconds with AI." accent="#00FF7F" />
          <TipCard icon={Target}      title="Curriculum Aligned"  desc="Questions aligned with JSS and Secondary curricula." accent="#00C8FF" />
          <TipCard icon={CheckCircle2} title="Fully Editable"     desc="Review and customise every question before finalising." accent="#9B6BFF" />
        </div>

        <ExamSetupForm
          examData={examData}
          setExamData={setExamData}
          onGenerate={generateQuestionsWithAI}
          isLoading={isGenerating}
          availableSyllabi={availableSyllabi}
          isLoadingSyllabi={isLoadingSyllabi}
          onSyllabusSelect={handleSyllabusSelect}
          onShowSyllabusUpload={() => setShowSyllabusModal(true)}
        />
      </div>

      {showSyllabusModal && (
        <SyllabusUploadModal
          examData={examData}
          onUpload={handleSyllabusUpload}
          onClose={() => setShowSyllabusModal(false)}
        />
      )}
    </>
  );

  /* ── Step 2 ── */
  if (currentStep === 2) return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Syne:wght@700;800&family=Space+Mono&display=swap');`}</style>
      <div style={{ maxWidth: 1000, margin: "0 auto", fontFamily: "'DM Sans','Helvetica Neue',sans-serif", color: "#E8E8E0" }}>
        <SuccessStats stats={generationStats} />
        <ReviewQuestionsStep
          examData={examData}
          generatedQuestions={generatedQuestions}
          setGeneratedQuestions={setGeneratedQuestions}
          onBackToSetup={handleBackToSetup}
          onProceedToPayment={proceedToPayment}
          onRegenerateAll={generateQuestionsWithAI}
          onRegenerateQuestion={regenerateQuestion}
          examCreationResult={examCreationResult}
        />
      </div>
    </>
  );

  return <ExamSetupForm examData={examData} setExamData={setExamData} onGenerate={generateQuestionsWithAI} />;
};

export default CreateExam;