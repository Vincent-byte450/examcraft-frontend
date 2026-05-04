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

  const value = useMemo(() => ({
    API_BASE,
    ...auth,
    ...ui,
    clearError,
    apiRequest,
    showNotification,
  }), [auth, ui, clearError, showNotification]);

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
