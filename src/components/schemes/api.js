// api.js - central fetch utils
import { API_BASE_URL } from '../../config/env';

export const API_BASE = API_BASE_URL;

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