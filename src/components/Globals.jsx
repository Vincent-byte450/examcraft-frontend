import { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from './common/ToastSystem';

const GlobalsContext = createContext();

export const useGlobals = () => {
  const context = useContext(GlobalsContext);
  if (!context) {
    throw new Error('useGlobals must be used within a GlobalsProvider');
  }
  return context;
};

export const GlobalsProvider = ({ children }) => {
  // API Configuration
  const API_BASE = 'http://localhost:5000';
  
  // Authentication State - Initialize from localStorage
  const [authToken, setAuthToken] = useState(() => {
    try {
      return localStorage.getItem('authToken') || null;
    } catch {
      return null;
    }
  });
  
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [currentExam, setCurrentExam] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Legacy state for backward compatibility
  const [savedExams, setSavedExams] = useState([]);

  // API Helper Functions
  const apiRequest = async (endpoint, options = {}) => {
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, config);
      
      if (response.status === 401) {
        // Token expired or invalid
        logout();
        throw new Error('Session expired. Please login again.');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      } else {
        return response; // For file downloads
      }
    } catch (err) {
      console.error(`API request failed for ${endpoint}:`, err);
      throw err;
    }
  };

  // Authentication Functions
  const login = async (credentials) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await apiRequest('/api/auth/login/', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });

      if (response.token && response.user) {
        setAuthToken(response.token);
        setUser(response.user);
        
        // Store in localStorage
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        
        return { success: true, user: response.user };
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await apiRequest("/api/auth/register/", {
        method: "POST",
        body: JSON.stringify(userData),
      });

      // If registration succeeded but requires email verification
      if (response.message?.toLowerCase().includes("verify")) {
        // Redirect to verification info page
        window.location.href = "/verify-registration";
        return {
          success: true,
          message: "Registration successful! Please verify your email before logging in.",
        };
      }

      // Legacy path: if backend returns token and user (e.g. Admin-created users)
      if (response.token && response.user) {
        setAuthToken(response.token);
        setUser(response.user);

        localStorage.setItem("authToken", response.token);
        localStorage.setItem("user", JSON.stringify(response.user));

        return { success: true, user: response.user };
      }

      throw new Error(response.error || "Registration failed");
    } catch (err) {
      console.error("Registration error:", err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };


  const logout = () => {
    setAuthToken(null);
    setUser(null);
    setCurrentExam(null);
    setSavedExams([]);
    
    // Clear localStorage
    try {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    } catch (err) {
      console.error('Error clearing localStorage:', err);
    }
  };

  // Effect to validate token on app start and handle authentication state changes
  useEffect(() => {
  const validateToken = async () => {
    if (authToken && user) {
      try {
        const data = await apiRequest('/api/auth/validate');
      } catch (err) {
        console.warn('Token validation failed:', err.message);
        if (err.message.includes('Session expired') || err.message.includes('401')) {
          logout();
        }
      }
    }
  };

  if (authToken && user) validateToken();
}, [authToken, user]);

  // Derived state for authentication status
  const isAuthenticated = !!(authToken && user);

  // inside GlobalsProvider
  // useEffect(() => {
  //   const applyTheme = async () => {
  //     const prefs = await await apiRequest('/api/user/preferences').catch(() => null);

  //     let theme = prefs?.theme || 'light';

  //     if (theme === 'system') {
  //       const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  //       theme = systemDark ? 'dark' : 'light';
  //     }

  //     document.documentElement.classList.remove('light', 'dark');
  //     document.documentElement.classList.add(theme);
  //   };

  //   applyTheme();

  //   // also update if system preference changes (when theme=system)
  //   const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  //   const handleSystemChange = () => applyTheme();
  //   mediaQuery.addEventListener('change', handleSystemChange);

  //   return () => mediaQuery.removeEventListener('change', handleSystemChange);
  // }, []);

  const setCurrentView = (view) => {
    const routeMap = {
      dashboard: '/dashboard',
      'create-exam': '/create-exam',
      'schemes-generator': '/schemes',
      schemes: '/schemes',
      'question-bank': '/question-bank',
      'my-exams': '/my-exams',
      settings: '/settings',
      'review-exam': '/review-exam',
      'edit-exam': '/edit-exam',
      'edit-exam-questions': '/edit-exam-questions',
      payment: '/payment',
      login: '/',
    };

    const nextPath = routeMap[view] || '/dashboard';
    if (window.location.pathname !== nextPath) {
      window.history.pushState({}, '', nextPath);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  const currentView = typeof window !== "undefined" ? window.location.pathname : "/";

  const fetchExamConfig = async (filters = {}) => {
    try {
      const params = new URLSearchParams({
        ...filters
      });

      const response = await apiRequest(`/api/exams/configs/config?${params}`);
      return response;

    } catch (err) {
      console.error('Failed to fetch exam config:', err);
      throw err;
    }
  };

  // Exam Management Functions (API-integrated)
  const createExam = async (examData) => {
    try {
      setIsLoading(true);
      const response = await apiRequest('/api/exams/', {
        method: 'POST',
        body: JSON.stringify(examData),
      });
      
      return { success: true, exam: response.exam };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  const updateExam = async (examId, examData) => {
    try {
      setIsLoading(true);
      const response = await apiRequest(`/api/exams/${examId}`, {
        method: 'PUT',
        body: JSON.stringify(examData),
      });
      
      return { success: true, exam: response.exam };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  const deleteExam = async (examId) => {
    try {
      setIsLoading(true);
      await apiRequest(`/api/exams/${examId}`, {
        method: 'DELETE',
      });
      
      // Remove from local state if using legacy savedExams
      setSavedExams(prev => prev.filter(exam => exam.id !== examId));
      
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  // Dashboard Stats
  const getDashboardStats = async () => {
    try {
      const response = await apiRequest('/api/exams/dashboard/stats');
      return response;
    } catch (err) {
      console.error('Failed to fetch dashboard stats:', err);
      return null;
    }
  };

  // Legacy functions for backward compatibility
  const saveExam = (examData) => {
    const examWithId = {
      ...examData,
      id: Date.now().toString(),
      savedAt: new Date().toISOString(),
    };
    setSavedExams(prev => [...prev, examWithId]);
    return examWithId;
  };

  // Utility Functions
  const clearError = () => setError(null);
  
  const showNotification = useToast();

  const value = {
    // API Configuration
    API_BASE,
    
    // Authentication State
    authToken,
    user,
    isAuthenticated,
    
    // UI State
    currentView,
    setCurrentView,
    currentExam,
    setCurrentExam,
    isLoading,
    setIsLoading,
    error,
    setError,
    clearError,
    
    // Authentication Functions
    login,
    register,
    logout,
    
    // API Helper
    apiRequest,
    
    // Exam Management (API-integrated)
    createExam,
    updateExam,
    deleteExam,
    getDashboardStats,
    
    // Legacy Support
    savedExams,
    setSavedExams,
    saveExam,
    
    // Utility Functions
    showNotification,
    
    // Question Management
    getQuestions: async (filters = {}) => {
      try {
        const params = new URLSearchParams(filters);
        const response = await apiRequest(`/api/questions?${params}`);
        return response;
      } catch (err) {
        console.error('Failed to fetch questions:', err);
        throw err;
      }
    },
    
    createQuestion: async (questionData) => {
      try {
        const response = await apiRequest('/api/questions/', {
          method: 'POST',
          body: JSON.stringify(questionData),
        });
        return { success: true, question: response.question };
      } catch (err) {
        setError(err.message);
        return { success: false, error: err.message };
      }
    },
    
    updateQuestion: async (questionId, questionData) => {
      try {
        const response = await apiRequest(`/api/questions/${questionId}`, {
          method: 'PUT',
          body: JSON.stringify(questionData),
        });
        return { success: true, question: response.question };
      } catch (err) {
        setError(err.message);
        return { success: false, error: err.message };
      }
    },
    
    deleteQuestion: async (questionId) => {
      try {
        await apiRequest(`/api/questions/${questionId}`, {
          method: 'DELETE',
        });
        return { success: true };
      } catch (err) {
        setError(err.message);
        return { success: false, error: err.message };
      }
    },
    
    // Get available subjects and topics
    getSubjects: async (curriculum) => {
      try {
        const response = await apiRequest(`/api/questions/subjects?curriculum=${curriculum}`);
        return response.subjects || [];
      } catch (err) {
        console.error('Failed to fetch subjects:', err);
        return [];
      }
    },
    
    getTopics: async (curriculum, subject) => {
      try {
        const response = await apiRequest(`/api/questions/topics?curriculum=${curriculum}&subject=${subject}`);
        return response.topics || [];
      } catch (err) {
        console.error('Failed to fetch topics:', err);
        return [];
      }
    },
    
    // Exam Actions
    downloadExam: async (examId, format = 'pdf') => {
      try {
        setIsLoading(true);
        const response = await apiRequest(`/api/exams/${examId}/download/`, {
          method: 'POST',
          body: JSON.stringify({ format }),
        });
        
        // Handle the blob response for file download
        if (response instanceof Response) {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.style.display = 'none';
          a.href = url;
          a.download = `exam.${format}`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
          
          showNotification('Exam downloaded successfully', 'success');
          return { success: true };
        }
      } catch (err) {
        if (err.message.includes('Payment required')) {
          showNotification('Payment required to download this exam', 'warning');
        } else {
          showNotification(`Download failed: ${err.message}`, 'error');
        }
        return { success: false, error: err.message };
      } finally {
        setIsLoading(false);
      }
    },
    
    // Subscription and Payment
    getSubscriptionInfo: async () => {
      // try {
      //   const response = await apiRequest('/api/subscription');
      //   return response;
      // } catch (err) {
      //   console.error('Failed to fetch subscription info:', err);
      //   return null;
      // }
      return null;
    },
    
    // File Upload Helper
    uploadFile: async (file, endpoint) => {
      try {
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await fetch(`${API_BASE}${endpoint}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authToken}`,
          },
          body: formData,
        });
        
        if (!response.ok) {
          throw new Error(`Upload failed: ${response.status}`);
        }
        
        return await response.json();
      } catch (err) {
        console.error('File upload failed:', err);
        throw err;
      }
    },
    
    // Search functionality
    searchQuestions: async (searchTerm, filters = {}) => {
      try {
        const params = new URLSearchParams({
          search: searchTerm,
          ...filters
        });
        const response = await apiRequest(`/api/questions?${params}`);
        return response;
      } catch (err) {
        console.error('Search failed:', err);
        throw err;
      }
    },
    
    searchExams: async (searchTerm, filters = {}) => {
      try {
        const params = new URLSearchParams({
          search: searchTerm,
          ...filters
        });
        const response = await apiRequest(`/api/exams?${params}`);
        return response;
      } catch (err) {
        console.error('Exam search failed:', err);
        throw err;
      }
    },
    
    // Analytics and Reporting
    getQuestionStats: async (curriculum) => {
      try {
        const params = curriculum ? `?curriculum=${curriculum}` : '';
        const response = await apiRequest(`/api/questions/stats${params}`);
        return response;
      } catch (err) {
        console.error('Failed to fetch question stats:', err);
        return null;
      }
    },
    
    // Batch Operations
    bulkCreateQuestions: async (questions) => {
      try {
        setIsLoading(true);
        const response = await apiRequest('/api/questions/bulk/', {
          method: 'POST',
          body: JSON.stringify({ questions }),
        });
        return { success: true, questions: response.questions };
      } catch (err) {
        setError(err.message);
        return { success: false, error: err.message };
      } finally {
        setIsLoading(false);
      }
    },
    
    bulkDeleteQuestions: async (questionIds) => {
      try {
        setIsLoading(true);
        const response = await apiRequest('/api/questions/bulk-delete', {
          method: 'DELETE',
          body: JSON.stringify({ questionIds }),
        });
        return { success: true };
      } catch (err) {
        setError(err.message);
        return { success: false, error: err.message };
      } finally {
        setIsLoading(false);
      }
    },
    
    // Preferences and Settings
    getUserPreferences: async () => {
      try {
        const response = await apiRequest('/api/user/preferences');
        return response;
      } catch (err) {
        console.error('Failed to fetch user preferences:', err);
        return null;
      }
    },
    
    updateUserPreferences: async (preferences) => {
      try {
        const response = await apiRequest('/api/user/preferences', {
          method: 'PUT',
          body: JSON.stringify(preferences),
        });
        return { success: true, preferences: response.preferences };
      } catch (err) {
        setError(err.message);
        return { success: false, error: err.message };
      }
    },
    // Payment Processing
    initiatePayment: async (amount, currency = 'USD') => {
      try {
        const response = await apiRequest('/api/payments/initiate/', {
          method: 'POST',
          body: JSON.stringify({ amount, currency }),
        });
        return { success: true, paymentUrl: response.paymentUrl };
      } catch (err) {
        setError(err.message);
        return { success: false, error: err.message };
      }
    }    
  };

  return (
    <GlobalsContext.Provider value={value}>
      {children}
    </GlobalsContext.Provider>
  );
};

export default GlobalsProvider;