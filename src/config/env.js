const env = import.meta.env;
const isDevelopment = env.DEV;
const requiredVars = ['VITE_API_BASE_URL'];
const missingVars = requiredVars.filter((name) => !env[name]);

if (isDevelopment && missingVars.length > 0) {
  throw new Error(
    `[env] Missing required environment variable(s): ${missingVars.join(', ')}. Add them to your .env file (see .env.example).`
  );
}

const normalizeBaseUrl = (value, fallback = 'http://localhost:5000') => (value || fallback).replace(/\/$/, '');

export const API_BASE_URL = normalizeBaseUrl(env.VITE_API_BASE_URL);
export const API_API_BASE_URL = `${API_BASE_URL}/api`;

export const FEATURE_FLAGS = {
  analyticsEnabled: env.VITE_FEATURE_ANALYTICS === 'true',
  aiEndpointsEnabled: env.VITE_FEATURE_AI_ENDPOINTS !== 'false',
};

export const buildApiUrl = (path = '') => {
  if (!path) return API_BASE_URL;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${API_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
};
