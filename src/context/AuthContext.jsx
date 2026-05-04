import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { apiRequest, configureApiClient, mapApiError } from '../services/apiClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [authToken, setAuthToken] = useState(() => localStorage.getItem('authToken') || null);
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const logout = useCallback(() => {
    setAuthToken(null);
    setUser(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  }, []);

  configureApiClient({ getAuthToken: () => authToken, handleUnauthorized: logout });

  const login = useCallback(async (credentials) => {
    setIsLoading(true); setError(null);
    try {
      const response = await apiRequest('/api/auth/login/', { method: 'POST', body: JSON.stringify(credentials) });
      setAuthToken(response.token); setUser(response.user);
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      return { success: true, user: response.user };
    } catch (err) {
      const normalized = mapApiError(err, 'Login failed');
      setError(normalized.message);
      return { success: false, error: normalized.message };
    } finally { setIsLoading(false); }
  }, []);

  const register = useCallback(async (userData) => {
    setIsLoading(true); setError(null);
    try {
      const response = await apiRequest('/api/auth/register/', { method: 'POST', body: JSON.stringify(userData) });
      if (response.message?.toLowerCase().includes('verify')) {
        window.location.href = '/verify-registration';
        return { success: true, message: response.message };
      }
      if (response.token && response.user) {
        setAuthToken(response.token); setUser(response.user);
      }
      return { success: true, user: response.user };
    } catch (err) {
      const normalized = mapApiError(err, 'Registration failed');
      setError(normalized.message);
      return { success: false, error: normalized.message };
    } finally { setIsLoading(false); }
  }, []);

  const value = useMemo(() => ({
    authToken, user, isAuthenticated: !!(authToken && user), isLoading, error, setError, login, register, logout,
  }), [authToken, user, isLoading, error, login, register, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
