// utils/api.js
export const API_BASE = 'http://localhost:5000';

// Common HTTP status codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  PAYMENT_REQUIRED: 402,
  INTERNAL_SERVER_ERROR: 500
};

// API Error class for better error handling
export class APIError extends Error {
  constructor(message, status, data = null) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.data = data;
  }
}

// Generic API request function
export const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('authToken');
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, config);
    
    // Handle different response types
    const contentType = response.headers.get('content-type');
    let data = null;
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else if (contentType && (contentType.includes('application/pdf') || contentType.includes('application/octet-stream'))) {
      // For file downloads, return the response object
      if (response.ok) {
        return response;
      }
    }

    if (!response.ok) {
      const errorMessage = data?.error || data?.message || `HTTP error! status: ${response.status}`;
      throw new APIError(errorMessage, response.status, data);
    }

    return data || response;
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    
    // Handle network errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new APIError('Network error. Please check your connection.', 0);
    }
    
    throw new APIError(error.message || 'An unexpected error occurred', 500);
  }
};

// Authentication API calls
export const authAPI = {
  login: (credentials) => apiRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  }),

  register: (userData) => apiRequest('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),

  validateToken: () => apiRequest('/api/auth/validate'),

  refreshToken: () => apiRequest('/api/auth/refresh', {
    method: 'POST',
  }),

  logout: () => apiRequest('/api/auth/logout', {
    method: 'POST',
  }),
};

// Exam API calls
export const examAPI = {
  getAll: (params = {}) => {
    const searchParams = new URLSearchParams(params);
    return apiRequest(`/api/exams?${searchParams}`);
  },

  getById: (id) => apiRequest(`/api/exams/${id}`),

  create: (examData) => apiRequest('/api/exams', {
    method: 'POST',
    body: JSON.stringify(examData),
  }),

  update: (id, examData) => apiRequest(`/api/exams/${id}`, {
    method: 'PUT',
    body: JSON.stringify(examData),
  }),

  delete: (id) => apiRequest(`/api/exams/${id}`, {
    method: 'DELETE',
  }),

  download: (id, format = 'pdf') => apiRequest(`/api/exams/${id}/download`, {
    method: 'POST',
    body: JSON.stringify({ format }),
  }),

  getDashboardStats: () => apiRequest('/api/dashboard/stats'),
};

// Question API calls
export const questionAPI = {
  getAll: (params = {}) => {
    const searchParams = new URLSearchParams(params);
    return apiRequest(`/api/questions?${searchParams}`);
  },

  getById: (id) => apiRequest(`/api/questions/${id}`),

  create: (questionData) => apiRequest('/api/questions', {
    method: 'POST',
    body: JSON.stringify(questionData),
  }),

  update: (id, questionData) => apiRequest(`/api/questions/${id}`, {
    method: 'PUT',
    body: JSON.stringify(questionData),
  }),

  delete: (id) => apiRequest(`/api/questions/${id}`, {
    method: 'DELETE',
  }),

  bulkCreate: (questions) => apiRequest('/api/questions/bulk', {
    method: 'POST',
    body: JSON.stringify({ questions }),
  }),

  getSubjects: (curriculum) => apiRequest(`/api/questions/subjects?curriculum=${curriculum}`),

  getTopics: (curriculum, subject) => 
    apiRequest(`/api/questions/topics?curriculum=${curriculum}&subject=${subject}`),

  getStats: (curriculum = null) => {
    const params = curriculum ? `?curriculum=${curriculum}` : '';
    return apiRequest(`/api/questions/stats${params}`);
  },
};

// File upload utility
export const uploadFile = async (file, endpoint) => {
  const token = localStorage.getItem('authToken');
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new APIError(
        errorData.error || 'Upload failed',
        response.status,
        errorData
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError('Upload failed', 500);
  }
};

// Download utility for files
export const downloadFile = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};

// Error message formatter
export const formatError = (error) => {
  if (error instanceof APIError) {
    switch (error.status) {
      case HTTP_STATUS.UNAUTHORIZED:
        return 'Your session has expired. Please login again.';
      case HTTP_STATUS.FORBIDDEN:
        return 'You do not have permission to perform this action.';
      case HTTP_STATUS.NOT_FOUND:
        return 'The requested resource was not found.';
      case HTTP_STATUS.PAYMENT_REQUIRED:
        return 'Payment is required to access this feature.';
      case HTTP_STATUS.BAD_REQUEST:
        return error.message || 'Invalid request. Please check your input.';
      case HTTP_STATUS.INTERNAL_SERVER_ERROR:
        return 'Server error. Please try again later.';
      case 0:
        return 'Network error. Please check your internet connection.';
      default:
        return error.message || 'An unexpected error occurred.';
    }
  }
  
  return error.message || 'An unexpected error occurred.';
};

// Retry utility for failed requests
export const retryRequest = async (requestFunction, maxRetries = 3, delay = 1000) => {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await requestFunction();
    } catch (error) {
      lastError = error;
      
      // Don't retry for client errors (4xx)
      if (error instanceof APIError && error.status >= 400 && error.status < 500) {
        throw error;
      }
      
      // Wait before retrying
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
      }
    }
  }
  
  throw lastError;
};

// Local storage utilities
export const storage = {
  get: (key) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  },
  
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  },
  
  remove: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Failed to remove from localStorage:', error);
    }
  },
  
  clear: () => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
    }
  }
};

// Validation utilities
export const validators = {
  email: (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  },
  
  password: (password) => {
    return password && password.length >= 6;
  },
  
  required: (value) => {
    return value !== null && value !== undefined && value.toString().trim() !== '';
  },
  
  number: (value) => {
    return !isNaN(parseFloat(value)) && isFinite(value);
  },
  
  positiveNumber: (value) => {
    return validators.number(value) && parseFloat(value) > 0;
  }
};

// Date utilities
export const dateUtils = {
  format: (date, options = {}) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      ...options
    });
  },
  
  formatDateTime: (date) => {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  },
  
  isToday: (date) => {
    const today = new Date();
    const compareDate = new Date(date);
    return today.toDateString() === compareDate.toDateString();
  },
  
  daysAgo: (date) => {
    const now = new Date();
    const compareDate = new Date(date);
    const diffTime = Math.abs(now - compareDate);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
};

export async function fetchMetadata() {
  const res = await fetch(`http://localhost:5000/api/schemes/metadata`);
  return res.json();
}

export async function fetchSchemeList() {
  const res = await fetch(`http://localhost:5000/api/schemes/list`);
  return res.json();
}

export async function fetchSchemeView(subject, form) {
  const res = await fetch(`http://localhost:5000/api/schemes/view?subject=${encodeURIComponent(subject)}&form=${form}`);
  return res.json();
}

export async function generateEnhanced(data) {
  const res = await fetch(`http://localhost:5000/api/schemes/generate-enhanced`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function exportEnhanced(data, format, coverPage) {
  const res = await fetch(`http://localhost:5000/api/schemes/export`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data, format, coverPage }),
  });
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Enhanced_Scheme.${format}`;
  a.click();
  window.URL.revokeObjectURL(url);
}