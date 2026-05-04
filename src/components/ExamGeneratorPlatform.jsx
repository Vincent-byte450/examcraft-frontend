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
import { AppLoading } from "./common/FeedbackPatterns";

/* ─── Loading screen ─────────────────────────────────────── */
const LoadingScreen = () => <AppLoading message="Loading your workspace…" />;

/* ─── Page transition wrapper ────────────────────────────── */
const PageView = ({ children, viewKey }) => {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    setVisible(false);
    const t = setTimeout(() => setVisible(true), 40);
    return () => clearTimeout(t);
  }, [viewKey]);
  return (
    <div style={{
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(10px)",
      transition: "opacity .3s ease, transform .3s ease",
    }}>
      {children}
    </div>
  );
};

/* ─── Main authenticated app ─────────────────────────────── */
const MainApp = ({ currentView }) => (
  <div style={{
    display: "flex",
    background: "#080A0F",
    minHeight: "100vh",
    height: "100vh",
    overflow: "hidden",
    fontFamily: "'DM Sans','Helvetica Neue',sans-serif",
    color: "#E8E8E0",
  }}>
    <Navigation />

    <main style={{
      flex: 1,
      overflowY: "auto",
      /* on mobile, Navigation renders a fixed top-bar 58px tall */
      paddingTop: "var(--mobile-nav-offset, 0px)",
      background: "#080A0F",
    }}>
      {/* Inject the mobile offset CSS var */}
      <style>{`
        @media (max-width: 768px) {
          :root { --mobile-nav-offset: 58px; }
        }
        /* Scrollbar to match theme */
        main::-webkit-scrollbar { width: 4px; }
        main::-webkit-scrollbar-track { background: #080A0F; }
        main::-webkit-scrollbar-thumb { background: #00FF7F30; border-radius: 4px; }
        main::-webkit-scrollbar-thumb:hover { background: #00FF7F60; }
      `}</style>

      <div style={{ maxWidth: 1440, margin: "0 auto", padding: "32px 28px 48px" }}>
        <PageView viewKey={currentView}>
          {currentView === "dashboard"            && <Dashboard />}
          {currentView === "create-exam"          && <CreateExam />}
          {currentView === "schemes-generator"    && <SchemeOfWorkGenerator />}
          {currentView === "review-exam"          && <ReviewExam />}
          {currentView === "edit-exam"            && <ReviewExam />}
          {currentView === "edit-exam-questions"  && <ReviewQuestionsStep />}
          {currentView === "payment"              && <Payment />}
          {currentView === "question-bank"        && <QuestionBank />}
          {currentView === "my-exams"             && <MyExams />}
          {currentView === "settings"             && <Settings />}
        </PageView>
      </div>
    </main>
  </div>
);

/* ─── Root ───────────────────────────────────────────────── */
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
        <Route path="/"                      element={!user ? <Auth /> : <MainApp currentView={currentView} />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/verify-email/:token"   element={<VerifyEmail />} />
        <Route path="/verify-email-success"  element={<VerifyEmailSuccess />} />
        <Route path="/verify-email-failed"   element={<VerifyEmailFailed />} />
        <Route path="/verify-registration"   element={<RegistrationStatus />} />
      </Routes>
    </Router>
  );
};

export default ExamGeneratorPlatform;