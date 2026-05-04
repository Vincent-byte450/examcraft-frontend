const API_BASE = (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');

let authTokenGetter = () => null;
let onUnauthorized = () => {};

export const configureApiClient = ({ getAuthToken, handleUnauthorized } = {}) => {
  if (typeof getAuthToken === 'function') authTokenGetter = getAuthToken;
  if (typeof handleUnauthorized === 'function') onUnauthorized = handleUnauthorized;
};

export const mapApiError = (error, fallback = 'Something went wrong') => {
  if (!error) return { message: fallback, status: 0 };
  return {
    message: error.message || fallback,
    status: error.status || 0,
    code: error.code || null,
    details: error.details || null,
  };
};

export const apiRequest = async (endpoint, options = {}) => {
  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const token = authTokenGetter();
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });

  if (response.status === 401) {
    onUnauthorized();
    const error = new Error('Session expired. Please login again.');
    error.status = 401;
    throw error;
  }

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    const error = new Error(payload.error || payload.message || `HTTP ${response.status}`);
    error.status = response.status;
    error.code = payload.code;
    error.details = payload;
    throw error;
  }

  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) return response.json();
  return response;
};

export { API_BASE };
