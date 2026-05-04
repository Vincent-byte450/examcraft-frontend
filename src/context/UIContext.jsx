import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const UIContext = createContext(null);

export const UIProvider = ({ children }) => {
  const [currentView, setCurrentView] = useState(() => (localStorage.getItem('authToken') ? 'dashboard' : 'login'));
  const [currentExam, setCurrentExam] = useState(null);
  const [savedExams, setSavedExams] = useState([]);

  const saveExam = useCallback((examData) => {
    const exam = { ...examData, id: Date.now().toString(), savedAt: new Date().toISOString() };
    setSavedExams((prev) => [...prev, exam]);
    return exam;
  }, []);

  const value = useMemo(() => ({
    currentView, setCurrentView, currentExam, setCurrentExam, savedExams, setSavedExams, saveExam,
  }), [currentView, currentExam, savedExams, saveExam]);

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
};

export const useUI = () => {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error('useUI must be used within UIProvider');
  return ctx;
};
