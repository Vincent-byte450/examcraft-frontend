import { createContext, useCallback, useContext, useMemo } from 'react';
import { useToast } from './common/ToastSystem';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { UIProvider, useUI } from '../context/UIContext';
import { API_BASE, apiRequest } from '../services/apiClient';

const GlobalsContext = createContext(null);

const GlobalsBridge = ({ children }) => {
  const auth = useAuth();
  const ui = useUI();
  const showNotification = useToast();

  const clearError = useCallback(() => auth.setError(null), [auth]);

  // Legacy globals helpers kept for migration compatibility.
  const getDashboardStats = useCallback(() => apiRequest('/api/dashboard/stats'), []);

  const searchExams = useCallback((query = '', options = {}) => {
    const params = new URLSearchParams();
    if (query) params.set('search', query);
    Object.entries(options || {}).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') params.set(key, String(val));
    });
    const qs = params.toString();
    return apiRequest(`/api/exams${qs ? `?${qs}` : ''}`);
  }, []);

  const updateExam = useCallback((id, examData) => apiRequest(`/api/exams/${id}`, {
    method: 'PUT',
    body: JSON.stringify(examData),
  }), []);

  const createQuestion = useCallback((questionData) => apiRequest('/api/questions', {
    method: 'POST',
    body: JSON.stringify(questionData),
  }), []);

  const updateQuestion = useCallback((id, questionData) => apiRequest(`/api/questions/${id}`, {
    method: 'PUT',
    body: JSON.stringify(questionData),
  }), []);

  const getUserPreferences = useCallback(() => apiRequest('/api/user/preferences'), []);

  const updateUserPreferences = useCallback((preferences) => apiRequest('/api/user/preferences', {
    method: 'PUT',
    body: JSON.stringify(preferences),
  }), []);

  const value = useMemo(() => ({
    API_BASE,
    ...auth,
    ...ui,
    clearError,
    getDashboardStats,
    searchExams,
    updateExam,
    createQuestion,
    updateQuestion,
    getUserPreferences,
    updateUserPreferences,
    apiRequest,
    showNotification,
  }), [auth, ui, clearError, getDashboardStats, searchExams, updateExam, createQuestion, updateQuestion, getUserPreferences, updateUserPreferences, showNotification]);

  return <GlobalsContext.Provider value={value}>{children}</GlobalsContext.Provider>;
};

export const GlobalsProvider = ({ children }) => (
  <AuthProvider>
    <UIProvider>
      <GlobalsBridge>{children}</GlobalsBridge>
    </UIProvider>
  </AuthProvider>
);

export const useGlobals = () => {
  const context = useContext(GlobalsContext);
  if (!context) throw new Error('useGlobals must be used within a GlobalsProvider');
  return context;
};

export default GlobalsProvider;
