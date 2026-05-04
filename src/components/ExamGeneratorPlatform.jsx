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

const LoadingScreen = () => (
  <>
    <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Space+Mono&display=swap');@keyframes spin{to{transform:rotate(360deg)}}@keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}@keyframes fadeIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}@media (prefers-reduced-motion: reduce){*,*::before,*::after{animation:none !important;transition:none !important;}}`}</style>
    <div role="status" aria-live="polite" aria-label="Loading workspace" style={{ minHeight: "100vh", background: "#080A0F", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Syne', sans-serif", backgroundImage: "linear-gradient(#1A1D2510 1px,transparent 1px),linear-gradient(90deg,#1A1D2510 1px,transparent 1px)", backgroundSize: "60px 60px" }}>
      <span style={{ position: "absolute", width: 1, height: 1, padding: 0, margin: -1, overflow: "hidden", clip: "rect(0,0,0,0)", border: 0 }}>Loading your workspace</span>
      <div style={{ position: "fixed", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle,#00FF7F0F 0%,transparent 70%)", top: "20%", left: "20%", filter: "blur(60px)", pointerEvents: "none" }} />
      <div style={{ position: "fixed", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle,#00C8FF08 0%,transparent 70%)", bottom: "20%", right: "20%", filter: "blur(60px)", pointerEvents: "none" }} />
      <div style={{ textAlign: "center", animation: "fadeIn .6s ease forwards", position: "relative", zIndex: 1 }}>
        <div style={{ width: 72, height: 72, borderRadius: 20, background: "linear-gradient(135deg,#00FF7F,#00C8FF)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 28px", fontSize: 36, animation: "float 3s ease-in-out infinite", boxShadow: "0 0 40px #00FF7F20" }}>📖</div>
        <div style={{ position: "relative", width: 48, height: 48, margin: "0 auto 28px" }}><div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "2px solid #1A1D25" }} /><div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "2px solid transparent", borderTopColor: "#00FF7F", animation: "spin .9s linear infinite" }} /></div>
        <h2 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 22, letterSpacing: "-0.02em", color: "#E8E8E0", marginBottom: 8 }}>Mtihani Kenya</h2>
        <p style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "#3A3D45", animation: "pulse 2s ease-in-out infinite" }}>Loading your workspace…</p>
      </div>
    </div>
  </>
);

const PageView = ({ children, viewKey }) => {
  const [visible, setVisible] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (reducedMotion) { setVisible(true); return; }
    setVisible(false);
    const t = setTimeout(() => setVisible(true), 40);
    return () => clearTimeout(t);
  }, [viewKey, reducedMotion]);

  return <div style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(10px)", transition: reducedMotion ? "none" : "opacity .3s ease, transform .3s ease" }}>{children}</div>;
};

const MainApp = ({ currentView }) => (
  <div style={{ display: "flex", background: "#080A0F", minHeight: "100vh", height: "100vh", overflow: "hidden", fontFamily: "'DM Sans','Helvetica Neue',sans-serif", color: "#E8E8E0" }}>
    <Navigation />
    <main style={{ flex: 1, overflowY: "auto", paddingTop: "var(--mobile-nav-offset, 0px)", background: "#080A0F" }}>
      <style>{`@media (max-width: 768px){:root{--mobile-nav-offset:58px;}}main::-webkit-scrollbar{width:4px;}main::-webkit-scrollbar-track{background:#080A0F;}main::-webkit-scrollbar-thumb{background:#00FF7F30;border-radius:4px;}main::-webkit-scrollbar-thumb:hover{background:#00FF7F60;}`}</style>
      <div style={{ maxWidth: 1440, margin: "0 auto", padding: "32px 28px 48px" }}>
        <PageView viewKey={currentView}>{currentView === "dashboard" && <Dashboard />}{currentView === "create-exam" && <CreateExam />}{currentView === "schemes-generator" && <SchemeOfWorkGenerator />}{currentView === "review-exam" && <ReviewExam />}{currentView === "edit-exam" && <ReviewExam />}{currentView === "edit-exam-questions" && <ReviewQuestionsStep />}{currentView === "payment" && <Payment />}{currentView === "question-bank" && <QuestionBank />}{currentView === "my-exams" && <MyExams />}{currentView === "settings" && <Settings />}</PageView>
      </div>
    </main>
  </div>
);

const ExamGeneratorPlatform = () => {
  const { user, currentView } = useGlobals();
  const [ready, setReady] = useState(false);
  useEffect(() => { const t = setTimeout(() => setReady(true), 500); return () => clearTimeout(t); }, []);
  if (!ready) return <LoadingScreen />;
  return (<Router><Routes><Route path="/" element={!user ? <Auth /> : <MainApp currentView={currentView} />} /><Route path="/reset-password/:token" element={<ResetPassword />} /><Route path="/verify-email/:token" element={<VerifyEmail />} /><Route path="/verify-email-success" element={<VerifyEmailSuccess />} /><Route path="/verify-email-failed" element={<VerifyEmailFailed />} /><Route path="/verify-registration" element={<RegistrationStatus />} /></Routes></Router>);
};

export default ExamGeneratorPlatform;
