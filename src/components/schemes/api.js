// api.js - central fetch utils
export const API_BASE = import.meta.env.VITE_API_BASE_URL || import.meta.env.API_BASE_URL || "http://localhost:5000";

/**
 * fetchJson - wrapper that supports AbortController and simple timeout
 * options: same as fetch options; returns parsed json or throws
 */
export const fetchJson = async (url, options = {}) => {
  const controller = new AbortController();
  const timeout = options.timeout || 15000;
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(text || res.statusText || `HTTP ${res.status}`);
    }
    return res.json();
  } finally {
    clearTimeout(id);
  }
};