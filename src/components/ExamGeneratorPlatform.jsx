import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./Dashboard";
import CreateExam from "./CreateExam";
import ReviewExam from "./ReviewExam";
import ReviewQuestionsStep from "./ReviewQuestionsStep";
import Payment from "./Payment";
import QuestionBank from "./questions/index";
import MyExams from "./exams/index";
import Settings from "./Settings";
import Navigation from "./Navigation";
import Auth from "./Auth";
import ResetPassword from "./ResetPassword";
import { VerifyEmail, VerifyEmailSuccess, VerifyEmailFailed, RegistrationStatus } from "./VerifyEmail";
import { useGlobals } from "./Globals";
import SchemeOfWorkGenerator from "./schemes/index";
import AppShell from "./ui/AppShell";
import Spinner from "./ui/Spinner";

const LoadingScreen = () => (
  <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[var(--color-bg)] font-['Syne']">
    <div className="pointer-events-none fixed left-[20%] top-[20%] h-[400px] w-[400px] rounded-full blur-[60px]" style={{ background: "radial-gradient(circle, rgba(0,255,127,0.06) 0%, transparent 70%)" }} />
    <div className="pointer-events-none fixed bottom-[20%] right-[20%] h-[300px] w-[300px] rounded-full blur-[60px]" style={{ background: "radial-gradient(circle, rgba(0,200,255,0.03) 0%, transparent 70%)" }} />
    <div className="relative z-10 animate-[fadeIn_.6s_ease_forwards] text-center">
      <div className="mx-auto mb-7 flex h-[72px] w-[72px] animate-[float_3s_ease-in-out_infinite] items-center justify-center rounded-[var(--radius-xl)] text-4xl text-[var(--color-bg)] shadow-[var(--shadow-glow)]" style={{ background: "linear-gradient(135deg, var(--color-brand), var(--color-info))" }}>📖</div>
      <Spinner className="mx-auto mb-7 h-12 w-12" />
      <h2 className="mb-2 text-[22px] font-extrabold tracking-tight text-[var(--color-text)]">Mtihani Kenya</h2>
      <p className="animate-[pulse_2s_ease-in-out_infinite] font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--color-text-subtle)]">Loading your workspace…</p>
    </div>
  </div>
);

const PageView = ({ children, viewKey }) => {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    setVisible(false);
    const t = setTimeout(() => setVisible(true), 40);
    return () => clearTimeout(t);
  }, [viewKey]);
  return <div className={`transition-all duration-300 ${visible ? "translate-y-0 opacity-100" : "translate-y-2.5 opacity-0"}`}>{children}</div>;
};

const MainApp = ({ currentView }) => (
  <AppShell sidebar={<Navigation />}>
    <PageView viewKey={currentView}>
      {currentView === "dashboard" && <Dashboard />}
      {currentView === "create-exam" && <CreateExam />}
      {currentView === "schemes-generator" && <SchemeOfWorkGenerator />}
      {currentView === "review-exam" && <ReviewExam />}
      {currentView === "edit-exam" && <ReviewExam />}
      {currentView === "edit-exam-questions" && <ReviewQuestionsStep />}
      {currentView === "payment" && <Payment />}
      {currentView === "question-bank" && <QuestionBank />}
      {currentView === "my-exams" && <MyExams />}
      {currentView === "settings" && <Settings />}
    </PageView>
  </AppShell>
);

const ExamGeneratorPlatform = () => {
  const { user, currentView } = useGlobals();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 500);
    return () => clearTimeout(t);
  }, []);

  if (!ready) return <LoadingScreen />;

  return (
    <Router>
      <Routes>
        <Route path="/" element={!user ? <Auth /> : <MainApp currentView={currentView} />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/verify-email/:token" element={<VerifyEmail />} />
        <Route path="/verify-email-success" element={<VerifyEmailSuccess />} />
        <Route path="/verify-email-failed" element={<VerifyEmailFailed />} />
        <Route path="/verify-registration" element={<RegistrationStatus />} />
      </Routes>
    </Router>
  );
};

export default ExamGeneratorPlatform;
